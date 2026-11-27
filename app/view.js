// DOM rendering helpers for deal cards, detail drawer, savings basket dialog, and methodology breakdown.

import {
  formatMoney,
  formatMoneyFixed,
  formatUtcTimestamp,
  verdictLabel,
} from './deals.js';

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderSelectOptions(selectEl, items, allLabel, countMap) {
  const current = selectEl.value;
  const options = [`<option value="all">${escapeHtml(allLabel)}</option>`];
  for (const item of items) {
    const count = countMap ? ` (${countMap.get(item) || 0})` : '';
    options.push(`<option value="${escapeHtml(item)}">${escapeHtml(item + count)}</option>`);
  }
  selectEl.innerHTML = options.join('');
  if ([...selectEl.options].some((o) => o.value === current)) {
    selectEl.value = current;
  }
}

export function renderMastheadStats(stats, lastChecked) {
  const totalEl = document.getElementById('stat-total');
  const avgEl = document.getElementById('stat-avg');
  const steepEl = document.getElementById('stat-steep');
  const checkedEl = document.getElementById('stat-checked');

  if (totalEl) totalEl.textContent = String(stats.total);
  if (avgEl) avgEl.textContent = `${stats.avgPct}%`;
  if (steepEl) steepEl.textContent = String(stats.steepCount);
  if (checkedEl) checkedEl.textContent = formatUtcTimestamp(lastChecked);
}

export function renderDealGrid(gridEl, emptyEl, deals, basketIds) {
  if (!deals.length) {
    gridEl.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;
  gridEl.innerHTML = deals
    .map((deal) => {
      const inBasket = basketIds.has(deal.id);
      const vClass = deal.verdict === 'steep' ? 'verdict-steep' : 'verdict-solid';
      const vText = verdictLabel(deal.verdict);
      const pctWidth = Math.min(100, Math.max(4, deal.pctOff));
      const unitHtml = deal.unit
        ? `<p class="price-unit">${escapeHtml(deal.unit)}</p>`
        : '';

      return `
        <article class="deal-card" data-deal-id="${escapeHtml(deal.id)}">
          <div class="card-eyebrow">
            <div class="tag-group">
              <span class="badge-cat">${escapeHtml(deal.category)}</span>
              <span class="badge-store">${escapeHtml(deal.store)}</span>
            </div>
            <span class="badge-verdict ${vClass}">${escapeHtml(vText)}</span>
          </div>

          <h3 class="card-title">
            <button type="button" class="card-title-btn" data-inspect="${escapeHtml(deal.id)}">${escapeHtml(deal.product)}</button>
          </h3>
          <p class="card-brand">${escapeHtml(deal.brand)}</p>

          <div class="price-block">
            <span class="price-sale">${escapeHtml(formatMoney(deal.price))}</span>
            <span class="price-usual">${escapeHtml(formatMoney(deal.usualPrice))}</span>
            <span class="pct-pill">-${escapeHtml(deal.pctOff)}%</span>
            <span class="price-saved">Save ${escapeHtml(formatMoney(deal.saved))}</span>
          </div>
          ${unitHtml}

          <div class="drop-bar-track" role="img" aria-label="${escapeHtml(deal.pctOff)}% price drop from ${escapeHtml(formatMoney(deal.usualPrice))} to ${escapeHtml(formatMoney(deal.price))}">
            <div class="drop-bar-fill" style="width: ${pctWidth}%"></div>
          </div>

          <p class="card-blurb">${escapeHtml(deal.blurb)}</p>
          <p class="card-evidence"><strong>Audit:</strong> ${escapeHtml(deal.verdictNote)}</p>

          <div class="card-meta">
            <span>Checked ${escapeHtml(formatUtcTimestamp(deal.checkedAt))}</span>
            <span>Source: <a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(deal.source)}</a></span>
          </div>

          <div class="card-actions">
            <button type="button" class="btn-inspect" data-inspect="${escapeHtml(deal.id)}">Details &amp; proof</button>
            <button type="button" class="btn-basket" data-basket="${escapeHtml(deal.id)}" aria-pressed="${inBasket ? 'true' : 'false'}">${inBasket ? 'Shortlisted' : 'Shortlist'}</button>
            <a class="btn-store" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer">Open at ${escapeHtml(deal.store)} ↗</a>
          </div>
        </article>
      `;
    })
    .join('');
}

export function renderBasketBadge(totals) {
  const navCount = document.getElementById('nav-basket-count');
  const fabCount = document.getElementById('fab-count');
  const fabSaved = document.getElementById('fab-saved');

  if (navCount) navCount.textContent = String(totals.count);
  if (fabCount) fabCount.textContent = String(totals.count);
  if (fabSaved) fabSaved.textContent = `${formatMoney(totals.savedTotal)} saved`;
}

export function renderDetailDrawer(containerEl, deal, inBasket) {
  const vClass = deal.verdict === 'steep' ? 'verdict-steep' : 'verdict-solid';
  const vText = verdictLabel(deal.verdict);
  const pctWidth = Math.min(100, Math.max(4, deal.pctOff));
  const promoHtml = deal.code
    ? `
      <div class="promo-box">
        <div>
          <span class="field-label">Promo code</span>
          <span class="promo-code">${escapeHtml(deal.code)}</span>
        </div>
        <button type="button" class="btn-inspect" data-copy-text="${escapeHtml(deal.code)}">Copy code</button>
      </div>
    `
    : '';

  containerEl.innerHTML = `
    <div class="dialog-top">
      <div>
        <div class="tag-group">
          <span class="badge-cat">${escapeHtml(deal.category)}</span>
          <span class="badge-store">${escapeHtml(deal.store)}</span>
          <span class="badge-verdict ${vClass}">${escapeHtml(vText)}</span>
        </div>
        <h2 id="detail-title">${escapeHtml(deal.product)}</h2>
        <p class="card-brand">${escapeHtml(deal.brand)}</p>
      </div>
      <button type="button" class="dialog-close" data-close-dialog aria-label="Close detail drawer">✕</button>
    </div>

    <div class="dialog-price-box">
      <div class="price-block">
        <span class="price-sale">${escapeHtml(formatMoney(deal.price))}</span>
        <span class="price-usual">${escapeHtml(formatMoney(deal.usualPrice))}</span>
        <span class="pct-pill">-${escapeHtml(deal.pctOff)}% off</span>
        <span class="price-saved">Save ${escapeHtml(formatMoney(deal.saved))}</span>
      </div>
      ${deal.unit ? `<p class="price-unit">${escapeHtml(deal.unit)}</p>` : ''}
      <div class="dialog-drop-track" role="img" aria-label="${escapeHtml(deal.pctOff)}% discount bar">
        <div class="dialog-drop-fill" style="width: ${pctWidth}%"></div>
      </div>
    </div>

    ${promoHtml}

    <p>${escapeHtml(deal.blurb)}</p>
    <p class="card-evidence"><strong>Is it really a deal?</strong> ${escapeHtml(deal.verdictNote)}</p>

    <div class="proof-list">
      <div class="proof-row">
        <strong>Price checked:</strong>
        <span>${escapeHtml(formatUtcTimestamp(deal.checkedAt))} (${escapeHtml(deal.checkedAt)})</span>
      </div>
      <div class="proof-row">
        <strong>Price read from:</strong>
        <span>${escapeHtml(deal.source)} — <a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener noreferrer">Open source ↗</a></span>
      </div>
      <div class="proof-row">
        <strong>Direct merchant URL:</strong>
        <span><a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(deal.url)}</a></span>
      </div>
    </div>

    <div class="dialog-actions">
      <a class="btn-primary" href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer">Open at ${escapeHtml(deal.store)} ↗</a>
      <button type="button" class="btn-inspect" data-copy-link="${escapeHtml(deal.url)}">Copy store link</button>
      <button type="button" class="btn-basket" data-basket="${escapeHtml(deal.id)}" aria-pressed="${inBasket ? 'true' : 'false'}">${inBasket ? 'Remove from shortlist' : 'Add to shortlist'}</button>
    </div>
  `;
}

export function renderBasketDialog(containerEl, totals) {
  const listHtml = totals.items.length
    ? `
      <ul class="basket-items">
        ${totals.items
          .map(
            (item) => `
          <li class="basket-item">
            <div class="basket-item-info">
              <strong>${escapeHtml(item.product)}</strong>
              <span>${escapeHtml(item.store)} · ${escapeHtml(formatMoneyFixed(item.price))} (was ${escapeHtml(formatMoneyFixed(item.usualPrice))}, save ${escapeHtml(formatMoneyFixed(item.saved))})</span>
            </div>
            <button type="button" class="btn-remove" data-remove-basket="${escapeHtml(item.id)}" aria-label="Remove ${escapeHtml(item.product)} from shortlist">Remove</button>
          </li>
        `,
          )
          .join('')}
      </ul>
    `
    : `<p class="card-evidence">Your shortlist is empty. Click <strong>Shortlist</strong> on any deal card to compare combined savings.</p>`;

  containerEl.innerHTML = `
    <div class="dialog-top">
      <div>
        <p class="edition-tag">Saved Shortlist</p>
        <h2 id="basket-title">Savings Basket (${totals.count} ${totals.count === 1 ? 'deal' : 'deals'})</h2>
      </div>
      <button type="button" class="dialog-close" data-close-dialog aria-label="Close savings basket">✕</button>
    </div>

    <div class="basket-summary">
      <div class="basket-sum-card">
        <span>Usual total</span>
        <strong>${escapeHtml(formatMoneyFixed(totals.usualTotal))}</strong>
      </div>
      <div class="basket-sum-card">
        <span>Black Friday total</span>
        <strong>${escapeHtml(formatMoneyFixed(totals.saleTotal))}</strong>
      </div>
      <div class="basket-sum-card highlight">
        <span>Total saved</span>
        <strong>${escapeHtml(formatMoneyFixed(totals.savedTotal))}</strong>
      </div>
    </div>

    ${listHtml}

    <div class="dialog-actions">
      ${totals.count ? `<button type="button" class="btn-inspect" data-clear-basket>Clear shortlist</button>` : ''}
      <button type="button" class="btn-primary" data-close-dialog>Done</button>
    </div>
  `;
}

export function renderMethodology(containerEl, stats, lastChecked) {
  const maxCat = Math.max(1, ...stats.byCategory.map((c) => c.count));
  const maxStore = Math.max(1, ...stats.byStore.map((s) => s.count));

  containerEl.innerHTML = `
    <div class="method-card">
      <h3>Category Coverage (${stats.byCategory.length})</h3>
      <ul class="dist-list">
        ${stats.byCategory
          .map(
            (row) => `
          <li class="dist-row">
            <span>${escapeHtml(row.name)}</span>
            <strong>${row.count}</strong>
            <div class="dist-bar"><span style="width: ${Math.round((row.count / maxCat) * 100)}%"></span></div>
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>

    <div class="method-card">
      <h3>Merchant Distribution (${stats.byStore.length})</h3>
      <ul class="dist-list">
        ${stats.byStore
          .map(
            (row) => `
          <li class="dist-row">
            <span>${escapeHtml(row.name)}</span>
            <strong>${row.count}</strong>
            <div class="dist-bar"><span style="width: ${Math.round((row.count / maxStore) * 100)}%"></span></div>
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>

    <div class="method-card">
      <h3>Audit Rules &amp; Exclusions</h3>
      <ul class="audit-notes">
        <li><strong>Last full pass:</strong> ${escapeHtml(formatUtcTimestamp(lastChecked))} (${stats.total} verified items, ${stats.avgPct}% avg cut).</li>
        <li><strong>Direct verification:</strong> Every Amazon ASIN link returned HTTP 200 with a matching product title; software plans were verified against vendor pricing pages.</li>
        <li><strong>Editorial verdicts:</strong> <em>Steep cut</em> marks rare ≥40–50% drops or historical holiday floors; <em>Solid deal</em> marks genuine verified discounts below list.</li>
        <li><strong>Discarded items:</strong> Echo Show 8 (unconfirmed price), Logitech G502 (ambiguous variant), Dell XPS 13 (mismatched config), and NordVPN (HTTP 403) were excluded.</li>
      </ul>
    </div>
  `;
}
