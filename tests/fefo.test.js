import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysUntilExpiry, getBatchStatus, sortByFefo, suggestPicking, summarize } from '../js/fefo.js';

// Fixed "today" so the tests don't depend on the day they run.
const today = new Date('2026-03-10T15:30:00');

const batches = [
  { sku: 'X', batch: 'OLD', expiry: '2026-03-01', quantity: 10, location: 'A1', blocked: false },
  { sku: 'X', batch: 'SHORT', expiry: '2026-03-20', quantity: 10, location: 'A2', blocked: false },
  { sku: 'X', batch: 'B', expiry: '2026-06-01', quantity: 30, location: 'A3', blocked: false },
  { sku: 'X', batch: 'A', expiry: '2026-05-01', quantity: 20, location: 'A4', blocked: false },
  { sku: 'X', batch: 'HOLD', expiry: '2026-04-15', quantity: 50, location: 'A5', blocked: true },
  { sku: 'Y', batch: 'OTHER', expiry: '2026-08-01', quantity: 99, location: 'B1', blocked: false },
];

test('counts days by calendar day, ignoring the time', () => {
  assert.equal(daysUntilExpiry('2026-03-10', today), 0);
  assert.equal(daysUntilExpiry('2026-03-11', today), 1);
  assert.equal(daysUntilExpiry('2026-03-09', today), -1);
});

test('classifies batch status', () => {
  assert.equal(getBatchStatus({ expiry: '2026-03-01' }, today), 'expired');
  assert.equal(getBatchStatus({ expiry: '2026-03-25' }, today), 'critical');
  assert.equal(getBatchStatus({ expiry: '2026-05-20' }, today), 'warning');
  assert.equal(getBatchStatus({ expiry: '2027-01-01' }, today), 'ok');
  assert.equal(getBatchStatus({ expiry: '2027-01-01', blocked: true }, today), 'blocked');
});

test('sorts by expiry first, then by smaller quantity', () => {
  const sorted = sortByFefo([
    { batch: 'late', expiry: '2026-09-01', quantity: 1 },
    { batch: 'big', expiry: '2026-05-01', quantity: 100 },
    { batch: 'small', expiry: '2026-05-01', quantity: 5 },
  ]);
  assert.deepEqual(sorted.map((b) => b.batch), ['small', 'big', 'late']);
});

test('picks the earliest valid batch first and skips the bad ones', () => {
  const result = suggestPicking(batches, 'X', 35, today);

  assert.deepEqual(result.picks.map((p) => [p.batch, p.quantity]), [['A', 20], ['B', 15]]);
  assert.equal(result.missingQty, 0);
  assert.deepEqual(
    result.skipped.map((s) => s.reason).sort(),
    ['blocked', 'expired', 'short shelf life'],
  );
});

test('reports what is missing when stock is not enough', () => {
  const result = suggestPicking(batches, 'X', 80, today);
  assert.equal(result.pickedQty, 50);
  assert.equal(result.missingQty, 30);
});

test('rejects invalid quantities', () => {
  assert.throws(() => suggestPicking(batches, 'X', 0, today));
  assert.throws(() => suggestPicking(batches, 'X', 2.5, today));
});

test('summarizes the stock', () => {
  const s = summarize(batches, today);
  assert.equal(s.batches, 6);
  assert.equal(s.units, 219);
  assert.equal(s.expired, 1);
  assert.equal(s.critical, 1);
  assert.equal(s.blocked, 1);
});
