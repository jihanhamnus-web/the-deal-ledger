// Persistent shortlist / savings basket state backed by localStorage.

const STORAGE_KEY = 'bf-deal-ledger-shortlist';

export function loadBasketIds() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

export function saveBasketIds(ids) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore storage failures in restricted browsing modes.
  }
}

export function toggleBasketId(ids, dealId) {
  const next = new Set(ids);
  if (next.has(dealId)) {
    next.delete(dealId);
  } else {
    next.add(dealId);
  }
  saveBasketIds(next);
  return next;
}

export function clearBasketIds() {
  const empty = new Set();
  saveBasketIds(empty);
  return empty;
}

export function computeBasketTotals(deals, ids) {
  const items = deals.filter((deal) => ids.has(deal.id));
  let usualCents = 0;
  let saleCents = 0;

  for (const item of items) {
    usualCents += Math.round(item.usualPrice * 100);
    saleCents += Math.round(item.price * 100);
  }

  const savedCents = Math.max(0, usualCents - saleCents);
  return {
    items,
    count: items.length,
    usualTotal: usualCents / 100,
    saleTotal: saleCents / 100,
    savedTotal: savedCents / 100,
  };
}
