# Module 19 · Test Data, Mocking and Utils

> **Why this matters for Playwright:** real suites live or die by their test data and their helpers.
> Hard-coded data makes tests collide, missing helpers make code copy-pasted everywhere, and a slow or broken
> backend makes UI tests flaky. This module gives you the everyday toolbox: builders, unique data, env variables,
> utils, data-driven tests, readable reports and network mocking.

## 🎯 After this module you can

- Write test data builders with `Partial<T>` overrides
- Create unique data (`Date.now()`, `randomUUID()`, `test.info().workerIndex`) so tests never collide
- Read environment variables with fallbacks, and explain how teams use `.env` files
- Write small utils (`parsePrice`, `formatPrice`, `retry`)
- Generate tests from an array of data (data-driven tests)
- Make reports readable: `test.step`, tags (`@smoke`) + `--grep`, annotations, attachments, screenshots
- Mock (`route.fulfill`), break (`route.abort`) and modify (`route.fetch`) network responses, and wait for them (`waitForResponse`)

---

## 1. Test data builders (factories)

A **builder** returns a valid object with good defaults. Each test changes only what it cares about:

```ts
interface NewProduct {
  name: string;
  price: number;
  category: string;
  stock: number;
}

function buildProduct(overrides: Partial<NewProduct> = {}): NewProduct {
  return { name: 'Test Product', price: 9.99, category: 'other', stock: 10, ...overrides };
}

buildProduct();                       // the defaults
buildProduct({ stock: 0 });           // a sold-out product: the test SAYS what matters
buildProduct({ price: -1 });          // invalid price for a negative test
```

### 🧩 Anatomy

```
function buildProduct( overrides: Partial<NewProduct> = {} ): NewProduct {
                       └───┬───┘  └────────┬────────┘  └┬┘
                       param name   "NewProduct, but    default: nothing to override
                                     every field optional"
  return { ...defaults , ...overrides };
           └────┬────┘   └────┬─────┘
           first: defaults     LAST wins: the overrides replace defaults with the same key
```

`Partial<T>` (module 10) makes every property optional, so `{ stock: 0 }` is a valid argument.

### 🗣️ Say it

> "Return the defaults, **spread**, then the overrides, **spread**. The last one wins."

---

## 2. Unique data

Tests that create data with a fixed name break the second time they run (`409 username already exists`),
and they collide when two workers run at the same time. Make the data unique:

```ts
import { randomUUID } from 'node:crypto';

const username = `user-${Date.now()}`;                              // milliseconds since 1970
const email = `qa+${randomUUID()}@example.com`;                     // 'qa+3f9a1c2b-...@example.com'
const name = `product-${test.info().workerIndex}-${Date.now()}`;    // which worker (0, 1, 2...)

function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}
```

`Date.now()` alone can repeat (two calls in the same millisecond). A UUID part can't.
`test.info()` works anywhere inside a test, also in helpers called by the test (it's the same `testInfo` as in module 16).

---

## 3. Environment variables

```ts
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const RETRIES = Number(process.env.RETRIES ?? '2');           // env values are ALWAYS strings
const HEADED = process.env.HEADED === 'true';                 // 'true' string -> boolean
```

On the command line (Git Bash / macOS / Linux): `BASE_URL=https://staging.example.com npx playwright test`.
In PowerShell: `$env:BASE_URL='https://staging.example.com'; npx playwright test`. In CI: the pipeline's variables and secrets (module 20).

### `.env` files

Teams usually keep local values in a `.env` file at the project root, **never committed** (add `.env` to `.gitignore`;
commit a `.env.example` with fake values instead):

```
# .env
BASE_URL=http://localhost:3000
ADMIN_PASSWORD=admin123
```

A small library called **dotenv** (`npm install --save-dev dotenv`) loads it into `process.env`, usually at the top of `playwright.config.ts`:

```ts
import 'dotenv/config';     // reads .env -> process.env.ADMIN_PASSWORD
```

(This course doesn't install it: the fallbacks after `??` are enough here. Node 20+ can also do it without a library: `node --env-file=.env`.)

---

## 4. Small utils

Put helpers you need in many tests in `utils/` files and `export` them (module 10):

```ts
export function parsePrice(text: string): number {
  return Number(text.replace('$', ''));            // '$29.99' -> 29.99
}

export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;                   // 29.9 -> '$29.90'
}

export async function retry<T>(action: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
```

⚠️ Money is decimal, computers are binary: `29.99 + 9.99 + ...` can give `129.94000000000003`.
Compare sums with `expect(total).toBeCloseTo(129.94)`, not `toBe`.

⚠️ Don't use `retry` to hide flaky UI. For the page, use web-first assertions, `expect.poll` and `toPass` (module 14).
`retry` is for things outside Playwright's control, like a slow test-data service.

---

## 5. Data-driven tests

The test file is just TypeScript, so a `for...of` loop can **create tests** from an array:

```ts
const searchCases = [
  { term: 'shirt', expected: 2 },
  { term: 'bike', expected: 1 },
  { term: 'laptop', expected: 0 },
];

for (const { term, expected } of searchCases) {
  test(`search "${term}" finds ${expected}`, async ({ request }) => {
    const response = await request.get('/api/products', { params: { search: term } });
    expect(await response.json()).toHaveLength(expected);
  });
}
```

### 🧩 Anatomy

```
for ( const { term, expected } of searchCases ) {
            └───────┬────────┘    └────┬─────┘
       destructure each row          the data
  test( `search "${term}" ...` , async (...) => { ... } );
        └──────────┬─────────┘
   the title MUST be different for each row (use the data in it)
}
```

The loop runs **when the file loads**, so Playwright sees 3 separate tests, each with its own name in the report,
and you can re-run just one. Each title must be unique, or you get `Error: duplicate test title`.

---

## 6. Readable reports: `test.step`

Steps group actions under a name in the HTML report, the trace and the UI mode. A failing test then says *which step* failed.

```ts
test('checkout', async ({ page }) => {
  await test.step('add a backpack to the cart', async () => {
    await page.goto('/products');
    // ...
  });

  const orderNumber = await test.step('place the order', async () => {
    // ...
    return page.getByTestId('order-number').textContent();     // a step can RETURN a value
  });
});
```

### 🧩 Anatomy

```
const result = await test.step( 'name in the report' , async () => { ...; return value; } );
                                                        └──────────────┬─────────────────┘
                                                        the step's code (an async arrow function)
```

### 🗣️ Say it

> "Constant result equals await **test step** 'place the order', which runs this async function."

Tip: put `test.step` inside page object methods too. Then every report reads like a user story.

---

## 7. Tags, `--grep` and annotations

The **details object** goes between the title and the function:

```ts
test('login works', { tag: '@smoke' }, async ({ page }) => { /* ... */ });

test('checkout', { tag: ['@smoke', '@checkout'] }, async ({ page }) => { /* ... */ });

test(
  'discount code',
  { annotation: { type: 'issue', description: 'https://jira.example.com/browse/SHOP-42' } },
  async ({ page }) => { /* ... */ },
);

test.describe('cart', { tag: '@cart' }, () => { /* every test inside gets @cart */ });
```

Run only some tests:

```bash
npx playwright test --grep @smoke              # only tests tagged @smoke
npx playwright test --grep-invert @slow        # everything except @slow
npx playwright test --grep "@smoke|@cart"      # smoke OR cart (a regex)
```

Annotations show up in the HTML report. Some are built in: `test.skip()`, `test.fixme()`, `test.fail()`, `test.slow()`.
You can also add one while the test runs: `test.info().annotations.push({ type: 'note', description: '...' })`.

---

## 8. Attachments and screenshots

Attach anything to the report: JSON, logs, screenshots.

```ts
await test.info().attach('cart.json', {
  body: JSON.stringify(cart, null, 2),
  contentType: 'application/json',
});

const screenshot = await page.screenshot();                     // a Buffer (the PNG bytes)
await test.info().attach('checkout page', { body: screenshot, contentType: 'image/png' });

await page.screenshot({ path: 'screenshots/cart.png', fullPage: true });   // or save it to a file
await page.getByTestId('cart-total').screenshot();                         // just one element
```

The config option `screenshot: 'only-on-failure'` (this course has it) attaches one automatically when a test fails.

---

## 9. The network: mock, abort, modify

`page.route(url, handler)` catches the browser's requests that match the URL pattern **before** they leave the browser.

```ts
// MOCK: answer it yourself. The server never sees the request.
await page.route('**/api/products', (route) => route.fulfill({ json: [{ id: 1, name: 'Mock Mug', price: 3 }] }));

// ABORT: simulate a network failure. Great for testing error messages.
await page.route('**/api/products', (route) => route.abort());

// MODIFY: get the real response, change it, send it on.
await page.route('**/api/products', async (route) => {
  const response = await route.fetch();
  const products = await response.json();
  products.push({ id: 99, name: 'Secret Sale', price: 1 });
  await route.fulfill({ response, json: products });
});

// Other answers
await route.fulfill({ status: 500, json: { error: 'boom' } });   // a server error
await route.continue();                                           // let it go to the server unchanged
```

### 🧩 Anatomy

```
await page.route( '**/api/products' , (route) => route.fulfill( { json: data } ) );
                  └──────┬───────┘    └─────────────────┬─────────────────────┘
       URL pattern: ** = "anything before"     the handler: what to do with each request
```

**Register the route BEFORE the action that sends the request** (the click, the `goto`). Routes don't go back in time.

### 🗣️ Say it

> "Page dot **route** everything ending in api slash products: **fulfill** the route with this JSON."

### When to mock

| Mock | Don't mock |
|---|---|
| errors that are hard to cause (500, timeouts, offline) | the main happy path: test the real thing |
| third-party services (payments, maps, analytics) | your own API, in end-to-end tests |
| edge cases: empty lists, 1000 items, weird data | when you need to know the backend really works |

---

## 10. Waiting for a response

```ts
const responsePromise = page.waitForResponse('**/api/products');   // 1. start waiting (no await!)
await page.getByRole('button', { name: 'Load products' }).click(); // 2. do the action
const response = await responsePromise;                            // 3. now await it
expect(response.status()).toBe(200);
```

Why this order? If you click first and then start waiting, the response may already be finished: you wait forever.
`page.waitForRequest(...)` works the same way for requests. You can also pass a function:
`page.waitForResponse((r) => r.url().includes('/api/cart') && r.request().method() === 'POST')`.

---

## 🎭 In Playwright you'll see

```ts
import { test, expect } from '../fixtures';
import { buildProduct, uniqueName } from '../utils/data';

test.describe('admin products', { tag: '@admin' }, () => {
  test('shows an error when the API is down', { tag: '@smoke' }, async ({ page }) => {
    await page.route('**/api/products', (route) => route.fulfill({ status: 503, json: { error: 'down' } }));
    await page.goto('/playground');
    await test.step('try to load', async () => {
      await page.getByRole('button', { name: 'Load products' }).click();
    });
    await expect(page.getByTestId('load-status')).toHaveText('Failed to load products');
  });

  for (const stock of [0, 1, 100]) {
    test(`create a product with stock ${stock}`, async ({ api }) => {
      const product = await api.createProduct(buildProduct({ name: uniqueName('p'), stock }));
      expect(product.stock).toBe(stock);
    });
  }
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Error: duplicate test title "search", first declared in ...` | A loop creates tests with the SAME title | Put the data in the title: `` `search ${term}` `` |
| `409` `{"error":"username already exists"}` on the 2nd run | Hard-coded test data collides with old data | Make it unique: `uniqueName('user')` |
| `Expected: 129.94` `Received: 129.94000000000003` | Floating-point maths | `toBeCloseTo(129.94)` |
| `Expected: 2` `Received: NaN` | `Number('$2')`: the `$` wasn't removed, or the value is `undefined` | Clean the string first; check the env variable exists |
| The mock is ignored, real data appears | The route was registered AFTER the request, or the pattern doesn't match | `page.route` before the click/goto; check the URL with `**/` |
| `Test timeout of 30000ms exceeded.` while `waiting for event "response"` | You started `waitForResponse` after the response came | Create the promise BEFORE the action, `await` it after |
| `Argument of type '{ price: string; }' is not assignable to parameter of type 'Partial<NewProduct>'` | Wrong type in the overrides | Use the right type (`price: 1`) |
| `route.fulfill: Route is already handled!` | Your handler answered twice (e.g. `fulfill` and `continue`) | One answer per request |

---

## ✍️ Type it (warm-up, 5 minutes)

Type this into `my-katas/19-warmup.spec.ts` and run `npm run kata 19-warmup`:

```ts
import { test, expect } from '@playwright/test';

test('mock the playground', { tag: '@smoke' }, async ({ page }) => {
  await page.route('**/api/products', (route) => route.fulfill({ json: [] }));
  await page.goto('/playground');
  await test.step('load', async () => {
    await page.getByRole('button', { name: 'Load products' }).click();
  });
  await expect(page.getByTestId('load-status')).toHaveText('Loaded 0 products');
});
```

Then run only tagged tests: `npx playwright test --project=katas --grep @smoke`.
Change `route.fulfill({ json: [] })` to `route.abort()` and predict the status text before you run it.

## 🏋️ Exercises

```bash
npm run check 19
```

## 🥋 Kata

Close everything. From memory, in `my-katas/19-data.spec.ts`:

1. A builder `buildUser(overrides: Partial<NewUser> = {})` that returns `{ username: <unique>, password: 'secret123', ...overrides }`
2. A data-driven loop over `[{ password: 'abc', status: 400 }, { password: 'secret123', status: 201 }]` that creates a user with the API and checks the status (unique titles!)
3. A test tagged `@smoke` that mocks `**/api/products` with two products, clicks **Load products** on `/playground` and checks "Loaded 2 products"
4. The same page, but `route.abort()` and "Failed to load products"

Run it with `npm run kata 19-data`.

## 🧠 Remember

```ts
const build = (o: Partial<T> = {}): T => ({ ...defaults, ...o });          // last spread wins
const name = `user-${Date.now()}-${randomUUID().slice(0, 8)}`;
const URL = process.env.BASE_URL ?? 'http://localhost:3000';
for (const { term, expected } of cases) { test(`search ${term}`, async () => { ... }); }
test('x', { tag: '@smoke' }, async () => { ... });          // npx playwright test --grep @smoke
const v = await test.step('name', async () => { return 1; });
await page.route('**/api/x', (route) => route.fulfill({ json: data }));   // or route.abort()
const p = page.waitForResponse('**/api/x'); await click; const r = await p;
```

## ✅ Done when

- [ ] `npm run check 19` is all green with 0 type errors
- [ ] You can explain when to mock and when not to
- [ ] Kata done without looking
- [ ] `npm run drill`
