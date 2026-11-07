export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${roundMoney(amount).toFixed(2)}`;
  }
}

export function discountPercent(regular: number, sale?: number | null) {
  if (!sale || sale <= 0 || sale >= regular) return null;
  return Math.round(((regular - sale) / regular) * 100);
}

export function unitPrice(regular: number, sale?: number | null) {
  if (sale != null && sale > 0 && sale < regular) return roundMoney(sale);
  return roundMoney(regular);
}
