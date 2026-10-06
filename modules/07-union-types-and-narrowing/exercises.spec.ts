// Module 07 · Union Types and Narrowing
// Run:  npm run check 07
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('unions and literal types', () => {
  test('7.1 🔮 a function that takes string | number', () => {
    function formatId(id: string | number): string {
      if (typeof id === 'number') {
        return `#${id}`;
      }
      return id.toUpperCase();
    }
    expect(formatId(42)).toBe(___);
    expect(formatId('ord-1001')).toBe(___);
  });

  test('7.2 ✍️ a union of literal types', () => {
    // 1) Create a type alias called Role that is 'admin' OR 'user'
    // 2) Declare a constant `role` of type Role with the value 'admin'
    // 3) Declare a constant `allRoles` of type Role[] with both values: ['admin', 'user']
    // Shape: type Name = 'a' | 'b';
    // ✍️ your code here

    todo();
    expect(role).toBe('admin');
    expect(allRoles).toEqual(['admin', 'user']);
  });

  test('7.3 🐛 a value that is not in the union', () => {
    // Read the red squiggle on 'chrome'. Then press Ctrl+Space inside the quotes to see the allowed values.
    type BrowserName = 'chromium' | 'firefox' | 'webkit';
    const browser: BrowserName = 'chrome';
    expect(['chromium', 'firefox', 'webkit']).toContain(browser);
  });

  test('7.4 ✍️ switch over a literal union', () => {
    type TestStatus = 'passed' | 'failed' | 'skipped';
    // Write a function statusIcon(status: TestStatus): string with a switch:
    //   'passed' -> '✅'    'failed' -> '❌'    'skipped' -> '⏭️'
    // (Because TestStatus has only 3 values, you don't need a default.)
    // ✍️ your code here

    todo();
    expect(statusIcon('passed')).toBe('✅');
    expect(statusIcon('failed')).toBe('❌');
    expect(statusIcon('skipped')).toBe('⏭️');
  });
});

test.describe('narrowing', () => {
  test('7.5 ✍️ narrow with typeof', () => {
    // A timeout can come from code (a number) or from an env variable (a string like '30000').
    // Write a function parseTimeout(value: string | number): number
    //  - if value is a string, return Number(value)
    //  - otherwise return value as it is
    // ✍️ your code here

    todo();
    expect(parseTimeout(5000)).toBe(5000);
    expect(parseTimeout('30000')).toBe(30000);
  });

  test('7.6 🐛 truthiness narrowing removes too much', () => {
    // The cart link says 'Cart' when we don't know the count, and 'Cart (N)' when we do.
    // An empty cart (0) should say 'Cart (0)'. Fix the check.
    function cartLabel(count: number | undefined): string {
      if (!count) return 'Cart';
      return `Cart (${count})`;
    }
    expect(cartLabel(undefined)).toBe('Cart');
    expect(cartLabel(2)).toBe('Cart (2)');
    expect(cartLabel(0)).toBe('Cart (0)');
  });

  test('7.7 ✍️ narrow with in', () => {
    type ApiUser = { username: string; role: string };
    type ApiError = { error: string };
    // Write a function userOrError(body: ApiUser | ApiError): string
    //  - if body has an 'error' property: return `Error: ${body.error}`
    //  - otherwise: return `${body.username} (${body.role})`
    // Shape: if ('error' in body) { ... }
    // ✍️ your code here

    todo();
    expect(userOrError({ username: 'admin', role: 'admin' })).toBe('admin (admin)');
    expect(userOrError({ error: 'Unauthorized' })).toBe('Error: Unauthorized');
  });

  test('7.8 ✍️ narrow with Array.isArray', () => {
    // Write a function countSelectors(selector: string | string[]): number
    //  - an array: return how many items it has
    //  - a single string: return 1
    // ✍️ your code here

    todo();
    expect(countSelectors('#login')).toBe(1);
    expect(countSelectors(['#username', '#password', '#submit'])).toBe(3);
  });

  test('7.9 🔮 string | null', () => {
    // Like Playwright's textContent(): a string, or null when there is nothing.
    function getText(found: boolean): string | null {
      return found ? '  3 items  ' : null;
    }
    const found = getText(true);
    const missing = getText(false);
    expect(found?.trim()).toBe(___);
    expect(missing?.trim()).toBe(___);
    expect(missing ?? 'none').toBe(___);
    expect((missing ?? '').length).toBe(___);
  });

  test('7.10 🐛 the ! lied', () => {
    // `text!` says "trust me, text is never null". But it can be! Run it and read the error.
    // Remove the ! and handle null: return '' when text is null, otherwise the trimmed text.
    function cleanText(text: string | null): string {
      return text!.trim();
    }
    expect(cleanText('  Backpack ')).toBe('Backpack');
    expect(cleanText(null)).toBe('');
  });
});

test.describe('discriminated unions', () => {
  type ProductResult = { ok: true; data: string[] } | { ok: false; error: string };

  test('7.11 🔮 check ok, then use data or error', () => {
    function summary(result: ProductResult): string {
      if (result.ok) {
        return `${result.data.length} products`;
      }
      return `Error: ${result.error}`;
    }
    expect(summary({ ok: true, data: ['Backpack', 'Onesie'] })).toBe(___);
    expect(summary({ ok: false, error: 'Unauthorized' })).toBe(___);
  });

  test('7.12 ✍️ return the data or throw the error', () => {
    // Write a function firstProductName(result: ProductResult): string
    //  - if result.ok: return the first item of result.data, or 'none' if the list is empty (?? 'none')
    //  - otherwise: throw new Error(result.error)
    // ✍️ your code here

    todo();
    expect(firstProductName({ ok: true, data: ['Backpack', 'Onesie'] })).toBe('Backpack');
    expect(firstProductName({ ok: true, data: [] })).toBe('none');
    expect(() => firstProductName({ ok: false, error: 'Forbidden' })).toThrow('Forbidden');
  });

  test('7.13 🐛 reading data without checking', () => {
    // TypeScript is already warning you (red squiggle). Run it to see the crash.
    // Fix: when the result is not ok, return 0.
    function countProducts(result: ProductResult): number {
      return result.data.length;
    }
    expect(countProducts({ ok: true, data: ['Backpack'] })).toBe(1);
    expect(countProducts({ ok: false, error: 'Unauthorized' })).toBe(0);
  });

  test('7.14 ✍️ a tiny code generator', () => {
    type Step =
      | { type: 'goto'; url: string }
      | { type: 'click'; selector: string }
      | { type: 'fill'; selector: string; value: string };
    // Write a function stepToCode(step: Step): string with a switch on step.type that returns:
    //   goto  -> await page.goto('/login');
    //   click -> await page.locator('#submit').click();
    //   fill  -> await page.locator('#username').fill('admin');
    // (Use template literals. The single quotes are part of the text.)
    // ✍️ your code here

    todo();
    expect(stepToCode({ type: 'goto', url: '/login' })).toBe("await page.goto('/login');");
    expect(stepToCode({ type: 'click', selector: '#submit' })).toBe("await page.locator('#submit').click();");
    expect(stepToCode({ type: 'fill', selector: '#username', value: 'admin' })).toBe(
      "await page.locator('#username').fill('admin');",
    );
  });
});

test.describe('as const and enums', () => {
  test('7.15 ✍️ one list, one type: as const', () => {
    // 1) Declare a constant BROWSERS = ['chromium', 'firefox', 'webkit'] as const
    // 2) Declare a type BrowserName = (typeof BROWSERS)[number]
    // 3) Declare a constant favourite, of type BrowserName, with the value 'firefox'
    // Hover over BrowserName in VS Code: it's a union made from the array!
    // ✍️ your code here

    todo();
    expect(BROWSERS).toEqual(['chromium', 'firefox', 'webkit']);
    expect(BROWSERS).toContain(favourite);
  });

  test('7.16 🔮 enums', () => {
    enum Priority {
      Low,
      Medium,
      High,
    }
    enum Env {
      Dev = 'dev',
      Staging = 'staging',
    }
    expect(Priority.Low).toBe(___);
    expect(Priority.High).toBe(___);
    expect(Priority[1]).toBe(___);
    expect(Env.Staging).toBe(___);
  });
});

test.describe('any, unknown, as and !', () => {
  test('7.17 🔮 any hides typos', () => {
    // JSON.parse returns `any`: TypeScript stops checking.
    const body = JSON.parse('{"user":{"name":"Sam Standard","role":"user"}}');
    expect(body.user.name).toBe(___);
    // A typo: nmae instead of name. Does TypeScript complain? Does it crash? What is the value?
    expect(body.user.nmae).toBe(___);
  });

  test('7.18 ✍️ narrow an unknown value', () => {
    // Write a function readStatus(data: unknown): number
    // Return data.status when data is an object (not null) that has a 'status' property which is a number.
    // Otherwise return -1.
    // Shape: if (typeof data === 'object' && data !== null && 'status' in data && typeof data.status === 'number') { ... }
    // ✍️ your code here

    todo();
    expect(readStatus({ status: 200 })).toBe(200);
    expect(readStatus({ status: '200' })).toBe(-1);
    expect(readStatus(null)).toBe(-1);
    expect(readStatus('hello')).toBe(-1);
  });

  test('7.19 🐛 find() can return undefined', () => {
    // The ! says "find always finds something". It doesn't. Run it and read the error.
    // Fix: return 'Unknown user' when nobody is found. Use ?. and ?? (and remove the !)
    type User = { username: string; name: string };
    const users: User[] = [
      { username: 'standard_user', name: 'Sam Standard' },
      { username: 'admin', name: 'Ada Admin' },
    ];
    function displayName(username: string): string {
      return users.find((user) => user.username === username)!.name;
    }
    expect(displayName('admin')).toBe('Ada Admin');
    expect(displayName('ghost')).toBe('Unknown user');
  });

  test('7.20 🐛 the as lied', () => {
    // The `as` says status is a number. Look at the JSON: is it? Run it and read "Received".
    // Fix: make the `as` type tell the truth (status: string), and convert with Number(...) before adding 1.
    const raw: unknown = JSON.parse('{"status":"200"}');
    const response = raw as { status: number };
    const nextStatus = response.status + 1;
    expect(nextStatus).toBe(201);
  });
});

test.describe('combine everything', () => {
  test('7.21 ✍️ turn an API answer into a result', () => {
    type LoginBody = { token: string } | { error: string };
    type LoginResult = { ok: true; token: string } | { ok: false; error: string };
    // Write a function toLoginResult(status: number, body: LoginBody): LoginResult
    //  - status is 200 AND body has a 'token'  -> { ok: true, token: body.token }
    //  - else, if body has an 'error'          -> { ok: false, error: body.error }
    //  - else                                  -> { ok: false, error: `Unexpected status ${status}` }
    // ✍️ your code here

    todo();
    expect(toLoginResult(200, { token: 'abc' })).toEqual({ ok: true, token: 'abc' });
    expect(toLoginResult(401, { error: 'Invalid username or password' })).toEqual({
      ok: false,
      error: 'Invalid username or password',
    });
    expect(toLoginResult(500, { token: 'abc' })).toEqual({ ok: false, error: 'Unexpected status 500' });
  });

  test('7.22 🧪 assert a discriminated result', () => {
    type StockResult = { ok: true; quantity: number } | { ok: false; error: string };
    function checkStock(name: string, stock: number): StockResult {
      if (stock === 0) return { ok: false, error: `${name} is sold out` };
      return { ok: true, quantity: stock };
    }
    const backpack = checkStock('Backpack', 10);
    const onesie = checkStock('Onesie', 0);
    // Write THREE assertions:
    //  - onesie equals { ok: false, error: 'Onesie is sold out' }   (toEqual)
    //  - backpack equals { ok: true, quantity: 10 }
    //  - backpack.ok is true
    // ✍️ your code here

    todo();
  });

  test('7.23 ✍️ format a report cell', () => {
    // A report table can show text, numbers, yes/no and empty cells.
    // Write a function formatCell(value: string | number | boolean | null): string
    //  - null     -> '-'
    //  - boolean  -> 'yes' or 'no'
    //  - number   -> the number with 2 decimals (value.toFixed(2))
    //  - string   -> the string as it is
    // ✍️ your code here

    todo();
    const row = ['Backpack', 29.99, true, null];
    expect(row.map((cell) => formatCell(cell))).toEqual(['Backpack', '29.99', 'yes', '-']);
    expect(formatCell(false)).toBe('no');
    expect(formatCell(10)).toBe('10.00');
  });
});
