// Module 16 · Fixtures
// Run:  npm run check 16          (watch the browser: npm run check 16 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// Most fixtures in this file are defined right above the tests that use them, with a small
// test.extend(...) per group. An unfinished fixture only breaks ITS OWN tests.
// Exercises 16.16 and 16.17 happen in ./fixtures.ts (your own fixtures file).

import { test, expect, mergeTests, type APIRequestContext, type Page } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';
import { LoginPage } from './pages';
// In a real project this would be your ONLY import line: import { test, expect } from './fixtures';
// Here we rename it, because this file already has a `test` and an `expect`.
import { test as shopTest, expect as shopExpect } from './fixtures';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

// PROVIDED helper: logs in as admin with the API and returns the token.
async function loginAsAdmin(request: APIRequestContext): Promise<string> {
  const response = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
  const body = await response.json();
  return body.token;
}

test.describe('built-in fixtures', () => {
  test('16.1 🔮 browserName', async ({ browserName }) => {
    // Which browser runs your tests? (playwright.config.ts uses devices['Desktop Chrome'])
    expect(browserName).toBe(___);
  });

  test('16.2 🔮 baseURL comes from the config', async ({ baseURL }) => {
    // Look at `use: { baseURL: ... }` in playwright.config.ts. Which host name is in it?
    expect(baseURL).toContain(___);
  });

  test('16.3 🔮 testInfo knows which test is running', async ({}, testInfo) => {
    // testInfo is the SECOND parameter of the test function.
    expect(testInfo.title).toBe(___);
  });

  test('16.4 🔮 the page lives inside the context', async ({ context, page }) => {
    expect(context.pages().length).toBe(___);
    const secondTab = await context.newPage();
    expect(context.pages().length).toBe(___);
    expect(secondTab.context() === page.context()).toBe(___);
  });

  test('16.5 ✍️ a second, separate browser context', async ({ browser, page }) => {
    // The `page` fixture logs in as standard_user:
    await page.goto('/login');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');

    // Now create a SECOND context (a fresh "incognito window") from the `browser` fixture,
    // and a page inside it. Names: otherContext and otherPage.
    // Shape: const otherContext = await browser.newContext();
    //        const otherPage = await otherContext.newPage();
    // ✍️ your code here

    todo();
    await otherPage.goto('/cart');
    await expect(otherPage).toHaveURL(/\/login/); // its own cookies: NOT logged in
    await otherContext.close(); // contexts YOU create, YOU close
  });
});

// ---------------------------------------------------------------------------
// Your first fixtures. Read the type first: it says what each fixture gives to the test.
// ---------------------------------------------------------------------------
const firstTest = test.extend<{ shopName: string; playgroundPage: Page }>({
  shopName: async ({}, use) => {
    // 16.6 ✍️ hand the string 'QA Shop' to the test.
    // Shape: await use(value);
    // ✍️ your code here

    todo('16.6: write the shopName fixture (above the test)');
  },

  playgroundPage: async ({ page }, use) => {
    // 16.7 ✍️ prepare the page: go to '/playground', THEN hand the page to the test.
    // ✍️ your code here

    todo('16.7: write the playgroundPage fixture (above the test)');
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

// ---------------------------------------------------------------------------
// The anatomy: setup -> await use(value) -> teardown. Each fixture writes into `log`.
// ---------------------------------------------------------------------------
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
    expect(log).toEqual(___);
  });

  orderTest('16.9 🔮 a fixture that needs another fixture', async ({ server, log }) => {
    // The test asks only for `server`. But look at server's parameters...
    log.push('test');
    expect(server).toBe('server using db-connection');
    expect(log).toEqual(___);
  });

  const buggyTest = test.extend<{ log: string[]; session: string }>({
    log: async ({}, use) => {
      await use([]);
    },
    session: async ({ log }, use) => {
      log.push('login');
      use('session-123');
      log.push('logout');
    },
  });

  buggyTest('16.10 🐛 the teardown runs too early', async ({ session, log }) => {
    // The test should run while the session is still open: login -> test (logout comes AFTER the test).
    // Read the "Received" array. Then fix the `session` fixture just above (one word is missing).
    log.push('test');
    expect(session).toBe('session-123');
    expect(log).toEqual(['login', 'test']);
  });
});

// ---------------------------------------------------------------------------
// Setup and teardown with the API: create test data before, delete it after.
// ---------------------------------------------------------------------------
const dataTest = test.extend<{ createdIds: number[]; tempProduct: Product }>({
  // PROVIDED: remembers the ids that were created and, AFTER the test, checks they were deleted.
  // (It is set up before tempProduct, so it is torn down after it: teardown runs in reverse order.)
  createdIds: async ({ request }, use) => {
    const ids: number[] = [];
    await use(ids);
    for (const id of ids) {
      const response = await request.get(`/api/products/${id}`);
      expect(response.status(), `product ${id} must be deleted by the tempProduct teardown`).toBe(404);
    }
  },

  tempProduct: async ({ request, createdIds }, use) => {
    // SETUP (provided): create a product as admin
    const headers = { Authorization: `Bearer ${await loginAsAdmin(request)}` };
    const response = await request.post('/api/products', { headers, data: { name: 'Temp Product', price: 5 } });
    const product: Product = await response.json();
    createdIds.push(product.id);

    // 16.11 ✍️ 1) hand `product` to the test
    //          2) TEARDOWN: delete it again: request.delete(`/api/products/${product.id}`, { headers })
    // ✍️ your code here

    todo('16.11: finish the tempProduct fixture (above the test)');
  },
});

test.describe('setup and teardown with the API', () => {
  dataTest('16.11 ✍️ a product that exists only during the test', async ({ tempProduct, request }) => {
    expect(tempProduct.name).toBe('Temp Product');
    const response = await request.get(`/api/products/${tempProduct.id}`);
    expect(response.status()).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Auto fixtures run for EVERY test, even when the test doesn't ask for them.
// ---------------------------------------------------------------------------
const resetLog: string[] = [];

const autoTest = test.extend<{ resetShop: void }>({
  resetShop: [
    async ({ request }, use, testInfo) => {
      // 16.12 ✍️ before the test:
      //   1) reset the shop: POST /api/reset
      //   2) remember which test it was for: resetLog.push(testInfo.title)
      // then: await use();   (nothing to hand over, so use() gets no value)
      // ✍️ your code here

      todo('16.12: write the auto fixture (above the test)');
    },
    { auto: true },
  ],
});

test.describe('auto fixtures', () => {
  autoTest('16.12 ✍️ an auto fixture resets the shop before every test', async ({ request }) => {
    // This test does NOT ask for resetShop. It runs anyway, because it is { auto: true }.
    expect(resetLog).toContain('16.12 ✍️ an auto fixture resets the shop before every test');
    const response = await request.get('/api/products');
    expect(await response.json()).toHaveLength(6);
  });
});

// ---------------------------------------------------------------------------
// Option fixtures: a default value you can change with .use({ ... })
// ---------------------------------------------------------------------------
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
    expect(shopUser).toBe(___);
    expect(role).toBe(___);
  });

  test.describe('as admin', () => {
    // 16.14 ✍️ Change the option for THIS describe only: shopUser must be 'admin'.
    // Shape: optionTest.use({ optionName: value });
    // ✍️ your code here

    optionTest('16.14 ✍️ override an option with .use()', async ({ shopUser, role }) => {
      expect(shopUser).toBe('admin');
      expect(role).toBe('admin');
    });
  });
});

// ---------------------------------------------------------------------------
// mergeTests: combine fixtures that were written in different places.
// ---------------------------------------------------------------------------
type Credentials = { username: string; password: string };

const pagesTest = test.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

const credentialsTest = test.extend<{ credentials: Credentials }>({
  credentials: async ({}, use) => {
    // 16.15 ✍️ hand this object to the test: username 'standard_user', password 'secret123'
    // ✍️ your code here

    todo('16.15: write the credentials fixture (above the test)');
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

// ---------------------------------------------------------------------------
// Your own fixtures file: ./fixtures.ts  (open it side by side with this file)
// ---------------------------------------------------------------------------
test.describe('your own fixtures.ts', () => {
  shopTest.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

  shopTest('16.16 ✍️ fixtures.ts: the loginPage fixture', async ({ loginPage, page }) => {
    // Write the loginPage fixture in fixtures.ts (look for 16.16 there).
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');
    await shopExpect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  shopTest('16.17 ✍️ fixtures.ts: a page object that is already logged in', async ({ productsPage }) => {
    // Write the productsPage fixture in fixtures.ts (look for 16.17 there). This test has NO login code.
    await shopExpect(productsPage.heading).toBeVisible();
    await shopExpect(productsPage.productCards).toHaveCount(6);
  });

  shopTest('16.18 🧪 combine your fixtures', async ({ productsPage, cartPage }) => {
    await productsPage.addToCart('Backpack');
    await productsPage.addToCart('Bike Light');
    await cartPage.goto();
    // Write TWO web-first assertions with shopExpect:
    //  - cartPage.rows has 2 rows          (toHaveCount)
    //  - cartPage.total has the text 'Total: $39.98'
    // ✍️ your code here

    todo();
  });
});

// ---------------------------------------------------------------------------
// Worker-scoped fixtures: set up ONCE per worker process, shared by many tests.
// (These tests are last on purpose: tests with different worker fixtures run in their own worker.)
// ---------------------------------------------------------------------------
const BASE_URL = `http://localhost:${process.env.PORT ?? 3000}`;
let adminLogins = 0;

const workerTest = test.extend<{}, { adminToken: string }>({
  adminToken: [
    async ({ playwright }, use) => {
      adminLogins++;
      // Worker fixtures can't use `request` or `baseURL` (they are per TEST). Make your own API context:
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
    expect(adminLogins).toBe(___);
  });

  workerTest('16.20 🧪 reuse the worker token in a second test', async ({ adminToken, request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { name: 'Worker Mug', price: 7.5 },
    });
    // Write TWO assertions:
    //  - response.status() is 201
    //  - adminLogins is STILL 1 (the fixture did not run again for this test)
    // ✍️ your code here

    todo();
  });
});
