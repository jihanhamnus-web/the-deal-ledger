// Pure search, filter, sort, and summary calculation helpers.

export function computeSavingsRank(deal) {
  return deal.saved * 100 + deal.pctOff * 10;
}

export function matchesSearchQuery(deal, rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    deal.product,
    deal.brand,
    deal.store,
    deal.category,
    deal.blurb,
    deal.verdictNote,
  ]
    .join(' ')
    .toLowerCase();
  return query.split(/\s+/).every((token) => haystack.includes(token));
}

export function applyFilters(deals, state) {
  const minOff = Number(state.minOff) || 0;
  const maxPrice = Number(state.maxPrice) || 0;

  const filtered = deals.filter((deal) => {
    if (state.category !== 'all' && deal.category !== state.category) return false;
    if (state.store !== 'all' && deal.store !== state.store) return false;
    if (minOff > 0 && deal.pctOff < minOff) return false;
    if (maxPrice > 0 && deal.price > maxPrice) return false;
    if (!matchesSearchQuery(deal, state.query || '')) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (state.sort) {
    case 'pct':
      sorted.sort((a, b) => b.pctOff - a.pctOff || b.saved - a.saved);
      break;
    case 'saved':
      sorted.sort((a, b) => b.saved - a.saved || b.pctOff - a.pctOff);
      break;
    case 'price':
      sorted.sort((a, b) => a.price - b.price || b.pctOff - a.pctOff);
      break;
    case 'top':
    default:
      sorted.sort((a, b) => computeSavingsRank(b) - computeSavingsRank(a));
      break;
  }

  return sorted;
}

export function computeAuditStats(deals) {
  if (!deals.length) {
    return {
      total: 0,
      avgPct: 0,
      steepCount: 0,
      byCategory: [],
      byStore: [],
    };
  }

  let pctSum = 0;
  let steepCount = 0;
  const catMap = new Map();
  const storeMap = new Map();

  for (const deal of deals) {
    pctSum += deal.pctOff;
    if (deal.verdict === 'steep') steepCount += 1;
    catMap.set(deal.category, (catMap.get(deal.category) || 0) + 1);
    storeMap.set(deal.store, (storeMap.get(deal.store) || 0) + 1);
  }

  const byCategory = [...catMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const byStore = [...storeMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    total: deals.length,
    avgPct: Number((pctSum / deals.length).toFixed(1)),
    steepCount,
    byCategory,
    byStore,
  };
}
