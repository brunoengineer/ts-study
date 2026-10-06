// Module 17 · Authentication
// Run:  npm run check 17          (watch the browser: npm run check 17 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// START IN auth.setup.ts (exercises 17.1 and 17.2). This module has its own playwright.config.ts:
// the "setup" project runs first and saves .auth/user.json and .auth/admin.json.
// The tests in this file only run when the setup passed.

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { ___, todo } from '../../helpers/blank';

// The files that auth.setup.ts writes. Absolute paths, so they work no matter where you run from.
const USER_STATE = path.join(import.meta.dirname, '.auth', 'user.json');
const ADMIN_STATE = path.join(import.meta.dirname, '.auth', 'admin.json');

// Every test in this file starts LOGGED IN as standard_user... unless a describe says otherwise.
test.use({ storageState: USER_STATE });

test.describe('logged in from the start', () => {
  test('17.3 🔮 open a page that needs a login', async ({ page }) => {
    await page.goto('/cart');
    // Logged-out visitors are sent to /login?next=/cart. Where are we?
    expect(new URL(page.url()).pathname).toBe(___);
  });

  test('17.4 🧪 assert that you are logged in', async ({ page }) => {
    await page.goto('/products');
    // Write TWO web-first assertions:
    //  - the element with test id 'user-name' has the text 'Sam Standard'
    //  - the link 'Log in' is NOT visible   (Shape: await expect(...).not.toBeVisible();)
    // ✍️ your code here

    todo();
  });

  test('17.5 🔮 page.request uses the same cookies as the page', async ({ page }) => {
    const response = await page.request.get('/api/me');
    const me = await response.json();
    expect(me.username).toBe(___);
    expect(me.role).toBe(___);
  });

  test('17.6 🔮 and the request fixture?', async ({ request }) => {
    // The `request` fixture also uses the storageState option of the test.
    const response = await request.get('/api/me');
    expect(response.status()).toBe(___);
  });

  test('17.7 🔮 what is inside the state file?', async () => {
    const state = JSON.parse(fs.readFileSync(USER_STATE, 'utf8'));
    const cookieNames = state.cookies.map((cookie: { name: string }) => cookie.name);
    expect(cookieNames).toEqual(___);
    expect(state.cookies[0].httpOnly).toBe(___);
  });
});

test.describe('logged out', () => {
  // 17.8 ✍️ The tests in THIS describe must start logged out (an empty state: no cookies, no origins).
  // Shape: test.use({ storageState: { cookies: [], origins: [] } });
  // ✍️ your code here

  test('17.8 ✍️ a describe that starts logged out', async ({ page }) => {
    await page.goto('/cart');
    expect(new URL(page.url()).pathname).toBe('/login');
  });
});

test.describe('logging in inside the test', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('17.9 ✍️ the slow way: log in through the UI', async ({ page }) => {
    // Log in as standard_user / secret123 through the /login page (4 lines: goto, fill, fill, click).
    // This is what every test would need WITHOUT storageState.
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('17.10 ✍️ the fast way: API login + cookie', async ({ page, request, context, baseURL }) => {
    // 1. POST '/api/login' with data { username: 'standard_user', password: 'secret123' }
    // 2. const { token } = await response.json();
    // 3. context.addCookies with ONE cookie: name 'session', value token, url baseURL
    // ✍️ your code here

    todo();
    await page.goto('/products');
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('17.11 🔮 log in with the form, without a browser', async ({ request }) => {
    // The login FORM sends username + password to POST /login. `request` can do that too:
    const response = await request.post('/login', { form: { username: 'standard_user', password: 'secret123' } });
    // The shop answers with a redirect + a Set-Cookie header. `request` follows the redirect...
    expect(new URL(response.url()).pathname).toBe(___);
    // ...and keeps the cookie. storageState() without a path returns the state as an object:
    const state = await request.storageState();
    expect(state.cookies.map((cookie) => cookie.name)).toEqual(___);
  });
});

test.describe('as admin', () => {
  // 17.12 ✍️ The tests in THIS describe must start logged in as ADMIN (use the ADMIN_STATE file).
  // ✍️ your code here

  test('17.12 ✍️ switch to the admin state', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(200); // a normal user gets 403 Access denied
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });
});

test.describe('as admin, again', () => {
  // Someone wrote a short relative path here. Run the test and read the error: which folder did Playwright look in?
  test.use({ storageState: '.auth/admin.json' });

  test('17.13 🐛 the state file is not found', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(200);
  });
});

test.describe('two roles in one test', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

  test('17.14 ✍️ an admin and a user at the same time', async ({ page, browser }) => {
    // `page` is the standard_user (file-level test.use). Create a SECOND context for the admin:
    //   adminContext: browser.newContext with { storageState: ADMIN_STATE }
    //   adminPage:    a new page in adminContext
    // ✍️ your code here

    todo();
    // The admin creates a product with the API (adminPage.request sends the admin's cookie):
    const created = await adminPage.request.post('/api/products', { data: { name: 'Team Mug', price: 12 } });
    expect(created.status()).toBe(201);
    await adminPage.goto('/admin');
    await expect(adminPage.getByTestId('product-total')).toHaveText('7');
    // ...and the user sees it in the shop:
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Team Mug' })).toBeVisible();
    await adminContext.close();
  });
});

test.describe('credentials', () => {
  test('17.15 🔮 credentials from environment variables', async () => {
    // Nobody set these environment variables on your machine, so the fallback (after ??) is used.
    const adminPassword = process.env.SHOP_ADMIN_PASSWORD ?? 'admin123';
    const loginTimeout = Number(process.env.LOGIN_TIMEOUT ?? '10000');
    expect(adminPassword).toBe(___);
    expect(loginTimeout).toBe(___);
  });
});

test.describe('logging out', () => {
  test('17.16 🐛 logging out must not break the other tests', async ({ page, browser }) => {
    // This test logs out with the SHARED session from user.json. Logging out deletes that session
    // on the server... and every other test that uses user.json is logged out too!
    // Fix: this describe must start logged out (empty state), and the test must log in with its OWN
    // session before it goes to /products (UI login like 17.9, or API login like 17.10).
    await page.goto('/products');
    await page.getByRole('link', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login/);

    // Check: the shared session in user.json must STILL work.
    const other = await browser.newContext({ storageState: USER_STATE });
    const me = await other.request.get('/api/me');
    expect(me.status(), 'the shared session in user.json must still work').toBe(200);
    await other.close();
  });
});
