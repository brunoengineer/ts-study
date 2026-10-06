// Module 10 · Modules and Generics — reference solution
// Run:  npm run solution 10
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.
//
// The solved utils files are in solutions/10-modules-and-generics/utils/.

import { test, expect } from '@playwright/test';
import { BASE_URL, buildUrl } from './utils/urls';
import type { TestUser } from './utils/users';
import * as money from './utils/money';
import * as shop from './utils';
// 10.4: a default import. You choose the name (log); no { } because it is the default.
import log from './utils/logger';
// 10.6: import type = "I only need these as types". Several names in one line, separated by commas.
import type { Role, TestStatus } from './utils/types';

// ─────────────────────────────────────────────────────────────────────────────
// Test data for the generics exercises (don't change it).
// ─────────────────────────────────────────────────────────────────────────────
type Product = { id: number; name: string; price: number; category: string; stock: number };

const PRODUCTS: Product[] = [
  { id: 1, name: 'Backpack', price: 29.99, category: 'bags', stock: 10 },
  { id: 2, name: 'Bike Light', price: 9.99, category: 'accessories', stock: 25 },
  { id: 3, name: 'Bolt T-Shirt', price: 15.99, category: 'clothes', stock: 40 },
  { id: 4, name: 'Fleece Jacket', price: 49.99, category: 'clothes', stock: 5 },
  { id: 5, name: 'Onesie', price: 7.99, category: 'clothes', stock: 0 },
  { id: 6, name: 'Red T-Shirt', price: 15.99, category: 'clothes', stock: 12 },
];

/** A fake of Playwright's APIResponse: json() is async and returns `any`, like the real one. */
function fakeResponse(body: unknown) {
  return {
    status: (): number => 200,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    json: async (): Promise<any> => body,
  };
}
// ─────────────────────────────────────────────────────────────────────────────

test.describe('import and export', () => {
  test('10.1 🔮 named imports', () => {
    expect(BASE_URL).toBe('http://localhost:3000');
    expect(buildUrl('/login')).toBe('http://localhost:3000/login');
  });

  test('10.2 🐛 a function that is not exported', () => {
    // Fixed in utils/money.ts: `export function formatPrice(...)`
    expect(money.formatPrice(29.99)).toBe('$29.99');
    expect(money.formatPrice(7.9)).toBe('$7.90');
  });

  test('10.3 ✍️ write and export a function in another file', () => {
    // Written in utils/money.ts: export function toCents(price: number): number { ... }
    expect(money.toCents(29.99)).toBe(2999);
    expect(money.toCents(15)).toBe(1500);
  });

  test('10.4 ✍️ a default import', () => {
    expect(log('starting checkout')).toBe('[test] starting checkout');
  });

  test('10.5 ✍️ re-export from a barrel file', () => {
    // Added to utils/index.ts: export { slugify } from './strings';
    expect(shop.buildUrl('/cart')).toBe('http://localhost:3000/cart');
    expect(shop.slugify('Bolt T-Shirt')).toBe('bolt-t-shirt');
  });

  test('10.6 🐛 a missing type import (types only)', () => {
    const role: Role = 'admin';
    const status: TestStatus = 'passed';
    expect(`${role}: ${status}`).toBe('admin: passed');
  });

  test('10.7 🔮 relative paths', async () => {
    const strings = await import('./utils/strings'); // ./ = "the folder of THIS file"
    expect(strings.capitalize('backpack')).toBe('Backpack');
    const blank = await import('../../helpers/blank'); // ../ = "one folder up" (twice)
    expect(typeof blank.todo).toBe('function');
  });
});

test.describe('generic functions', () => {
  test('10.8 🔮 first<T>', () => {
    function first<T>(items: T[]): T | undefined {
      return items[0];
    }
    expect(first(['standard_user', 'admin'])).toBe('standard_user'); // T = string
    expect(first([404, 500])).toBe(404); // T = number
    expect(first([])).toBe(undefined); // index 0 of an empty array
  });

  test('10.9 ✍️ write last<T>', () => {
    function last<T>(items: T[]): T | undefined {
      return items[items.length - 1];
    }
    expect(last(['passed', 'failed', 'skipped'])).toBe('skipped');
    expect(last(PRODUCTS)?.name).toBe('Red T-Shirt'); // T = Product, so ?.name is allowed
    expect(last([])).toBe(undefined);
  });

  test('10.10 ✍️ write unique<T>', () => {
    function unique<T>(items: T[]): T[] {
      // keep an item only if this is the FIRST place it appears
      return items.filter((item, index) => items.indexOf(item) === index);
    }
    expect(unique(['@smoke', '@login', '@smoke', '@cart', '@login'])).toEqual(['@smoke', '@login', '@cart']);
    expect(unique([200, 200, 404])).toEqual([200, 404]);
  });

  test('10.11 🐛 a generic function with a falsy bug', () => {
    function firstOrDefault<T>(items: T[], fallback: T): T {
      return items[0] ?? fallback; // ?? only replaces undefined/null, so 0 and '' are kept
    }
    expect(firstOrDefault([0, 200], 999)).toBe(0);
    expect(firstOrDefault([], 999)).toBe(999);
    expect(firstOrDefault(['', 'x'], 'none')).toBe('');
  });
});

test.describe('generic types and constraints', () => {
  test('10.12 ✍️ a generic type', () => {
    type Paginated<T> = { items: T[]; total: number; page: number };
    const firstPage: Paginated<Product> = { items: PRODUCTS.slice(0, 2), total: 6, page: 1 };
    expect(firstPage.items.map((product) => product.name)).toEqual(['Backpack', 'Bike Light']);
    expect(firstPage.total).toBe(6);
  });

  test('10.13 ✍️ a function that returns a generic type', () => {
    type ApiResponse<T> = { status: number; data: T };
    function ok<T>(data: T): ApiResponse<T> {
      return { status: 200, data };
    }
    const productsResponse = ok(PRODUCTS); // ApiResponse<Product[]> (T inferred from the argument)
    const userResponse = ok({ username: 'admin' }); // ApiResponse<{ username: string }>
    expect(productsResponse.data).toHaveLength(6);
    expect(userResponse).toEqual({ status: 200, data: { username: 'admin' } });
  });

  test('10.14 🐛 the Playwright way to read JSON', async () => {
    const response = fakeResponse(PRODUCTS);
    const products: Product[] = await response.json(); // json() returns a Promise: await it
    expect(products).toHaveLength(6);
  });

  test('10.15 ✍️ a constraint: T extends { id: number }', () => {
    function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
      return items.find((item) => item.id === id); // allowed: the constraint promises .id
    }
    const users = [
      { id: 1, username: 'standard_user' },
      { id: 2, username: 'admin' },
    ];
    expect(findById(PRODUCTS, 4)?.name).toBe('Fleece Jacket');
    expect(findById(users, 2)?.username).toBe('admin');
    expect(findById(users, 99)).toBe(undefined);
  });

  test('10.16 🐛 a missing constraint (types only)', () => {
    function getIds<T extends { id: number }>(items: T[]): number[] {
      return items.map((item) => item.id);
    }
    expect(getIds(PRODUCTS)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('10.17 ✍️ keyof: pick one property from every item', () => {
    function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
      return items.map((item) => item[key]);
    }
    // pluck(PRODUCTS, 'name') returns string[]; pluck(PRODUCTS, 'stock') returns number[]
    expect(pluck(PRODUCTS, 'name')).toEqual(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
    expect(pluck(PRODUCTS, 'stock')).toEqual([10, 25, 40, 5, 0, 12]);
  });
});

test.describe('utility types', () => {
  test('10.18 ✍️ Partial<T>: a test data builder', () => {
    function buildProduct(overrides: Partial<Product> = {}): Product {
      // later properties win: the overrides replace the defaults
      return { id: 100, name: 'Test Product', price: 10, category: 'other', stock: 10, ...overrides };
    }
    expect(buildProduct()).toEqual({ id: 100, name: 'Test Product', price: 10, category: 'other', stock: 10 });
    expect(buildProduct({ stock: 0 }).stock).toBe(0);
    expect(buildProduct({ name: 'Sale Item', price: 1.5 })).toMatchObject({ name: 'Sale Item', price: 1.5, id: 100 });
  });

  test('10.19 ✍️ Omit<T, K>: a body without the id', () => {
    type NewProduct = Omit<Product, 'id'>;
    function createProduct(input: NewProduct, nextId: number): Product {
      return { id: nextId, ...input };
    }
    const input: NewProduct = { name: 'Water Bottle', price: 12.5, category: 'accessories', stock: 30 };
    expect(createProduct(input, 7)).toEqual({ id: 7, name: 'Water Bottle', price: 12.5, category: 'accessories', stock: 30 });
  });

  test('10.20 🔮 Pick<T, K> is only a type', () => {
    type ProductSummary = Pick<Product, 'id' | 'name'>;
    function toSummary(product: Product): ProductSummary {
      return { id: product.id, name: product.name };
    }
    function toSummaryLazy(product: Product): ProductSummary {
      return product; // allowed: a Product has id and name (and more)
    }
    const backpack = PRODUCTS[0];
    expect(Object.keys(toSummary(backpack)).length).toBe(2);
    // Types don't change values: it's still the whole product object, with all 5 properties.
    expect(Object.keys(toSummaryLazy(backpack)).length).toBe(5);
  });

  test('10.21 ✍️ Record<K, V>', () => {
    const permissions: Record<'admin' | 'user', string[]> = {
      admin: ['read', 'create', 'delete'],
      user: ['read'],
    };
    function canDelete(role: 'admin' | 'user'): boolean {
      return permissions[role].includes('delete');
    }
    expect(permissions.user).toEqual(['read']);
    expect(canDelete('admin')).toBe(true);
    expect(canDelete('user')).toBe(false);
  });

  test('10.22 🐛 Required<T>: the defaults win', () => {
    type RunOptions = { retries?: number; workers?: number; headless?: boolean };
    function withDefaults(options: RunOptions): Required<RunOptions> {
      // Defaults FIRST, then the options on top. Later properties win in a spread.
      return { retries: 0, workers: 1, headless: true, ...options };
    }
    expect(withDefaults({})).toEqual({ retries: 0, workers: 1, headless: true });
    expect(withDefaults({ retries: 2, headless: false })).toEqual({ retries: 2, workers: 1, headless: false });
  });
});

test.describe('combine everything', () => {
  test('10.23 ✍️ a typed fake API client', async () => {
    type ApiResponse<T> = { status: number; data: T };
    const routes: Record<string, unknown> = {
      '/api/products': PRODUCTS,
      '/api/me': { username: 'admin', role: 'admin' },
    };
    async function getJson<T>(path: string): Promise<ApiResponse<T>> {
      if (routes[path] === undefined) {
        throw new Error(`404 ${path}`);
      }
      return { status: 200, data: routes[path] as T };
    }
    const products = await getJson<Product[]>('/api/products'); // we CHOOSE T when we call it
    expect(products.data.filter((product) => product.stock === 0)).toHaveLength(1);

    const me = await getJson<{ username: string; role: string }>('/api/me');
    expect(me.data.username).toBe('admin');

    await expect(getJson('/api/nope')).rejects.toThrow('404 /api/nope');
  });

  test('10.24 ✍️ a user builder from the barrel', () => {
    function buildUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[] {
      const users: TestUser[] = [];
      for (let i = 1; i <= count; i++) {
        users.push({ ...shop.createUser(`user${i}`), ...overrides });
      }
      return users;
    }
    const users = buildUsers(3);
    expect(users.map((user) => user.username)).toEqual(['user1', 'user2', 'user3']);
    expect(users.every((user) => user.password === 'secret123')).toBe(true);

    const admins = buildUsers(2, { role: 'admin' });
    expect(admins).toEqual([
      { username: 'user1', password: 'secret123', role: 'admin' },
      { username: 'user2', password: 'secret123', role: 'admin' },
    ]);
  });
});
