// Module 04 · Arrays
// Run:  npm run check 04
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('creating and reading', () => {
  test('4.1 🔮 index, length and at()', () => {
    const users: string[] = ['standard_user', 'admin', 'locked_user'];
    expect(users[0]).toBe(___);
    expect(users.length).toBe(___);
    expect(users.at(-1)).toBe(___);
    expect(users[3]).toBe(___);
  });

  test('4.2 ✍️ declare typed arrays', () => {
    // 1. Declare a constant prices, of type number[], with the values 29.99, 9.99 and 15.99
    // 2. Declare a constant categories, of type Array<string>, with 'bags', 'accessories' and 'clothes'
    // ✍️ your code here

    todo();
    expect(prices).toEqual([29.99, 9.99, 15.99]);
    expect(categories).toEqual(['bags', 'accessories', 'clothes']);
  });

  test('4.3 🔮 push, pop, includes, indexOf', () => {
    const cart: string[] = [];
    cart.push('Backpack');
    cart.push('Bike Light');
    expect(cart.length).toBe(___);
    expect(cart.includes('Onesie')).toBe(___);
    expect(cart.indexOf('Bike Light')).toBe(___);
    const removed = cart.pop();
    expect(removed).toBe(___);
    expect(cart).toEqual(___); // write the whole array: [ ... ]
  });

  test('4.4 🐛 two arrays with the same content', () => {
    // Read the error message: "serializes to the same string". Change the matcher.
    const names = ['Backpack', 'Onesie'];
    expect(names).toBe(['Backpack', 'Onesie']);
  });

  test('4.5 🧪 assert a list from the page', () => {
    // Imagine this came from: await page.getByRole('heading', { level: 2 }).allTextContents()
    const headings: string[] = ['Backpack', 'Bike Light', 'Bolt T-Shirt'];
    // Write TWO assertions:
    //  - headings has 3 items          (matcher: toHaveLength)
    //  - headings contains 'Bike Light' (matcher: toContain)
    // ✍️ your code here

    todo();
  });
});

test.describe('looping and callbacks', () => {
  test('4.6 ✍️ for...of', () => {
    const quantities = [2, 1, 3];
    // Declare `let totalItems = 0;` then write a for...of loop that adds every quantity to totalItems.
    // Shape: for (const quantity of quantities) { ... }
    // ✍️ your code here

    todo();
    expect(totalItems).toBe(6);
  });

  test('4.7 🔮 map', () => {
    const prices = [29.99, 9.99];
    const labels = prices.map((price) => `$${price}`);
    const lengths = ['Backpack', 'Onesie'].map((name) => name.length);
    expect(labels).toEqual(___);
    expect(lengths).toEqual(___);
    expect(prices).toEqual(___); // did map change prices?
  });

  test('4.8 ✍️ map to upper case', () => {
    const names = ['Backpack', 'Bike Light', 'Onesie'];
    // Create a constant upperNames with every name in UPPER case. Use map.
    // Shape: const upperNames = names.map((name) => ...);
    // ✍️ your code here

    todo();
    expect(upperNames).toEqual(['BACKPACK', 'BIKE LIGHT', 'ONESIE']);
  });

  test('4.9 ✍️ filter the cheap prices', () => {
    const prices = [29.99, 9.99, 15.99, 49.99, 7.99];
    // Create a constant cheap with only the prices UNDER 20. Use filter.
    // ✍️ your code here

    todo();
    expect(cheap).toEqual([9.99, 15.99, 7.99]);
  });

  test('4.10 🔮 find and findIndex', () => {
    const statusCodes = [200, 201, 404, 500];
    expect(statusCodes.find((code) => code >= 400)).toBe(___);
    expect(statusCodes.findIndex((code) => code >= 400)).toBe(___);
    expect(statusCodes.find((code) => code === 302)).toBe(___);
    expect(statusCodes.findIndex((code) => code === 302)).toBe(___);
  });

  test('4.11 ✍️ find the first T-shirt', () => {
    const names = ['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt'];
    // Create a constant firstShirt: the first name that includes 'T-Shirt'. Use find.
    // ✍️ your code here

    todo();
    expect(firstShirt).toBe('Bolt T-Shirt');
  });

  test('4.12 🔮 some and every', () => {
    const statusCodes = [200, 201, 404];
    expect(statusCodes.some((code) => code >= 400)).toBe(___);
    expect(statusCodes.every((code) => code < 500)).toBe(___);
    expect(statusCodes.every((code) => code === 200)).toBe(___);
    const noCodes: number[] = [];
    expect(noCodes.some((code) => code === 200)).toBe(___); // an empty list: is there at least one?
  });

  test('4.13 🧪 check every item', () => {
    const prices = [29.99, 9.99, 15.99, 49.99, 7.99, 15.99];
    const stock = [10, 25, 40, 5, 0, 12];
    // Write TWO assertions:
    //  - EVERY price is greater than 0               -> expect(prices.every(...)).toBe(true);
    //  - SOME stock value is 0 (a sold out product)  -> expect(stock.some(...)).toBe(true);
    // ✍️ your code here

    todo();
  });

  test('4.14 ✍️ reduce: the cart total', () => {
    const cartPrices = [29.99, 9.99, 15.99];
    // Create a constant total: the sum of all cartPrices. Use reduce with a starting value of 0.
    // Shape: const total = cartPrices.reduce((sum, price) => ..., 0);
    // ✍️ your code here

    todo();
    expect(total).toBeCloseTo(55.97);
  });

  test('4.15 🐛 reduce gives back undefined', () => {
    const cartPrices = [29.99, 9.99, 15.99];
    const total = cartPrices.reduce((sum, price) => {
      sum + price;
    }, 0);
    expect(total).toBeCloseTo(55.97);
  });
});

test.describe('sorting', () => {
  test('4.16 🔮 sort() and numbers', () => {
    const numbers = [10, 9, 100, 1];
    expect([...numbers].sort()).toEqual(___);
    expect([...numbers].sort((a, b) => a - b)).toEqual(___);
    expect([...numbers].sort((a, b) => b - a)).toEqual(___);
  });

  test('4.17 🐛 sort prices from low to high', () => {
    const prices = [15.99, 7.99, 29.99, 9.99, 49.99];
    const lowToHigh = [...prices].sort();
    expect(lowToHigh).toEqual([7.99, 9.99, 15.99, 29.99, 49.99]);
  });

  test('4.18 🐛 sorting broke the original list', () => {
    const original = ['Onesie', 'Backpack', 'Bike Light'];
    const sorted = original.sort();
    expect(sorted).toEqual(['Backpack', 'Bike Light', 'Onesie']);
    expect(original).toEqual(['Onesie', 'Backpack', 'Bike Light']); // the original must NOT change
  });

  test('4.19 🧪 is the list sorted?', () => {
    // The products page with "Name (A to Z)" and with "Name (Z to A)":
    const namesAtoZ = ['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt'];
    const namesZtoA = ['Red T-Shirt', 'Onesie', 'Fleece Jacket', 'Bolt T-Shirt', 'Bike Light', 'Backpack'];
    // Write TWO assertions:
    //  - namesAtoZ equals a sorted COPY of itself
    //  - namesZtoA equals a sorted, then reversed, COPY of itself   ([...x].sort().reverse())
    // ✍️ your code here

    todo();
  });
});

test.describe('join, slice, spread, destructuring', () => {
  test('4.20 🔮 join, slice and spread', () => {
    const names = ['Backpack', 'Bike Light', 'Onesie'];
    expect(names.join(', ')).toBe(___);
    expect(names.slice(0, 2)).toEqual(___);
    expect([...names, 'Red T-Shirt'].length).toBe(___);
    expect(names.length).toBe(___); // did slice or spread change names?
    expect(Math.max(...[29.99, 9.99, 7.99])).toBe(___);
  });

  test('4.21 ✍️ array destructuring', () => {
    const credentials = ['standard_user', 'secret123'];
    // With ONE line of array destructuring, create the constants username and password from credentials.
    // Shape: const [a, b] = list;
    // ✍️ your code here

    todo();
    expect(username).toBe('standard_user');
    expect(password).toBe('secret123');
  });
});

test.describe('combine everything', () => {
  test('4.22 ✍️ prices from the page', () => {
    // From: await page.locator('.price').allTextContents()   with "Price (low to high)" selected
    const priceTexts = ['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99'];
    // 1. Create a constant prices: the texts as numbers (map + replace + parseFloat)
    // 2. Create a constant highest: the biggest price (Math.max + spread)
    // ✍️ your code here

    todo();
    expect(prices).toEqual([7.99, 9.99, 15.99, 15.99, 29.99, 49.99]);
    expect(highest).toBe(49.99);
    expect(prices).toEqual([...prices].sort((a, b) => a - b)); // sorted low to high ✅
  });

  test('4.23 ✍️ names of the products in stock', () => {
    // An array of objects (more in module 05). Read a property with a dot: product.stock
    const products = [
      { name: 'Backpack', price: 29.99, stock: 10 },
      { name: 'Bike Light', price: 9.99, stock: 25 },
      { name: 'Bolt T-Shirt', price: 15.99, stock: 40 },
      { name: 'Fleece Jacket', price: 49.99, stock: 5 },
      { name: 'Onesie', price: 7.99, stock: 0 },
      { name: 'Red T-Shirt', price: 15.99, stock: 12 },
    ];
    // 1. Create a constant inStockNames: the NAMES of the products with stock greater than 0 (filter, then map)
    // 2. Create a constant soldOutCount: HOW MANY products have stock 0 (filter, then .length)
    // ✍️ your code here

    todo();
    expect(inStockNames).toEqual(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Red T-Shirt']);
    expect(soldOutCount).toBe(1);
  });

  test('4.24 🐛 we wanted ONE product, not a list', () => {
    const products = [
      { name: 'Backpack', price: 29.99, stock: 10 },
      { name: 'Onesie', price: 7.99, stock: 0 },
      { name: 'Red T-Shirt', price: 15.99, stock: 12 },
    ];
    // Read Expected vs Received: one is an object { }, the other is an array [ ]. Use the right method.
    const soldOut = products.filter((product) => product.stock === 0);
    expect(soldOut).toEqual({ name: 'Onesie', price: 7.99, stock: 0 });
  });
});
