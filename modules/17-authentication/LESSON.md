# Module 17 · Authentication

> **Why this matters for Playwright:** almost every real app needs a login. Logging in through the UI in
> every test is slow and fragile. Playwright's answer is to log in ONCE, save the browser state to a file,
> and start every test already logged in. Every professional Playwright project does this.

## 🎯 After this module you can

- Explain why "log in through the UI in every test" doesn't scale
- Save a login with `storageState({ path })` and reuse it with `test.use({ storageState })`
- Write a **setup project** (`auth.setup.ts`) and make other projects depend on it
- Use several roles (user and admin) in one suite, and even in one test
- Start a test logged out: `test.use({ storageState: { cookies: [], origins: [] } })`
- Log in with the API (`/api/login` + `context.addCookies`) instead of the UI
- Read credentials from environment variables, with fallbacks
- Explain why `.auth/` must never be committed

> This module has **its own `playwright.config.ts`** (in `modules/17-authentication/`). `npm run check 17` uses it automatically.
> Start with `auth.setup.ts`: the other exercises only run after your setup passes.

---

## 1. The slow way: log in in every test

```ts
test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
});
```

It works. But with 300 tests that's 300 logins: minutes of extra run time, 300 chances for a slow login page
to make a test flaky, and a lot of load on the login service. And when the login page changes, everything breaks at once.
Only the tests that **test the login itself** should go through the login form.

---

## 2. How a login is remembered: cookies

When you log in to QA Shop, the server answers with a header:

```
Set-Cookie: session=6f1c...e2; Path=/; HttpOnly; SameSite=Lax
```

The browser keeps that **cookie** in the **context** (module 16) and sends it with every request.
The server sees the cookie and knows who you are. Some apps keep a token in `localStorage` instead.

**Storage state** = all cookies + all localStorage of a context. Save it, and you can give it to a new context later:

```json
{
  "cookies": [
    { "name": "session", "value": "6f1c...e2", "domain": "localhost", "path": "/",
      "expires": -1, "httpOnly": true, "secure": false, "sameSite": "Lax" }
  ],
  "origins": []
}
```

---

## 3. Save the state: `storageState({ path })`

```ts
await page.goto('/login');
// ...fill and click...
await expect(page).toHaveURL(/\/products/);                  // WAIT until the login finished!
await page.context().storageState({ path: USER_STATE });     // write the file
```

### 🧩 Anatomy

```
await page.context().storageState( { path: USER_STATE } );
        └────┬─────┘ └────┬─────┘     └───────┬───────┘
     the page's context   │        where to write the JSON file
                  "give me your cookies + localStorage"
```

Without `path`, it just returns the object: `const state = await page.context().storageState();`
The same method exists on an API context: `await request.storageState({ path })`.

### 🗣️ Say it

> "Await the page's context, storage state, with path USER_STATE."

⚠️ Always wait for something that proves the login finished (the URL, the user name) **before** saving.
Save too early and the file has no session cookie. Your tests then start logged out, and the error shows up in a different test.

---

## 4. Use the state: `test.use({ storageState })`

```ts
import path from 'node:path';

const USER_STATE = path.join(import.meta.dirname, '.auth', 'user.json');

test.use({ storageState: USER_STATE });             // whole file: every test starts logged in

test('cart', async ({ page }) => {
  await page.goto('/cart');                         // no login code at all
});
```

`test.use` works at the top of the file (all tests) or inside a `describe` (only those tests).
The `request` fixture and `page.request` use the same state, so API calls are logged in too.

**Paths:** `import.meta.dirname` is the folder of the current file. `path.join` glues the parts with the right slash.
A relative string like `'.auth/user.json'` is read from the folder you **run** Playwright from (the project root),
NOT from the folder of the test file. Use absolute paths and you avoid that problem.

### 🗣️ Say it

`test.use({ storageState: USER_STATE });`
> "In these tests, use the storage state from USER_STATE."

---

## 5. The setup project: log in once, before everything

A **setup project** is a normal test file that runs before the other tests and writes the state files.

```ts
// auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const USER_STATE = path.join(import.meta.dirname, '.auth', 'user.json');

setup('log in as standard_user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/products/);
  await page.context().storageState({ path: USER_STATE });
});
```

`import { test as setup }` is only a rename, so the file reads nicely. It's the same `test`.

```ts
// playwright.config.ts
projects: [
  { name: 'setup', testMatch: /.*\.setup\.ts/ },
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    dependencies: ['setup'],
  },
],
```

### 🧩 Anatomy

```
{ name: 'chromium',  use: { storageState: '...' },  dependencies: ['setup'] }
          │                └──────────┬─────────┘     └─────────┬────────┘
     project name     every test in this project      run the 'setup' project FIRST;
                      starts with this state           if it fails, skip these tests
```

What happens on `npx playwright test`:
1. Playwright runs the `setup` project → the state files are written.
2. Then it runs `chromium`. Every test starts logged in.
3. If setup fails, the dependent tests **don't run** (you see them as "did not run").

Two ways to choose the state, and you'll see both in real projects:

| Where | Example | Good for |
|---|---|---|
| in the config, per project | `use: { storageState: '...' }` | "all tests in this project are logged in as X" |
| in the spec, per file/describe | `test.use({ storageState: ADMIN_STATE })` | switching role for a few tests |

---

## 6. Many roles

Make one setup test per role, one file per role:

```ts
setup('user', async ({ page }) => { /* ... */ await page.context().storageState({ path: USER_STATE }); });
setup('admin', async ({ page }) => { /* ... */ await page.context().storageState({ path: ADMIN_STATE }); });
```

Then choose per describe:

```ts
test.describe('admin dashboard', () => {
  test.use({ storageState: ADMIN_STATE });
  test('shows users', async ({ page }) => { /* ... */ });
});
```

**Two roles in ONE test** (an admin changes something, a user sees it): make a second context yourself.

```ts
test('admin adds, user sees', async ({ page, browser }) => {   // page = user (from test.use)
  const adminContext = await browser.newContext({ storageState: ADMIN_STATE });
  const adminPage = await adminContext.newPage();
  // ...admin does things in adminPage, user checks in page...
  await adminContext.close();
});
```

---

## 7. Logged-out tests

If the file logs everyone in, some tests still need a visitor with no session (login page tests, redirects):

```ts
test.describe('login page', () => {
  test.use({ storageState: { cookies: [], origins: [] } });   // an EMPTY state
  test('wrong password shows an error', async ({ page }) => { /* ... */ });
});
```

### 🗣️ Say it

> "Use a storage state with **no cookies** and **no origins**."

---

## 8. Even faster: log in with the API

The UI login takes about a second. An API call takes a few milliseconds. QA Shop's `POST /api/login` returns a token,
and the token is the same value the browser keeps in the `session` cookie. So:

```ts
setup('admin via API', async ({ request, context, baseURL }) => {
  const response = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
  await expect(response).toBeOK();
  const { token } = await response.json();
  await context.addCookies([{ name: 'session', value: token, url: baseURL }]);
  await context.storageState({ path: ADMIN_STATE });
});
```

### 🧩 Anatomy

```
await context.addCookies( [ { name: 'session', value: token, url: baseURL } ] );
                          │ └────────────────────┬──────────────────────┘ │
                          │       ONE cookie: name, value, and where it belongs
                          └────────── an array: you can add many ──────────┘
```

`url: baseURL` tells Playwright the domain and path of the cookie for you.

Another trick: post the login **form** with the `request` fixture. It follows the redirect, keeps the cookie, and can save it:

```ts
await request.post('/login', { form: { username: 'standard_user', password: 'secret123' } });
await request.storageState({ path: USER_STATE });
```

Each app is different: find out how YOUR app keeps the session (DevTools → Application → Cookies / Local Storage),
then copy that into the context.

---

## 9. Credentials and secrets

Never hard-code real passwords in test files. Read them from **environment variables**, with a fallback for local runs:

```ts
const ADMIN = process.env.SHOP_ADMIN ?? 'admin';
const ADMIN_PASSWORD = process.env.SHOP_ADMIN_PASSWORD ?? 'admin123';
```

- `process.env.NAME` is always a `string` or `undefined`. `??` gives the fallback when it's `undefined` (module 07).
- Numbers come as strings: `Number(process.env.LOGIN_TIMEOUT ?? '10000')`.
- In CI, the values come from the CI's secret store (module 20). Locally, teams often use a `.env` file (module 19).

### Why `.auth/` is gitignored

The state files contain **real, working session cookies**. Anyone with the file is logged in as that user.
They also go stale (sessions expire, servers restart). So: generate them on every run (setup project), never commit them.
This course's `.gitignore` has the line `.auth/`.

---

## 10. Don't break the shared session

All tests that use `user.json` share **one** server session. If one test clicks **Log out**, the server deletes that
session, and every later test that uses `user.json` is suddenly logged out. Tests that log out (or change the password,
or delete the user) must log in with their **own** session: an empty state plus their own login.

---

## 🎭 In Playwright you'll see

```ts
// playwright.config.ts
export default defineConfig({
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:3000' },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'logged-in',
      testIgnore: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});

// tests/login.spec.ts
test.use({ storageState: { cookies: [], origins: [] } });

test('locked user sees an error', async ({ page }) => {
  await page.goto('/login');
  // ...
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Error: Error reading storage state from .auth/admin.json:` `ENOENT: no such file or directory, open 'C:\...\ts-study\.auth\admin.json'` | The file doesn't exist THERE. A relative path is read from the folder you run from (the root), or the setup didn't run | Use `path.join(import.meta.dirname, '.auth', 'admin.json')`; run with the setup project (don't use `--no-deps`) |
| Tests show as "did not run" / `15 did not run` | A project they depend on (setup) failed | Fix the setup test first, it's the first red one |
| Test expects to be logged in but lands on `/login?next=...` | The state file has no valid session: saved too early, or a test logged out the shared session | Wait for the URL/user name before `storageState`; log out only with your own session |
| `Access denied` / status `403` on `/admin` | You're logged in, but as the wrong role | Use the admin state for that describe |
| `Error: browserContext.addCookies: Cookie should have a url or a domain/path pair` | The cookie object is missing `url` (or `baseURL` is undefined) | Add `url: baseURL` (and check `use.baseURL` in the config) |
| Login works locally, fails in CI | The env variables aren't set in CI, or a different user/password there | Set them as CI secrets; print which username is used (never the password) |

---

## ✍️ Type it (warm-up, 5 minutes)

Type this into `my-katas/17-warmup.spec.ts` (it uses the root config, which has no setup project, so it saves and uses the state in one file):

```ts
import { test, expect } from '@playwright/test';
import path from 'node:path';

const STATE = path.join(import.meta.dirname, '.auth', 'warmup.json');

test('save the state', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/products/);
  await page.context().storageState({ path: STATE });
});

test.describe('reuse it', () => {
  test.use({ storageState: STATE });
  test('already logged in', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByRole('heading', { name: 'Your Cart' })).toBeVisible();
  });
});
```

Run `npm run kata 17-warmup`, then open `my-katas/.auth/warmup.json` and find the `session` cookie.

## 🏋️ Exercises

```bash
npm run check 17
```

Start in `modules/17-authentication/auth.setup.ts` (17.1, 17.2), then `exercises.spec.ts`.

## 🥋 Kata

Close everything. From memory, in `my-katas/17-auth.spec.ts`:

1. Two constants with absolute paths: `USER_STATE` and `ADMIN_STATE` (in `.auth/` next to the file).
2. A test `'save admin state'` that logs in as admin with `request.post('/api/login', ...)`, adds the `session` cookie with `context.addCookies`, and saves `ADMIN_STATE`.
3. A `describe` with `test.use({ storageState: ADMIN_STATE })` and a test that opens `/admin` and sees "Admin Dashboard".
4. A `describe` that starts logged out and checks that `/cart` redirects to `/login`.

Run it with `npm run kata 17-auth`. (The tests run in file order, one worker, so the state exists before it's used.)

## 🧠 Remember

```ts
await page.context().storageState({ path: USER_STATE });            // save (after the login finished!)
test.use({ storageState: USER_STATE });                             // reuse
test.use({ storageState: { cookies: [], origins: [] } });           // logged out
await context.addCookies([{ name: 'session', value: token, url: baseURL }]);
{ name: 'setup', testMatch: /.*\.setup\.ts/ }                       // config: setup project...
{ name: 'chromium', use: { storageState: '...' }, dependencies: ['setup'] }   // ...runs first
const PASSWORD = process.env.SHOP_PASSWORD ?? 'secret123';
```

## ✅ Done when

- [ ] `npm run check 17` is all green with 0 type errors
- [ ] You can explain setup project + `dependencies` + `storageState` in your own words
- [ ] Kata done without looking
- [ ] `npm run drill`
