// Module 17 · Authentication — the SETUP file (exercises 17.1 and 17.2 happen HERE)
// Run:  npm run check 17
//
// This file belongs to the "setup" project (see playwright.config.ts in this folder).
// Playwright runs it BEFORE exercises.spec.ts. Until both setup tests pass, the other
// exercises show as "not run" (○): they depend on the files you save here.
//
// ✍️ Write    -> write the missing code, then delete the todo() line

import { test as setup, expect } from '@playwright/test';
import path from 'node:path';
import { todo } from '../../helpers/blank';

// Where to save the state. .auth/ is in .gitignore: these files contain real session cookies.
const USER_STATE = path.join(import.meta.dirname, '.auth', 'user.json');
const ADMIN_STATE = path.join(import.meta.dirname, '.auth', 'admin.json');

// Credentials: from environment variables when they exist, otherwise the QA Shop defaults.
const USER = process.env.SHOP_USER ?? 'standard_user';
const USER_PASSWORD = process.env.SHOP_USER_PASSWORD ?? 'secret123';
const ADMIN = process.env.SHOP_ADMIN ?? 'admin';
const ADMIN_PASSWORD = process.env.SHOP_ADMIN_PASSWORD ?? 'admin123';

setup('17.1 ✍️ setup: log in as standard_user in the UI and save the state', async ({ page }) => {
  // 1. Go to '/login'. Fill "Username" with USER and "Password" with USER_PASSWORD. Click "Log in".
  // 2. WAIT until the login has really finished: expect the URL to contain /products.
  //    (Save too early and the session cookie isn't there yet.)
  // 3. Save the state of the page's context to USER_STATE.
  //    Shape: await page.context().storageState({ path: ... });
  // ✍️ your code here

  todo('17.1: log in through the UI and save .auth/user.json (in auth.setup.ts)');
});

setup('17.2 ✍️ setup: log in as admin with the API and save the state', async ({ request, context, baseURL }) => {
  // The API is much faster than the UI: no page, no typing, no clicking.
  // 1. POST '/api/login' with data { username: ADMIN, password: ADMIN_PASSWORD }
  // 2. Check it worked:  await expect(response).toBeOK();
  //    Read the token:   const { token } = await response.json();
  // 3. Put the token into the browser context as the cookie the shop uses, called 'session':
  //    Shape: await context.addCookies([{ name: '...', value: ..., url: baseURL }]);
  // 4. Save the context's state to ADMIN_STATE (same shape as 17.1, but on `context`).
  // ✍️ your code here

  todo('17.2: log in with the API and save .auth/admin.json (in auth.setup.ts)');
});
