// Module 04 · Arrays — reference solution
// Run:  npm run solution 04
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('creating and reading', () => {
  test('4.1 🔮 index, length and at()', () => {
    const users: string[] = ['standard_user', 'admin', 'locked_user'];
    expect(users[0]).toBe('standard_user'); // index 0 = the first item
    expect(users.length).toBe(3);
    expect(users.at(-1)).toBe('locked_user'); // -1 = the last item
    expect(users[3]).toBe(undefined); // nothing there: undefined, not an error
  });

  test('4.2 ✍️ declare typed arrays', () => {
    const prices: number[] = [29.99, 9.99, 15.99];
    const categories: Array<string> = ['bags', 'accessories', 'clothes']; // same as string[]
    expect(prices).toEqual([29.99, 9.99, 15.99]);
    expect(categories).toEqual(['bags', 'accessories', 'clothes']);
  });

  test('4.3 🔮 push, pop, includes, indexOf', () => {
    const cart: string[] = [];
    cart.push('Backpack');
    cart.push('Bike Light');
    expect(cart.length).toBe(2);
    expect(cart.includes('Onesie')).toBe(false);
    expect(cart.indexOf('Bike Light')).toBe(1);
    const removed = cart.pop(); // removes the LAST item and gives it back
    expect(removed).toBe('Bike Light');
    expect(cart).toEqual(['Backpack']);
  });

  test('4.4 🐛 two arrays with the same content', () => {
    const names = ['Backpack', 'Onesie'];
    // toBe = "the same array in memory". toEqual = "the same content". Arrays and objects: toEqual.
    expect(names).toEqual(['Backpack', 'Onesie']);
  });

  test('4.5 🧪 assert a list from the page', () => {
    const headings: string[] = ['Backpack', 'Bike Light', 'Bolt T-Shirt'];
    expect(headings).toHaveLength(3);
    expect(headings).toContain('Bike Light');
  });
});

test.describe('looping and callbacks', () => {
  test('4.6 ✍️ for...of', () => {
    const quantities = [2, 1, 3];
    let totalItems = 0;
    for (const quantity of quantities) {
      totalItems += quantity;
    }
    expect(totalItems).toBe(6);
  });

  test('4.7 🔮 map', () => {
    const prices = [29.99, 9.99];
    const labels = prices.map((price) => `$${price}`);
    const lengths = ['Backpack', 'Onesie'].map((name) => name.length);
    expect(labels).toEqual(['$29.99', '$9.99']);
    expect(lengths).toEqual([8, 6]);
    expect(prices).toEqual([29.99, 9.99]); // map gives a NEW array; the original is untouched
  });

  test('4.8 ✍️ map to upper case', () => {
    const names = ['Backpack', 'Bike Light', 'Onesie'];
    const upperNames = names.map((name) => name.toUpperCase());
    expect(upperNames).toEqual(['BACKPACK', 'BIKE LIGHT', 'ONESIE']);
  });

  test('4.9 ✍️ filter the cheap prices', () => {
    const prices = [29.99, 9.99, 15.99, 49.99, 7.99];
    const cheap = prices.filter((price) => price < 20); // true = keep it
    expect(cheap).toEqual([9.99, 15.99, 7.99]);
  });

  test('4.10 🔮 find and findIndex', () => {
    const statusCodes = [200, 201, 404, 500];
    expect(statusCodes.find((code) => code >= 400)).toBe(404); // the FIRST match only
    expect(statusCodes.findIndex((code) => code >= 400)).toBe(2);
    expect(statusCodes.find((code) => code === 302)).toBe(undefined); // nothing found
    expect(statusCodes.findIndex((code) => code === 302)).toBe(-1); // nothing found
  });

  test('4.11 ✍️ find the first T-shirt', () => {
    const names = ['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt'];
    const firstShirt = names.find((name) => name.includes('T-Shirt'));
    expect(firstShirt).toBe('Bolt T-Shirt');
  });

  test('4.12 🔮 some and every', () => {
    const statusCodes = [200, 201, 404];
    expect(statusCodes.some((code) => code >= 400)).toBe(true); // 404 is
    expect(statusCodes.every((code) => code < 500)).toBe(true);
    expect(statusCodes.every((code) => code === 200)).toBe(false);
    const noCodes: number[] = [];
    expect(noCodes.some((code) => code === 200)).toBe(false); // an empty list has no "at least one"
  });

  test('4.13 🧪 check every item', () => {
    const prices = [29.99, 9.99, 15.99, 49.99, 7.99, 15.99];
    const stock = [10, 25, 40, 5, 0, 12];
    expect(prices.every((price) => price > 0)).toBe(true);
    expect(stock.some((amount) => amount === 0)).toBe(true);
  });

  test('4.14 ✍️ reduce: the cart total', () => {
    const cartPrices = [29.99, 9.99, 15.99];
    const total = cartPrices.reduce((sum, price) => sum + price, 0);
    expect(total).toBeCloseTo(55.97); // a calculated decimal: toBeCloseTo, not toBe
  });

  test('4.15 🐛 reduce gives back undefined', () => {
    const cartPrices = [29.99, 9.99, 15.99];
    // The { } made it a block body without return. Expression body = automatic return.
    const total = cartPrices.reduce((sum, price) => sum + price, 0);
    expect(total).toBeCloseTo(55.97);
  });
});

test.describe('sorting', () => {
  test('4.16 🔮 sort() and numbers', () => {
    const numbers = [10, 9, 100, 1];
    expect([...numbers].sort()).toEqual([1, 10, 100, 9]); // sorted as TEXT: '10' < '9' like 'ba' < 'c'
    expect([...numbers].sort((a, b) => a - b)).toEqual([1, 9, 10, 100]); // low to high
    expect([...numbers].sort((a, b) => b - a)).toEqual([100, 10, 9, 1]); // high to low
  });

  test('4.17 🐛 sort prices from low to high', () => {
    const prices = [15.99, 7.99, 29.99, 9.99, 49.99];
    const lowToHigh = [...prices].sort((a, b) => a - b); // numbers ALWAYS need a compare function
    expect(lowToHigh).toEqual([7.99, 9.99, 15.99, 29.99, 49.99]);
  });

  test('4.18 🐛 sorting broke the original list', () => {
    const original = ['Onesie', 'Backpack', 'Bike Light'];
    const sorted = [...original].sort(); // sort a COPY: sort() changes the array it is called on
    expect(sorted).toEqual(['Backpack', 'Bike Light', 'Onesie']);
    expect(original).toEqual(['Onesie', 'Backpack', 'Bike Light']);
  });

  test('4.19 🧪 is the list sorted?', () => {
    const namesAtoZ = ['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt'];
    const namesZtoA = ['Red T-Shirt', 'Onesie', 'Fleece Jacket', 'Bolt T-Shirt', 'Bike Light', 'Backpack'];
    expect(namesAtoZ).toEqual([...namesAtoZ].sort());
    expect(namesZtoA).toEqual([...namesZtoA].sort().reverse());
  });
});

test.describe('join, slice, spread, destructuring', () => {
  test('4.20 🔮 join, slice and spread', () => {
    const names = ['Backpack', 'Bike Light', 'Onesie'];
    expect(names.join(', ')).toBe('Backpack, Bike Light, Onesie');
    expect(names.slice(0, 2)).toEqual(['Backpack', 'Bike Light']); // index 2 NOT included
    expect([...names, 'Red T-Shirt'].length).toBe(4);
    expect(names.length).toBe(3); // slice and spread make NEW arrays
    expect(Math.max(...[29.99, 9.99, 7.99])).toBe(29.99);
  });

  test('4.21 ✍️ array destructuring', () => {
    const credentials = ['standard_user', 'secret123'];
    const [username, password] = credentials; // by POSITION: first item, second item
    expect(username).toBe('standard_user');
    expect(password).toBe('secret123');
  });
});

test.describe('combine everything', () => {
  test('4.22 ✍️ prices from the page', () => {
    const priceTexts = ['$7.99', '$9.99', '$15.99', '$15.99', '$29.99', '$49.99'];
    const prices = priceTexts.map((text) => parseFloat(text.replace('$', '')));
    const highest = Math.max(...prices); // spread: Math.max wants separate numbers, not one array
    expect(prices).toEqual([7.99, 9.99, 15.99, 15.99, 29.99, 49.99]);
    expect(highest).toBe(49.99);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('4.23 ✍️ names of the products in stock', () => {
    const products = [
      { name: 'Backpack', price: 29.99, stock: 10 },
      { name: 'Bike Light', price: 9.99, stock: 25 },
      { name: 'Bolt T-Shirt', price: 15.99, stock: 40 },
      { name: 'Fleece Jacket', price: 49.99, stock: 5 },
      { name: 'Onesie', price: 7.99, stock: 0 },
      { name: 'Red T-Shirt', price: 15.99, stock: 12 },
    ];
    const inStockNames = products.filter((product) => product.stock > 0).map((product) => product.name);
    const soldOutCount = products.filter((product) => product.stock === 0).length;
    expect(inStockNames).toEqual(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Red T-Shirt']);
    expect(soldOutCount).toBe(1);
  });

  test('4.24 🐛 we wanted ONE product, not a list', () => {
    const products = [
      { name: 'Backpack', price: 29.99, stock: 10 },
      { name: 'Onesie', price: 7.99, stock: 0 },
      { name: 'Red T-Shirt', price: 15.99, stock: 12 },
    ];
    const soldOut = products.find((product) => product.stock === 0); // find = the first ITEM, filter = an ARRAY
    expect(soldOut).toEqual({ name: 'Onesie', price: 7.99, stock: 0 });
  });
});
