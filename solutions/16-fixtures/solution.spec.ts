// Module 16 · Fixtures — reference solution
// Run:  npm run solution 16
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.
// Exercises 16.16 and 16.17 are solved in ./fixtures.ts

import { test, expect, mergeTests, type APIRequestContext, type Page } from '@playwright/test';
import { LoginPage } from './pages';
import { test as shopTest, expect as shopExpect } from './fixtures';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

async function loginAsAdmin(request: APIRequestContext): Promise<string> {
  const response = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
  const body = await response.json();
  return body.token;
}

test.describe('built-in fixtures', () => {
  test('16.1 🔮 browserName', async ({ browserName }) => {
    // Desktop Chrome runs on Chromium. The other two are 'firefox' and 'webkit'.
    expect(browserName).toBe('chromium');
  });

  test('16.2 🔮 baseURL comes from the config', async ({ baseURL }) => {
    expect(baseURL).toContain('localhost');
  });

  test('16.3 🔮 testInfo knows which test is running', async ({}, testInfo) => {
    expect(testInfo.title).toBe('16.3 🔮 testInfo knows which test is running');
  });

  test('16.4 🔮 the page lives inside the context', async ({ context, page }) => {
    // Asking for `page` created one page in this context.
    expect(context.pages().length).toBe(1);
    const secondTab = await context.newPage();
    expect(context.pages().length).toBe(2);
    expect(secondTab.context() === page.context()).toBe(true); // same context = same cookies
  });

  test('16.5 ✍️ a second, separate browser context', async ({ browser, page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');

    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    await otherPage.goto('/cart');
    await expect(otherPage).toHaveURL(/\/login/);
    await otherContext.close();
  });
});

const firstTest = test.extend<{ shopName: string; playgroundPage: Page }>({
  shopName: async ({}, use) => {
    await use('QA Shop');
  },

  playgroundPage: async ({ page }, use) => {
    await page.goto('/playground'); // setup first...
    await use(page); // ...then hand it over
  },
});

test.describe('your first fixtures', () => {
  firstTest('16.6 ✍️ a fixture that gives a value', async ({ shopName }) => {
    expect(shopName).toBe('QA Shop');
  });

  firstTest('16.7 ✍️ a fixture that prepares the page', async ({ playgroundPage }) => {
    await expect(playgroundPage.getByRole('heading', { name: 'Playground', level: 1 })).toBeVisible();
  });
});

const orderTest = test.extend<{ log: string[]; database: string; server: string }>({
  log: async ({}, use) => {
    await use([]);
  },
  database: async ({ log }, use) => {
    log.push('database setup');
    await use('db-connection');
    log.push('database teardown');
  },
  server: async ({ log, database }, use) => {
    log.push('server setup');
    await use(`server using ${database}`);
    log.push('server teardown');
  },
});

test.describe('setup, use, teardown', () => {
  orderTest('16.8 🔮 what has happened when the test body starts?', async ({ log, database }) => {
    log.push('test');
    expect(database).toBe('db-connection');
    // Only the SETUP part ran. The teardown waits until the test is finished.
    expect(log).toEqual(['database setup', 'test']);
  });

  orderTest('16.9 🔮 a fixture that needs another fixture', async ({ server, log }) => {
    log.push('test');
    expect(server).toBe('server using db-connection');
    // server needs database, so Playwright sets up database first.
    expect(log).toEqual(['database setup', 'server setup', 'test']);
  });

  const buggyTest = test.extend<{ log: string[]; session: string }>({
    log: async ({}, use) => {
      await use([]);
    },
    session: async ({ log }, use) => {
      log.push('login');
      await use('session-123'); // without await, the next line ran immediately (before the test)
      log.push('logout');
    },
  });

  buggyTest('16.10 🐛 the teardown runs too early', async ({ session, log }) => {
    log.push('test');
    expect(session).toBe('session-123');
    expect(log).toEqual(['login', 'test']);
  });
});

const dataTest = test.extend<{ createdIds: number[]; tempProduct: Product }>({
  createdIds: async ({ request }, use) => {
    const ids: number[] = [];
    await use(ids);
    for (const id of ids) {
      const response = await request.get(`/api/products/${id}`);
      expect(response.status(), `product ${id} must be deleted by the tempProduct teardown`).toBe(404);
    }
  },

  tempProduct: async ({ request, createdIds }, use) => {
    const headers = { Authorization: `Bearer ${await loginAsAdmin(request)}` };
    const response = await request.post('/api/products', { headers, data: { name: 'Temp Product', price: 5 } });
    const product: Product = await response.json();
    createdIds.push(product.id);

    await use(product);

    // Teardown: runs after the test, even when the test failed.
    await request.delete(`/api/products/${product.id}`, { headers });
  },
});

test.describe('setup and teardown with the API', () => {
  dataTest('16.11 ✍️ a product that exists only during the test', async ({ tempProduct, request }) => {
    expect(tempProduct.name).toBe('Temp Product');
    const response = await request.get(`/api/products/${tempProduct.id}`);
    expect(response.status()).toBe(200);
  });
});

const resetLog: string[] = [];

const autoTest = test.extend<{ resetShop: void }>({
  resetShop: [
    async ({ request }, use, testInfo) => {
      await request.post('/api/reset');
      resetLog.push(testInfo.title);
      await use();
    },
    { auto: true },
  ],
});

test.describe('auto fixtures', () => {
  autoTest('16.12 ✍️ an auto fixture resets the shop before every test', async ({ request }) => {
    expect(resetLog).toContain('16.12 ✍️ an auto fixture resets the shop before every test');
    const response = await request.get('/api/products');
    expect(await response.json()).toHaveLength(6);
  });
});

const PASSWORDS: Record<string, string> = { standard_user: 'secret123', admin: 'admin123' };

const optionTest = test.extend<{ shopUser: string; role: string }>({
  shopUser: ['standard_user', { option: true }],
  role: async ({ shopUser, request }, use) => {
    const response = await request.post('/api/login', { data: { username: shopUser, password: PASSWORDS[shopUser] } });
    const body = await response.json();
    await use(body.user.role);
  },
});

test.describe('option fixtures', () => {
  optionTest('16.13 🔮 the default value of an option', async ({ shopUser, role }) => {
    expect(shopUser).toBe('standard_user'); // the first item of [default, { option: true }]
    expect(role).toBe('user');
  });

  test.describe('as admin', () => {
    optionTest.use({ shopUser: 'admin' }); // only for the tests in THIS describe

    optionTest('16.14 ✍️ override an option with .use()', async ({ shopUser, role }) => {
      expect(shopUser).toBe('admin');
      expect(role).toBe('admin'); // `role` depends on shopUser, so it changed too
    });
  });
});

type Credentials = { username: string; password: string };

const pagesTest = test.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

const credentialsTest = test.extend<{ credentials: Credentials }>({
  credentials: async ({}, use) => {
    await use({ username: 'standard_user', password: 'secret123' });
  },
});

const mergedTest = mergeTests(pagesTest, credentialsTest);

test.describe('mergeTests', () => {
  mergedTest('16.15 ✍️ fixtures from two places in one test', async ({ loginPage, credentials, page }) => {
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);
    await expect(page).toHaveURL(/\/products/);
  });
});

test.describe('your own fixtures.ts', () => {
  shopTest.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

  shopTest('16.16 ✍️ fixtures.ts: the loginPage fixture', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');
    await shopExpect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  shopTest('16.17 ✍️ fixtures.ts: a page object that is already logged in', async ({ productsPage }) => {
    await shopExpect(productsPage.heading).toBeVisible();
    await shopExpect(productsPage.productCards).toHaveCount(6);
  });

  shopTest('16.18 🧪 combine your fixtures', async ({ productsPage, cartPage }) => {
    await productsPage.addToCart('Backpack');
    await productsPage.addToCart('Bike Light');
    await cartPage.goto();
    await shopExpect(cartPage.rows).toHaveCount(2);
    await shopExpect(cartPage.total).toHaveText('Total: $39.98'); // 29.99 + 9.99
  });
});

const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;
let adminLogins = 0;

const workerTest = test.extend<{}, { adminToken: string }>({
  adminToken: [
    async ({ playwright }, use) => {
      adminLogins++;
      const api = await playwright.request.newContext({ baseURL: BASE_URL });
      const token = await loginAsAdmin(api);
      await use(token);
      await api.dispose();
    },
    { scope: 'worker' },
  ],
});

test.describe('worker-scoped fixtures', () => {
  workerTest('16.19 🔮 how many admin logins so far?', async ({ adminToken }) => {
    expect(adminToken.length).toBeGreaterThan(10);
    expect(adminLogins).toBe(1);
  });

  workerTest('16.20 🧪 reuse the worker token in a second test', async ({ adminToken, request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Worker Mug', price: 7.5 },
    });
    expect(response.status()).toBe(201);
    // Same worker, same token: the worker fixture was set up only ONCE for both tests.
    expect(adminLogins).toBe(1);
  });
});
