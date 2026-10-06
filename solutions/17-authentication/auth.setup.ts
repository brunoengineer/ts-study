// Module 17 · Authentication — the SETUP file, reference solution
// Run:  npm run solution 17
//
// This file belongs to the "setup" project (see playwright.config.ts in this folder).
// Playwright runs it BEFORE solution.spec.ts, which depends on the files saved here.

import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

// Where to save the state. .auth/ is in .gitignore: these files contain real session cookies.
const USER_STATE = path.join(import.meta.dirname, '.auth', 'user.json');
const ADMIN_STATE = path.join(import.meta.dirname, '.auth', 'admin.json');

// Credentials: from environment variables when they exist, otherwise the QA Shop defaults.
const USER = process.env.SHOP_USER ?? 'standard_user';
const USER_PASSWORD = process.env.SHOP_USER_PASSWORD ?? 'secret123';
const ADMIN = process.env.SHOP_ADMIN ?? 'admin';
const ADMIN_PASSWORD = process.env.SHOP_ADMIN_PASSWORD ?? 'admin123';

setup('17.1 ✍️ setup: log in as standard_user in the UI and save the state', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill(USER);
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
  // Wait for the redirect: now the session cookie is surely set.
  await expect(page).toHaveURL(/\/products/);
  await page.context().storageState({ path: USER_STATE }); // creates .auth/ if needed
});

setup('17.2 ✍️ setup: log in as admin with the API and save the state', async ({ request, context, baseURL }) => {
  const response = await request.post('/api/login', { data: { username: ADMIN, password: ADMIN_PASSWORD } });
  await expect(response).toBeOK();
  const { token } = await response.json();
  // The browser sends the 'session' cookie; the API also accepts it. `url` sets domain + path for us.
  await context.addCookies([{ name: 'session', value: token, url: baseURL }]);
  await context.storageState({ path: ADMIN_STATE });
});
