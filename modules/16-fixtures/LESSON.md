# Module 16 · Fixtures

> **Why this matters for Playwright:** you have used fixtures since module 11: `{ page }` is one.
> Fixtures are how Playwright gives each test what it needs (a page, a logged-in user, test data)
> and cleans up afterwards. Professional test suites are built on custom fixtures.

## 🎯 After this module you can

- Use the built-in fixtures: `page`, `context`, `browser`, `request`, `baseURL`, `browserName`, `testInfo`
- Write your own fixture with `test.extend<{ ... }>({ ... })`
- Read and write the fixture anatomy: setup → `await use(value)` → teardown
- Build fixtures that give page objects, fixtures that depend on other fixtures, and fixtures that create and delete test data with the API
- Use auto fixtures, option fixtures (`test.use`), worker-scoped fixtures and `mergeTests`
- Create a `fixtures.ts` that exports your own `test` and `expect`

---

## 1. What is a fixture?

A fixture is **something a test needs, prepared before the test and cleaned up after it**.
You ask for fixtures by name, in the `{ }` of the test function:

```ts
test('add to cart', async ({ page, request }) => {
  //                         └────┬──────┘
  //          "Playwright, please give me a page and a request"
});
```

Playwright sees the names, builds those fixtures (and only those), runs the test, then tears them down.
Every test gets **fresh** test fixtures: a new page, a new context. That's why tests don't leak into each other.

Compare with `beforeEach` (module 11):

| `beforeEach` / `afterEach` | Fixtures |
|---|---|
| runs for every test in the describe, needed or not | runs only when a test asks for it by name |
| setup and cleanup are in two different places | setup and cleanup are in ONE function |
| shares values through `let` variables outside the test | gives the value straight to the test: `{ loginPage }` |
| copy-pasted into every file | written once, imported everywhere |

---

## 2. The built-in fixtures

| Fixture | What it is | Example |
|---|---|---|
| `page` | one browser tab | `await page.goto('/login')` |
| `context` | the "incognito window" that holds the page: cookies, storage | `context.pages()`, `context.addCookies(...)` |
| `browser` | the browser process (shared, worker-scoped) | `await browser.newContext()` |
| `request` | an HTTP client for API calls (module 18) | `await request.get('/api/products')` |
| `baseURL` | the `use.baseURL` value from the config | `'http://localhost:3000'` |
| `browserName` | `'chromium'`, `'firefox'` or `'webkit'` | skip a test on one browser |
| `testInfo` | information about the running test (2nd parameter) | `testInfo.title`, `testInfo.retry` |
| `playwright` | the Playwright library itself (worker-scoped) | `playwright.request.newContext()` |

```ts
test('built-ins', async ({ page, context, browser, baseURL, browserName }, testInfo) => {
  console.log(baseURL, browserName, testInfo.title);
  console.log(context.pages().length);            // 1: the `page` fixture lives in this context
  const otherContext = await browser.newContext(); // a second, separate "incognito window"
  await otherContext.close();                      // contexts YOU create, YOU close
});
```

The layers, from big to small: **browser** → **context** → **page**. One browser has many contexts.
One context has many pages (tabs) that share cookies. A new context = new cookies = logged out.

### 🗣️ Say it

`async ({ page }, testInfo) => { ... }`
> "an async function that takes the **page** fixture, and **testInfo** as the second parameter"

---

## 3. Your first fixture: `test.extend`

```ts
import { test as base, expect } from '@playwright/test';

const test = base.extend<{ shopName: string }>({
  shopName: async ({}, use) => {
    await use('QA Shop');
  },
});

test('uses my fixture', async ({ shopName }) => {
  expect(shopName).toBe('QA Shop');
});
```

### 🧩 Anatomy

```
const test = base.extend< { shopName: string } >( {  shopName: async ({}, use) => { ... }  } );
  │            │    │          └──────┬───────┘       └───┬──┘         │    │
  │            │    │       the TYPE: fixture name     the name   other   the function that
  │            │    │       and what it gives          again      fixtures hands the value
  │            │    └ "add fixtures to it"                        it needs  to the test
  │            └ the original Playwright test (renamed to base)
  └ the NEW test function: has all old fixtures + yours
```

- `base` is just the usual `test`, renamed with `import { test as base }` so the new one can be called `test`.
- The `<{ ... }>` part is a **type** (module 05): name → what the fixture gives.
- `({}, use)`: the first parameter lists the fixtures this fixture needs. `{}` means "none".
  Playwright needs it written as `{ }` (object destructuring), even when it's empty.
- `use` is the function that hands the value to the test.

### 🗣️ Say it

> "constant **test** equals **base dot extend**, with the type: **shopName is a string**. The shopName fixture is an async function that **uses** 'QA Shop'."

---

## 4. The anatomy: setup → `await use(value)` → teardown

This is THE shape. Learn it like `expect(actual).toBe(expected)`:

```ts
myFixture: async ({ page }, use) => {
  // 1. SETUP: runs before the test
  const thing = await createSomething(page);

  await use(thing);   // 2. THE TEST RUNS HERE (use() waits until the test is finished)

  // 3. TEARDOWN: runs after the test, even when the test failed
  await thing.cleanUp();
},
```

### 🧩 Anatomy

```
async ( { page } , use ) => {
          └─┬──┘   └┬┘
            │       └ call it with the value: await use(value)
            └ fixtures this fixture needs

  setup...               before the test
  await use(value);      the test body runs during this line
  teardown...            after the test
}
```

### 🗣️ Say it

> "Set up, **await use** the value, tear down."

⚠️ **Always `await use(...)`.** Without `await`, `use()` starts the test but your code doesn't wait:
the teardown runs **immediately**, before the test. Your test then uses a deleted product or a closed session.
TypeScript does not warn you, so you have to remember the `await` yourself.

### Order

- Fixtures are set up in **dependency order**: if `server` needs `database`, then `database` is set up first.
- Teardown is in **reverse order**: `server` teardown, then `database` teardown.
- A fixture nobody asks for is **never** set up (they are lazy), except auto fixtures (section 7).

---

## 5. Fixtures that give page objects

The most common custom fixture in real projects: hand the test a ready page object (module 15).

```ts
import { test as base, expect } from '@playwright/test';
import { LoginPage, ProductsPage } from './pages';

type ShopFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<ShopFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // A fixture can ask for OTHER fixtures, including your own:
  productsPage: async ({ loginPage, page }, use) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');
    await expect(page).toHaveURL(/\/products/);
    await use(new ProductsPage(page));
  },
});

test('the test has no login code at all', async ({ productsPage }) => {
  await expect(productsPage.productCards).toHaveCount(6);
});
```

The test now reads like a sentence. No `new`, no login, no `beforeEach`.

---

## 6. Setup and teardown with the API: test data

Create data before the test and delete it after. The data exists **only** during the test.

```ts
const test = base.extend<{ tempProduct: Product }>({
  tempProduct: async ({ request }, use) => {
    // setup: create it (as admin)
    const login = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
    const headers = { Authorization: `Bearer ${(await login.json()).token}` };
    const response = await request.post('/api/products', { headers, data: { name: 'Temp Product', price: 5 } });
    const product: Product = await response.json();

    await use(product);

    // teardown: delete it (runs even if the test failed)
    await request.delete(`/api/products/${product.id}`, { headers });
  },
});
```

---

## 7. Auto fixtures: run for every test

Add `{ auto: true }`. The fixture runs for every test made with this `test`, even if the test doesn't name it.
To pass options, the fixture becomes an **array**: `[function, options]`.

```ts
const test = base.extend<{ resetShop: void }>({
  resetShop: [
    async ({ request }, use, testInfo) => {
      await request.post('/api/reset');
      console.log(`reset before: ${testInfo.title}`);
      await use(); // nothing to hand over: use() with no value
    },
    { auto: true },
  ],
});
```

### 🧩 Anatomy

```
resetShop: [  async ({ request }, use, testInfo) => { ... } ,  { auto: true }  ]
           │  └──────────────┬────────────────────────────┘    └─────┬─────┘  │
           │      the fixture function (3rd param: testInfo)      options    │
           └──────────────────────── an array of 2 things ───────────────────┘
```

Typical auto fixtures: reset data, collect console errors, attach logs on failure.
The type is `void` because the fixture gives the test nothing.

---

## 8. Option fixtures and `test.use`

An option is a fixture with a **default value** that you can change per file or per describe:

```ts
const test = base.extend<{ shopUser: string }>({
  shopUser: ['standard_user', { option: true }],   // default value + "this is an option"
});

test.describe('as admin', () => {
  test.use({ shopUser: 'admin' });                 // only inside this describe

  test('admin things', async ({ shopUser }) => {
    expect(shopUser).toBe('admin');
  });
});
```

You already know options: `baseURL`, `storageState`, `viewport` are built-in options.
That's why you can write `test.use({ viewport: { width: 375, height: 667 } })`.
You can also set options in `playwright.config.ts` under `use: { shopUser: 'admin' }` (or per project).

### 🗣️ Say it

`shopUser: ['standard_user', { option: true }]`
> "shopUser is an **option** with the **default** standard_user"

`test.use({ shopUser: 'admin' });`
> "in this describe, **use** shopUser admin"

---

## 9. Worker-scoped fixtures: once per worker

Test fixtures are created for **every test**. A worker fixture is created **once per worker process**
and shared by all its tests. Use it for expensive things that are safe to share: a login token, a database connection.

```ts
const test = base.extend<{}, { adminToken: string }>({
  //                       └┬┘  └──────────┬──────────┘
  //              test fixtures    worker fixtures (2nd type parameter)
  adminToken: [
    async ({ playwright }, use) => {
      const api = await playwright.request.newContext({ baseURL: 'http://localhost:3000' });
      const response = await api.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
      await use((await response.json()).token);
      await api.dispose();
    },
    { scope: 'worker' },
  ],
});
```

Rules:
- A worker fixture can only use other **worker** fixtures (`playwright`, `browser`, `browserName`), not `page`, `request` or `baseURL`.
- When a test fails, Playwright throws the worker away and starts a new one, so the worker fixture runs again there.
- Tests with different worker fixtures run in different workers, so Playwright may run them **after** the other tests of the file.

---

## 10. `mergeTests`: combine fixtures from different files

Big projects keep fixtures in several files (pages, API, data). `mergeTests` joins them:

```ts
import { mergeTests } from '@playwright/test';
import { test as pagesTest } from './fixtures/pages';
import { test as apiTest } from './fixtures/api';

export const test = mergeTests(pagesTest, apiTest);   // has the fixtures of both
```

(`mergeExpects` does the same for custom `expect` matchers.)

---

## 11. The professional pattern: `fixtures.ts`

One file extends `test`, and **every** spec file imports from it instead of `@playwright/test`:

```ts
// fixtures.ts
import { test as base, expect } from '@playwright/test';
import { CartPage, LoginPage, ProductsPage } from './pages';

type ShopFixtures = { loginPage: LoginPage; productsPage: ProductsPage; cartPage: CartPage };

export const test = base.extend<ShopFixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  productsPage: async ({ page }, use) => { await use(new ProductsPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
});

export { expect };
```

```ts
// cart.spec.ts
import { test, expect } from './fixtures';    // <- the only change in the spec files

test('empty cart', async ({ cartPage }) => { ... });
```

### 🗣️ Say it

> "Export constant **test** equals base dot extend with my **ShopFixtures**. Export **expect** too."

---

## 🎭 In Playwright you'll see

```ts
// fixtures/index.ts in a real project
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ApiClient } from '../api/ApiClient';

type Fixtures = { loginPage: LoginPage; api: ApiClient; failOnConsoleErrors: void };

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
  failOnConsoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
      await use();
      expect(errors, 'console errors on the page').toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Test has unknown parameter "loginPage".` | The test asks for a fixture that this `test` doesn't have. Often: you imported `test` from `'@playwright/test'` instead of from `./fixtures`. The whole FILE fails to load. | Import `test` from your fixtures file |
| `Fixture "productsPage" has unknown parameter "loginpage".` | A fixture asks for another fixture that doesn't exist (here: a typo) | Fix the name in the `{ }` |
| `First argument must use the object destructuring pattern: shopName` | You wrote `async (shopName, use) =>` | Write `async ({}, use) =>` or `async ({ page }, use) =>` |
| `use() was not called in fixture "loginPage"` | Your fixture finished without calling `use` | Add `await use(value);` |
| Teardown happens before the test / data is already deleted | `use(value)` without `await` | `await use(value);` |
| `worker fixture "adminToken" cannot depend on a test fixture "request"` | Worker fixtures live longer than tests | Use `playwright.request.newContext()` |
| `Cannot use({ adminToken }) in a describe group, because it forces a new worker.` | You called `test.use` for a worker option inside a describe | Put that `test.use` at the top level of the file, or in the config |
| `Type '"QA Shop"' is not assignable to type 'number'` (on `use(...)`) | The value doesn't match the type in `extend<{ ... }>` | Fix the type or the value |
| `Property 'loginPage' does not exist on type ...` | TypeScript doesn't know the fixture: it's missing from the type | Add it to the `<{ ... }>` type |

---

## ✍️ Type it (warm-up, 5 minutes)

This one is a test, so type it into `my-katas/16-warmup.spec.ts` and run `npm run kata 16-warmup`:

```ts
import { test as base, expect } from '@playwright/test';

const test = base.extend<{ greeting: string }>({
  greeting: async ({}, use) => {
    console.log('setup');
    await use('Hello, QA!');
    console.log('teardown');
  },
});

test('my first fixture', async ({ greeting }) => {
  console.log('test');
  expect(greeting).toBe('Hello, QA!');
});
```

Look at the order of `setup`, `test`, `teardown` in the terminal. Then remove the `await` before `use` and run it again.

## 🏋️ Exercises

```bash
npm run check 16
```

Exercises 16.16 and 16.17 are in `modules/16-fixtures/fixtures.ts`. Open it next to `exercises.spec.ts`.

## 🥋 Kata

Close everything. In `my-katas/16-fixtures.spec.ts`, from memory:

1. `import { test as base, expect } from '@playwright/test';`
2. Create `test` with `base.extend` and two fixtures:
   - `adminCredentials`: gives `{ username: 'admin', password: 'admin123' }`
   - `loggedInPage` (type `Page`): needs `page` and `adminCredentials`, logs in through `/login`, then `await use(page)`
3. A test that asks for `loggedInPage` and checks that `/admin` shows the heading "Admin Dashboard".

Run it with `npm run kata 16`.

## 🧠 Remember

```ts
const test = base.extend<{ name: Type }>({
  name: async ({ page }, use) => {
    /* setup */  await use(value);  /* teardown */
  },
  auto: [async ({}, use) => { await use(); }, { auto: true }],
  opt: ['default', { option: true }],            // change it: test.use({ opt: 'x' })
});
export { expect };                               // spec files: import { test, expect } from './fixtures'
```

## ✅ Done when

- [ ] `npm run check 16` is all green with 0 type errors
- [ ] You can write the fixture anatomy (setup, `await use`, teardown) without looking
- [ ] Kata done without looking
- [ ] `npm run drill`
