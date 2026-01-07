/**
 * 格式化金額 (從 cents 轉換為顯示格式)
 * @param cents - 金額 (單位: cents)
 * @param currency - 貨幣符號，預設為 '$'
 * @returns 格式化後的金額字串，如 "$27,000.00"
 */
export function formatCurrency(cents: number, currency: string = '$'): string {
  if (!cents && cents !== 0) return `${currency}0.00`;
  const dollars = cents / 100;
  return `${currency}${dollars.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * 解析金額字串為 cents
 * @param amount - 金額字串，如 "$27,000.00"
 * @returns 金額 (單位: cents)
 */
export function parseCurrency(amount: string): number {
  const numeric = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
  return Math.round(numeric * 100);
}
