# Module 08 · Async / Await

> **Why this matters for Playwright:** this is THE most important TypeScript module for Playwright.
> Almost every line of a Playwright test talks to a browser, and the browser needs time to answer.
> `async` and `await` are how you wait for those answers. The #1 bug in Playwright code is a forgotten `await`.
> After this module you'll recognise it at once.

## 🎯 After this module you can

- Explain what a **Promise** is (pending → fulfilled / rejected) and read `Promise<T>` types
- Write `async` functions and `async` arrow functions, and use `await`
- Know that an `async` function **always** returns a Promise
- Handle errors with `try / catch` + `await`, and test them with `await expect(...).rejects.toThrow()`
- Run things **one after another** or **at the same time** (`Promise.all`)
- Write a `sleep(ms)` helper, a polling helper and a timeout with `Promise.race`
- Recognise the **forgotten `await`** bug, and the `forEach` + `async` trap
- Read old `.then()` code and rewrite it with `await`

---

## 1. Why async? The browser is slow

Your test runs in Node.js. The browser runs in **another process**. Every action is a message:
"click this", "what's the text here?". The answer comes back later: maybe 5 ms later, maybe 2 seconds later.

JavaScript **never stops and waits** by itself. Instead, a slow operation immediately gives you a
**Promise**: an object that says "I don't have the value yet, but I promise to give it to you later".

> Think of a restaurant receipt with an order number. You don't have the food yet, but the receipt says you
> *will* get it (or you'll be told it's sold out). `await` means "stand at the counter until my number is called".

---

## 2. What is a Promise?

A Promise is always in one of 3 states:

```
            ┌──► fulfilled  (it worked: here is the value)
pending ────┤
            └──► rejected   (it failed: here is the error)
```

Its type says **what value you'll get** when it's fulfilled:

| Type | Means |
|---|---|
| `Promise<string>` | "later, you'll get a string" |
| `Promise<User>` | "later, you'll get a User" |
| `Promise<Product[]>` | "later, you'll get an array of products" |
| `Promise<void>` | "later, I'll tell you I'm done (no value)" |

### 🧩 Anatomy

```
Promise < User >
   │       └── the type of the value you get when it's fulfilled
   └── a box that will hold that value LATER
```

### 🗣️ Say it

> "`Promise<User>`: a **promise of a User**"

---

## 3. `await`: wait for the value

```ts
const user = await fetchUser(1);   // user is a User, not a Promise
console.log(user.name);            // 'Sam Standard'
```

### 🧩 Anatomy

```
const  user  =  await  fetchUser(1) ;
                 │     └────┬─────┘
                 │     gives a Promise<User>
                 └── pause HERE until the Promise is fulfilled,
                     then give me the value inside (a User)
                     If it's rejected: throw the error right here.
```

### 🗣️ Say it

> "constant **user** equals: **wait for** fetchUser 1"

Without `await`, you get the box, not the value:

```ts
const user = fetchUser(1);
console.log(user);         // Promise { <pending> }
console.log(user.name);    // undefined (and a red squiggle)
```

---

## 4. `async` functions

You can only use `await` inside a function marked `async`:

```ts
async function getUserName(id: number): Promise<string> {
  const user = await fetchUser(id);
  return user.name;              // you return a string...
}                                // ...the caller receives a Promise<string>
```

**An `async` function ALWAYS returns a Promise.** Even if you `return 200`, the caller gets `Promise<number>`.
So the caller must `await` it too. Async is "contagious": it goes all the way up to the test.

### 🧩 Anatomy

```
async  function  getUserName ( id: number ) : Promise<string>  {  ...  }
  │                                            └──────┬──────┘
  │                                      the return type is ALWAYS Promise<...>
  └── "this function can use await inside, and returns a Promise"
```

### The async arrow function: every Playwright test!

```ts
const getRole = async (id: number): Promise<string> => {
  const user = await fetchUser(id);
  return user.role;
};

test('login works', async ({ page }) => {   // ← the same shape!
  await page.goto('/login');
});
```

```
async  ( { page } )  =>  {  ...  }
  │      └───┬───┘
  │    parameters (here: an object, destructured, see module 05)
  └── async goes BEFORE the parameters
```

### 🗣️ Say it

> "test 'login works', which runs an **async** function that gets the page: **await** page dot goto slash login"

---

## 5. Making a Promise yourself: `sleep(ms)`

You rarely create Promises yourself, but this one shape is worth knowing:

```ts
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

await sleep(100);   // waits 100 ms
```

### 🧩 Anatomy

```
new Promise( (resolve, reject) => { ... } )
                │         └── call this to REJECT (fail) with an error
                └── call this to FULFIL (succeed) with a value

setTimeout( resolve , 100 )   "call resolve after 100 ms"
```

The exercises use fake async functions built this way, so you can practise without a browser:

```ts
function fakeFetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find((u) => u.id === id);
      if (user) resolve(user);
      else reject(new Error(`User ${id} not found`));
    }, 20);
  });
}
```

> ⚠️ In real Playwright tests, **don't** sleep to wait for the page (`page.waitForTimeout(2000)`).
> It's slow and still flaky. Use web-first assertions that wait for you: `await expect(locator).toBeVisible()`.

---

## 6. Errors with `await`: `try / catch`, `.rejects`, `.resolves`

When an awaited Promise is **rejected**, `await` **throws** the error. So the normal `try / catch` (module 06) works:

```ts
try {
  await fetchUser(99);
} catch (error) {
  if (error instanceof Error) console.log(error.message); // 'User 99 not found'
}
```

To **test** async results, Playwright's `expect` has `.resolves` and `.rejects`:

```ts
await expect(fetchUser(99)).rejects.toThrow('User 99 not found');
await expect(fetchUser(1)).resolves.toMatchObject({ username: 'standard_user' });
```

### 🧩 Anatomy

```
await  expect( fetchUser(99) ).rejects.toThrow( 'User 99 not found' );
  │            └─────┬──────┘   └──┬──┘
  │       give the PROMISE       "wait until it settles; it must be rejected"
  │       (no arrow needed!)
  └── await the whole expect (it is async now)
```

| What you test | Sync code (module 06) | Async code |
|---|---|---|
| throws / rejects | `expect(() => fn()).toThrow('msg')` | `await expect(fn()).rejects.toThrow('msg')` |
| returns / resolves to | `expect(fn()).toBe(5)` | `expect(await fn()).toBe(5)` or `await expect(fn()).resolves.toBe(5)` |

---

## 7. One after another, or at the same time?

```ts
// SEQUENTIAL: ~40 ms (20 + 20). The second waits for the first.
const sam = await fetchUser(1);
const ada = await fetchUser(2);

// PARALLEL: ~20 ms. Both start at once, then we wait for both.
const [sam2, ada2] = await Promise.all([fetchUser(1), fetchUser(2)]);
```

### 🧩 Anatomy

```
const [ sam , ada ]  =  await  Promise.all( [ fetchUser(1) , fetchUser(2) ] );
      └────┬─────┘                          └────────────┬───────────────┘
   array destructuring:                     an ARRAY of promises (all started now)
   results in the SAME order
```

### 🗣️ Say it

> "constant sam and ada equal: **wait for all** of: fetchUser 1, fetchUser 2"

| Use | When |
|---|---|
| `await a(); await b();` | `b` needs the result of `a` (login → token → cart), or order matters (click, then check) |
| `await Promise.all([a(), b()])` | they are independent (load user AND products) |

If **any** promise in `Promise.all` is rejected, the whole `Promise.all` is rejected.

Process a list in parallel with `map`:

```ts
const users = await Promise.all([1, 2, 3].map((id) => fetchUser(id)));
```

---

## 8. 🚨 THE #1 BUG: the forgotten `await`

Learn these symptoms by heart. You **will** meet them.

**Symptom 1: you get a Promise instead of a value**

```ts
const user = fetchUser(1);       // forgot await
user.name;                       // ❌ Property 'name' does not exist on type 'Promise<User>'.
console.log(user);               // Promise { <pending> }
expect(user).toBe(5);            // Received: Promise {}
```

**Symptom 2: the code runs before the value is ready**

```ts
let loaded = false;
async function loadProducts(): Promise<void> {
  await sleep(50);
  loaded = true;
}

loadProducts();                 // forgot await
expect(loaded).toBe(true);      // ❌ still false: the check ran too early
```

**Symptom 3: the test passes for the wrong reason** (the most dangerous one)

```ts
expect(fetchUser(99)).toBeTruthy();   // ✅ passes! A Promise object is always truthy.
```

**Symptom 4: errors "escape" into another test, or disappear**

```ts
test('A', async () => {
  expect(fetchUser(1)).resolves.toEqual({ name: 'Wrong' });   // no await!
});  // test A finishes BEFORE the check runs and is reported as PASSED.
     // The failure shows up later, in a DIFFERENT test, or not at all.
```

**Symptom 5 (Playwright): actions after the test has ended**

```ts
test('add to cart', async ({ page }) => {
  await page.goto('/products');
  page.getByRole('button', { name: 'Add to cart' }).first().click();   // no await!
});
// Error: locator.click: Target page, context or browser has been closed
```

The test finished, Playwright closed the browser, and the click arrived too late.

### Which lines need `await` in Playwright?

| Code | `await`? | Why |
|---|---|---|
| `page.goto('/login')` | ✅ yes | talks to the browser |
| `locator.click()`, `.fill()`, `.check()`, `.textContent()` | ✅ yes | talks to the browser |
| `expect(locator).toBeVisible()` / `.toHaveText()` | ✅ yes | web-first assertions retry until timeout: async |
| `expect(await fn()).toBe(5)` / `await expect(promise).resolves` | ✅ yes | |
| `page.getByRole(...)`, `page.locator(...)`, `.filter()`, `.first()` | ❌ **no** | a locator is just a *description*; nothing is sent yet |
| `expect(value).toBe(5)` (a plain value) | ❌ no | nothing to wait for |

**Rule of thumb:** if VS Code shows the return type as `Promise<...>`, you need `await`.
Many teams add the ESLint rule `@typescript-eslint/no-floating-promises`: it flags every forgotten `await`.

---

## 9. The `forEach` trap

`forEach` **does not wait** for async callbacks. It starts them all and moves on immediately:

```ts
// ❌ BROKEN: names is still [] when expect runs
const names: string[] = [];
[1, 2, 3].forEach(async (id) => {
  const user = await fetchUser(id);
  names.push(user.name);
});
expect(names).toHaveLength(3);   // fails: Received length: 0

// ✅ for...of waits for every await, one by one
for (const id of [1, 2, 3]) {
  const user = await fetchUser(id);
  names.push(user.name);
}

// ✅ or in parallel
const users = await Promise.all([1, 2, 3].map((id) => fetchUser(id)));
```

**Rule:** never put an `async` callback in `forEach`. Use `for...of` (or `Promise.all` + `map`).

---

## 10. Waiting with a limit: polling and `Promise.race`

Playwright's auto-waiting is, at its heart, a loop: "check, wait a bit, check again, give up after the timeout".
You can write the same idea:

```ts
async function waitUntil(condition: () => boolean, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (condition()) return;
    await sleep(10);
  }
  throw new Error(`Timed out after ${timeoutMs}ms`);
}
```

`Promise.race([a, b])` settles as soon as the **first** promise settles. That's how you add a timeout:

```ts
function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms));
}

const user = await Promise.race([fetchUser(1), timeout(1000)]);
```

(`Promise<never>` means "this never gives a value: it can only fail". The `_` is a parameter we don't use.)

---

## 11. Old code: `.then()` chains

Before `async/await` existed, people wrote:

```ts
fetchUser(1)
  .then((user) => user.name)
  .then((name) => console.log(name))
  .catch((error) => console.log('failed', error));
```

The same thing with `await` (prefer this):

```ts
try {
  const user = await fetchUser(1);
  console.log(user.name);
} catch (error) {
  console.log('failed', error);
}
```

| `.then` style | `await` style |
|---|---|
| `p.then((value) => ...)` | `const value = await p;` |
| `p.catch((error) => ...)` | `try { await p; } catch (error) { ... }` |
| `p.finally(() => ...)` | `try { ... } finally { ... }` |

⚠️ Inside `.then((user) => { user.name })` with **braces**, you must write `return`. Without it the next step gets `undefined`.

---

## 🎭 In Playwright you'll see

```ts
import { test, expect, type Page } from '@playwright/test';

type Product = { id: number; name: string; price: number; category: string; stock: number; description: string };

test('load products in the playground', async ({ page }) => {
  await page.goto('/playground');

  // Start waiting for the response BEFORE clicking, so we can't miss it. Both at the same time:
  const [response] = await Promise.all([
    page.waitForResponse('**/api/products'),
    page.getByRole('button', { name: 'Load products' }).click(),
  ]);

  const products: Product[] = await response.json();     // json() is async too!
  expect(products).toHaveLength(6);

  await expect(page.getByTestId('load-status')).toHaveText('Loaded 6 products');
});

test('add two products', async ({ page }) => {
  await page.goto('/products');
  for (const name of ['Backpack', 'Bike Light']) {         // for...of, NOT forEach
    await page.getByTestId('product-card').filter({ hasText: name })
      .getByRole('button', { name: 'Add to cart' }).click();
  }
  await expect(page.getByTestId('cart-count')).toHaveText('2');
});

// An async helper used by tests: it returns a Promise, so callers must await it
async function login(page: Page, username: string, password: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Property 'name' does not exist on type 'Promise<User>'.` (VS Code may add: *Did you forget to use 'await'?*) | You have the Promise, not the value | Add `await` |
| `'await' expressions are only allowed within async functions and at the top levels of modules.` | You used `await` inside a function without `async` | Add `async` before the function / arrow parameters |
| `The return type of an async function or method must be the global Promise<T> type. Did you mean to write 'Promise<number>'?` | You wrote `async function f(): number` | Write `Promise<number>` |
| `Received: Promise {}` in an expect | You compared a Promise, not its value | `expect(await fn()).toBe(...)` |
| `Promise { <pending> }` in console.log | Same: no `await` | Add `await` |
| `Received promise resolved instead of rejected` | You expected a rejection, but it worked | Check the input / the expectation |
| `Error: locator.click: Target page, context or browser has been closed` | An action ran after the test ended: a missing `await` | Add `await` before the action |
| A test passes but the failure appears in **another** test | A floating (un-awaited) `expect(...).resolves/rejects` or action | `await` every async `expect` |
| `Test timeout of 30000ms exceeded.` | Something never finished (a Promise that never resolves, an endless loop) | Look for the step that hangs; add a timeout |
| An array is still `[]` after a `forEach(async ...)` | `forEach` doesn't wait | Use `for...of` with `await` |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getStatus(): Promise<number> {
  await sleep(200);
  return 200;
}

async function main(): Promise<void> {
  const forgotten = getStatus();
  console.log('without await:', forgotten);
  const status = await getStatus();
  console.log('with await:', status);

  const start = Date.now();
  await Promise.all([sleep(300), sleep(300)]);
  console.log('parallel took', Date.now() - start, 'ms');
}

main();
```

Then change `Promise.all` to two separate `await sleep(300)` lines and compare the time.

## 🏋️ Exercises

```bash
npm run check 08
```

## 🥋 Kata

Close everything. In `my-katas/08-async.spec.ts`, from memory:

1. Write `function sleep(ms: number): Promise<void>` with `new Promise` and `setTimeout`
2. Write `async function fetchName(id: number): Promise<string>` that waits 20 ms with `sleep`,
   then returns `'Sam'` for id 1, and **throws** `new Error('Not found')` for any other id
3. Write one **async** test that:
   - checks `await fetchName(1)` is `'Sam'`
   - checks `fetchName(2)` **rejects** with `'Not found'` (`await expect(...).rejects.toThrow(...)`)
   - fetches ids `1` and `1` **in parallel** with `Promise.all` and checks you got `['Sam', 'Sam']`

Run it with `npm run kata 08`.

## 🧠 Remember

```ts
const user = await fetchUser(1);                       // await = wait for the value
async function get(): Promise<string> { }              // async ALWAYS returns a Promise
test('x', async ({ page }) => { await page.goto('/'); });
const [a, b] = await Promise.all([fetchA(), fetchB()]); // at the same time
for (const id of ids) { await fetchUser(id); }         // NOT forEach
await expect(fetchUser(99)).rejects.toThrow('not found');
new Promise((resolve) => setTimeout(resolve, ms));     // sleep
```

## ✅ Done when

- [ ] `npm run check 08` is all green with 0 type errors
- [ ] You can list 3 symptoms of a forgotten `await`
- [ ] You know which Playwright lines need `await` (and that `page.getByRole(...)` doesn't)
- [ ] Kata done without looking
- [ ] `npm run drill`
