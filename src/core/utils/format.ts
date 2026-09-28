/**
 * Central money/weight formatters (prototypes show price-per-unit labels
 * everywhere — keep them consistent via these helpers, no ad-hoc strings).
 */

/** 4850 -> "₹4,850", 12600 -> "₹12,600" (manual Indian grouping, no Intl dependency). */
export function priceLabel(price: number): string {
  const rounded = Math.round(price);
  const s = String(Math.abs(rounded));
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest.replace(/(\d)(?=(\d{2})+$)/g, "$1,");
  const out = (rest ? `${grouped},${last3}` : last3) || "0";
  return `₹${rounded < 0 ? "-" : ""}${out}`;
}

/** 40 -> "40 bags", 1 -> "1 bag". */
export function bagsLabel(bags: number): string {
  return `${bags} bag${bags === 1 ? "" : "s"}`;
}
