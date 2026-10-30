// Prices are stored in cedis; Paystack works in pesewas.
export const CURRENCY = "GHS";

export function toPesewas(cedis: number) {
  return Math.round(cedis * 100);
}

// Sums of float prices drift (0.1 + 0.2) — round every total to 2 places.
export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

const formatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

export function formatMoney(value: number | null | undefined) {
  return formatter.format(value || 0);
}
