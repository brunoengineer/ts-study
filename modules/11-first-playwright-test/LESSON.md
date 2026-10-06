# Module 11 · Your First Playwright Test

> **Why this matters for Playwright:** until now every test was "unit style": values in, `expect` out.
> From this module on, every test opens a **real browser**, visits a page, clicks, types and checks what the user sees.
> Everything you learned (destructuring in module 05, `async`/`await` in module 08) comes together in one line: `async ({ page }) => {`.

## 🎯 After this module you can

- Read and write the shape `test('...', async ({ page }) => { ... })` and say what every piece means
- Open pages with `page.goto('/login')` and know where the rest of the URL comes from (`baseURL`)
- Check the page with `await expect(page).toHaveTitle(...)` and `toHaveURL(...)` (string and regex)
- Find an element with `getByRole` / `getByLabel`, then `click()` and `fill()` it
- Organise tests with `test.describe` and the 4 hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`)
- Use `test.only`, `test.skip`, `test.fixme` while you work
- Watch, record and debug tests: headed mode, UI mode, **codegen**, trace viewer, `page.pause()`
- Find your way around `playwright.config.ts`

---

## 1. The new shape: `async ({ page }) =>`

A unit test from earlier modules:

```ts
test('2 + 2 is 4', () => {
  expect(2 + 2).toBe(4);
});
```

A browser test:

```ts
import { test, expect } from '@playwright/test';

test('the login page has the right title', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle('Login | QA Shop');
});
```

Only two things changed: the word `async`, and `{ page }` between the brackets.

### 🧩 Anatomy

```
test( 'the login page has the right title' , async ( { page } ) => {  ...  } );
 │                  │                          │     └───┬──┘
 │             the test name                   │    destructuring (module 05):
 │                                             │    "from the fixtures object, take page"
 │                                             └ async (module 08): the body uses await
 └ "here is a test"

await page.goto('/login');
  │    │    │       └ the URL (relative: baseURL adds http://localhost:3000)
  │    │    └ the method: "navigate to"
  │    └ the page object: one browser tab, brand new for THIS test
  └ wait until the page has loaded before the next line
```

### 🗣️ Say it

> "**Test** called 'the login page has the right title', an **async** function that takes **page**:
> **await** page **go to** slash login. **Await expect** page **to have title** 'Login | QA Shop'."

### Why `async` and `await`?

Everything that talks to the browser takes time: loading a page, clicking, reading text.
So every browser method returns a **Promise** (module 08), and you `await` it.
Rule of thumb: **if the line touches the browser, it starts with `await`.**

### Why `{ page }`?

Playwright calls your function with ONE object full of ready-made tools called **fixtures**.
You pick the ones you need with destructuring:

```ts
test('...', async ({ page }) => {});              // just a browser tab
test('...', async ({ page, baseURL }) => {});     // a tab + the configured baseURL
test('...', async ({ request }) => {});           // an API client, no browser (later module)
```

| Fixture | What it is | You'll use it for |
|---|---|---|
| `page` | One fresh browser tab, new for every test | 95% of UI tests |
| `context` | The "browser profile" the page lives in (cookies, storage) | new tabs, cookies |
| `browser` | The whole browser | rare: creating extra contexts |
| `request` | An HTTP client that uses `baseURL` | API tests, resetting data |
| `baseURL` | The string from the config | building full URLs |

Every test gets a **brand new** page and context. No cookies, no login, no history from other tests.
That's why tests can't depend on each other, and that's a good thing.

---

## 2. `page.goto` and `baseURL`

```ts
await page.goto('/login');       // ✅ relative: baseURL + '/login'
await page.goto('/products/1');  // ✅ the product with id 1
await page.goto('http://localhost:3000/login');  // works, but don't: the port is now hard-coded
```

`baseURL` lives in `playwright.config.ts`:

```ts
use: {
  baseURL: `http://localhost:${PORT}`,   // PORT is 3000 unless you change it
},
```

Change it in ONE place and every test follows (local, staging, production...).

`goto` waits for the page to **load**, and follows redirects. If you `goto('/cart')` while logged out,
QA Shop redirects you, and when `goto` finishes you are already on `/login?next=%2Fcart`.

---

## 3. Your first assertions on the page: `toHaveTitle` and `toHaveURL`

The **title** is the text in the browser tab (the `<title>` tag), not the big heading on the page.
In QA Shop every title looks like `'<Page> | QA Shop'`: `'Home | QA Shop'`, `'Login | QA Shop'`, `'Products | QA Shop'`.

```ts
await expect(page).toHaveTitle('Login | QA Shop');   // exact title
await expect(page).toHaveTitle(/Login/);             // regex: the title CONTAINS "Login"

await expect(page).toHaveURL(/\/products/);          // regex: the URL contains /products
await expect(page).toHaveURL('http://localhost:3000/products');  // exact string: brittle, avoid
```

### 🧩 Anatomy

```
await  expect( page ).toHaveURL( /products/ );
  │       │      │        │          └ expected: a string (exact) or a regex (contains / pattern)
  │       │      │        └ the matcher: checks the current URL
  │       │      └ actual: the whole page (not a value!)
  │       └ expect, the same function you know
  └ AWAIT: this assertion waits and retries (up to 5 seconds)
```

### 🗣️ Say it

> "**Await expect** page **to have URL** matching products."

### String or regex?

| Use | When | Example |
|---|---|---|
| string | You know the WHOLE value and it never changes | `toHaveTitle('Login \| QA Shop')` |
| regex `/.../` | You only care about a part, or the value has variable bits (port, ids, query) | `toHaveURL(/login/)`, `toHaveURL(/products\/\d+/)` |

For URLs, almost always use a regex: the full URL contains the port (`3000`) and query strings (`?next=...`).
Regex recap in module 02: `/login/` = "contains login"; `\/` = a real slash; `\d+` = one or more digits.

### This `expect` is different: it waits

`await expect(page).toHaveURL(...)` is a **web-first assertion**. It doesn't check once and give up.
It checks, waits a bit, checks again... until it passes or 5 seconds pass. That's why it needs `await`.
Pages change after clicks (redirects, loading), so this waiting is exactly what you want. Module 14 goes deep on this.

Two non-waiting helpers you'll meet too:

```ts
const title = await page.title();  // a plain string, read ONCE right now
const url = page.url();            // a plain string (no await: the page already knows it)
```

---

## 4. Your first locator, click and fill

A **locator** describes HOW to find an element. Then you do something with it.

```ts
await page.getByRole('button', { name: 'Log in' }).click();
await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
await page.getByLabel('Password').fill('secret123');
```

### 🧩 Anatomy

```
await page.getByRole( 'button' , { name: 'Log in' } ).click();
          └────┬───┘     │       └───────┬────────┘    └──┬──┘
       "find by role"    │       the accessible name:     the ACTION
                         │       the text a user           (returns a Promise -> await)
             the role: what KIND of element
             (button, link, textbox, heading, checkbox...)
```

### 🗣️ Say it

> "**Await** page **get by role** button, **name** 'Log in', **click**."

`getByRole` finds elements the way a **user** (or a screen reader) sees them: "the button called Log in".
It doesn't care about CSS classes or ids, so it survives redesigns. Module 12 is all about locators.

| You want | Locator |
|---|---|
| a button | `page.getByRole('button', { name: 'Log in' })` |
| a link | `page.getByRole('link', { name: 'Playground' })` |
| a heading | `page.getByRole('heading', { name: 'Products' })` |
| a text input | `page.getByRole('textbox', { name: 'Username' })` |
| a password input | `page.getByLabel('Password')` (password inputs have **no** role) |
| something with a test id | `page.getByTestId('user-name')` |

### Two more assertions you'll use from today

```ts
await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
await expect(page.getByTestId('cart-count')).toHaveText('0');
```

Same shape as before: `await expect(locator).matcher(expected)`.

### ⚠️ Link or button?

The login page has **two** things called "Log in": a **link** in the header and a **button** in the form.
`getByRole('link', { name: 'Log in' })` clicks the wrong one. The role is part of the question, so choose it carefully.

---

## 5. Organising tests: `test.describe`

```ts
test.describe('login', () => {
  test('valid user goes to products', async ({ page }) => { /* ... */ });
  test('wrong password shows an error', async ({ page }) => { /* ... */ });
});
```

`describe` is a folder for tests: the report shows `login › valid user goes to products`.
Notice: the describe callback is NOT async and gets NO fixtures. Only tests and hooks get them.

---

## 6. Hooks: code that runs around your tests

```ts
test.describe('playground', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');   // runs before EVERY test in this describe
  });

  test('counter starts at 0', async ({ page }) => {
    await expect(page.getByTestId('counter')).toHaveText('0');
  });

  test('increment adds 1', async ({ page }) => {
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByTestId('counter')).toHaveText('1');
  });
});
```

The `page` in `beforeEach` is the **same** page the test receives. So the test starts already on `/playground`.

### 🧩 Anatomy

```
test.beforeEach( async ( { page } ) => {  await page.goto('/playground');  } );
      │           └────────┬─────────┘
      │           same shape as a test body (no name!)
      └ which hook
```

### 🗣️ Say it

> "**Before each** test, an async function that takes **page**: await page go to playground."

| Hook | Runs | Can use `page`? | Typical use |
|---|---|---|---|
| `test.beforeEach` | before **every** test | ✅ | open a page, log in, reset data |
| `test.afterEach` | after **every** test (even failed ones) | ✅ | clean up, take extra screenshots |
| `test.beforeAll` | **once** before all tests of the file/describe | ❌ only `browser`, `request` | expensive setup: create test users via API |
| `test.afterAll` | **once** after all tests | ❌ | delete test data |

Order for two tests: `beforeAll` → `beforeEach` → test 1 → `afterEach` → `beforeEach` → test 2 → `afterEach` → `afterAll`.

A hook placed **outside** any describe applies to every test in the file.
A hook **inside** a describe applies only to that describe.

Resetting the server before each test is a pattern you'll see in the next modules:

```ts
test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');  // QA Shop goes back to its default data
});
```

---

## 7. `test.only`, `test.skip`, `test.fixme`

| Write | Effect | When |
|---|---|---|
| `test.only('...', ...)` | Run ONLY this test (and other `.only`s) | Focusing while you debug. **Never commit it!** |
| `test.skip('...', ...)` | Don't run it, show it as skipped | The feature is not on this environment |
| `test.fixme('...', ...)` | Don't run it, marked "needs fixing" | A known bug, a test you'll fix later |
| `test.describe.only(...)` | Only this group | Same as `.only`, for a group |

```ts
test.only('I am debugging this one', async ({ page }) => { /* ... */ });
```

> In this course, don't leave `.only` in exercise files: `npm run check` would run only that test and
> your progress would look wrong. On CI, teams use `forbidOnly: !!process.env.CI` so a forgotten `.only` fails the build.

---

## 8. Running and watching tests

| Command | What you get |
|---|---|
| `npm run check 11` | The course checker: one failure at a time, type errors, next step |
| `npm run check 11 headed` | Same, but you **see** the browser (it's fast, watch closely) |
| `npm run check 11 ui` | **UI mode**: list of tests, click to run, timeline of every step, DOM snapshots, watch mode |
| `npx playwright test modules/11-first-playwright-test --project=exercises --debug` | The **Inspector**: runs step by step, you press ▶ |
| `npm run report` (after any `npm run check`) | The **HTML report** of the last run in your browser |

**UI mode is your best friend** for browser tests. Open it, click a test, and you see every action
with a screenshot of the page before and after. Turn on the 👁 "watch" icon and the test re-runs every time you save.

### Trace viewer

The config has `trace: 'retain-on-failure'`. When a test fails, Playwright keeps a **trace**: a recording of
every action, every network request, the console and a DOM snapshot per step. Open it with:

```bash
npx playwright show-trace test-results/<folder-of-the-failed-test>/trace.zip
```

(or from the HTML report: click the failed test → "Traces"). In UI mode you get the same view for every run.

### Debugging with `page.pause()`

```ts
test('debug me', async ({ page }) => {
  await page.goto('/playground');
  await page.pause();   // ⏸ stops here and opens the Inspector (in headed / --debug / UI mode)
  await page.getByRole('button', { name: 'Increment' }).click();
});
```

While paused you can click **"Pick locator"** in the Inspector, hover over the page and Playwright shows
the best locator for that element. Remove `page.pause()` when you're done.

---

## 9. Codegen: let Playwright write the first draft

If you find it hard to remember syntax, **codegen** is the tool for you. You click around in a browser,
and Playwright writes the test code while you do it.

```bash
npm run app                                     # terminal 1: start QA Shop
npx playwright codegen http://localhost:3000    # terminal 2: start recording
```

Two windows open: a browser and the **Playwright Inspector** with the code. Log in, click "Products", and watch:

```ts
// What codegen writes (roughly):
await page.goto('http://localhost:3000/');
await page.getByRole('link', { name: 'Log in' }).click();
await page.getByRole('textbox', { name: 'Username' }).click();
await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
await page.getByRole('textbox', { name: 'Username' }).press('Tab');
await page.getByLabel('Password').fill('secret123');
await page.getByRole('button', { name: 'Log in' }).click();
```

The toolbar also has buttons to **add assertions** while recording: "Assert visibility", "Assert text", "Assert value".

### Record, then READ and CLEAN

Codegen gives you a draft, not a finished test. After recording, always:

1. Replace full URLs with relative ones: `page.goto('/')`.
2. Delete noise: `click()` right before `fill()` on the same field, `press('Tab')`.
3. Check every locator: is it the one a user would describe? Is it stable (not `nth(3)`, not long CSS)?
4. Add the assertions that prove the behaviour (`toHaveURL`, `toHaveText`, `toBeVisible`).
5. Read it aloud (🗣️). If you can't explain a line, look it up in the lessons.

Reading generated code every day is how syntax sticks. Recording is not cheating: it's how professionals start.

---

## 10. A tour of `playwright.config.ts`

Open the file at the root of the project. The important parts:

```ts
export default defineConfig({
  fullyParallel: false,
  workers: 1,                 // one test at a time (easier to follow while learning)
  timeout: 30_000,            // a whole test may take at most 30 s
  expect: { timeout: 5_000 }, // each web-first assertion retries for at most 5 s
  reporter: 'list',           // print one line per test in the terminal

  use: {                                   // defaults for EVERY test
    baseURL: `http://localhost:${PORT}`,   // page.goto('/login') -> http://localhost:3000/login
    trace: 'retain-on-failure',            // keep a trace when a test fails
    screenshot: 'only-on-failure',         // keep a screenshot when a test fails
    ...devices['Desktop Chrome'],          // viewport, user agent... of a desktop Chrome
  },

  projects: [ /* exercises, solutions, katas: which folders to run */ ],

  webServer: {                             // start QA Shop before the tests
    command: 'node practice-app/server.mjs',
    url: `http://localhost:${PORT}/api/health`,  // wait until this URL answers
    reuseExistingServer: true,             // if it's already running (npm run app), use it
  },
});
```

| Setting | Read it as |
|---|---|
| `timeout` | max time for ONE test (hooks included) |
| `expect.timeout` | max time ONE `await expect(...)` keeps retrying |
| `use` | options every test gets (you can override per file with `test.use({...})`) |
| `projects` | named groups of tests, often one per browser (chromium, firefox, webkit) |
| `webServer` | "start my app first" |

You can read some of it inside a test: `test.info().timeout` is `30000`, and the `baseURL` fixture is the URL string.

---

## 🎭 In Playwright you'll see

```ts
import { test, expect } from '@playwright/test';

test.describe('login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('standard user lands on the products page', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/products/);
    await expect(page).toHaveTitle('Products | QA Shop');
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('locked user sees an error', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Username' }).fill('locked_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('alert')).toHaveText('Sorry, this user has been locked out.');
  });
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Expected: "Playground \| QA Shop"` `Received: Promise {}` | You forgot `await`, so you compared a Promise, not the string | `const title = await page.title();` |
| `SyntaxError: ... Unexpected reserved word 'await'.` | You used `await` in a function that is not `async` (the whole file doesn't run) | Write `async ({ page }) =>` |
| `'await' expressions are only allowed within async functions and at the top levels of modules.` | Same thing, said by TypeScript (red squiggle) | Add `async` |
| `First argument must use the object destructuring pattern: 'page'` | You wrote `async (page) =>` instead of `async ({ page }) =>` | Add the `{ }` |
| `Error: expect(page).toHaveURL(expected) failed` `Expected pattern: /products/` `Received string: "http://localhost:3000/login"` `Timeout: 5000ms` | For 5 s the URL never matched. Usually the action before it didn't work (wrong button, wrong password) | Look at the previous step. Run headed or in UI mode and watch |
| `Error: expect(locator).toBeVisible() failed` `Error: element(s) not found` | No element matches your locator (typo in the name? wrong role? wrong page?) | Check the name in DevTools or with "Pick locator" |
| `Error: locator.click: Test ended.` | An action was still running when the test finished: a missing `await` | `await` every line that touches the browser |
| `Error: locator.click: Target page, context or browser has been closed` | You used the page after it was closed (or after the test ended) | Missing `await`, or a closed tab; check the order of your steps |
| `"context" and "page" fixtures are not supported in "beforeAll"` | `beforeAll` runs once, but every test gets its own page | Use `beforeEach` for page work |
| `Error: page.goto: net::ERR_CONNECTION_REFUSED` | The app isn't running at that URL | Let `webServer` start it, or `npm run app` |

---

## ✍️ Type it (warm-up, 10 minutes)

This warm-up happens in the **browser**, not in `scratch/playground.ts`.

1. In one terminal: `npm run app`, then open http://localhost:3000 and click around QA Shop. Log in as `standard_user` / `secret123`.
2. Press **F12** → Elements. Find the "Log in" **button** and the "Log in" **link**. See the difference?
3. In a second terminal: `npx playwright codegen http://localhost:3000`. Record: log in, click "Playground", click "Increment" twice.
4. In the Inspector toolbar, pick "Assert text" and click the counter.
5. Copy the code into `my-katas/11-codegen.spec.ts` inside a `test('recorded', async ({ page }) => { ... })`, add the import line, and **clean it up** using the 5 steps from section 9.
6. Run it: `npm run kata 11-codegen`. Then type the cleaned version again from memory, without looking.

## 🏋️ Exercises

```bash
npm run check 11
npm run check 11 headed   # watch them run
npm run check 11 ui       # or explore them in UI mode
```

## 🥋 Kata

Close everything. In `my-katas/11-first-test.spec.ts`, from memory, write:

1. the import line
2. a `test.describe('playground', ...)` with a `test.beforeEach` that opens `/playground`
3. a test that asserts the title is `'Playground | QA Shop'` and the URL matches `/playground/`
4. a test that clicks "Increment" 3 times and asserts the counter (`getByTestId('counter')`) has the text `'3'`
5. outside the describe: a test that logs in as `standard_user` / `secret123` and asserts the URL matches `/products/`

Run it with `npm run kata 11`.

## 🧠 Remember

```ts
test('name', async ({ page }) => {                       // async + { page }
  await page.goto('/login');                             // relative URL, baseURL adds the rest
  await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/products/);              // await expect(...) waits and retries
  await expect(page).toHaveTitle('Products | QA Shop');
});
test.beforeEach(async ({ page }) => { await page.goto('/playground'); });
```

## ✅ Done when

- [ ] `npm run check 11` is all green with 0 type errors
- [ ] You recorded something with codegen and cleaned it up
- [ ] You opened one test in UI mode and looked at the timeline
- [ ] Kata done without looking
- [ ] `npm run drill`
