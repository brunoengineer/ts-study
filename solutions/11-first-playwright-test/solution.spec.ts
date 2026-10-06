// Module 11 · Your First Playwright Test — reference solution
// Run:  npm run solution 11
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('page.goto, the title and the URL', () => {
  test('11.1 🔮 the title of the home page', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBe('Home | QA Shop'); // the <title> tag, not the big heading on the page
  });

  test('11.2 ✍️ go to the login page', async ({ page }) => {
    await page.goto('/login'); // baseURL + '/login' = http://localhost:3000/login
    await expect(page).toHaveTitle('Login | QA Shop');
  });

  test('11.3 🧪 assert the title of the playground', async ({ page }) => {
    await page.goto('/playground');
    await expect(page).toHaveTitle('Playground | QA Shop');
  });

  test('11.4 🔮 where does a logged-out visitor end up?', async ({ page }) => {
    await page.goto('/cart');
    // The full URL is http://localhost:3000/login?next=%2Fcart (goto follows the redirect)
    expect(page.url()).toContain('/login');
  });

  test('11.5 🧪 assert the URL with a regex', async ({ page }) => {
    await page.goto('/products');
    await expect(page).toHaveURL(/login/); // a regex matches PART of the URL
  });

  test('11.6 🐛 the forgotten await', async ({ page }) => {
    await page.goto('/playground');
    const title = await page.title(); // page.title() returns a Promise<string>: await unwraps it
    expect(title).toBe('Playground | QA Shop');
  });
});

test.describe('your first clicks and fills', () => {
  test('11.7 ✍️ click a link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Playground' }).click();
    await expect(page).toHaveURL(/playground/);
    await expect(page.getByRole('heading', { name: 'Playground' })).toBeVisible();
  });

  test('11.8 ✍️ log in', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/products/);
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('11.9 🐛 link or button?', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    // The header has a LINK 'Log in' (it just reloads /login). The form has a BUTTON 'Log in'.
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/products/);
  });

  test('11.10 🧪 a wrong password shows an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toHaveText('Invalid username or password');
  });
});

test.describe('hooks: beforeEach', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('11.11 ✍️ beforeEach opens the playground', async ({ page }) => {
    expect(page.url()).toContain('/playground');
  });

  test('11.12 ✍️ click Increment twice', async ({ page }) => {
    await page.getByRole('button', { name: 'Increment' }).click();
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByTestId('counter')).toHaveText('2');
  });

  test('11.13 ✍️ show the secret details', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle details' }).click();
    await expect(page.getByText('These are the secret details.')).toBeVisible();
  });
});

test.describe('hook order', () => {
  const log: string[] = [];
  test.beforeAll(() => {
    log.push('beforeAll');
  });
  test.beforeEach(() => {
    log.push('beforeEach');
  });
  test.afterEach(() => {
    log.push('afterEach');
  });

  test('11.14 🔮 which hooks ran before the test body?', () => {
    log.push('test');
    // afterEach runs AFTER the test body, so it is not in the array yet.
    expect(log).toEqual(['beforeAll', 'beforeEach', 'test']);
  });
});

test.describe('fixtures and config', () => {
  test('11.15 🔮 the baseURL fixture', async ({ baseURL }) => {
    expect(baseURL).toContain('localhost'); // http://localhost:3000
  });

  test('11.16 🔮 the test timeout', async () => {
    expect(test.info().timeout).toBe(30_000); // timeout: 30_000 in playwright.config.ts
  });
});

test.describe('combine everything', () => {
  test('11.17 ✍️ log in as admin and open the dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('admin');
    await page.getByLabel('Password').fill('admin123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL(/admin/);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('11.18 ✍️ the locked user (write it all)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('locked_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toHaveText('Sorry, this user has been locked out.');
    await expect(page).toHaveURL(/login/);
  });
});
