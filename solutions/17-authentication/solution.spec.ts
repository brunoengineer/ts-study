// Module 17 · Authentication — reference solution
// Run:  npm run solution 17
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.
// Exercises 17.1 and 17.2 are solved in ./auth.setup.ts

import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const USER_STATE = path.join(import.meta.dirname, '.auth', 'user.json');
const ADMIN_STATE = path.join(import.meta.dirname, '.auth', 'admin.json');

test.use({ storageState: USER_STATE });

test.describe('logged in from the start', () => {
  test('17.3 🔮 open a page that needs a login', async ({ page }) => {
    await page.goto('/cart');
    // The context starts with the session cookie, so no redirect.
    expect(new URL(page.url()).pathname).toBe('/cart');
  });

  test('17.4 🧪 assert that you are logged in', async ({ page }) => {
    await page.goto('/products');
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
    await expect(page.getByRole('link', { name: 'Log in' })).not.toBeVisible();
  });

  test('17.5 🔮 page.request uses the same cookies as the page', async ({ page }) => {
    const response = await page.request.get('/api/me');
    const me = await response.json();
    expect(me.username).toBe('standard_user');
    expect(me.role).toBe('user');
  });

  test('17.6 🔮 and the request fixture?', async ({ request }) => {
    // test.use({ storageState }) applies to `request` too, so it is logged in.
    const response = await request.get('/api/me');
    expect(response.status()).toBe(200);
  });

  test('17.7 🔮 what is inside the state file?', async () => {
    const state = JSON.parse(fs.readFileSync(USER_STATE, 'utf8'));
    const cookieNames = state.cookies.map((cookie: { name: string }) => cookie.name);
    expect(cookieNames).toEqual(['session']);
    // HttpOnly: JavaScript in the page can't read it (Set-Cookie: ...; HttpOnly).
    expect(state.cookies[0].httpOnly).toBe(true);
  });
});

test.describe('logged out', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('17.8 ✍️ a describe that starts logged out', async ({ page }) => {
    await page.goto('/cart');
    expect(new URL(page.url()).pathname).toBe('/login');
  });
});

test.describe('logging in inside the test', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('17.9 ✍️ the slow way: log in through the UI', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('17.10 ✍️ the fast way: API login + cookie', async ({ page, request, context, baseURL }) => {
    const response = await request.post('/api/login', { data: { username: 'standard_user', password: 'secret123' } });
    const { token } = await response.json();
    await context.addCookies([{ name: 'session', value: token, url: baseURL }]);
    await page.goto('/products');
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('17.11 🔮 log in with the form, without a browser', async ({ request }) => {
    const response = await request.post('/login', { form: { username: 'standard_user', password: 'secret123' } });
    expect(new URL(response.url()).pathname).toBe('/products');
    const state = await request.storageState();
    expect(state.cookies.map((cookie) => cookie.name)).toEqual(['session']);
    // Tip: request.storageState({ path: ... }) would save it to a file, like in a setup.
  });
});

test.describe('as admin', () => {
  test.use({ storageState: ADMIN_STATE });

  test('17.12 ✍️ switch to the admin state', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });
});

test.describe('as admin, again', () => {
  // A relative path is read from the folder you RUN from (the project root), not from this folder.
  test.use({ storageState: ADMIN_STATE });

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
    const adminContext = await browser.newContext({ storageState: ADMIN_STATE });
    const adminPage = await adminContext.newPage();
    const created = await adminPage.request.post('/api/products', { data: { name: 'Team Mug', price: 12 } });
    expect(created.status()).toBe(201);
    await adminPage.goto('/admin');
    await expect(adminPage.getByTestId('product-total')).toHaveText('7');
    await page.goto('/products');
    await expect(page.getByRole('heading', { name: 'Team Mug' })).toBeVisible();
    await adminContext.close();
  });
});

test.describe('credentials', () => {
  test('17.15 🔮 credentials from environment variables', async () => {
    const adminPassword = process.env.SHOP_ADMIN_PASSWORD ?? 'admin123';
    const loginTimeout = Number(process.env.LOGIN_TIMEOUT ?? '10000');
    expect(adminPassword).toBe('admin123');
    expect(loginTimeout).toBe(10000); // Number('10000'): env variables are always strings
  });
});

test.describe('logging out', () => {
  // Own, fresh session: logging out only kills THIS session, not the shared one in user.json.
  test.use({ storageState: { cookies: [], origins: [] } });

  test('17.16 🐛 logging out must not break the other tests', async ({ page, browser }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard'); // wait: login finished

    await page.goto('/products');
    await page.getByRole('link', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login/);

    const other = await browser.newContext({ storageState: USER_STATE });
    const me = await other.request.get('/api/me');
    expect(me.status(), 'the shared session in user.json must still work').toBe(200);
    await other.close();
  });
});
