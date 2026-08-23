export const SORT_GAP = 1000;
const MIN_GAP = 1e-6;

export function sortBetween(before: number | null, after: number | null) {
  if (before == null && after == null) {
    return SORT_GAP;
  }
  if (before == null) {
    return after! / 2;
  }
  if (after == null) {
    return before + SORT_GAP;
  }
  return (before + after) / 2;
}

export function needsRebalance(
  before: number | null,
  after: number | null,
  next: number,
) {
  if (before != null && !(next > before)) {
    return true;
  }
  if (after != null && !(next < after)) {
    return true;
  }
  if (before != null && after != null && after - before < MIN_GAP) {
    return true;
  }
  return false;
}

export function rebalanceOrders(count: number) {
  return Array.from({ length: count }, (_, index) => (index + 1) * SORT_GAP);
}
