// Module 02 · Strings and Numbers
// Run:  npm run check 02
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('template literals', () => {
  test('2.1 🔮 a value inside a string', () => {
    const name = 'Sam';
    const cartCount = 3;
    expect(`Hello, ${name}!`).toBe(___);
    expect(`Cart (${cartCount})`).toBe(___);
    expect(`${cartCount + 1} items`).toBe(___);
  });

  test('2.2 ✍️ build a product URL', () => {
    const baseUrl = 'http://localhost:3000';
    const productId = 4;
    // Create a constant productUrl using a TEMPLATE LITERAL (backticks) and the two constants above.
    // Shape: const productUrl = `${...}/products/${...}`;
    // ✍️ your code here

    todo();
    expect(productUrl).toBe('http://localhost:3000/products/4');
  });

  test('2.3 🐛 the greeting is not filled in', () => {
    // Run it and read Expected vs Received. Why is ${username} still in the text?
    const username = 'standard_user';
    const greeting = 'Hello, ${username}!';
    expect(greeting).toBe('Hello, standard_user!');
  });

  test('2.4 ✍️ a unique email', () => {
    // In real tests you would use Date.now(). Here we use a fixed number so the test can check the result.
    const timestamp = 1767225600000;
    // Create a constant email: 'user_' + timestamp + '@test.com', with ONE template literal (no +).
    // ✍️ your code here

    todo();
    expect(email).toBe('user_1767225600000@test.com');
  });
});

test.describe('string methods', () => {
  test('2.5 🔮 length, [index] and at()', () => {
    const code = 'ORD-1001';
    expect(code.length).toBe(___);
    expect(code[0]).toBe(___);
    expect(code.at(-1)).toBe(___);
  });

  test('2.6 🔮 trim and change case', () => {
    const buttonText = '  Add to Cart  ';
    expect(buttonText.trim()).toBe(___);
    expect(buttonText.trim().toLowerCase()).toBe(___);
    expect(buttonText.length).toBe(___); // careful: did trim() change buttonText itself?
  });

  test('2.7 🔮 includes, startsWith, endsWith, indexOf', () => {
    const url = 'http://localhost:3000/products?sort=az';
    expect(url.includes('/products')).toBe(___);
    expect(url.startsWith('https')).toBe(___);
    expect(url.endsWith('az')).toBe(___);
    expect(url.includes('Products')).toBe(___);
    expect(url.indexOf('#')).toBe(___);
  });

  test('2.8 ✍️ cut the number out of an order code', () => {
    const orderCode = 'ORD-1001';
    // Create a constant digits with the part AFTER 'ORD-' (that is '1001'). Use slice.
    // Then create a constant prefix with the first 3 characters ('ORD'). Use slice with two numbers.
    // ✍️ your code here

    todo();
    expect(digits).toBe('1001');
    expect(prefix).toBe('ORD');
  });

  test('2.9 🔮 split a full name', () => {
    const fullName = 'Sam Standard';
    const parts = fullName.split(' ');
    expect(parts.length).toBe(___);
    expect(parts[0]).toBe(___);
    expect(parts[1]).toBe(___);
  });

  test('2.10 🐛 only the first space was replaced', () => {
    // We want a URL "slug" for the product: every space becomes a dash.
    const productName = 'Bike Light Pro';
    const slug = productName.replace(' ', '-');
    expect(slug).toBe('Bike-Light-Pro');
  });

  test('2.11 ✍️ pad an order number', () => {
    const id = '7';
    // Create a constant orderCode = 'ORD-' + the id padded with zeros to 4 characters.
    // Use a template literal and padStart.   Shape: `ORD-${id.padStart(..., ...)}`
    // ✍️ your code here

    todo();
    expect(orderCode).toBe('ORD-0007');
  });

  test('2.12 🧪 assert an error message', () => {
    const message = 'Sorry, this user has been locked out.';
    // Write TWO assertions:
    //  - message contains the text 'locked out'            (matcher: toContain)
    //  - message.startsWith('Sorry') is true               (matcher: toBe)
    // ✍️ your code here

    todo();
  });
});

test.describe('numbers and conversion', () => {
  test('2.13 🔮 text to number', () => {
    expect(Number('42')).toBe(___);
    expect(parseInt('42px')).toBe(___);
    expect(parseFloat('29.99')).toBe(___);
    expect(Number('$29.99')).toBe(___); // hint: what do you get when it is "not a number"?
    expect(String(200)).toBe(___);
  });

  test('2.14 🐛 the quantity comes from an input field', () => {
    // Everything you read from an input is a string. Fix the line that calculates total.
    const quantity = '2';
    const total = quantity + 1;
    expect(total).toBe(3);
  });

  test('2.15 ✍️ parse the cart total', () => {
    const totalText = 'Total: $59.98';
    // Create a constant total that is the NUMBER 59.98.
    // Step 1: remove 'Total: $' with replace. Step 2: convert with parseFloat. (One line or two, your choice.)
    // ✍️ your code here

    todo();
    expect(total).toBe(59.98);
    expect(typeof total).toBe('number');
  });

  test('2.16 ✍️ format a price', () => {
    const price = 7.5;
    // Create a constant priceText = '$7.50' using a template literal and toFixed(2).
    // ✍️ your code here

    todo();
    expect(priceText).toBe('$7.50');
    expect(typeof priceText).toBe('string');
    expect((9.999).toFixed(2)).toBe('10.00'); // already correct: toFixed ROUNDS and gives back a string
  });
});

test.describe('Math, NaN and decimals', () => {
  test('2.17 🔮 Math', () => {
    expect(Math.round(2.5)).toBe(___);
    expect(Math.floor(2.9)).toBe(___);
    expect(Math.ceil(2.1)).toBe(___);
    expect(Math.max(3, 7, 1)).toBe(___);
    expect(Math.min(3, 7, 1)).toBe(___);
  });

  test('2.18 🐛 two prices in the cart', () => {
    // The maths is right, the assertion is wrong. Use the matcher made for decimals.
    const fleeceJacket = 49.99;
    const bikeLight = 9.99;
    expect(fleeceJacket + bikeLight).toBe(59.98);
  });

  test('2.19 🔮 NaN', () => {
    const parsed = Number('free');
    // @ts-expect-error - TypeScript knows that comparing with NaN using === is always false
    expect(parsed === NaN).toBe(___);
    expect(Number.isNaN(parsed)).toBe(___);
    expect(typeof parsed).toBe(___);
  });

  test('2.20 ✍️ a random dice roll', () => {
    // Create a constant roll: a random WHOLE number from 1 to 6.
    // Shape: Math.floor(Math.random() * howManyOptions) + smallest
    // ✍️ your code here

    todo();
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(6);
    expect(Number.isInteger(roll)).toBe(true);
  });
});

test.describe('regular expressions', () => {
  test('2.21 🔮 regex.test(text) and text.match(regex)', () => {
    expect(/products/.test('http://localhost:3000/products/4')).toBe(___);
    expect(/^Hello/.test('Hello, Sam!')).toBe(___);
    expect(/^Hello/.test('Oh, Hello!')).toBe(___);
    expect(/^hello/.test('Hello, Sam!')).toBe(___);
    expect(/^hello/i.test('Hello, Sam!')).toBe(___);
    expect(/\d+ items/.test('Cart: 12 items')).toBe(___);
    // text.match(regex) gives back what it found. Is it a number or a string?
    const found = 'Loaded 6 products'.match(/\d+/);
    expect(found?.[0]).toBe(___);
  });

  test('2.22 🧪 assert with toMatch', () => {
    const resultCount = '6 products';
    const url = 'http://localhost:3000/products?sort=lohi';
    // Write TWO assertions with toMatch:
    //  - resultCount matches: start, one or more digits, ' products', end
    //  - url matches: 'products' anywhere
    // ✍️ your code here

    todo();
  });
});

test.describe('combine everything', () => {
  test('2.23 ✍️ average price per item', () => {
    const totalText = 'Total: $59.98';
    const itemCount = 2;
    // Create a constant averageText = '$29.99':
    //  1. turn totalText into a number
    //  2. divide by itemCount
    //  3. format with a template literal and toFixed(2)
    // ✍️ your code here

    todo();
    expect(averageText).toBe('$29.99');
  });

  test('2.24 🧪 check a generated email', () => {
    const email = `qa_${Date.now()}@test.com`;
    // Write THREE assertions:
    //  - email matches /^qa_\d+@test\.com$/
    //  - email contains '@'
    //  - email.endsWith('@test.com') is true
    // ✍️ your code here

    todo();
  });

  test('2.25 🐛 compare a heading without caring about case and spaces', () => {
    const headingOnPage = '  welcome to QA SHOP \n';
    const expectedHeading = 'Welcome to QA Shop';
    // Fix the line that builds `normalized`: it must remove the extra spaces/new line AND lower-case the text.
    // Then make the assertion compare with expectedHeading lower-cased too.
    const normalized = headingOnPage.toUpperCase();
    expect(normalized).toBe(expectedHeading);
  });
});
