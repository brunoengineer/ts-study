// Module 11 · Your First Playwright Test
// Run:  npm run check 11          (watch the browser: npm run check 11 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// Every test here opens a real browser on QA Shop (the practice app).
// Playwright starts the app for you. Want to look at it yourself? `npm run app` -> http://localhost:3000

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('page.goto, the title and the URL', () => {
  test('11.1 🔮 the title of the home page', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    // Tip: every QA Shop page title ends with the same text. Look at section 3 of the lesson.
    expect(title).toBe(___);
  });

  test('11.2 ✍️ go to the login page', async ({ page }) => {
    // Open the login page. Use a RELATIVE url ('/something'): baseURL in playwright.config.ts adds the rest.
    // ✍️ your code here

    todo();
    await expect(page).toHaveTitle('Login | QA Shop');
  });

  test('11.3 🧪 assert the title of the playground', async ({ page }) => {
    await page.goto('/playground');
    // Write ONE assertion: the page has the title 'Playground | QA Shop'.
    // Shape: await expect(page).toHaveTitle('...');
    // ✍️ your code here

    todo();
  });

  test('11.4 🔮 where does a logged-out visitor end up?', async ({ page }) => {
    // The cart needs a login. This browser is NOT logged in.
    await page.goto('/cart');
    // page.url() gives the full current URL as a string. Which PATH does it contain now?
    expect(page.url()).toContain(___);
  });

  test('11.5 🧪 assert the URL with a regex', async ({ page }) => {
    await page.goto('/products'); // not logged in -> QA Shop redirects you
    // Write ONE assertion: the URL contains 'login'. Use a REGEX, not a string,
    // because the full URL is long and has the port in it.
    // Shape: await expect(page).toHaveURL(/something/);
    // ✍️ your code here

    todo();
  });

  test('11.6 🐛 the forgotten await', async ({ page }) => {
    // Run it and read the error: "Received: Promise {}". Then fix it (one word is missing).
    await page.goto('/playground');
    const title = page.title();
    expect(title).toBe('Playground | QA Shop');
  });
});

test.describe('your first clicks and fills', () => {
  test('11.7 ✍️ click a link', async ({ page }) => {
    await page.goto('/');
    // Click the link named 'Playground' (it's in the header).
    // Shape: await page.getByRole('link', { name: '...' }).click();
    // ✍️ your code here

    todo();
    await expect(page).toHaveURL(/playground/);
    await expect(page.getByRole('heading', { name: 'Playground' })).toBeVisible();
  });

  test('11.8 ✍️ log in', async ({ page }) => {
    await page.goto('/login');
    // 1. fill the textbox named 'Username' with 'standard_user'   -> getByRole('textbox', { name: '...' })
    // 2. fill the field labelled 'Password' with 'secret123'      -> getByLabel('...')  (password fields have no role!)
    // 3. click the button named 'Log in'
    // ✍️ your code here

    todo();
    await expect(page).toHaveURL(/products/);
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('11.9 🐛 link or button?', async ({ page }) => {
    // This login never happens. The test waits 5 seconds and fails. Why?
    // Hint: the login page has TWO things called 'Log in'. Open http://localhost:3000/login and look.
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/products/);
  });

  test('11.10 🧪 a wrong password shows an error', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Log in' }).click();
    // Write ONE assertion: the element with role 'alert' has the text 'Invalid username or password'.
    // Shape: await expect(page.getByRole('...')).toHaveText('...');
    // ✍️ your code here

    todo();
  });
});

test.describe('hooks: beforeEach', () => {
  // ✍️ 11.11: write a test.beforeEach here that opens '/playground' before EVERY test in this describe.
  // Shape: test.beforeEach(async ({ page }) => { ... });
  // ✍️ your code here

  test('11.11 ✍️ beforeEach opens the playground', async ({ page }) => {
    // Nothing to write inside this test: the work is the beforeEach above.
    expect(page.url()).toContain('/playground');
  });

  test('11.12 ✍️ click Increment twice', async ({ page }) => {
    // The beforeEach already opened the playground. Click the button 'Increment' TWO times.
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('counter')).toHaveText('2');
  });

  test('11.13 ✍️ show the secret details', async ({ page }) => {
    // Click the button 'Toggle details'.
    // ✍️ your code here

    todo();
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
    // What is inside log at THIS moment? Write the whole array, in order.
    expect(log).toEqual(___);
  });
});

test.describe('fixtures and config', () => {
  test('11.15 🔮 the baseURL fixture', async ({ baseURL }) => {
    // baseURL comes from playwright.config.ts (use: { baseURL: ... }).
    // Which host name is inside it? (one word, no port)
    expect(baseURL).toContain(___);
  });

  test('11.16 🔮 the test timeout', async () => {
    // test.info() tells you things about the running test. .timeout is in milliseconds.
    // Open playwright.config.ts and find `timeout:`. What number is it?
    expect(test.info().timeout).toBe(___);
  });
});

test.describe('combine everything', () => {
  test('11.17 ✍️ log in as admin and open the dashboard', async ({ page }) => {
    // 1. go to '/login'
    // 2. log in as 'admin' with password 'admin123' (same steps as 11.8)
    // 3. click the link 'Admin' in the header
    // ✍️ your code here

    todo();
    await expect(page).toHaveURL(/admin/);
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  });

  test('11.18 ✍️ the locked user (write it all)', async ({ page }) => {
    // Write the WHOLE test body yourself, steps AND assertion:
    // 1. go to '/login'
    // 2. log in as 'locked_user' with password 'secret123'
    // 3. assert that the alert has the text 'Sorry, this user has been locked out.'
    // 4. assert that the URL still contains 'login' (regex)
    // ✍️ your code here

    todo();
  });
});
