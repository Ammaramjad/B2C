/** Authoritative cancellation fee. quote() remains in pricing.ts. */
export function cancelFee(hoursBefore: number, total: number, midPct = 0.5) {
  if (hoursBefore >= 24) return 0;
  if (hoursBefore >= 6) return Math.round(total * midPct);
  return total;
}
