export const CURRENCY_SYMBOL = '$';

// 10.2: without `export`, the function is private to this file.
export function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}

// 10.3
export function toCents(price: number): number {
  return Math.round(price * 100); // 29.99 * 100 is 2998.9999999999995, so round it
}
