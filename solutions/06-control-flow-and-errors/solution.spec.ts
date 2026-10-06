// Module 06 · Control Flow and Errors — reference solution
// Run:  npm run solution 06
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('if / else and operators', () => {
  test('6.1 🔮 && || and !', () => {
    const status: number = 201;
    const isLoggedIn: boolean = false;
    expect(status >= 200 && status < 300).toBe(true); // both sides are true
    expect(status === 404 || status === 500).toBe(false); // neither side is true
    expect(!isLoggedIn).toBe(true); // ! flips false to true
    expect(isLoggedIn || status > 200).toBe(true); // the right side is true, that's enough for ||
  });

  test('6.2 ✍️ if / else if / else', () => {
    function statusCategory(status: number): string {
      if (status >= 200 && status < 300) {
        return 'success';
      } else if (status >= 300 && status < 400) {
        return 'redirect';
      } else if (status >= 400 && status < 500) {
        return 'client error';
      } else if (status >= 500) {
        return 'server error';
      } else {
        return 'unknown';
      }
    }
    expect(statusCategory(200)).toBe('success');
    expect(statusCategory(302)).toBe('redirect');
    expect(statusCategory(404)).toBe('client error');
    expect(statusCategory(503)).toBe('server error');
    expect(statusCategory(100)).toBe('unknown');
  });

  test('6.3 🐛 the conditions are in the wrong order', () => {
    function priceTier(price: number): string {
      // Check the SMALLEST range first: 9.99 is also < 30, so the order decides.
      if (price < 10) {
        return 'cheap';
      } else if (price < 30) {
        return 'medium';
      } else {
        return 'expensive';
      }
    }
    expect(priceTier(9.99)).toBe('cheap');
    expect(priceTier(29.99)).toBe('medium');
    expect(priceTier(49.99)).toBe('expensive');
  });

  test('6.4 🔮 truthy or falsy?', () => {
    expect(Boolean('')).toBe(false); // empty string: falsy
    expect(Boolean('0')).toBe(true); // a NON-empty string, even if it says '0'
    expect(Boolean(0)).toBe(false);
    expect(Boolean([])).toBe(true); // every array is truthy, even an empty one
    expect(Boolean(null)).toBe(false);
    expect(Boolean('false')).toBe(true); // non-empty string again
  });

  test('6.5 🐛 the 0 trap', () => {
    function stockLabel(stock: number | undefined): string {
      if (stock === undefined) return 'unknown'; // ask the exact question: 0 is a real value
      if (stock === 0) return 'Sold out';
      return `${stock} in stock`;
    }
    expect(stockLabel(10)).toBe('10 in stock');
    expect(stockLabel(undefined)).toBe('unknown');
    expect(stockLabel(0)).toBe('Sold out');
  });

  test('6.6 ✍️ the ternary', () => {
    const buttonLabel = (stock: number): string => (stock > 0 ? 'Add to cart' : 'Sold out');
    expect(buttonLabel(10)).toBe('Add to cart');
    expect(buttonLabel(0)).toBe('Sold out');
  });
});

test.describe('switch', () => {
  test('6.7 ✍️ switch with return', () => {
    function sortLabel(option: string): string {
      switch (option) {
        case 'az':
          return 'Name (A to Z)';
        case 'za':
          return 'Name (Z to A)';
        case 'lohi':
          return 'Price (low to high)';
        case 'hilo':
          return 'Price (high to low)';
        default:
          return 'Unknown sort';
      }
    }
    expect(sortLabel('az')).toBe('Name (A to Z)');
    expect(sortLabel('za')).toBe('Name (Z to A)');
    expect(sortLabel('lohi')).toBe('Price (low to high)');
    expect(sortLabel('hilo')).toBe('Price (high to low)');
    expect(sortLabel('random')).toBe('Unknown sort');
  });

  test('6.8 🐛 fall-through', () => {
    function methodColor(method: string): string {
      let color = '';
      switch (method) {
        case 'GET':
          color = 'green';
          break; // without this, GET "falls through" into the POST case
        case 'POST':
          color = 'blue';
          break;
        case 'DELETE':
          color = 'red';
          break;
        default:
          color = 'grey';
      }
      return color;
    }
    expect(methodColor('GET')).toBe('green');
    expect(methodColor('POST')).toBe('blue');
    expect(methodColor('DELETE')).toBe('red');
    expect(methodColor('PATCH')).toBe('grey');
  });
});

test.describe('loops', () => {
  test('6.9 🔮 for...of with an if inside', () => {
    const durations = [120, 4500, 300, 9000];
    let total = 0;
    let slow = 0;
    for (const ms of durations) {
      total += ms;
      if (ms > 1000) slow++;
    }
    expect(total).toBe(13920); // 120 + 4500 + 300 + 9000
    expect(slow).toBe(2); // 4500 and 9000
  });

  test('6.10 ✍️ count the failed tests', () => {
    const results: string[] = ['passed', 'failed', 'passed', 'skipped', 'failed'];
    let failed = 0;
    for (const result of results) {
      if (result === 'failed') failed++;
    }
    expect(failed).toBe(2);
  });

  test('6.11 ✍️ classic for loop', () => {
    const usernames: string[] = [];
    for (let i = 1; i <= 3; i++) {
      usernames.push(`user${i}`);
    }
    expect(usernames).toEqual(['user1', 'user2', 'user3']);
  });

  test('6.12 🐛 off by one', () => {
    const products = ['Backpack', 'Bike Light', 'Onesie'];
    const upper: string[] = [];
    // Indexes are 0, 1, 2. products[3] is undefined, so it must be <, not <=
    for (let i = 0; i < products.length; i++) {
      upper.push(products[i].toUpperCase());
    }
    expect(upper).toEqual(['BACKPACK', 'BIKE LIGHT', 'ONESIE']);
  });

  test('6.13 ✍️ a while loop that retries', () => {
    const isPageReady = (attempt: number): boolean => attempt >= 3;
    let attempt = 0;
    let ready = false;
    while (!ready && attempt < 5) {
      attempt++;
      ready = isPageReady(attempt);
    }
    expect(ready).toBe(true);
    expect(attempt).toBe(3);
  });

  test('6.14 🔮 break and continue', () => {
    const products = [
      { name: 'Onesie', price: 7.99, stock: 0 },
      { name: 'Bike Light', price: 9.99, stock: 25 },
      { name: 'Backpack', price: 29.99, stock: 10 },
      { name: 'Fleece Jacket', price: 49.99, stock: 5 },
      { name: 'Red T-Shirt', price: 15.99, stock: 12 },
    ];
    const picked: string[] = [];
    for (const product of products) {
      if (product.stock === 0) continue; // Onesie is skipped
      if (product.price > 40) break; // the loop STOPS at Fleece Jacket: Red T-Shirt is never reached
      picked.push(product.name);
    }
    expect(picked).toEqual(['Bike Light', 'Backpack']);
  });

  test('6.15 ✍️ loop over an object with Object.entries', () => {
    const headers = {
      'content-type': 'application/json',
      'x-request-id': 'abc-123',
    };
    const lines: string[] = [];
    for (const [key, value] of Object.entries(headers)) {
      lines.push(`${key}: ${value}`);
    }
    expect(lines).toEqual(['content-type: application/json', 'x-request-id: abc-123']);
  });
});

test.describe('?. and ??', () => {
  test('6.16 🔮 optional chaining and ?? vs ||', () => {
    type User = { name: string; address?: { city: string } };
    const sam: User = { name: 'Sam', address: { city: 'Lisbon' } };
    const ada: User = { name: 'Ada' };
    expect(sam.address?.city).toBe('Lisbon');
    expect(ada.address?.city).toBe(undefined); // ?. stops and gives undefined: no crash

    const retries: number = 0;
    expect(retries || 3).toBe(3); // || replaces ANY falsy value, and 0 is falsy
    expect(retries ?? 3).toBe(0); // ?? only replaces null/undefined: 0 stays
  });

  test('6.17 🐛 crash on a missing address', () => {
    type ApiUser = { username: string; address?: { city: string } };
    function cityOf(user: ApiUser): string {
      return user.address?.city ?? 'unknown';
    }
    expect(cityOf({ username: 'admin', address: { city: 'Porto' } })).toBe('Porto');
    expect(cityOf({ username: 'standard_user' })).toBe('unknown');
  });

  test('6.18 ✍️ environment variables with fallbacks', () => {
    type Env = { BASE_URL?: string; CI?: string };
    function getBaseUrl(env: Env): string {
      return env.BASE_URL ?? 'http://localhost:3000';
    }
    function getRetries(env: Env): number {
      return env.CI ? 2 : 0; // the same idea as `retries: process.env.CI ? 2 : 0` in playwright.config.ts
    }
    expect(getBaseUrl({})).toBe('http://localhost:3000');
    expect(getBaseUrl({ BASE_URL: 'https://staging.qa-shop.dev' })).toBe('https://staging.qa-shop.dev');
    expect(getRetries({ CI: 'true' })).toBe(2);
    expect(getRetries({})).toBe(0);
  });
});

test.describe('errors', () => {
  test('6.19 🔮 try, catch, finally: in which order?', () => {
    const log: string[] = [];
    try {
      log.push('try');
      throw new Error('boom');
      log.push('after throw'); // never runs: throw leaves the try block immediately
    } catch (error) {
      log.push('catch');
    } finally {
      log.push('finally');
    }
    expect(log).toEqual(['try', 'catch', 'finally']);
  });

  test('6.20 ✍️ throw your own error', () => {
    function parseQuantity(text: string): number {
      const quantity = Number(text);
      if (Number.isNaN(quantity) || quantity < 1) {
        throw new Error(`Invalid quantity: ${text}`);
      }
      return quantity;
    }
    expect(parseQuantity('3')).toBe(3);
    expect(() => parseQuantity('abc')).toThrow('Invalid quantity: abc');
    expect(() => parseQuantity('0')).toThrow('Invalid quantity: 0');
  });

  test('6.21 🐛 the error escapes', () => {
    function requirePassword(password: string): string {
      if (password === '') throw new Error('Password is required');
      return password;
    }
    expect(requirePassword('secret123')).toBe('secret123');
    // Give expect a FUNCTION. expect calls it inside its own try/catch.
    expect(() => requirePassword('')).toThrow('Password is required');
  });

  test('6.22 🧪 assert the errors', () => {
    function login(username: string, password: string): string {
      if (username === '') throw new Error('Username is required');
      if (password === '') throw new Error('Password is required');
      if (username === 'locked_user') throw new Error('Sorry, this user has been locked out.');
      return `token-${username}`;
    }
    expect(() => login('', 'secret123')).toThrow('Username is required');
    expect(() => login('standard_user', '')).toThrow('Password is required');
    expect(() => login('locked_user', 'secret123')).toThrow('Sorry, this user has been locked out.');
    expect(() => login('standard_user', 'secret123')).not.toThrow();
  });

  test('6.23 ✍️ catch the error and read its message', () => {
    function login(username: string): string {
      if (username === 'locked_user') throw new Error('Sorry, this user has been locked out.');
      return `token-${username}`;
    }
    let message = '';
    let finished = false;
    try {
      login('locked_user');
    } catch (error) {
      // error is `unknown`: check it is a real Error before reading .message
      if (error instanceof Error) {
        message = error.message;
      }
    } finally {
      finished = true;
    }
    expect(message).toBe('Sorry, this user has been locked out.');
    expect(finished).toBe(true);
  });
});

test.describe('combine everything', () => {
  test('6.24 ✍️ wait for a status (a retry helper)', () => {
    function waitForStatus(getStatus: () => number, expected: number, maxAttempts: number): number {
      let last = 0;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        last = getStatus();
        if (last === expected) return attempt; // return leaves the loop AND the function
      }
      throw new Error(`Expected status ${expected} but got ${last} after ${maxAttempts} attempts`);
    }
    let calls = 0;
    const flakyStatus = (): number => {
      calls++;
      return calls < 3 ? 503 : 200;
    };
    expect(waitForStatus(flakyStatus, 200, 5)).toBe(3);

    const alwaysDown = (): number => 503;
    expect(() => waitForStatus(alwaysDown, 200, 3)).toThrow('Expected status 200 but got 503 after 3 attempts');
  });

  test('6.25 ✍️ summarize a test run', () => {
    type TestResult = { title: string; status: string; durationMs?: number };
    const results: TestResult[] = [
      { title: 'login works', status: 'passed', durationMs: 1200 },
      { title: 'logout works', status: 'passed', durationMs: 800 },
      { title: 'checkout works', status: 'failed', durationMs: 5000 },
      { title: 'admin page', status: 'skipped' },
    ];
    function summarize(results: TestResult[]) {
      const summary = { passed: 0, failed: 0, skipped: 0, totalMs: 0 };
      for (const result of results) {
        switch (result.status) {
          case 'passed':
            summary.passed++;
            break;
          case 'failed':
            summary.failed++;
            break;
          case 'skipped':
            summary.skipped++;
            break;
        }
        summary.totalMs += result.durationMs ?? 0; // no duration -> count 0
      }
      return summary;
    }
    expect(summarize(results)).toEqual({ passed: 2, failed: 1, skipped: 1, totalMs: 7000 });
    expect(summarize([])).toEqual({ passed: 0, failed: 0, skipped: 0, totalMs: 0 });
  });
});
