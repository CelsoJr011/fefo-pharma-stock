import { daysUntilExpiry, getBatchStatus, sortByFefo, suggestPicking, summarize } from './fefo.js';
import { buildSampleBatches } from './sample-data.js';
import { LANGUAGES, detectLanguage, saveLanguage, translate, hasTranslation } from './i18n.js';

const STORAGE_KEY = 'fefo-pharma-stock:batches';

let batches = loadBatches();
let lang = detectLanguage();

// Kept so the picking result can be redrawn when the language changes,
// instead of disappearing and forcing the user to ask again.
let lastPicking = null;

const t = (key, params) => translate(lang, key, params);

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
  if (days === 0) return t('days.today');
  if (days === -1) return t('days.agoOne');
  if (days < 0) return t('days.ago', { n: Math.abs(days) });
  if (days === 1) return t('days.leftOne');
  return t('days.left', { n: days });
}

// Sample products have a translation per SKU. Anything the user typed in the
// form is shown exactly as typed — there's no way to translate free text.
function productName(batch) {
  const key = `product.${batch.sku}`;
  return hasTranslation(lang, key) ? t(key) : batch.product;
}

// --- static texts --------------------------------------------------------

function applyStaticTranslations() {
  document.documentElement.lang = LANGUAGES[lang].locale;
  document.title = t('page.title');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });

  document.querySelectorAll('[data-lang]').forEach((button) => {
    const active = button.dataset.lang === lang;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

// --- rendering -----------------------------------------------------------

function renderSummary() {
  const s = summarize(batches);
  const cards = [
    { label: t('summary.batches'), value: s.batches },
    { label: t('summary.units'), value: s.units.toLocaleString(LANGUAGES[lang].locale) },
    { label: t('summary.expired'), value: s.expired, css: 'expired' },
    { label: t('summary.critical'), value: s.critical, css: 'critical' },
    { label: t('summary.warning'), value: s.warning, css: 'warning' },
    { label: t('summary.blocked'), value: s.blocked, css: 'blocked' },
    { label: t('summary.coldChain'), value: s.coldChain },
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
      // Search both the translated name and the original one, so typing
      // "dipirona" or "dipyrone" finds the same batch in any language.
      const haystack = `${productName(batch)} ${batch.product} ${batch.batch} ${batch.sku}`.toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      return haystack.includes(search) && matchesStatus;
    });

  const tbody = document.getElementById('batch-rows');

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8">${t('table.empty')}</td></tr>`;
    return;
  }

  tbody.innerHTML = rows
    .map(({ batch, status, days }) => `
      <tr>
        <td>
          ${escapeHtml(productName(batch))}
          ${batch.storage === 'cold' ? `<span class="cold-tag" title="${t('table.coldTitle')}">❄ 2–8 °C</span>` : ''}
        </td>
        <td>${escapeHtml(batch.batch)}</td>
        <td>${formatDate(batch.expiry)}</td>
        <td>${describeDays(days)}</td>
        <td>${batch.quantity}</td>
        <td>${escapeHtml(batch.location)}</td>
        <td><span class="badge ${status}">${t(`status.${status}`)}</span></td>
        <td>
          <button class="btn-small" type="button" data-toggle-block="${escapeHtml(batch.batch)}">
            ${batch.blocked ? t('table.release') : t('table.block')}
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
  for (const b of batches) products.set(b.sku, productName(b));

  select.innerHTML = [...products]
    .sort((a, b) => a[1].localeCompare(b[1], LANGUAGES[lang].locale))
    .map(([sku, product]) => `<option value="${escapeHtml(sku)}">${escapeHtml(product)}</option>`)
    .join('');

  if (products.has(current)) select.value = current;
}

function renderPickingResult() {
  const box = document.getElementById('picking-result');
  if (!lastPicking) {
    box.innerHTML = '';
    return;
  }

  const { result, requestedQty } = lastPicking;

  const picksHtml = result.picks.length
    ? `<ol>${result.picks
        .map((p) => `<li>${t('picking.take', {
          qty: p.quantity,
          batch: escapeHtml(p.batch),
          location: escapeHtml(p.location),
          date: formatDate(p.expiry),
        })}</li>`)
        .join('')}</ol>`
    : `<p>${t('picking.none')}</p>`;

  const missingHtml = result.missingQty > 0
    ? `<p class="missing">${t('picking.missing', { missing: result.missingQty, requested: requestedQty })}</p>`
    : '';

  const skippedHtml = result.skipped.length
    ? `<p class="skipped">${t('picking.skipped')} ${result.skipped
        .map((s) => `${escapeHtml(s.batch)} (${t(`skip.${s.reason}`)})`)
        .join(', ')}</p>`
    : '';

  box.innerHTML = picksHtml + missingHtml + skippedHtml;
}

function renderAll() {
  applyStaticTranslations();
  renderSummary();
  renderTable();
  renderSkuOptions();
  renderPickingResult();
}

function showFormMessage(text, type) {
  const message = document.getElementById('form-message');
  message.textContent = text;
  message.className = `form-message ${type}`;
}

// --- events --------------------------------------------------------------

document.querySelectorAll('[data-lang]').forEach((button) => {
  button.addEventListener('click', () => {
    lang = button.dataset.lang;
    saveLanguage(lang);
    showFormMessage('', '');
    renderAll();
  });
});

document.getElementById('picking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const sku = document.getElementById('picking-sku').value;
  const qty = Number(document.getElementById('picking-qty').value);

  // Checked here as well (fefo.js also validates) so the message can be
  // shown in the selected language.
  if (!Number.isInteger(qty) || qty <= 0) {
    lastPicking = null;
    document.getElementById('picking-result').innerHTML = `<p class="missing">${t('picking.invalidQty')}</p>`;
    return;
  }

  lastPicking = { result: suggestPicking(batches, sku, qty), requestedQty: qty };
  renderPickingResult();
});

document.getElementById('batch-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  const data = Object.fromEntries(new FormData(form));

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
    showFormMessage(t('form.duplicate', { batch: newBatch.batch, sku: newBatch.sku }), 'error');
    return;
  }

  if (daysUntilExpiry(newBatch.expiry) < 0) {
    showFormMessage(t('form.expired'), 'error');
    return;
  }

  batches.push(newBatch);
  saveBatches();
  renderAll();
  form.reset();
  showFormMessage(t('form.success', { batch: newBatch.batch }), 'success');
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
  lastPicking = null;
  saveBatches();
  renderAll();
});

renderAll();
