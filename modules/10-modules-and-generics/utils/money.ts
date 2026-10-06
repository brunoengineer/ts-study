export const CURRENCY_SYMBOL = '$';

// 10.2 🐛 This function works, but exercises.spec.ts can't use it. Why? (One word is missing.)
function formatPrice(price: number): string {
  return `${CURRENCY_SYMBOL}${price.toFixed(2)}`;
}

// 10.3 ✍️ Below this line, write AND export a function toCents(price: number): number
//          It returns the price in cents, rounded: Math.round(price * 100)
