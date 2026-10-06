# Module 20 · Final Project: Your Own Framework

> **Why this matters for Playwright:** in a job you don't fill in blanks: you open an empty folder and build a test
> framework that a whole team can use for years. This project puts everything from modules 11-19 together in the
> same shape as a real company framework. When it's green, you have built one yourself, from scratch.

## 🎯 After this module you can

- Set up a Playwright project from an empty folder: config, `webServer`, projects, reporter
- Organise code in layers: `pages/` (POM), `api/` (API client), `utils/` (data, types), `fixtures/`, `tests/`
- Log in once with a setup project and reuse `storageState` for user and admin
- Write UI, API and hybrid tests that use your own fixtures, tags and test data
- Run the suite locally and in CI, and read the HTML report

---

## 1. The brief

Build a test framework for **QA Shop** in a new folder **`final-project/`** at the root of this repository
(next to `modules/`, not inside it). Nothing is there yet: you create every file.

- The acceptance tests in `modules/20-final-project/exercises.spec.ts` check your work. `npm run check 20` runs them.
  They import your classes and use them against QA Shop, then run your own suite.
- Your own suite runs with: `npx playwright test -c final-project`
- `npm run progress` shows a "Final project" line once `final-project/playwright.config.ts` exists.

Work **one milestone at a time**. Each one ends with green acceptance tests. Use the lessons as your manual:
the module number is next to each step.

---

## 2. The target architecture

```
final-project/
├── playwright.config.ts        M1  webServer, baseURL, projects (setup, ui, hybrid, api), html reporter
├── pages/                      M2  page objects (module 15)
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── ProductsPage.ts
│   └── CartPage.ts
├── utils/                      M3  (module 19)
│   ├── types.ts                    Product, NewProduct, CartItem, Cart
│   └── data.ts                     uniqueName(), buildProduct()
├── api/                        M3  (module 18)
│   └── ApiClient.ts
├── fixtures/                   M4  (module 16)
│   └── index.ts                    export test (with loginPage, productsPage, cartPage, api) and expect
├── tests/
│   ├── auth.setup.ts           M5  (module 17) writes .auth/user.json and .auth/admin.json
│   ├── ui/                     M6  browser tests (logged in as standard_user via storageState)
│   ├── api/                    M6  API tests (no browser)
│   └── hybrid/                 M6  API + UI together
└── .auth/                          generated, gitignored
```

How the layers talk to each other:

```
tests/*.spec.ts  ──imports──►  fixtures/index.ts  ──builds──►  pages/*  and  api/ApiClient
                                                                  │               │
                                                              page (browser)   request (HTTP)
                                                                  └──── QA Shop ──┘
```

Tests never use raw selectors or raw URLs: they talk to page objects and the API client.
When the app changes, you fix ONE class, not 50 tests.

---

## 3. The contract

The acceptance tests rely on these **exact** names. Extra methods and files are welcome.

| File | Must export | Must have |
|---|---|---|
| `playwright.config.ts` | `export default defineConfig({...})` | `testDir: './tests'`; `use.baseURL` = `http://localhost:${PORT}` with `const PORT = Number(process.env.PORT ?? 3000)`; `webServer` with `command: 'node ../practice-app/server.mjs'`, `url` ending in `/api/health`, `reuseExistingServer: true`; `reporter` including `'html'`; a project named `'setup'`; a project with `dependencies: ['setup']` and `use.storageState` = the absolute path of `.auth/user.json` |
| `pages/BasePage.ts` | `abstract class BasePage` | `constructor(readonly page: Page)`, `abstract readonly path: string`, `goto(): Promise<void>` (goes to `this.path`) |
| `pages/LoginPage.ts` | `class LoginPage extends BasePage` | `path = '/login'`, `errorMessage: Locator`, `login(username: string, password: string): Promise<void>` |
| `pages/ProductsPage.ts` | `class ProductsPage extends BasePage` | `path = '/products'`, `productCards: Locator`, `cartCount: Locator`, `productCard(name: string): Locator`, `addToCart(name: string): Promise<void>` (returns when the button says "Remove") |
| `pages/CartPage.ts` | `class CartPage extends BasePage` | `path = '/cart'`, `rows: Locator`, `total: Locator`, `emptyMessage: Locator`, `removeItem(name: string): Promise<void>` |
| `utils/types.ts` | `interface Product`, `NewProduct`, `CartItem`, `Cart` | as in `practice-app/README.md`; `NewProduct` = `name` + `price` required, `category`, `stock`, `description` optional |
| `utils/data.ts` | `function uniqueName`, `function buildProduct` | `uniqueName(prefix: string): string` (starts with prefix, different every call); `buildProduct(overrides: Partial<NewProduct> = {}): NewProduct` (unique name, price > 0, overrides win) |
| `api/ApiClient.ts` | `class ApiClient` | `constructor(request: APIRequestContext)`; `login(username, password): Promise<string>` (returns AND remembers the token); `getProducts(params?: { category?: string; search?: string }): Promise<Product[]>`; `getProduct(id: number): Promise<Product>`; `createProduct(data: NewProduct): Promise<Product>`; `deleteProduct(id: number): Promise<void>`; `getCart(): Promise<Cart>`; `addToCart(productId: number, quantity?: number): Promise<Cart>`; `reset(): Promise<void>`. **Every method throws when the response is not 2xx.** |
| `fixtures/index.ts` | `test`, `expect` | `test = base.extend<...>` with the fixtures `loginPage`, `productsPage`, `cartPage`, `api` |
| `tests/auth.setup.ts` | | saves `.auth/user.json` (standard_user) and `.auth/admin.json` (admin) with `storageState({ path })` |
| `tests/ui`, `tests/api`, `tests/hybrid` | | at least 3, 3 and 2 tests; at least 3 tests tagged `@smoke`; spec files import from `'../../fixtures'` |

> `.auth/` is already in the root `.gitignore`, and so are `test-results/` and `playwright-report/`.

---

## 4. Milestones

### Milestone 1 · The config (module 11, 17) → tests 20.1-20.2

- [ ] Create `final-project/playwright.config.ts`
- [ ] `PORT` from the environment, `baseURL`, `webServer` that starts `../practice-app/server.mjs`
- [ ] `reporter: [['list'], ['html', { open: 'never' }]]`, `workers: 1` (QA Shop has ONE shared database)
- [ ] For now, one project is enough; you add the setup project in Milestone 5

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: './tests',
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [/* M5 */],
  webServer: {
    command: 'node ../practice-app/server.mjs',   // relative to final-project/
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    env: { PORT: String(PORT) },
  },
});
```

### Milestone 2 · Page objects (module 15) → tests 20.3-20.6

- [ ] `BasePage`: abstract class, `page`, abstract `path`, `goto()`
- [ ] `LoginPage`, `ProductsPage`, `CartPage` extend it and follow the contract
- [ ] Locators are `readonly` properties, built in the constructor with user-facing locators

```ts
export abstract class BasePage {
  abstract readonly path: string;
  constructor(readonly page: Page) {}
  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}

export class LoginPage extends BasePage {
  readonly path = '/login';
  readonly errorMessage: Locator;
  // ...usernameInput, passwordInput, loginButton
  constructor(page: Page) {
    super(page);                                   // FIRST line of a child constructor
    this.errorMessage = page.getByRole('alert');
  }
  async login(username: string, password: string): Promise<void> { /* fill, fill, click */ }
}
```

Tip for `productCard(name)`: `this.productCards.filter({ has: this.page.getByRole('heading', { name, exact: true }) })`.
Tip for `addToCart`: after the click, wait for the "Remove" button in that card (`await expect(...).toBeVisible()`),
otherwise a test that leaves the page right away can lose the click.

### Milestone 3 · Test data and the API client (modules 18, 19) → tests 20.7-20.11

- [ ] `utils/types.ts` with the interfaces
- [ ] `utils/data.ts` with `uniqueName` and `buildProduct`
- [ ] `api/ApiClient.ts`: one method per endpoint, the token in a private field, throw on non-2xx

```ts
export class ApiClient {
  private token: string | undefined;

  constructor(private readonly request: APIRequestContext) {}

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  async getProduct(id: number): Promise<Product> {
    const response = await this.request.get(`/api/products/${id}`);
    if (!response.ok()) throw new Error(`get product ${id} failed: ${response.status()}`);
    return response.json();
  }
  // login, getProducts, createProduct, deleteProduct, getCart, addToCart, reset ...
}
```

Why throw? So `await api.createProduct(...)` can never fail silently. A test that expects a failure says so:
`await expect(api.createProduct(data)).rejects.toThrow(/403/);`

### Milestone 4 · Fixtures (module 16) → test 20.12

- [ ] `fixtures/index.ts` extends `test` with `loginPage`, `productsPage`, `cartPage`, `api`
- [ ] It exports `test` and `expect`; from now on, spec files import ONLY from here

```ts
type ShopFixtures = { loginPage: LoginPage; productsPage: ProductsPage; cartPage: CartPage; api: ApiClient };

export const test = base.extend<ShopFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  // ...
});
export { expect };
```

### Milestone 5 · Authentication (module 17) → test 20.13

- [ ] `tests/auth.setup.ts`: standard_user through the UI (with your `LoginPage`), admin through the API (with your `ApiClient` + `context.addCookies`)
- [ ] State paths: absolute, e.g. in a `utils/env.ts`: `export const USER_STATE = path.join(import.meta.dirname, '..', '.auth', 'user.json');`
- [ ] Credentials from `process.env` with fallbacks
- [ ] Projects in the config:

```ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  { name: 'ui', testDir: './tests/ui', use: { ...devices['Desktop Chrome'], storageState: USER_STATE }, dependencies: ['setup'] },
  { name: 'hybrid', testDir: './tests/hybrid', use: { ...devices['Desktop Chrome'], storageState: USER_STATE }, dependencies: ['setup'] },
  { name: 'api', testDir: './tests/api' },
],
```

### Milestone 6 · The tests (modules 11-19) → test 20.14

Write real tests. Ideas (pick at least 8):

| Folder | Test ideas |
|---|---|
| `tests/ui/` | standard_user logs in (logged-out describe!); locked user sees the error; wrong password; products page shows 6 products; search "shirt" shows 2; sold-out product has a disabled button; adding updates the cart counter; admin dashboard (switch to the admin state) |
| `tests/api/` | list products; filter by category; admin creates + deletes a product (`buildProduct`); normal user gets 403; unknown product gets 404; out-of-stock gives 409 |
| `tests/hybrid/` | seed the cart with the API → check the cart page; add in the UI → check `api.getCart()`; remove in the UI → API cart is empty |

- [ ] Every spec file starts with `import { test, expect } from '../../fixtures';`
- [ ] Tests that change data reset first: `test.beforeEach(async ({ api }) => { await api.reset(); });`
- [ ] At least 3 tests tagged `{ tag: '@smoke' }`. Try `npx playwright test -c final-project --grep @smoke`
- [ ] Use `test.step` in at least one long test

### Milestone 7 · Green, and looked at → test 20.15

- [ ] `npx playwright test -c final-project`: everything passes
- [ ] `npx playwright show-report`: open the HTML report, open one test, look at its steps
- [ ] Break one test on purpose, run again, open the trace of the failure (module 11)
- [ ] `npm run check 20`: all 15 green, 0 type errors

---

## 5. How to work

```bash
npm run check 20                                   # the acceptance tests (stops at the first red one)
npx playwright test -c final-project               # your suite
npx playwright test -c final-project --ui          # your suite in UI mode
npx playwright test -c final-project --grep @smoke # only smoke tests
npx playwright test -c final-project tests/api     # only one folder
npx playwright show-report                         # the HTML report of the last run
```

When an acceptance test is red, read its message first: it tells you which file, export or method is missing.
Stuck for more than 20 minutes? `HINTS.md`, then the reference framework in `solutions/20-final-project/framework/`
(read one file, close it, write yours from memory).

---

## 🎭 In Playwright you'll see

Your folder is the shape you'll meet in companies. A typical day in that codebase:

```ts
import { test, expect } from '../../fixtures';
import { buildProduct } from '../../utils/data';
import { ADMIN } from '../../utils/env';

test('a new product shows in the shop', { tag: '@smoke' }, async ({ api, productsPage }) => {
  await api.login(ADMIN.username, ADMIN.password);
  const product = await api.createProduct(buildProduct({ name: 'Team Mug' }));

  await productsPage.goto();
  await expect(productsPage.productCard(product.name)).toBeVisible();
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `📁 Missing final-project/pages/LoginPage.ts` | The acceptance test can't find the file | Create it at exactly that path (check the folder name and the capital letters) |
| `final-project/pages/LoginPage.ts must export LoginPage` | The file exists but has no export with that name | `export class LoginPage ...` |
| `LoginPage must extend BasePage` | `class LoginPage` without `extends BasePage` | `export class LoginPage extends BasePage` and `super(page)` |
| `Error: Cannot find module '.../pages/BasePage'` | A wrong relative import inside your files | From `pages/` it's `'./BasePage'`; from `tests/ui/` it's `'../../fixtures'` |
| `Error: Process from config.webServer was not able to start. Exit code: 1` (or `...exited early.`) | The `command` path is wrong (it's relative to `final-project/`) | `node ../practice-app/server.mjs` |
| `Error reading storage state from ...user.json: ENOENT` | The setup didn't run or wrote somewhere else | Same absolute path in setup and config; don't use `--no-deps` |
| `X did not run` | The setup project failed | Fix `tests/auth.setup.ts` first |
| Hybrid test sees an empty cart | The API client and the browser are different users | `api.login(...)` as standard_user, the same user as `user.json` |
| `Test has unknown parameter "api"` | The spec imports `test` from `@playwright/test` | `import { test, expect } from '../../fixtures';` |

---

## ✍️ Type it (warm-up, 5 minutes)

Create the empty structure from the terminal (Git Bash), from the project root:

```bash
mkdir -p final-project/pages final-project/api final-project/utils final-project/fixtures final-project/tests/ui final-project/tests/api final-project/tests/hybrid
```

Then type Milestone 1's config into `final-project/playwright.config.ts` and run `npm run check 20`. Test 20.1 should turn green.

## 🏋️ Exercises

```bash
npm run check 20
```

## 🥋 Kata

When everything is green, rebuild the skeleton **from memory**, in `scratch/framework-kata/` (a throwaway copy: it only has to type-check, `npm run typecheck`):

1. `playwright.config.ts` with `webServer`, `baseURL`, and the setup project + `dependencies` + `storageState`
2. `BasePage` and `LoginPage`
3. `fixtures/index.ts` with `loginPage` and `api`
4. `tests/auth.setup.ts` for standard_user

Compare with your `final-project/`. Repeat in a week: the goal is to write a new framework skeleton in 20 minutes without looking.

---

## 🚀 After the course

### Practise on public demo sites

Write a small framework (same layers!) for each of these. They are made for practising test automation:

| Site | Good for |
|---|---|
| `https://www.saucedemo.com` | login with different users, inventory, cart, checkout: very close to QA Shop |
| `https://the-internet.herokuapp.com` | one page per tricky element: iframes, dialogs, uploads, dynamic loading, basic auth, hovers |
| `https://restful-booker.herokuapp.com` | a REST API with token auth: CRUD on bookings, perfect for `tests/api/` |
| `https://demo.playwright.dev/todomvc` | Playwright's own demo app: a quick place to try locators and assertions |

Be kind to public sites: run with 1 worker and don't hammer them in loops.

### Run it in CI (GitHub Actions)

Put this in `.github/workflows/playwright.yml` in your repository:

```yaml
name: Playwright tests
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test -c final-project
        env:
          CI: true
          SHOP_ADMIN_PASSWORD: ${{ secrets.SHOP_ADMIN_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

- `npm ci` installs exactly what's in `package-lock.json`.
- `npx playwright install --with-deps chromium` downloads the browser and the Linux libraries it needs.
- Secrets (passwords, tokens) go in the repository settings → Secrets, and reach your code as `process.env.X`.
- `if: ${{ !cancelled() }}` uploads the report even when tests failed (that's when you need it most).
- The HTML report is written to `playwright-report/` next to the nearest `package.json` (the project root here).
- `CI: true` lets your config change behaviour: `retries: process.env.CI ? 2 : 0`, `forbidOnly: !!process.env.CI`.

### Keep the syntax alive

- `npm run drill` a few minutes every day: the cards come back right before you'd forget them.
- Redo one kata per week from an earlier module, from a blank file.
- Read the Playwright release notes when a new version comes out, and try one new feature in your framework.
- Stretch goals for your framework: run in Firefox and WebKit (more projects), make tests parallel-safe
  (each test creates its own user with `POST /api/users` and `uniqueName`), add a custom matcher with `expect.extend`,
  add a `failOnConsoleErrors` auto fixture (module 16), mock an error state with `page.route` (module 19).

---

## 🧠 Remember

```
config      →  webServer + baseURL + projects: setup → (ui, hybrid with storageState) + api
pages/      →  class XPage extends BasePage { readonly path; readonly locators; async actions() }
api/        →  class ApiClient { constructor(request); one method per endpoint; throw if !ok() }
utils/      →  types (interfaces) + data (uniqueName, buildProduct with Partial<T>)
fixtures/   →  export const test = base.extend<{...}>({...}); export { expect };
tests/      →  import { test, expect } from '../../fixtures';  tags, steps, reset in beforeEach
```

## ✅ Done when

- [ ] `npm run check 20` is all green (15/15) with 0 type errors
- [ ] `npx playwright test -c final-project` is green and you opened the HTML report and a trace
- [ ] Your framework runs in GitHub Actions (optional, but do it: it's what teams expect)
- [ ] Kata done without looking
- [ ] `npm run drill`
