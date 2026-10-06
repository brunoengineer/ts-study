# Playwright cheat sheet

Module numbers in brackets. Remember: **every `page.`/`locator.` action and every `expect(locator)` needs `await`.**

## Running [11]

```bash
npx playwright test                        # everything
npx playwright test tests/login.spec.ts    # one file
npx playwright test -g "checkout"          # tests whose title matches
npx playwright test --grep @smoke          # by tag
npx playwright test --headed               # watch the browser
npx playwright test --ui                   # UI mode (time travel, watch mode, pick locator)
npx playwright test --debug                # step through with the inspector
npx playwright test --project=chromium     # one project
npx playwright show-report                 # last HTML report
npx playwright show-trace trace.zip        # open a trace
npx playwright codegen http://localhost:3000   # record clicks → code
```

## Test structure [11]

```ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('valid user can log in', { tag: '@smoke' }, async ({ page }) => {
    await test.step('fill the form', async () => { /* ... */ });
  });
});

test.only(...)   test.skip(...)   test.fixme(...)   test.slow()   test.setTimeout(60_000)
test.beforeAll / afterAll / afterEach
```

## Locators [12]: find elements

Priority: **role → label → placeholder → text → test id → CSS**

```ts
page.getByRole('button', { name: 'Log in' })
page.getByRole('heading', { name: 'Products', level: 1 })
page.getByRole('link', { name: 'Cart' })
page.getByRole('textbox', { name: 'Username' })     // also: checkbox, radio, combobox, row, cell, list, listitem, table, dialog, alert, tab
page.getByLabel('Password')
page.getByPlaceholder('Search...')
page.getByText('Your cart is empty')                 // substring, case-insensitive
page.getByText('Total', { exact: true })
page.getByText(/total: \$\d+/i)
page.getByTestId('cart-count')                       // data-testid="cart-count"
page.locator('.product-card')                        // CSS (last resort)

// narrowing down
page.getByTestId('product-card').filter({ hasText: 'Backpack' })
page.getByRole('row').filter({ has: page.getByText('Bruno Costa') })
card.getByRole('button', { name: 'Add to cart' })    // chaining: search inside card
locator.first()   locator.last()   locator.nth(2)
await locator.count()
await locator.allTextContents()                      // string[]
await locator.textContent()   await locator.innerText()   await locator.inputValue()
await locator.getAttribute('href')   await locator.isVisible()
```

`strict mode violation: ... resolved to 3 elements` → your locator matches more than one element. Make it more specific.

## Actions [13]

```ts
await page.goto('/products');
await page.goBack();   await page.reload();
await locator.click();   await locator.dblclick();   await locator.click({ button: 'right' });
await locator.fill('standard_user');                 // replaces the value
await locator.clear();
await locator.pressSequentially('slow typing', { delay: 50 });
await locator.press('Enter');                        // also: 'Tab', 'Escape', 'Control+A'
await page.keyboard.press('Enter');
await locator.check();   await locator.uncheck();   await locator.setChecked(true);
await locator.selectOption('br');                    // by value
await locator.selectOption({ label: 'Brazil' });
await locator.hover();
await locator.focus();
await locator.setInputFiles('path/to/file.pdf');
await locator.setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });

// dialogs (alert/confirm/prompt): register BEFORE the click
page.once('dialog', (dialog) => dialog.accept());    // or dialog.dismiss(), dialog.accept('text')

// new tab / popup: start waiting BEFORE the click
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Open in new tab' }).click();
const popup = await popupPromise;
```

## Assertions [14]

**Web-first (auto-retry until timeout): use these for anything on the page**

```ts
await expect(page).toHaveURL('/products');           // or a regex: /\/products$/
await expect(page).toHaveTitle(/QA Shop/);
await expect(locator).toBeVisible();      .toBeHidden()
await expect(locator).toHaveText('Exact text');      // or regex, or array for many elements
await expect(locator).toContainText('part');
await expect(locator).toHaveValue('typed value');
await expect(locator).toHaveCount(6);
await expect(locator).toBeChecked();     .toBeEnabled()     .toBeDisabled()     .toBeEditable()
await expect(locator).toHaveAttribute('aria-expanded', 'true');
await expect(locator).toHaveClass(/active/);
await expect(locator).toBeFocused();     .toBeEmpty()
await expect(locator).not.toBeVisible();
await expect(locator, 'cart badge should update').toHaveText('1');   // custom message
await expect(locator).toBeVisible({ timeout: 10_000 });
await expect(response).toBeOK();                     // API response 2xx
expect.soft(locator) ...                             // keep going after failure
await expect.poll(async () => (await api.get('/x')).status()).toBe(200);
await expect(async () => { /* retry this block */ }).toPass();
```

**Generic (checks once, no retry): for plain values**

```ts
expect(value).toBe(5);                     // same value (primitives)
expect(obj).toEqual({ a: 1 });             // same content (objects/arrays)
expect(obj).toMatchObject({ a: 1 });       // contains at least these
expect(obj).toHaveProperty('id');
expect(list).toContain('Backpack');        expect(list).toHaveLength(3);
expect(n).toBeGreaterThan(0);              expect(price).toBeCloseTo(59.98, 2);
expect(text).toMatch(/total/i);            expect(x).toBeTruthy();   expect(x).toBeDefined();
expect(fn).toThrow('message');
expect(body).toEqual(expect.objectContaining({ id: expect.any(Number) }));
expect(list).toEqual(expect.arrayContaining(['a']));
```

## Page Object [15]

```ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Log in' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submit.click();
  }
}
```

## Fixtures [16]

```ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

type MyFixtures = { loginPage: LoginPage };

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);   // setup
    await use(loginPage);                    // the test runs here
    // teardown (optional)
  },
});
export { expect };

// worker scope:  myThing: [async ({}, use) => { ... }, { scope: 'worker' }]
// auto:          myThing: [async ({ page }, use) => { ... }, { auto: true }]
// option:        role: ['user', { option: true }]   →   test.use({ role: 'admin' })
```

## Authentication [17]

```ts
// auth.setup.ts
import { test as setup } from '@playwright/test';
setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  // ...log in...
  await page.context().storageState({ path: '.auth/user.json' });
});

// in config: projects: [{ name: 'setup', testMatch: /.*\.setup\.ts/ },
//   { name: 'chromium', use: { storageState: '.auth/user.json' }, dependencies: ['setup'] }]

test.use({ storageState: '.auth/admin.json' });                  // per file / describe
test.use({ storageState: { cookies: [], origins: [] } });        // logged out
```

## API testing [18]

```ts
test('get products', async ({ request }) => {
  const response = await request.get('/api/products', { params: { category: 'clothes' } });
  await expect(response).toBeOK();
  expect(response.status()).toBe(200);
  const products: Product[] = await response.json();
});

const login = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
const { token } = await login.json();
await request.post('/api/products', {
  headers: { Authorization: `Bearer ${token}` },
  data: { name: 'Mug', price: 12.5 },
});
await request.put(url, { data });   await request.patch(url, { data });   await request.delete(url);
response.ok()   response.status()   response.statusText()   await response.text()   response.headers()

// your own API context
import { request as playwrightRequest } from '@playwright/test';
const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });
await api.dispose();
```

## Network & mocking [19]

```ts
await page.route('**/api/products', (route) => route.fulfill({ json: [{ id: 1, name: 'Fake', price: 1 }] }));
await page.route('**/api/products', (route) => route.fulfill({ status: 500 }));
await page.route('**/*.png', (route) => route.abort());
await page.route('**/api/products', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  await route.fulfill({ response, json: json.slice(0, 2) });
});
const responsePromise = page.waitForResponse('**/api/products');
await page.getByRole('button', { name: 'Load products' }).click();
const response = await responsePromise;
page.on('request', (req) => console.log(req.method(), req.url()));
```

## Config (playwright.config.ts) [11, 17]

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'chromium', use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' }, dependencies: ['setup'] },
  ],
  webServer: { command: 'npm run start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
});
```

## Debugging

```ts
await page.pause();                                    // opens the inspector here
await page.screenshot({ path: 'debug.png', fullPage: true });
console.log(await page.content());
test.info().attach('data', { body: JSON.stringify(data), contentType: 'application/json' });
```
