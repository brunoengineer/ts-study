// Module 19 · Test Data, Mocking and Utils
// Run:  npm run check 19          (watch the browser: npm run check 19 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// Some exercises are small functions at the top of this file (19.1, 19.3, 19.6, 19.7, 19.8).
// Write the function body there; the test that uses it is further down.

import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { ___, todo } from '../../helpers/blank';

interface NewProduct {
  name: string;
  price: number;
  category: string;
  stock: number;
}

interface Product extends NewProduct {
  id: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Your helpers (in a real project they live in utils/ files)
// ---------------------------------------------------------------------------

// 19.1 ✍️ A test data builder. Return the default product, with `overrides` on top:
//   defaults: name 'Test Product', price 9.99, category 'other', stock 10
// Shape: return { ...defaults, ...overrides };   (you can write the defaults inline)
function buildProduct(overrides: Partial<NewProduct> = {}): NewProduct {
  // ✍️ your code here (then delete BOTH lines below)

  todo('19.1: write buildProduct (top of the file)');
  return ___;
}

// 19.3 ✍️ Return a name that is different EVERY time: the prefix, a dash, then something unique.
// Example: uniqueName('user') -> 'user-1767712345678-3f9a1c2b'
// Use Date.now() and/or randomUUID() (already imported). A template string makes it one line.
function uniqueName(prefix: string): string {
  // ✍️ your code here (then delete BOTH lines below)

  todo('19.3: write uniqueName (top of the file)');
  return ___;
}

// 19.6 ✍️ Turn a price text like '$29.99' into the number 29.99.
// Shape: remove the '$' (replace), then Number(...)
function parsePrice(text: string): number {
  // ✍️ your code here (then delete BOTH lines below)

  todo('19.6: write parsePrice (top of the file)');
  return ___;
}

// 19.7 ✍️ The other way round: 29.9 -> '$29.90'  (always 2 decimals: toFixed)
function formatPrice(value: number): string {
  // ✍️ your code here (then delete BOTH lines below)

  todo('19.7: write formatPrice (top of the file)');
  return ___;
}

// 19.8 ✍️ Call `action` up to `attempts` times. Return the result of the first call that does NOT throw.
// If every call throws, throw the last error.
// Use a for loop with try/catch inside (module 06), and a `let lastError: unknown;` outside the loop.
async function retry<T>(action: () => Promise<T>, attempts: number): Promise<T> {
  // ✍️ your code here (then delete BOTH lines below)

  todo('19.8: write retry (top of the file)');
  return ___;
}

// PROVIDED
async function adminHeaders(request: APIRequestContext): Promise<Record<string, string>> {
  const response = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
  return { Authorization: `Bearer ${(await response.json()).token}` };
}

test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
});

test.describe('test data', () => {
  test('19.1 ✍️ a builder with Partial<T> overrides', async ({ request }) => {
    expect(buildProduct()).toEqual({ name: 'Test Product', price: 9.99, category: 'other', stock: 10 });
    expect(buildProduct({ price: 1, stock: 0 })).toEqual({ name: 'Test Product', price: 1, category: 'other', stock: 0 });
    // The builder feeds the API:
    const response = await request.post('/api/products', { headers: await adminHeaders(request), data: buildProduct({ name: 'Built Mug' }) });
    expect(response.status()).toBe(201);
  });

  test('19.2 🔮 the order of the spread', async () => {
    const defaults = { name: 'Test Product', price: 9.99 };
    const overrides = { price: 1 };
    const right = { ...defaults, ...overrides };
    const wrong = { ...overrides, ...defaults };
    expect(right.price).toBe(___);
    expect(wrong.price).toBe(___);
  });

  test('19.3 ✍️ unique data', async ({ request }) => {
    const first = uniqueName('tester');
    const second = uniqueName('tester');
    expect(first.startsWith('tester')).toBe(true);
    expect(first).not.toBe(second);
    for (const username of [first, second]) {
      const response = await request.post('/api/users', { data: { username, password: 'secret123' } });
      expect(response.status()).toBe(201);
    }
  });

  test('19.4 🐛 it worked yesterday', async ({ request }) => {
    // This test simulates running the SAME test twice (like two CI runs against one server).
    // The second run fails. Why? Make the username unique for every run (fix ONE line).
    for (const run of [1, 2]) {
      const username = 'qa_tester';
      const response = await request.post('/api/users', { data: { username, password: 'secret123' } });
      expect(response.status(), `run ${run}: ${await response.text()}`).toBe(201);
    }
  });
});

test.describe('environment variables and utils', () => {
  test('19.5 🔮 environment variables with fallbacks', async () => {
    // None of these variables exist on your machine.
    const shopUrl = process.env.QA_SHOP_URL ?? 'http://localhost:3000';
    const retries = Number(process.env.QA_SHOP_RETRIES ?? '2');
    const headed = process.env.QA_SHOP_HEADED === 'true';
    expect(shopUrl).toBe(___);
    expect(retries).toBe(___);
    expect(headed).toBe(___);
  });

  test('19.6 ✍️ parsePrice', async () => {
    expect(parsePrice('$29.99')).toBe(29.99);
    expect(parsePrice('$7.99')).toBe(7.99);
  });

  test('19.7 ✍️ formatPrice', async () => {
    expect(formatPrice(29.9)).toBe('$29.90');
    expect(formatPrice(5)).toBe('$5.00');
  });

  test('19.8 ✍️ retry', async () => {
    let calls = 0;
    const flakyLogin = async (): Promise<string> => {
      calls++;
      if (calls < 3) throw new Error('503 Service Unavailable');
      return 'token-123';
    };
    expect(await retry(flakyLogin, 5)).toBe('token-123');
    expect(calls).toBe(3);

    calls = 0;
    const alwaysDown = async (): Promise<string> => {
      calls++;
      throw new Error('server is down');
    };
    await expect(retry(alwaysDown, 2)).rejects.toThrow('server is down');
    expect(calls).toBe(2);
  });

  test('19.9 🧪 use your utils on the page', async ({ page }) => {
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 6 products');
    const texts = await page.getByTestId('loaded-products').getByRole('listitem').allTextContents();
    // texts look like 'Backpack - $29.99'
    const prices = texts.map((text) => parsePrice(text.split(' - ')[1]));
    const total = prices.reduce((sum, price) => sum + price, 0);
    // Write TWO assertions:
    //  - prices has 6 items
    //  - total is close to 129.94 (decimals! use toBeCloseTo, not toBe)
    // ✍️ your code here

    todo();
  });
});

// ---------------------------------------------------------------------------
// Data-driven tests: one test per row of data. The loop runs when the file loads.
// ---------------------------------------------------------------------------
const searchCases = [
  { term: 'shirt', expected: 2 },
  { term: 'bike', expected: 1 },
  { term: 'laptop', expected: 0 },
];

const loginCases = [
  { label: 'a valid user', username: 'standard_user', password: 'secret123', status: ___ },
  { label: 'a locked user', username: 'locked_user', password: 'secret123', status: ___ },
  { label: 'a wrong password', username: 'standard_user', password: 'oops', status: ___ },
];

test.describe('data-driven tests', () => {
  for (const { term, expected } of searchCases) {
    test(`19.10 ✍️ search "${term}" finds ${expected}`, async ({ request }) => {
      // ONE body, three tests: GET /api/products with params { search: term }, then
      // expect the JSON array to have the length `expected`.
      // ✍️ your code here

      todo();
    });
  }

  // 🔮 19.11: predict the `status` of each row in loginCases (just above this describe).
  for (const { label, username, password, status } of loginCases) {
    test(`19.11 🔮 login with ${label}`, async ({ request }) => {
      const response = await request.post('/api/login', { data: { username, password } });
      expect(response.status()).toBe(status);
    });
  }
});

// ---------------------------------------------------------------------------
// Readable reports: steps, tags, annotations, attachments
// ---------------------------------------------------------------------------
test.describe('readable reports', () => {
  test('19.12 ✍️ test.step', async ({ page }) => {
    // Write TWO steps:
    //  1. a step called 'open the playground' that goes to '/playground'
    //  2. a step called 'load the products' that clicks "Load products", waits for 'Loaded 6 products'
    //     in the load-status test id, and RETURNS the number of list items in the 'loaded-products' list.
    //     Store what the step returns in a constant `count`.
    // Shape: const count = await test.step('name', async () => { ...; return ...; });
    // ✍️ your code here

    todo();
    expect(count).toBe(6);
  });

  test('19.13 ✍️ tag a test', async () => {
    // Give THIS test the tag '@smoke'. The tag goes in a details object between the title and the function.
    // Shape: test('title', { tag: '@smoke' }, async () => { ... });
    expect(test.info().tags).toContain('@smoke');
  });

  test('19.14 ✍️ annotate a test', async () => {
    // Link THIS test to a bug: add an annotation with type 'issue' and description
    // 'https://jira.example.com/browse/SHOP-42' in the details object (like the tag in 19.13).
    expect(test.info().annotations).toContainEqual(
      expect.objectContaining({ type: 'issue', description: 'https://jira.example.com/browse/SHOP-42' }),
    );
  });

  test('19.15 ✍️ attach data to the report', async ({ request }) => {
    const response = await request.get('/api/products');
    const products = await response.json();
    // Attach the products to the report: name 'products.json', body JSON.stringify(products, null, 2),
    // contentType 'application/json'.
    // Shape: await test.info().attach('name', { body: ..., contentType: '...' });
    // ✍️ your code here

    todo();
    expect(test.info().attachments.map((attachment) => attachment.name)).toContain('products.json');
  });
});

// ---------------------------------------------------------------------------
// The network: mock, abort, modify, wait. The playground's "Load products" button calls GET /api/products.
// ---------------------------------------------------------------------------
const MOCK_PRODUCTS: Product[] = [
  { id: 101, name: 'Mock Mug', price: 3, category: 'other', stock: 1, description: '' },
  { id: 102, name: 'Mock Hat', price: 12.5, category: 'clothes', stock: 1, description: '' },
];

test.describe('the network', () => {
  test('19.16 ✍️ mock a response', async ({ page }) => {
    // BEFORE the click: route '**/api/products' and fulfill it with json: MOCK_PRODUCTS.
    // Shape: await page.route('**/api/products', (route) => route.fulfill({ json: ... }));
    // ✍️ your code here

    todo();
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 2 products');
    await expect(page.getByTestId('loaded-products').getByRole('listitem')).toHaveText(['Mock Mug - $3.00', 'Mock Hat - $12.50']);
  });

  test('19.17 ✍️ make the request fail', async ({ page }) => {
    // Route '**/api/products' and ABORT it (like a network error).
    // ✍️ your code here

    todo();
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Failed to load products');
  });

  test('19.18 ✍️ change the real response', async ({ page }) => {
    // Route '**/api/products' with an ASYNC handler that:
    //   1. gets the real response:      const response = await route.fetch();
    //   2. reads its JSON:              const products = await response.json();
    //   3. adds one product to it:      products.push({ id: 99, name: 'Secret Sale', price: 1, category: 'other', stock: 1, description: '' });
    //   4. fulfills with both:          await route.fulfill({ response, json: products });
    // ✍️ your code here

    todo();
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 7 products');
    await expect(page.getByTestId('loaded-products')).toContainText('Secret Sale - $1.00');
  });

  test('19.19 🧪 wait for a response', async ({ page }) => {
    await page.goto('/playground');
    const responsePromise = page.waitForResponse('**/api/products'); // start waiting BEFORE the click
    await page.getByRole('button', { name: 'Load products' }).click();
    const response = await responsePromise;
    // Write TWO assertions:
    //  - the response status is 200
    //  - its JSON has 6 items
    // ✍️ your code here

    todo();
  });

  test('19.20 ✍️ combine: mock, step, screenshot, attach', async ({ page }) => {
    await page.route('**/api/products', (route) => route.fulfill({ json: MOCK_PRODUCTS }));
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 2 products');
    // In a step called 'attach evidence':
    //   take a screenshot of the page (page.screenshot() returns a Buffer) and attach it
    //   with the name 'mocked-products' and the contentType 'image/png'.
    // ✍️ your code here

    todo();
    const attachment = test.info().attachments.find((item) => item.name === 'mocked-products');
    expect(attachment?.contentType).toBe('image/png');
  });
});
