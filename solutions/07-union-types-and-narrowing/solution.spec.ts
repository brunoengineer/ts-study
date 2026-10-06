// Module 07 · Union Types and Narrowing — reference solution
// Run:  npm run solution 07
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('unions and literal types', () => {
  test('7.1 🔮 a function that takes string | number', () => {
    function formatId(id: string | number): string {
      if (typeof id === 'number') {
        return `#${id}`;
      }
      return id.toUpperCase(); // here TypeScript knows id is a string
    }
    expect(formatId(42)).toBe('#42');
    expect(formatId('ord-1001')).toBe('ORD-1001');
  });

  test('7.2 ✍️ a union of literal types', () => {
    type Role = 'admin' | 'user';
    const role: Role = 'admin';
    const allRoles: Role[] = ['admin', 'user'];
    expect(role).toBe('admin');
    expect(allRoles).toEqual(['admin', 'user']);
  });

  test('7.3 🐛 a value that is not in the union', () => {
    type BrowserName = 'chromium' | 'firefox' | 'webkit';
    const browser: BrowserName = 'chromium'; // 'chrome' is not one of the allowed values
    expect(['chromium', 'firefox', 'webkit']).toContain(browser);
  });

  test('7.4 ✍️ switch over a literal union', () => {
    type TestStatus = 'passed' | 'failed' | 'skipped';
    function statusIcon(status: TestStatus): string {
      switch (status) {
        case 'passed':
          return '✅';
        case 'failed':
          return '❌';
        case 'skipped':
          return '⏭️';
      }
      // No default needed: TypeScript knows all 3 values are handled.
    }
    expect(statusIcon('passed')).toBe('✅');
    expect(statusIcon('failed')).toBe('❌');
    expect(statusIcon('skipped')).toBe('⏭️');
  });
});

test.describe('narrowing', () => {
  test('7.5 ✍️ narrow with typeof', () => {
    function parseTimeout(value: string | number): number {
      if (typeof value === 'string') {
        return Number(value);
      }
      return value; // number
    }
    expect(parseTimeout(5000)).toBe(5000);
    expect(parseTimeout('30000')).toBe(30000);
  });

  test('7.6 🐛 truthiness narrowing removes too much', () => {
    function cartLabel(count: number | undefined): string {
      if (count === undefined) return 'Cart'; // !count would also catch 0
      return `Cart (${count})`;
    }
    expect(cartLabel(undefined)).toBe('Cart');
    expect(cartLabel(2)).toBe('Cart (2)');
    expect(cartLabel(0)).toBe('Cart (0)');
  });

  test('7.7 ✍️ narrow with in', () => {
    type ApiUser = { username: string; role: string };
    type ApiError = { error: string };
    function userOrError(body: ApiUser | ApiError): string {
      if ('error' in body) {
        return `Error: ${body.error}`; // body is ApiError here
      }
      return `${body.username} (${body.role})`; // body is ApiUser here
    }
    expect(userOrError({ username: 'admin', role: 'admin' })).toBe('admin (admin)');
    expect(userOrError({ error: 'Unauthorized' })).toBe('Error: Unauthorized');
  });

  test('7.8 ✍️ narrow with Array.isArray', () => {
    function countSelectors(selector: string | string[]): number {
      return Array.isArray(selector) ? selector.length : 1;
    }
    expect(countSelectors('#login')).toBe(1);
    expect(countSelectors(['#username', '#password', '#submit'])).toBe(3);
  });

  test('7.9 🔮 string | null', () => {
    function getText(found: boolean): string | null {
      return found ? '  3 items  ' : null;
    }
    const found = getText(true);
    const missing = getText(false);
    expect(found?.trim()).toBe('3 items');
    expect(missing?.trim()).toBe(undefined); // ?. stops at null and gives undefined
    expect(missing ?? 'none').toBe('none');
    expect((missing ?? '').length).toBe(0);
  });

  test('7.10 🐛 the ! lied', () => {
    function cleanText(text: string | null): string {
      if (text === null) return '';
      return text.trim(); // narrowed to string: no ! needed
      // one-line version: return (text ?? '').trim();
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
    expect(summary({ ok: true, data: ['Backpack', 'Onesie'] })).toBe('2 products');
    expect(summary({ ok: false, error: 'Unauthorized' })).toBe('Error: Unauthorized');
  });

  test('7.12 ✍️ return the data or throw the error', () => {
    function firstProductName(result: ProductResult): string {
      if (result.ok) {
        return result.data[0] ?? 'none';
      }
      throw new Error(result.error);
    }
    expect(firstProductName({ ok: true, data: ['Backpack', 'Onesie'] })).toBe('Backpack');
    expect(firstProductName({ ok: true, data: [] })).toBe('none');
    expect(() => firstProductName({ ok: false, error: 'Forbidden' })).toThrow('Forbidden');
  });

  test('7.13 🐛 reading data without checking', () => {
    function countProducts(result: ProductResult): number {
      if (!result.ok) return 0; // check the discriminant first
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
    function stepToCode(step: Step): string {
      switch (step.type) {
        case 'goto':
          return `await page.goto('${step.url}');`;
        case 'click':
          return `await page.locator('${step.selector}').click();`;
        case 'fill':
          return `await page.locator('${step.selector}').fill('${step.value}');`; // only 'fill' steps have .value
      }
    }
    expect(stepToCode({ type: 'goto', url: '/login' })).toBe("await page.goto('/login');");
    expect(stepToCode({ type: 'click', selector: '#submit' })).toBe("await page.locator('#submit').click();");
    expect(stepToCode({ type: 'fill', selector: '#username', value: 'admin' })).toBe(
      "await page.locator('#username').fill('admin');",
    );
  });
});

test.describe('as const and enums', () => {
  test('7.15 ✍️ one list, one type: as const', () => {
    const BROWSERS = ['chromium', 'firefox', 'webkit'] as const;
    type BrowserName = (typeof BROWSERS)[number]; // 'chromium' | 'firefox' | 'webkit'
    const favourite: BrowserName = 'firefox';
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
    expect(Priority.Low).toBe(0); // numeric enums count from 0
    expect(Priority.High).toBe(2);
    expect(Priority[1]).toBe('Medium'); // numeric enums also map number -> name
    expect(Env.Staging).toBe('staging');
  });
});

test.describe('any, unknown, as and !', () => {
  test('7.17 🔮 any hides typos', () => {
    const body = JSON.parse('{"user":{"name":"Sam Standard","role":"user"}}');
    expect(body.user.name).toBe('Sam Standard');
    // No red squiggle (any = no checks) and no crash: a missing property is just undefined.
    expect(body.user.nmae).toBe(undefined);
  });

  test('7.18 ✍️ narrow an unknown value', () => {
    function readStatus(data: unknown): number {
      if (typeof data === 'object' && data !== null && 'status' in data && typeof data.status === 'number') {
        return data.status; // every check made the type narrower, until TypeScript is sure
      }
      return -1;
    }
    expect(readStatus({ status: 200 })).toBe(200);
    expect(readStatus({ status: '200' })).toBe(-1);
    expect(readStatus(null)).toBe(-1);
    expect(readStatus('hello')).toBe(-1);
  });

  test('7.19 🐛 find() can return undefined', () => {
    type User = { username: string; name: string };
    const users: User[] = [
      { username: 'standard_user', name: 'Sam Standard' },
      { username: 'admin', name: 'Ada Admin' },
    ];
    function displayName(username: string): string {
      return users.find((user) => user.username === username)?.name ?? 'Unknown user';
    }
    expect(displayName('admin')).toBe('Ada Admin');
    expect(displayName('ghost')).toBe('Unknown user');
  });

  test('7.20 🐛 the as lied', () => {
    const raw: unknown = JSON.parse('{"status":"200"}');
    const response = raw as { status: string }; // tell the truth: it's a string in the JSON
    const nextStatus = Number(response.status) + 1; // '200' + 1 would be '2001'
    expect(nextStatus).toBe(201);
  });
});

test.describe('combine everything', () => {
  test('7.21 ✍️ turn an API answer into a result', () => {
    type LoginBody = { token: string } | { error: string };
    type LoginResult = { ok: true; token: string } | { ok: false; error: string };
    function toLoginResult(status: number, body: LoginBody): LoginResult {
      if (status === 200 && 'token' in body) {
        return { ok: true, token: body.token };
      } else if ('error' in body) {
        return { ok: false, error: body.error };
      } else {
        return { ok: false, error: `Unexpected status ${status}` };
      }
    }
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
    expect(onesie).toEqual({ ok: false, error: 'Onesie is sold out' });
    expect(backpack).toEqual({ ok: true, quantity: 10 });
    expect(backpack.ok).toBe(true);
  });

  test('7.23 ✍️ format a report cell', () => {
    function formatCell(value: string | number | boolean | null): string {
      if (value === null) return '-';
      if (typeof value === 'boolean') return value ? 'yes' : 'no';
      if (typeof value === 'number') return value.toFixed(2);
      return value; // only string is left
    }
    const row = ['Backpack', 29.99, true, null];
    expect(row.map((cell) => formatCell(cell))).toEqual(['Backpack', '29.99', 'yes', '-']);
    expect(formatCell(false)).toBe('no');
    expect(formatCell(10)).toBe('10.00');
  });
});
