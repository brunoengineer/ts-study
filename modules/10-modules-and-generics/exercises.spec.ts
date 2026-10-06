// Module 10 · Modules and Generics
// Run:  npm run check 10
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// Some exercises in this module are solved in the files of the utils/ folder next to this file.

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';
import { BASE_URL, buildUrl } from './utils/urls';
import type { TestUser } from './utils/users';
// Namespace imports (`import * as name`, lesson section 4). With them, an unfinished utils file
// only breaks ITS exercise instead of the whole test file.
import * as money from './utils/money';
import * as shop from './utils';
// 10.4 ✍️ write your default import of utils/logger.ts on the next line (name it log)

// 10.6 🐛 write your `import type` of Role and TestStatus (from ./utils/types) on the next line


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
    // Look at the import line of BASE_URL and buildUrl above, then open utils/urls.ts.
    expect(BASE_URL).toBe(___);
    expect(buildUrl('/login')).toBe(___);
  });

  test('10.2 🐛 a function that is not exported', () => {
    // Run it and read the error. Then open utils/money.ts: formatPrice exists, but this file can't see it.
    expect(money.formatPrice(29.99)).toBe('$29.99');
    expect(money.formatPrice(7.9)).toBe('$7.90');
  });

  test('10.3 ✍️ write and export a function in another file', () => {
    // Open utils/money.ts and follow the 10.3 comment there.
    // ✍️ your code here: in utils/money.ts

    todo();
    expect(money.toCents(29.99)).toBe(2999);
    expect(money.toCents(15)).toBe(1500);
  });

  test('10.4 ✍️ a default import', () => {
    // utils/logger.ts has a DEFAULT export. At the TOP of this file (look for 10.4),
    // write a default import that calls it log.
    // ✍️ your code here: at the top of this file

    todo();
    expect(log('starting checkout')).toBe('[test] starting checkout');
  });

  test('10.5 ✍️ re-export from a barrel file', () => {
    // utils/index.ts is a "barrel": it re-exports other files. This file imports it as `shop`.
    // Open utils/index.ts and re-export slugify from './strings' (follow the 10.5 comment).
    // ✍️ your code here: in utils/index.ts

    todo();
    expect(shop.buildUrl('/cart')).toBe('http://localhost:3000/cart');
    expect(shop.slugify('Bolt T-Shirt')).toBe('bolt-t-shirt');
  });

  test('10.6 🐛 a missing type import (types only)', () => {
    // This test already passes: types disappear when the code runs.
    // But TypeScript says "Cannot find name 'Role'": the types live in utils/types.ts.
    // Fix: at the TOP of this file (look for 10.6), write ONE `import type` line for Role and TestStatus.
    const role: Role = 'admin';
    const status: TestStatus = 'passed';
    expect(`${role}: ${status}`).toBe('admin: passed');
  });

  test('10.7 🔮 relative paths', async () => {
    // `await import(path)` loads a file while the test runs. Normally you write imports at the top,
    // but here it lets the test check YOUR path. No `.ts` at the end.
    // This file is: modules/10-modules-and-generics/exercises.spec.ts
    // 1) the path to modules/10-modules-and-generics/utils/strings.ts
    const strings = await import(___);
    expect(strings.capitalize('backpack')).toBe('Backpack');
    // 2) the path to helpers/blank.ts (at the root of the project: go up two folders)
    const blank = await import(___);
    expect(typeof blank.todo).toBe('function');
  });
});

test.describe('generic functions', () => {
  test('10.8 🔮 first<T>', () => {
    function first<T>(items: T[]): T | undefined {
      return items[0];
    }
    expect(first(['standard_user', 'admin'])).toBe(___);
    expect(first([404, 500])).toBe(___);
    expect(first([])).toBe(___);
  });

  test('10.9 ✍️ write last<T>', () => {
    // Write a generic function last<T>(items: T[]): T | undefined that returns the last item.
    // (The last index is items.length - 1. An empty array gives undefined automatically.)
    // ✍️ your code here

    todo();
    expect(last(['passed', 'failed', 'skipped'])).toBe('skipped');
    expect(last(PRODUCTS)?.name).toBe('Red T-Shirt');
    expect(last([])).toBe(undefined);
  });

  test('10.10 ✍️ write unique<T>', () => {
    // Write a generic function unique<T>(items: T[]): T[] that removes duplicates.
    // Shape: return items.filter((item, index) => items.indexOf(item) === index);
    // ✍️ your code here

    todo();
    expect(unique(['@smoke', '@login', '@smoke', '@cart', '@login'])).toEqual(['@smoke', '@login', '@cart']);
    expect(unique([200, 200, 404])).toEqual([200, 404]);
  });

  test('10.11 🐛 a generic function with a falsy bug', () => {
    // The first status code is 0 (a request that never got an answer), and that IS a real value.
    // But the function returns the fallback. Remember module 06: || vs ??
    function firstOrDefault<T>(items: T[], fallback: T): T {
      return items[0] || fallback;
    }
    expect(firstOrDefault([0, 200], 999)).toBe(0);
    expect(firstOrDefault([], 999)).toBe(999);
    expect(firstOrDefault(['', 'x'], 'none')).toBe('');
  });
});

test.describe('generic types and constraints', () => {
  test('10.12 ✍️ a generic type', () => {
    // 1) Create a generic type Paginated<T> with three properties:
    //      items: an array of T, total: number, page: number
    //    Shape: type Name<T> = { prop: T[]; ... };
    // 2) Declare a constant firstPage of type Paginated<Product>:
    //      items: the first 2 products (PRODUCTS.slice(0, 2)), total: 6, page: 1
    // ✍️ your code here

    todo();
    expect(firstPage.items.map((product) => product.name)).toEqual(['Backpack', 'Bike Light']);
    expect(firstPage.total).toBe(6);
  });

  test('10.13 ✍️ a function that returns a generic type', () => {
    type ApiResponse<T> = { status: number; data: T };
    // Write a generic function ok<T>(data: T): ApiResponse<T> that returns { status: 200, data }
    // ✍️ your code here

    todo();
    const productsResponse = ok(PRODUCTS);
    const userResponse = ok({ username: 'admin' });
    expect(productsResponse.data).toHaveLength(6);
    expect(userResponse).toEqual({ status: 200, data: { username: 'admin' } });
  });

  test('10.14 🐛 the Playwright way to read JSON', async () => {
    // In Playwright: const products: Product[] = await response.json();
    // Read the red squiggle, run it, and fix the line.
    const response = fakeResponse(PRODUCTS);
    const products: Product[] = response.json();
    expect(products).toHaveLength(6);
  });

  test('10.15 ✍️ a constraint: T extends { id: number }', () => {
    // Write a generic function findById that works for ANY array of objects that have an id:
    //   function findById<T extends { id: number }>(items: T[], id: number): T | undefined
    // It returns the item whose id matches (use .find).
    // ✍️ your code here

    todo();
    const users = [
      { id: 1, username: 'standard_user' },
      { id: 2, username: 'admin' },
    ];
    expect(findById(PRODUCTS, 4)?.name).toBe('Fleece Jacket');
    expect(findById(users, 2)?.username).toBe('admin');
    expect(findById(users, 99)).toBe(undefined);
  });

  test('10.16 🐛 a missing constraint (types only)', () => {
    // It runs fine, but TypeScript says: Property 'id' does not exist on type 'T'.
    // TypeScript is right: T could be ANYTHING (a number has no id). Add a constraint to T.
    function getIds<T>(items: T[]): number[] {
      return items.map((item) => item.id);
    }
    expect(getIds(PRODUCTS)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('10.17 ✍️ keyof: pick one property from every item', () => {
    // Write a generic function pluck that returns the value of ONE property from every item:
    //   function pluck<T, K extends keyof T>(items: T[], key: K): T[K][]
    // Body: return items.map((item) => item[key]);
    // (K extends keyof T means: key must be one of T's property names. Try pluck(PRODUCTS, 'nmae') later!)
    // ✍️ your code here

    todo();
    expect(pluck(PRODUCTS, 'name')).toEqual(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
    expect(pluck(PRODUCTS, 'stock')).toEqual([10, 25, 40, 5, 0, 12]);
  });
});

test.describe('utility types', () => {
  test('10.18 ✍️ Partial<T>: a test data builder', () => {
    // Write a function buildProduct(overrides: Partial<Product> = {}): Product
    // It returns a default product, with the overrides on top (spread):
    //   { id: 100, name: 'Test Product', price: 10, category: 'other', stock: 10, ...overrides }
    // ✍️ your code here

    todo();
    expect(buildProduct()).toEqual({ id: 100, name: 'Test Product', price: 10, category: 'other', stock: 10 });
    expect(buildProduct({ stock: 0 }).stock).toBe(0);
    expect(buildProduct({ name: 'Sale Item', price: 1.5 })).toMatchObject({ name: 'Sale Item', price: 1.5, id: 100 });
  });

  test('10.19 ✍️ Omit<T, K>: a body without the id', () => {
    // When you CREATE a product (POST /api/products), you don't send an id: the server gives one.
    // 1) Create a type NewProduct = Omit<Product, 'id'>
    // 2) Write a function createProduct(input: NewProduct, nextId: number): Product
    //    that returns { id: nextId, ...input }
    // ✍️ your code here

    todo();
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
    // How many properties does each result REALLY have at runtime?
    expect(Object.keys(toSummary(backpack)).length).toBe(___);
    expect(Object.keys(toSummaryLazy(backpack)).length).toBe(___);
  });

  test('10.21 ✍️ Record<K, V>', () => {
    // Declare a constant permissions of type Record<'admin' | 'user', string[]>:
    //   admin -> ['read', 'create', 'delete']
    //   user  -> ['read']
    // Then write a function canDelete(role: 'admin' | 'user'): boolean
    //   that returns whether permissions[role] includes 'delete'
    // ✍️ your code here

    todo();
    expect(permissions.user).toEqual(['read']);
    expect(canDelete('admin')).toBe(true);
    expect(canDelete('user')).toBe(false);
  });

  test('10.22 🐛 Required<T>: the defaults win', () => {
    // Like Playwright's config: every option is optional, and missing ones get a default.
    type RunOptions = { retries?: number; workers?: number; headless?: boolean };
    function withDefaults(options: RunOptions): Required<RunOptions> {
      return { ...options, retries: 0, workers: 1, headless: true };
    }
    expect(withDefaults({})).toEqual({ retries: 0, workers: 1, headless: true });
    expect(withDefaults({ retries: 2, headless: false })).toEqual({ retries: 2, workers: 1, headless: false });
  });
});

test.describe('combine everything', () => {
  test('10.23 ✍️ a typed fake API client', async () => {
    type ApiResponse<T> = { status: number; data: T };
    // A fake server: the body for each path.
    const routes: Record<string, unknown> = {
      '/api/products': PRODUCTS,
      '/api/me': { username: 'admin', role: 'admin' },
    };
    // Write an async generic function getJson<T>(path: string): Promise<ApiResponse<T>>
    //  - if path is not in routes (routes[path] === undefined): throw new Error(`404 ${path}`)
    //  - otherwise return { status: 200, data: routes[path] as T }
    //    (`as T` is OK here: like response.json(), the data comes from outside and TypeScript can't check it)
    // ✍️ your code here

    todo();
    const products = await getJson<Product[]>('/api/products');
    expect(products.data.filter((product) => product.stock === 0)).toHaveLength(1);

    const me = await getJson<{ username: string; role: string }>('/api/me');
    expect(me.data.username).toBe('admin');

    await expect(getJson('/api/nope')).rejects.toThrow('404 /api/nope');
  });

  test('10.24 ✍️ a user builder from the barrel', () => {
    // Write a function buildUsers(count: number, overrides: Partial<TestUser> = {}): TestUser[]
    //  - classic for loop, i from 1 to count
    //  - each user: { ...shop.createUser(`user${i}`), ...overrides }
    // (TestUser is imported at the top with `import type`, and createUser comes from the barrel `shop`.)
    // ✍️ your code here

    todo();
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
