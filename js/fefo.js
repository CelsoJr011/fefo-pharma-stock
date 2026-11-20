// Core rules for batch/expiry control.
// Kept free of DOM code on purpose, so the same functions run in the browser
// and in the Node tests (npm test).

const DAY_MS = 24 * 60 * 60 * 1000;

// Thresholds in days. These are the defaults I chose for the demo — every
// warehouse/customer has its own numbers, so they live in one place.
export const DEFAULT_RULES = {
  criticalDays: 30,   // close to expiry: should leave the warehouse first
  warningDays: 90,    // still fine, but worth keeping an eye on
  minShelfLifeDays: 30, // a store won't accept a product that expires in a few days
};

// "2026-03-10" is parsed by JS as midnight UTC. In Brazil (UTC-3) that turns
// into the evening of March 9th — one day off. So date-only strings are read
// as local dates instead.
function toLocalDate(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

// Compare dates by calendar day only. Times of day would make a batch
// expiring "today" look already expired after lunch.
function startOfDay(date) {
  const d = toLocalDate(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntilExpiry(expiryDate, today = new Date()) {
  const diff = startOfDay(expiryDate) - startOfDay(today);
  return Math.round(diff / DAY_MS);
}

export function getBatchStatus(batch, today = new Date(), rules = DEFAULT_RULES) {
  // A blocked batch (quality hold, damaged packaging, recall...) can't be
  // picked no matter how good its date is, so it wins over everything else.
  if (batch.blocked) return 'blocked';

  const days = daysUntilExpiry(batch.expiry, today);
  if (days < 0) return 'expired';
  if (days <= rules.criticalDays) return 'critical';
  if (days <= rules.warningDays) return 'warning';
  return 'ok';
}

// FEFO = First Expired, First Out. Unlike FIFO (by arrival date), what matters
// here is the expiry date. Ties go to the smaller quantity, so half-used
// pallets get cleared instead of leaving lots of small leftovers spread around.
export function sortByFefo(batches) {
  return [...batches].sort((a, b) => {
    const byDate = startOfDay(a.expiry) - startOfDay(b.expiry);
    if (byDate !== 0) return byDate;
    return a.quantity - b.quantity;
  });
}

// Suggests which batches to pick for an order line.
// Returns the picks plus anything that couldn't be served, because in real
// life "we only have 70 of the 100 units" is information the team needs.
export function suggestPicking(batches, sku, requestedQty, today = new Date(), rules = DEFAULT_RULES) {
  if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
    throw new Error('Requested quantity must be a positive whole number');
  }

  const skipped = [];
  const eligible = [];

  for (const batch of batches) {
    if (batch.sku !== sku || batch.quantity <= 0) continue;

    const status = getBatchStatus(batch, today, rules);
    const days = daysUntilExpiry(batch.expiry, today);

    if (status === 'blocked') {
      skipped.push({ batch: batch.batch, reason: 'blocked' });
    } else if (status === 'expired') {
      skipped.push({ batch: batch.batch, reason: 'expired' });
    } else if (days < rules.minShelfLifeDays) {
      // Not expired yet, but too short-dated to ship to a store.
      skipped.push({ batch: batch.batch, reason: 'short shelf life' });
    } else {
      eligible.push(batch);
    }
  }

  const picks = [];
  let remaining = requestedQty;

  for (const batch of sortByFefo(eligible)) {
    if (remaining === 0) break;
    const take = Math.min(batch.quantity, remaining);
    picks.push({ batch: batch.batch, location: batch.location, expiry: batch.expiry, quantity: take });
    remaining -= take;
  }

  return {
    picks,
    pickedQty: requestedQty - remaining,
    missingQty: remaining,
    skipped,
  };
}

export function summarize(batches, today = new Date(), rules = DEFAULT_RULES) {
  const summary = { batches: batches.length, units: 0, expired: 0, critical: 0, warning: 0, blocked: 0, coldChain: 0 };

  for (const batch of batches) {
    summary.units += batch.quantity;
    if (batch.storage === 'cold') summary.coldChain += 1;

    const status = getBatchStatus(batch, today, rules);
    if (status !== 'ok') summary[status] += 1;
  }

  return summary;
}
