// Module 19 · Test Data, Mocking and Utils — reference solution
// Run:  npm run solution 19
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect, type APIRequestContext } from '@playwright/test';
import { randomUUID } from 'node:crypto';

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

// 19.1 — defaults first, overrides LAST (the last spread wins)
function buildProduct(overrides: Partial<NewProduct> = {}): NewProduct {
  return { name: 'Test Product', price: 9.99, category: 'other', stock: 10, ...overrides };
}

// 19.3 — Date.now() alone can repeat (two calls in the same millisecond); the UUID part can't.
function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

// 19.6
function parsePrice(text: string): number {
  return Number(text.replace('$', ''));
}

// 19.7
function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

// 19.8
async function retry<T>(action: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await action(); // `return await` so a rejected promise is caught HERE
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

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
    const response = await request.post('/api/products', { headers: await adminHeaders(request), data: buildProduct({ name: 'Built Mug' }) });
    expect(response.status()).toBe(201);
  });

  test('19.2 🔮 the order of the spread', async () => {
    const defaults = { name: 'Test Product', price: 9.99 };
    const overrides = { price: 1 };
    const right = { ...defaults, ...overrides };
    const wrong = { ...overrides, ...defaults };
    expect(right.price).toBe(1); // the LAST spread wins
    expect(wrong.price).toBe(9.99); // the defaults overwrote the override
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
    for (const run of [1, 2]) {
      const username = uniqueName('qa_tester'); // a fixed name -> 409 "username already exists" the 2nd time
      const response = await request.post('/api/users', { data: { username, password: 'secret123' } });
      expect(response.status(), `run ${run}: ${await response.text()}`).toBe(201);
    }
  });
});

test.describe('environment variables and utils', () => {
  test('19.5 🔮 environment variables with fallbacks', async () => {
    const shopUrl = process.env.QA_SHOP_URL ?? 'http://localhost:3000';
    const retries = Number(process.env.QA_SHOP_RETRIES ?? '2');
    const headed = process.env.QA_SHOP_HEADED === 'true';
    expect(shopUrl).toBe('http://localhost:3000');
    expect(retries).toBe(2); // a number, thanks to Number(...)
    expect(headed).toBe(false); // undefined === 'true' is false
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
    const prices = texts.map((text) => parsePrice(text.split(' - ')[1]));
    const total = prices.reduce((sum, price) => sum + price, 0);
    expect(prices).toHaveLength(6);
    // 29.99 + 9.99 + ... is 129.94000000000003 in floating point: toBe would fail.
    expect(total).toBeCloseTo(129.94);
  });
});

const searchCases = [
  { term: 'shirt', expected: 2 },
  { term: 'bike', expected: 1 },
  { term: 'laptop', expected: 0 },
];

const loginCases = [
  { label: 'a valid user', username: 'standard_user', password: 'secret123', status: 200 },
  { label: 'a locked user', username: 'locked_user', password: 'secret123', status: 403 },
  { label: 'a wrong password', username: 'standard_user', password: 'oops', status: 401 },
];

test.describe('data-driven tests', () => {
  for (const { term, expected } of searchCases) {
    // The title uses the data, so every generated test has a UNIQUE title.
    test(`19.10 ✍️ search "${term}" finds ${expected}`, async ({ request }) => {
      const response = await request.get('/api/products', { params: { search: term } });
      expect(await response.json()).toHaveLength(expected);
    });
  }

  for (const { label, username, password, status } of loginCases) {
    test(`19.11 🔮 login with ${label}`, async ({ request }) => {
      const response = await request.post('/api/login', { data: { username, password } });
      expect(response.status()).toBe(status);
    });
  }
});

test.describe('readable reports', () => {
  test('19.12 ✍️ test.step', async ({ page }) => {
    await test.step('open the playground', async () => {
      await page.goto('/playground');
    });
    const count = await test.step('load the products', async () => {
      await page.getByRole('button', { name: 'Load products' }).click();
      await expect(page.getByTestId('load-status')).toHaveText('Loaded 6 products');
      return page.getByTestId('loaded-products').getByRole('listitem').count();
    });
    expect(count).toBe(6);
  });

  test('19.13 ✍️ tag a test', { tag: '@smoke' }, async () => {
    expect(test.info().tags).toContain('@smoke');
  });

  test(
    '19.14 ✍️ annotate a test',
    { annotation: { type: 'issue', description: 'https://jira.example.com/browse/SHOP-42' } },
    async () => {
      expect(test.info().annotations).toContainEqual(
        expect.objectContaining({ type: 'issue', description: 'https://jira.example.com/browse/SHOP-42' }),
      );
    },
  );

  test('19.15 ✍️ attach data to the report', async ({ request }) => {
    const response = await request.get('/api/products');
    const products = await response.json();
    await test.info().attach('products.json', {
      body: JSON.stringify(products, null, 2),
      contentType: 'application/json',
    });
    expect(test.info().attachments.map((attachment) => attachment.name)).toContain('products.json');
  });
});

const MOCK_PRODUCTS: Product[] = [
  { id: 101, name: 'Mock Mug', price: 3, category: 'other', stock: 1, description: '' },
  { id: 102, name: 'Mock Hat', price: 12.5, category: 'clothes', stock: 1, description: '' },
];

test.describe('the network', () => {
  test('19.16 ✍️ mock a response', async ({ page }) => {
    // The server never sees this request: Playwright answers it.
    await page.route('**/api/products', (route) => route.fulfill({ json: MOCK_PRODUCTS }));
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 2 products');
    await expect(page.getByTestId('loaded-products').getByRole('listitem')).toHaveText(['Mock Mug - $3.00', 'Mock Hat - $12.50']);
  });

  test('19.17 ✍️ make the request fail', async ({ page }) => {
    await page.route('**/api/products', (route) => route.abort());
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Failed to load products');
  });

  test('19.18 ✍️ change the real response', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch(); // the REAL request to the server
      const products = await response.json();
      products.push({ id: 99, name: 'Secret Sale', price: 1, category: 'other', stock: 1, description: '' });
      await route.fulfill({ response, json: products }); // real status + headers, our body
    });
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 7 products');
    await expect(page.getByTestId('loaded-products')).toContainText('Secret Sale - $1.00');
  });

  test('19.19 🧪 wait for a response', async ({ page }) => {
    await page.goto('/playground');
    const responsePromise = page.waitForResponse('**/api/products');
    await page.getByRole('button', { name: 'Load products' }).click();
    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(await response.json()).toHaveLength(6);
  });

  test('19.20 ✍️ combine: mock, step, screenshot, attach', async ({ page }) => {
    await page.route('**/api/products', (route) => route.fulfill({ json: MOCK_PRODUCTS }));
    await page.goto('/playground');
    await page.getByRole('button', { name: 'Load products' }).click();
    await expect(page.getByTestId('load-status')).toHaveText('Loaded 2 products');
    await test.step('attach evidence', async () => {
      const screenshot = await page.screenshot();
      await test.info().attach('mocked-products', { body: screenshot, contentType: 'image/png' });
    });
    const attachment = test.info().attachments.find((item) => item.name === 'mocked-products');
    expect(attachment?.contentType).toBe('image/png');
  });
});
