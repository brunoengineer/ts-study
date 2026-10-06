// Module 02 · Strings and Numbers — reference solution
// Run:  npm run solution 02
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('template literals', () => {
  test('2.1 🔮 a value inside a string', () => {
    const name = 'Sam';
    const cartCount = 3;
    expect(`Hello, ${name}!`).toBe('Hello, Sam!');
    expect(`Cart (${cartCount})`).toBe('Cart (3)');
    expect(`${cartCount + 1} items`).toBe('4 items'); // ${} runs code: 3 + 1 is calculated first
  });

  test('2.2 ✍️ build a product URL', () => {
    const baseUrl = 'http://localhost:3000';
    const productId = 4;
    const productUrl = `${baseUrl}/products/${productId}`;
    expect(productUrl).toBe('http://localhost:3000/products/4');
  });

  test('2.3 🐛 the greeting is not filled in', () => {
    const username = 'standard_user';
    const greeting = `Hello, ${username}!`; // backticks, not single quotes: only backticks fill ${}
    expect(greeting).toBe('Hello, standard_user!');
  });

  test('2.4 ✍️ a unique email', () => {
    const timestamp = 1767225600000;
    const email = `user_${timestamp}@test.com`;
    expect(email).toBe('user_1767225600000@test.com');
  });
});

test.describe('string methods', () => {
  test('2.5 🔮 length, [index] and at()', () => {
    const code = 'ORD-1001';
    expect(code.length).toBe(8);
    expect(code[0]).toBe('O'); // counting starts at 0
    expect(code.at(-1)).toBe('1'); // -1 = the last one. Still a string!
  });

  test('2.6 🔮 trim and change case', () => {
    const buttonText = '  Add to Cart  ';
    expect(buttonText.trim()).toBe('Add to Cart');
    expect(buttonText.trim().toLowerCase()).toBe('add to cart');
    expect(buttonText.length).toBe(15); // strings never change: trim() returned a NEW string
  });

  test('2.7 🔮 includes, startsWith, endsWith, indexOf', () => {
    const url = 'http://localhost:3000/products?sort=az';
    expect(url.includes('/products')).toBe(true);
    expect(url.startsWith('https')).toBe(false); // it's http, without the s
    expect(url.endsWith('az')).toBe(true);
    expect(url.includes('Products')).toBe(false); // case-sensitive
    expect(url.indexOf('#')).toBe(-1); // -1 = not found
  });

  test('2.8 ✍️ cut the number out of an order code', () => {
    const orderCode = 'ORD-1001';
    const digits = orderCode.slice(4); // from index 4 to the end
    const prefix = orderCode.slice(0, 3); // from 0 up to 3 (3 not included)
    expect(digits).toBe('1001');
    expect(prefix).toBe('ORD');
  });

  test('2.9 🔮 split a full name', () => {
    const fullName = 'Sam Standard';
    const parts = fullName.split(' ');
    expect(parts.length).toBe(2);
    expect(parts[0]).toBe('Sam');
    expect(parts[1]).toBe('Standard');
  });

  test('2.10 🐛 only the first space was replaced', () => {
    const productName = 'Bike Light Pro';
    const slug = productName.replaceAll(' ', '-'); // replace() only changes the FIRST match
    expect(slug).toBe('Bike-Light-Pro');
  });

  test('2.11 ✍️ pad an order number', () => {
    const id = '7';
    const orderCode = `ORD-${id.padStart(4, '0')}`;
    expect(orderCode).toBe('ORD-0007');
  });

  test('2.12 🧪 assert an error message', () => {
    const message = 'Sorry, this user has been locked out.';
    expect(message).toContain('locked out');
    expect(message.startsWith('Sorry')).toBe(true);
  });
});

test.describe('numbers and conversion', () => {
  test('2.13 🔮 text to number', () => {
    expect(Number('42')).toBe(42);
    expect(parseInt('42px')).toBe(42); // parseInt stops at the first character that isn't a digit
    expect(parseFloat('29.99')).toBe(29.99);
    expect(Number('$29.99')).toBe(NaN); // the $ makes it "not a number"
    expect(String(200)).toBe('200');
  });

  test('2.14 🐛 the quantity comes from an input field', () => {
    const quantity = '2';
    const total = Number(quantity) + 1; // '2' + 1 would be '21' (string glue)
    expect(total).toBe(3);
  });

  test('2.15 ✍️ parse the cart total', () => {
    const totalText = 'Total: $59.98';
    const total = parseFloat(totalText.replace('Total: $', ''));
    expect(total).toBe(59.98);
    expect(typeof total).toBe('number');
  });

  test('2.16 ✍️ format a price', () => {
    const price = 7.5;
    const priceText = `$${price.toFixed(2)}`; // first $ is just text, ${ starts the hole
    expect(priceText).toBe('$7.50');
    expect(typeof priceText).toBe('string');
    expect((9.999).toFixed(2)).toBe('10.00'); // already correct: toFixed ROUNDS and gives back a string
  });
});

test.describe('Math, NaN and decimals', () => {
  test('2.17 🔮 Math', () => {
    expect(Math.round(2.5)).toBe(3); // .5 goes up
    expect(Math.floor(2.9)).toBe(2); // always down
    expect(Math.ceil(2.1)).toBe(3); // always up
    expect(Math.max(3, 7, 1)).toBe(7);
    expect(Math.min(3, 7, 1)).toBe(1);
  });

  test('2.18 🐛 two prices in the cart', () => {
    const fleeceJacket = 49.99;
    const bikeLight = 9.99;
    // 49.99 + 9.99 is really 59.980000000000004, so toBe fails. toBeCloseTo allows a tiny difference.
    expect(fleeceJacket + bikeLight).toBeCloseTo(59.98);
  });

  test('2.19 🔮 NaN', () => {
    const parsed = Number('free');
    // @ts-expect-error - TypeScript knows that comparing with NaN using === is always false
    expect(parsed === NaN).toBe(false); // NaN is not equal to anything, not even NaN
    expect(Number.isNaN(parsed)).toBe(true); // the right way to check
    expect(typeof parsed).toBe('number'); // yes, "not a number" is a number
  });

  test('2.20 ✍️ a random dice roll', () => {
    const roll = Math.floor(Math.random() * 6) + 1; // 0..5, then + 1 = 1..6
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
    expect(Number.isInteger(roll)).toBe(true);
  });
});

test.describe('regular expressions', () => {
  test('2.21 🔮 regex.test(text) and text.match(regex)', () => {
    expect(/products/.test('http://localhost:3000/products/4')).toBe(true);
    expect(/^Hello/.test('Hello, Sam!')).toBe(true);
    expect(/^Hello/.test('Oh, Hello!')).toBe(false); // ^ = must be at the START
    expect(/^hello/.test('Hello, Sam!')).toBe(false); // case-sensitive
    expect(/^hello/i.test('Hello, Sam!')).toBe(true); // the i flag ignores case
    expect(/\d+ items/.test('Cart: 12 items')).toBe(true);
    const found = 'Loaded 6 products'.match(/\d+/);
    expect(found?.[0]).toBe('6'); // a STRING: match finds text, it doesn't convert
  });

  test('2.22 🧪 assert with toMatch', () => {
    const resultCount = '6 products';
    const url = 'http://localhost:3000/products?sort=lohi';
    expect(resultCount).toMatch(/^\d+ products$/);
    expect(url).toMatch(/products/);
  });
});

test.describe('combine everything', () => {
  test('2.23 ✍️ average price per item', () => {
    const totalText = 'Total: $59.98';
    const itemCount = 2;
    const total = parseFloat(totalText.replace('Total: $', ''));
    const averageText = `$${(total / itemCount).toFixed(2)}`;
    expect(averageText).toBe('$29.99');
  });

  test('2.24 🧪 check a generated email', () => {
    const email = `qa_${Date.now()}@test.com`;
    expect(email).toMatch(/^qa_\d+@test\.com$/);
    expect(email).toContain('@');
    expect(email.endsWith('@test.com')).toBe(true);
  });

  test('2.25 🐛 compare a heading without caring about case and spaces', () => {
    const headingOnPage = '  welcome to QA SHOP \n';
    const expectedHeading = 'Welcome to QA Shop';
    const normalized = headingOnPage.trim().toLowerCase(); // trim removes spaces AND new lines at both ends
    expect(normalized).toBe(expectedHeading.toLowerCase()); // lower-case BOTH sides
  });
});
