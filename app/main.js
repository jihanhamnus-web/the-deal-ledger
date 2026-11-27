// Application boot, state management, keyboard shortcuts, and dialog orchestration.

import { CATEGORIES, DEALS, LAST_CHECKED, STORES } from './deals.js';
import { applyFilters, computeAuditStats } from './filters.js';
import {
  clearBasketIds,
  computeBasketTotals,
  loadBasketIds,
  toggleBasketId,
} from './basket.js';
import {
  renderBasketBadge,
  renderBasketDialog,
  renderDealGrid,
  renderDetailDrawer,
  renderMastheadStats,
  renderMethodology,
  renderSelectOptions,
} from './view.js';

const filterState = {
  query: '',
  category: 'all',
  store: 'all',
  minOff: '0',
  maxPrice: '0',
  sort: 'top',
};

let basketIds = loadBasketIds();
let activeDetailId = null;

const searchInput = document.getElementById('search');
const clearSearchBtn = document.getElementById('clear-search');
const categorySelect = document.getElementById('category');
const storeSelect = document.getElementById('store');
const minOffSelect = document.getElementById('min-off');
const maxPriceSelect = document.getElementById('max-price');
const sortSelect = document.getElementById('sort');
const clearFiltersBtn = document.getElementById('clear-filters');
const emptyClearBtn = document.getElementById('empty-clear');

const resultCountEl = document.getElementById('result-count');
const dealGridEl = document.getElementById('deal-grid');
const emptyStateEl = document.getElementById('empty-state');
const methodologyEl = document.getElementById('methodology-body');

const detailDialog = document.getElementById('detail-dialog');
const detailContent = document.getElementById('detail-content');
const basketDialog = document.getElementById('basket-dialog');
const basketContent = document.getElementById('basket-content');
const basketFab = document.getElementById('basket-fab');
const openBasketNav = document.getElementById('open-basket-nav');

function countBy(items, key) {
  const map = new Map();
  for (const item of items) {
    map.set(item[key], (map.get(item[key]) || 0) + 1);
  }
  return map;
}

function updateResults() {
  const visible = applyFilters(DEALS, filterState);
  renderDealGrid(dealGridEl, emptyStateEl, visible, basketIds);
  clearSearchBtn.hidden = filterState.query.trim().length === 0;

  const activeFilters = [
    filterState.query.trim() ? `search “${filterState.query.trim()}”` : '',
    filterState.category !== 'all' ? filterState.category : '',
    filterState.store !== 'all' ? filterState.store : '',
    Number(filterState.minOff) > 0 ? `${filterState.minOff}%+ off` : '',
    Number(filterState.maxPrice) > 0 ? `under $${filterState.maxPrice}` : '',
  ].filter(Boolean);

  const suffix = activeFilters.length ? ` (${activeFilters.join(' · ')})` : '';
  resultCountEl.textContent = `Showing ${visible.length} of ${DEALS.length} verified deals${suffix}`;
}

function updateBasketUi() {
  const totals = computeBasketTotals(DEALS, basketIds);
  renderBasketBadge(totals);
  if (basketDialog.open) {
    renderBasketDialog(basketContent, totals);
  }
  if (activeDetailId && detailDialog.open) {
    const deal = DEALS.find((d) => d.id === activeDetailId);
    if (deal) renderDetailDrawer(detailContent, deal, basketIds.has(deal.id));
  }
}

function resetAllFilters() {
  filterState.query = '';
  filterState.category = 'all';
  filterState.store = 'all';
  filterState.minOff = '0';
  filterState.maxPrice = '0';
  filterState.sort = 'top';

  searchInput.value = '';
  categorySelect.value = 'all';
  storeSelect.value = 'all';
  minOffSelect.value = '0';
  maxPriceSelect.value = '0';
  sortSelect.value = 'top';
  updateResults();
}

function openDetail(dealId) {
  const deal = DEALS.find((d) => d.id === dealId);
  if (!deal) return;
  activeDetailId = dealId;
  renderDetailDrawer(detailContent, deal, basketIds.has(deal.id));
  if (!detailDialog.open) detailDialog.showModal();
}

function openBasket() {
  const totals = computeBasketTotals(DEALS, basketIds);
  renderBasketDialog(basketContent, totals);
  if (!basketDialog.open) basketDialog.showModal();
}

async function copyTextWithFallback(text, buttonEl) {
  const original = buttonEl.textContent;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API unavailable');
    }
  } catch {
    const tmp = document.createElement('textarea');
    tmp.value = text;
    tmp.setAttribute('readonly', '');
    tmp.style.position = 'fixed';
    tmp.style.opacity = '0';
    document.body.appendChild(tmp);
    tmp.select();
    try {
      document.execCommand('copy');
    } finally {
      tmp.remove();
    }
  }
  buttonEl.textContent = 'Copied!';
  window.setTimeout(() => {
    buttonEl.textContent = original;
  }, 1500);
}

function wireEvents() {
  let searchTimer = 0;
  searchInput.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      filterState.query = searchInput.value;
      updateResults();
    }, 120);
  });

  clearSearchBtn.addEventListener('click', () => {
    filterState.query = '';
    searchInput.value = '';
    updateResults();
    searchInput.focus();
  });

  categorySelect.addEventListener('change', () => {
    filterState.category = categorySelect.value;
    updateResults();
  });

  storeSelect.addEventListener('change', () => {
    filterState.store = storeSelect.value;
    updateResults();
  });

  minOffSelect.addEventListener('change', () => {
    filterState.minOff = minOffSelect.value;
    updateResults();
  });

  maxPriceSelect.addEventListener('change', () => {
    filterState.maxPrice = maxPriceSelect.value;
    updateResults();
  });

  sortSelect.addEventListener('change', () => {
    filterState.sort = sortSelect.value;
    updateResults();
  });

  clearFiltersBtn.addEventListener('click', resetAllFilters);
  emptyClearBtn.addEventListener('click', resetAllFilters);

  basketFab.addEventListener('click', openBasket);
  openBasketNav.addEventListener('click', openBasket);

  document.addEventListener('click', (event) => {
    const inspectBtn = event.target.closest('[data-inspect]');
    if (inspectBtn) {
      openDetail(inspectBtn.dataset.inspect);
      return;
    }

    const basketBtn = event.target.closest('[data-basket]');
    if (basketBtn) {
      basketIds = toggleBasketId(basketIds, basketBtn.dataset.basket);
      updateResults();
      updateBasketUi();
      return;
    }

    const removeBtn = event.target.closest('[data-remove-basket]');
    if (removeBtn) {
      basketIds = toggleBasketId(basketIds, removeBtn.dataset.removeBasket);
      updateResults();
      updateBasketUi();
      return;
    }

    if (event.target.closest('[data-clear-basket]')) {
      basketIds = clearBasketIds();
      updateResults();
      updateBasketUi();
      return;
    }

    const copyLinkBtn = event.target.closest('[data-copy-link]');
    if (copyLinkBtn) {
      copyTextWithFallback(copyLinkBtn.dataset.copyLink, copyLinkBtn);
      return;
    }

    const copyTextBtn = event.target.closest('[data-copy-text]');
    if (copyTextBtn) {
      copyTextWithFallback(copyTextBtn.dataset.copyText, copyTextBtn);
      return;
    }

    if (event.target.closest('[data-close-dialog]')) {
      if (detailDialog.open) detailDialog.close();
      if (basketDialog.open) basketDialog.close();
    }
  });

  for (const dlg of [detailDialog, basketDialog]) {
    dlg.addEventListener('click', (event) => {
      if (event.target === dlg) dlg.close();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !detailDialog.open && !basketDialog.open) {
      const tag = document.activeElement ? document.activeElement.tagName : '';
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        event.preventDefault();
        searchInput.focus();
      }
    } else if (event.key === 'Escape' && document.activeElement === searchInput && searchInput.value) {
      event.preventDefault();
      filterState.query = '';
      searchInput.value = '';
      updateResults();
    }
  });
}

function init() {
  const stats = computeAuditStats(DEALS);
  renderMastheadStats(stats, LAST_CHECKED);
  renderSelectOptions(categorySelect, CATEGORIES, `All categories (${DEALS.length})`, countBy(DEALS, 'category'));
  renderSelectOptions(storeSelect, STORES, 'All stores', countBy(DEALS, 'store'));
  renderMethodology(methodologyEl, stats, LAST_CHECKED);

  wireEvents();
  updateResults();
  updateBasketUi();
}

init();
