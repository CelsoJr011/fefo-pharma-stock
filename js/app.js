import { daysUntilExpiry, getBatchStatus, sortByFefo, suggestPicking, summarize } from './fefo.js';
import { buildSampleBatches } from './sample-data.js';

const STORAGE_KEY = 'fefo-pharma-stock:batches';

const STATUS_LABELS = {
  expired: 'Expired',
  critical: 'Critical',
  warning: 'Warning',
  ok: 'OK',
  blocked: 'Blocked',
};

const SKIP_REASONS = {
  expired: 'expired',
  blocked: 'blocked (quality hold)',
  'short shelf life': 'too close to expiry to ship',
};

let batches = loadBatches();

// --- persistence ---------------------------------------------------------

function loadBatches() {
  // localStorage can be blocked (private mode, some browsers), so the app
  // falls back to the sample data instead of breaking.
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (err) {
    console.warn('Could not read saved batches, using sample data.', err);
  }
  return buildSampleBatches();
}

function saveBatches() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch (err) {
    console.warn('Could not save batches.', err);
  }
}

// --- small helpers -------------------------------------------------------

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function describeDays(days) {
  if (days < 0) return `${Math.abs(days)} days ago`;
  if (days === 0) return 'today';
  return `${days} days`;
}

// --- rendering -----------------------------------------------------------

function renderSummary() {
  const s = summarize(batches);
  const cards = [
    { label: 'Batches', value: s.batches },
    { label: 'Units in stock', value: s.units.toLocaleString('en-US') },
    { label: 'Expired', value: s.expired, css: 'expired' },
    { label: 'Critical (≤ 30d)', value: s.critical, css: 'critical' },
    { label: 'Warning (≤ 90d)', value: s.warning, css: 'warning' },
    { label: 'Blocked', value: s.blocked, css: 'blocked' },
    { label: 'Cold chain batches', value: s.coldChain },
  ];

  document.getElementById('summary').innerHTML = cards
    .map((c) => `
      <div class="card ${c.css ?? ''}">
        <div class="label">${c.label}</div>
        <div class="value">${c.value}</div>
      </div>`)
    .join('');
}

function renderTable() {
  const search = document.getElementById('search').value.trim().toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;

  // The table is shown in FEFO order too — what is on top is what should
  // leave first, so the screen itself teaches the rule.
  const rows = sortByFefo(batches)
    .map((batch) => ({ batch, status: getBatchStatus(batch), days: daysUntilExpiry(batch.expiry) }))
    .filter(({ batch, status }) => {
      const matchesText = `${batch.product} ${batch.batch} ${batch.sku}`.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return matchesText && matchesStatus;
    });

  const tbody = document.getElementById('batch-rows');

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8">No batches found.</td></tr>';
    return;
  }

  tbody.innerHTML = rows
    .map(({ batch, status, days }) => `
      <tr>
        <td>
          ${escapeHtml(batch.product)}
          ${batch.storage === 'cold' ? '<span class="cold-tag" title="Store between 2 and 8 °C">❄ 2–8 °C</span>' : ''}
        </td>
        <td>${escapeHtml(batch.batch)}</td>
        <td>${formatDate(batch.expiry)}</td>
        <td>${describeDays(days)}</td>
        <td>${batch.quantity}</td>
        <td>${escapeHtml(batch.location)}</td>
        <td><span class="badge ${status}">${STATUS_LABELS[status]}</span></td>
        <td>
          <button class="btn-small" type="button" data-toggle-block="${escapeHtml(batch.batch)}">
            ${batch.blocked ? 'Release' : 'Block'}
          </button>
        </td>
      </tr>`)
    .join('');
}

function renderSkuOptions() {
  const select = document.getElementById('picking-sku');
  const current = select.value;

  // One option per SKU, even when the product has several batches.
  const products = new Map();
  for (const b of batches) products.set(b.sku, b.product);

  select.innerHTML = [...products]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([sku, product]) => `<option value="${escapeHtml(sku)}">${escapeHtml(product)}</option>`)
    .join('');

  if (products.has(current)) select.value = current;
}

function renderPickingResult(result, requestedQty) {
  const box = document.getElementById('picking-result');

  const picksHtml = result.picks.length
    ? `<ol>${result.picks
        .map((p) => `<li>Take <strong>${p.quantity}</strong> from batch <strong>${escapeHtml(p.batch)}</strong> at ${escapeHtml(p.location)} (expires ${formatDate(p.expiry)})</li>`)
        .join('')}</ol>`
    : '<p>No batch can be picked for this product right now.</p>';

  const missingHtml = result.missingQty > 0
    ? `<p class="missing">Short by ${result.missingQty} of ${requestedQty} units — let the team know before closing the order.</p>`
    : '';

  const skippedHtml = result.skipped.length
    ? `<p class="skipped">Skipped: ${result.skipped
        .map((s) => `${escapeHtml(s.batch)} (${SKIP_REASONS[s.reason]})`)
        .join(', ')}</p>`
    : '';

  box.innerHTML = picksHtml + missingHtml + skippedHtml;
}

function renderAll() {
  renderSummary();
  renderTable();
  renderSkuOptions();
}

// --- events --------------------------------------------------------------

document.getElementById('picking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const sku = document.getElementById('picking-sku').value;
  const qty = Number(document.getElementById('picking-qty').value);

  try {
    renderPickingResult(suggestPicking(batches, sku, qty), qty);
  } catch (err) {
    document.getElementById('picking-result').innerHTML = `<p class="missing">${escapeHtml(err.message)}</p>`;
  }
});

document.getElementById('batch-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));
  const message = document.getElementById('form-message');

  const newBatch = {
    sku: data.sku.trim().toUpperCase(),
    product: data.product.trim(),
    batch: data.batch.trim().toUpperCase(),
    expiry: data.expiry,
    quantity: Number(data.quantity),
    location: data.location.trim().toUpperCase(),
    storage: data.storage,
    blocked: false,
  };

  // Batch numbers are how a recall is traced, so a duplicate would make the
  // whole history unreliable. Better to refuse it right away.
  if (batches.some((b) => b.batch === newBatch.batch && b.sku === newBatch.sku)) {
    message.textContent = `Batch ${newBatch.batch} already exists for ${newBatch.sku}.`;
    message.className = 'form-message error';
    return;
  }

  if (daysUntilExpiry(newBatch.expiry) < 0) {
    message.textContent = 'This batch is already expired — it should not be received into stock.';
    message.className = 'form-message error';
    return;
  }

  batches.push(newBatch);
  saveBatches();
  renderAll();
  form.reset();
  message.textContent = `Batch ${newBatch.batch} received.`;
  message.className = 'form-message success';
});

document.getElementById('batch-rows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-toggle-block]');
  if (!button) return;

  const batch = batches.find((b) => b.batch === button.dataset.toggleBlock);
  if (!batch) return;

  batch.blocked = !batch.blocked;
  saveBatches();
  renderAll();
});

document.getElementById('search').addEventListener('input', renderTable);
document.getElementById('status-filter').addEventListener('change', renderTable);

document.getElementById('reset-data').addEventListener('click', () => {
  batches = buildSampleBatches();
  saveBatches();
  renderAll();
  document.getElementById('picking-result').innerHTML = '';
});

renderAll();
