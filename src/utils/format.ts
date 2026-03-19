/** Format number as Vietnamese currency: "1.200.000 ₫" */
export function formatMoney(n: number): string {
  return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

/** Format balance: same as formatMoney */
export const formatBalance = formatMoney;

/** Format with sign: "+1.200.000 ₫" or "-1.200.000 ₫" */
export function formatSignedMoney(n: number): string {
  const abs = Math.abs(n);
  const formatted = new Intl.NumberFormat('vi-VN').format(abs) + ' ₫';
  return n >= 0 ? `+${formatted}` : `-${formatted}`;
}
