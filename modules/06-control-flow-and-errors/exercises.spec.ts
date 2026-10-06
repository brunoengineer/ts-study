// Module 06 · Control Flow and Errors
// Run:  npm run check 06
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('if / else and operators', () => {
  test('6.1 🔮 && || and !', () => {
    const status: number = 201;
    const isLoggedIn: boolean = false;
    expect(status >= 200 && status < 300).toBe(___);
    expect(status === 404 || status === 500).toBe(___);
    expect(!isLoggedIn).toBe(___);
    expect(isLoggedIn || status > 200).toBe(___);
  });

  test('6.2 ✍️ if / else if / else', () => {
    // Write a function called statusCategory that takes `status: number` and returns a string:
    //   200-299 -> 'success'
    //   300-399 -> 'redirect'
    //   400-499 -> 'client error'
    //   500 and more -> 'server error'
    //   anything else -> 'unknown'
    // Shape: function statusCategory(status: number): string { if (...) { return ...; } else if (...) ... }
    // ✍️ your code here

    todo();
    expect(statusCategory(200)).toBe('success');
    expect(statusCategory(302)).toBe('redirect');
    expect(statusCategory(404)).toBe('client error');
    expect(statusCategory(503)).toBe('server error');
    expect(statusCategory(100)).toBe('unknown');
  });

  test('6.3 🐛 the conditions are in the wrong order', () => {
    // Bike Light costs 9.99, so it should be 'cheap'. Run it and look at what it gets instead.
    function priceTier(price: number): string {
      if (price < 30) {
        return 'medium';
      } else if (price < 10) {
        return 'cheap';
      } else {
        return 'expensive';
      }
    }
    expect(priceTier(9.99)).toBe('cheap');
    expect(priceTier(29.99)).toBe('medium');
    expect(priceTier(49.99)).toBe('expensive');
  });

  test('6.4 🔮 truthy or falsy?', () => {
    // Boolean(x) shows what `if (x)` would think: true or false.
    expect(Boolean('')).toBe(___);
    expect(Boolean('0')).toBe(___);
    expect(Boolean(0)).toBe(___);
    expect(Boolean([])).toBe(___);
    expect(Boolean(null)).toBe(___);
    expect(Boolean('false')).toBe(___);
  });

  test('6.5 🐛 the 0 trap', () => {
    // The Onesie has stock 0. It should say 'Sold out', but it says 'unknown'. Why?
    // Fix the FIRST if so that only `undefined` returns 'unknown'.
    function stockLabel(stock: number | undefined): string {
      if (!stock) return 'unknown';
      if (stock === 0) return 'Sold out';
      return `${stock} in stock`;
    }
    expect(stockLabel(10)).toBe('10 in stock');
    expect(stockLabel(undefined)).toBe('unknown');
    expect(stockLabel(0)).toBe('Sold out');
  });

  test('6.6 ✍️ the ternary', () => {
    // Write an ARROW function called buttonLabel that takes `stock: number` and returns
    // 'Add to cart' when stock is more than 0, otherwise 'Sold out'. Use the ternary ? :
    // Shape: const buttonLabel = (stock: number): string => condition ? valueIfTrue : valueIfFalse;
    // ✍️ your code here

    todo();
    expect(buttonLabel(10)).toBe('Add to cart');
    expect(buttonLabel(0)).toBe('Sold out');
  });
});

test.describe('switch', () => {
  test('6.7 ✍️ switch with return', () => {
    // QA Shop has a "Sort by" dropdown. Write a function sortLabel(option: string): string with a switch:
    //   'az'   -> 'Name (A to Z)'
    //   'za'   -> 'Name (Z to A)'
    //   'lohi' -> 'Price (low to high)'
    //   'hilo' -> 'Price (high to low)'
    //   anything else -> 'Unknown sort'
    // Use `return` inside each case (then you don't need break).
    // ✍️ your code here

    todo();
    expect(sortLabel('az')).toBe('Name (A to Z)');
    expect(sortLabel('za')).toBe('Name (Z to A)');
    expect(sortLabel('lohi')).toBe('Price (low to high)');
    expect(sortLabel('hilo')).toBe('Price (high to low)');
    expect(sortLabel('random')).toBe('Unknown sort');
  });

  test('6.8 🐛 fall-through', () => {
    // A report shows HTTP methods in colours. GET should be 'green', but it comes out wrong.
    function methodColor(method: string): string {
      let color = '';
      switch (method) {
        case 'GET':
          color = 'green';
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
    expect(total).toBe(___);
    expect(slow).toBe(___);
  });

  test('6.10 ✍️ count the failed tests', () => {
    const results: string[] = ['passed', 'failed', 'passed', 'skipped', 'failed'];
    // Declare `let failed = 0`. Then loop over results with for...of and add 1 when the result is 'failed'.
    // Shape: for (const result of results) { if (...) ...; }
    // ✍️ your code here

    todo();
    expect(failed).toBe(2);
  });

  test('6.11 ✍️ classic for loop', () => {
    // Create `const usernames: string[] = []`.
    // Then use a classic for loop (let i = 1; i <= 3; i++) to push 'user1', 'user2', 'user3'.
    // (Template literal: `user${i}`)
    // ✍️ your code here

    todo();
    expect(usernames).toEqual(['user1', 'user2', 'user3']);
  });

  test('6.12 🐛 off by one', () => {
    // Run it and read the error. Which index does not exist?
    const products = ['Backpack', 'Bike Light', 'Onesie'];
    const upper: string[] = [];
    for (let i = 0; i <= products.length; i++) {
      upper.push(products[i].toUpperCase());
    }
    expect(upper).toEqual(['BACKPACK', 'BIKE LIGHT', 'ONESIE']);
  });

  test('6.13 ✍️ a while loop that retries', () => {
    // A fake check: the page is "ready" from attempt 3 on.
    const isPageReady = (attempt: number): boolean => attempt >= 3;
    // Declare `let attempt = 0` and `let ready = false`.
    // Write a while loop that runs WHILE not ready AND attempt < 5.
    // Inside: add 1 to attempt, then set ready = isPageReady(attempt).
    // ✍️ your code here

    todo();
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
      if (product.stock === 0) continue;
      if (product.price > 40) break;
      picked.push(product.name);
    }
    // An array: ['...', '...']
    expect(picked).toEqual(___);
  });

  test('6.15 ✍️ loop over an object with Object.entries', () => {
    const headers = {
      'content-type': 'application/json',
      'x-request-id': 'abc-123',
    };
    // Create `const lines: string[] = []`.
    // Loop over Object.entries(headers) and push one line per header: 'key: value'
    // Shape: for (const [key, value] of Object.entries(headers)) { ... }
    // ✍️ your code here

    todo();
    expect(lines).toEqual(['content-type: application/json', 'x-request-id: abc-123']);
  });
});

test.describe('?. and ??', () => {
  test('6.16 🔮 optional chaining and ?? vs ||', () => {
    type User = { name: string; address?: { city: string } };
    const sam: User = { name: 'Sam', address: { city: 'Lisbon' } };
    const ada: User = { name: 'Ada' };
    expect(sam.address?.city).toBe(___);
    expect(ada.address?.city).toBe(___);

    const retries: number = 0;
    expect(retries || 3).toBe(___);
    expect(retries ?? 3).toBe(___);
  });

  test('6.17 🐛 crash on a missing address', () => {
    // Not every user has an address. Make cityOf return 'unknown' when there is no address.
    // Use ?. and ?? (one line).
    type ApiUser = { username: string; address?: { city: string } };
    function cityOf(user: ApiUser): string {
      return user.address.city;
    }
    expect(cityOf({ username: 'admin', address: { city: 'Porto' } })).toBe('Porto');
    expect(cityOf({ username: 'standard_user' })).toBe('unknown');
  });

  test('6.18 ✍️ environment variables with fallbacks', () => {
    // In a real config you read process.env. Here we pass a fake env object so the test is predictable.
    type Env = { BASE_URL?: string; CI?: string };
    // 1) Write a function getBaseUrl(env: Env): string
    //    It returns env.BASE_URL, or 'http://localhost:3000' when BASE_URL is missing. Use ??
    // 2) Write a function getRetries(env: Env): number
    //    It returns 2 when env.CI is set (truthy), otherwise 0. Use a ternary.
    // ✍️ your code here

    todo();
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
      log.push('after throw');
    } catch (error) {
      log.push('catch');
    } finally {
      log.push('finally');
    }
    // An array: ['...', ...]
    expect(log).toEqual(___);
  });

  test('6.20 ✍️ throw your own error', () => {
    // Write a function parseQuantity(text: string): number
    //  - convert text to a number with Number(text)
    //  - if the result is NaN OR smaller than 1, throw new Error(`Invalid quantity: ${text}`)
    //  - otherwise return the number
    // ✍️ your code here

    todo();
    expect(parseQuantity('3')).toBe(3);
    expect(() => parseQuantity('abc')).toThrow('Invalid quantity: abc');
    expect(() => parseQuantity('0')).toThrow('Invalid quantity: 0');
  });

  test('6.21 🐛 the error escapes', () => {
    // The function is correct. The ASSERTION is wrong: run it and see that the test crashes
    // with the error instead of checking it. Fix the second expect.
    function requirePassword(password: string): string {
      if (password === '') throw new Error('Password is required');
      return password;
    }
    expect(requirePassword('secret123')).toBe('secret123');
    expect(requirePassword('')).toThrow('Password is required');
  });

  test('6.22 🧪 assert the errors', () => {
    function login(username: string, password: string): string {
      if (username === '') throw new Error('Username is required');
      if (password === '') throw new Error('Password is required');
      if (username === 'locked_user') throw new Error('Sorry, this user has been locked out.');
      return `token-${username}`;
    }
    // Write FOUR assertions:
    //  - login('', 'secret123') throws 'Username is required'
    //  - login('standard_user', '') throws 'Password is required'
    //  - login('locked_user', 'secret123') throws 'Sorry, this user has been locked out.'
    //  - login('standard_user', 'secret123') does NOT throw (.not.toThrow())
    // ✍️ your code here

    todo();
  });

  test('6.23 ✍️ catch the error and read its message', () => {
    function login(username: string): string {
      if (username === 'locked_user') throw new Error('Sorry, this user has been locked out.');
      return `token-${username}`;
    }
    // Declare `let message = ''` and `let finished = false`.
    // Then write a try / catch / finally:
    //  - try: call login('locked_user')
    //  - catch (error): if error instanceof Error, put error.message into message
    //  - finally: set finished to true
    // ✍️ your code here

    todo();
    expect(message).toBe('Sorry, this user has been locked out.');
    expect(finished).toBe(true);
  });
});

test.describe('combine everything', () => {
  test('6.24 ✍️ wait for a status (a retry helper)', () => {
    // Write a function waitForStatus(getStatus: () => number, expected: number, maxAttempts: number): number
    //  - call getStatus() up to maxAttempts times (classic for loop: attempt = 1 ... maxAttempts)
    //  - remember the last status in a `let last = 0`
    //  - when the status equals expected, return the attempt number
    //  - after the loop, throw new Error(`Expected status ${expected} but got ${last} after ${maxAttempts} attempts`)
    // ✍️ your code here

    todo();
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
    // Write a function summarize(results: TestResult[]) that returns
    //   { passed: number, failed: number, skipped: number, totalMs: number }
    //  - start with `const summary = { passed: 0, failed: 0, skipped: 0, totalMs: 0 };`
    //  - loop with for...of
    //  - use a switch on result.status to add 1 to the right counter
    //  - add the duration to totalMs. Skipped tests have no duration: use ?? 0
    // ✍️ your code here

    todo();
    expect(summarize(results)).toEqual({ passed: 2, failed: 1, skipped: 1, totalMs: 7000 });
    expect(summarize([])).toEqual({ passed: 0, failed: 0, skipped: 0, totalMs: 0 });
  });
});
