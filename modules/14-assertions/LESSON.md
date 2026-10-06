# Module 14 · Assertions

> **Why this matters for Playwright:** the assertion is the part of the test that finds bugs. Everything else is setup.
> Web pages change *over time* (loading, animations, requests), so Playwright's assertions **wait and retry**.
> Use the right kind and your tests are stable. Use the wrong kind and you get the famous "flaky test".

## 🎯 After this module you can

- Explain the difference between **web-first** (auto-retrying) and **generic** (check once) assertions, and pick the right one
- Explain why `expect(await locator.textContent()).toBe(...)` is flaky, and fix it
- Use the locator matchers: `toBeVisible`, `toBeHidden`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveCount`,
  `toBeChecked`, `toBeEnabled`, `toBeDisabled`, `toHaveAttribute`, `toHaveClass`, `toBeFocused`, `toBeEmpty`
- Use the page matchers `toHaveURL` and `toHaveTitle`, and negate anything with `.not`
- Add a custom message, change the timeout of one assertion, and use `expect.soft`, `expect.poll` and `toPass`
- Use the generic matchers on data from the page or an API: `toEqual`, `toContain`, `toBeCloseTo`, `toMatchObject`, `expect.any`...

---

## 1. Two kinds of `expect`

```ts
// WEB-FIRST: the actual value is a LOCATOR (or the page). Playwright re-checks until it passes or 5 s pass.
await expect(page.getByTestId('progress-status')).toHaveText('Complete!');

// GENERIC: the actual value is a plain VALUE. Checked ONCE, right now.
expect(cart.count).toBe(1);
```

### 🧩 Anatomy

```
await expect( locator ).toHaveText( 'Complete!' );     ← web-first: locator in, AWAIT in front
      └─ re-reads the element ~every 100 ms until it matches, up to expect.timeout (5 s)

      expect(  value  ).toBe( 1 );                     ← generic: a value in, no await
      └─ compares once. The value was read BEFORE expect was even called
```

### 🗣️ Say it

> "**Await expect** status **to have text** Complete." ("await expect" = "wait until")
> "**Expect** count **to be** 1." (no await = "right now")

### The crucial table

| | Web-first (auto-retrying) | Generic (non-retrying) |
|---|---|---|
| Actual value | a `Locator`, the `page`, an API response | a plain value: string, number, array, object |
| Needs `await`? | ✅ always | ❌ never |
| Waits/retries? | ✅ up to 5 s (`expect.timeout`) | ❌ checks once |
| Matchers | `toBeVisible`, `toHaveText`, `toHaveCount`, `toHaveURL`... | `toBe`, `toEqual`, `toContain`, `toBeGreaterThan`... |
| Use for | anything on the **page** | data you already have: API JSON, arrays of names, numbers you computed |

---

## 2. Why `expect(await locator.textContent()).toBe(...)` is flaky

```ts
await page.getByRole('button', { name: 'Start download' }).click();
expect(await page.getByTestId('progress-status').textContent()).toBe('Complete!');   // ❌
```

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "Complete!"
Received: "Downloading..."
```

`textContent()` read the text **once**, a few milliseconds after the click. The download needs 1.5 s.
On a fast machine it might pass sometimes, on CI it fails: that's a **flaky** test.

```ts
await expect(page.getByTestId('progress-status')).toHaveText('Complete!');   // ✅ waits for it
```

The same trap with other "read once" methods:

| ❌ Reads once (flaky for checks) | ✅ Web-first version |
|---|---|
| `expect(await loc.textContent()).toBe('x')` | `await expect(loc).toHaveText('x')` |
| `expect(await loc.isVisible()).toBe(true)` | `await expect(loc).toBeVisible()` |
| `expect(await loc.isChecked()).toBe(true)` | `await expect(loc).toBeChecked()` |
| `expect(await loc.inputValue()).toBe('x')` | `await expect(loc).toHaveValue('x')` |
| `expect(await loc.count()).toBe(3)` | `await expect(loc).toHaveCount(3)` |
| `expect(await loc.getAttribute('aria-expanded')).toBe('true')` | `await expect(loc).toHaveAttribute('aria-expanded', 'true')` |
| `expect(page.url()).toContain('/cart')` | `await expect(page).toHaveURL(/\/cart/)` |

Rule: **if it's on the page, use a web-first assertion.** Read values (`textContent`, `allTextContents`...) only to
*collect data* you will compute with (module 12).

### The 2-second message: see auto-waiting yourself

On `/playground`, "Show message" makes a text appear after **2 seconds**:

```ts
await page.getByRole('button', { name: 'Show message' }).click();
await expect(page.getByTestId('slow-message')).toBeVisible();   // passes after ~2 s, no sleep needed
```

Never "fix" timing with `await page.waitForTimeout(2000)`. It makes every run slower, and it still fails
the day the app needs 2.1 s. Web-first assertions wait **exactly as long as needed**.

---

## 3. Locator matchers: visibility and text

```ts
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();                       // hidden OR not in the page at all

await expect(locator).toHaveText('Total: $59.98');        // the WHOLE text (spaces normalised)
await expect(locator).toHaveText(/ORD-\d+/);              // regex: matches part of it
await expect(locator).toContainText('Total');             // a PART of the text
await expect(locator).toHaveText('total: $59.98', { ignoreCase: true });

// Many elements: an array, in order, one per element
await expect(page.getByTestId('product-card').getByRole('heading'))
  .toHaveText(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
await expect(items).toContainText(['Buy', 'Fix']);       // each element contains the matching part
```

| Matcher | String means | Regex means |
|---|---|---|
| `toHaveText('x')` | the whole text equals x | the text matches the pattern |
| `toContainText('x')` | the text contains x | the text matches the pattern |

⚠️ "The whole text" includes children. A to-do `<li>` with a "Delete" button inside has the text `'Buy milk Delete'`.

---

## 4. Locator matchers: values, counts, states, attributes

```ts
await expect(page.getByLabel('Email')).toHaveValue('sam@qa.shop');   // inputs, textareas, selects
await expect(page.getByLabel('Country')).toHaveValue('br');          // a select: the option VALUE
await expect(page.getByLabel('Age')).toBeEmpty();                     // empty input (or element with no text)

await expect(page.getByTestId('cart-row')).toHaveCount(2);           // how many elements match
await expect(page.getByTestId('cart-row')).toHaveCount(0);           // none

await expect(page.getByRole('checkbox', { name: 'I agree to the terms' })).toBeChecked();
await expect(page.getByRole('button', { name: 'Locked button' })).toBeDisabled();
await expect(page.getByRole('button', { name: 'Locked button' })).toBeEnabled();
await expect(page.getByLabel('Email')).toBeFocused();
await expect(page.getByRole('textbox', { name: 'Comments' })).toBeEditable();

await expect(page.getByRole('button', { name: 'Toggle details' })).toHaveAttribute('aria-expanded', 'true');
await expect(page.getByRole('alert')).toHaveClass(/error/);           // class attribute matches the regex
await expect(page.getByRole('alert')).toContainClass('error');        // one of the classes is 'error'
await expect(page.getByTestId('product-card').first()).toHaveClass('card product-card');  // the whole class string
```

## 5. Page matchers

```ts
await expect(page).toHaveURL(/\/checkout\/complete/);
await expect(page).toHaveURL('http://localhost:3000/cart');   // exact: brittle (port!), prefer a regex
await expect(page).toHaveTitle('Cart | QA Shop');
await expect(page).toHaveTitle(/Cart/);
```

---

## 6. `.not`: the opposite

```ts
await expect(page.getByRole('alert')).not.toBeVisible();
await expect(page.getByTestId('cart-count')).not.toHaveText('0');
await expect(terms).not.toBeChecked();
expect(names).not.toContain('Onesie');
```

### 🧩 Anatomy

```
await expect( terms ).not.toBeChecked();
                      └┬┘
                 put .not between expect(...) and the matcher
```

`.not` waits too: it retries until the condition is **not** true. `not.toBeVisible()` and `toBeHidden()` mean the same.

---

## 7. Custom messages and per-assertion timeouts

```ts
await expect(page.getByTestId('cart-count'), 'cart badge after adding the backpack').toHaveText('1');
```

When it fails, your message comes first:

```
Error: cart badge after adding the backpack

expect(locator).toHaveText(expected) failed

Locator:  getByTestId('cart-count')
Expected: "1"
Received: "0"
Timeout:  5000ms
```

One slow thing? Raise the timeout **for that assertion only**:

```ts
await expect(page.getByTestId('report-ready')).toBeVisible({ timeout: 15_000 });
```

### 🧩 Anatomy

```
await expect( locator , 'message' ).toBeVisible( { timeout: 15_000 } );
                           │                       └ options of THIS assertion
                           └ the 2nd argument of expect: your message
```

Don't lower timeouts to "make tests fast": a timeout only matters when something is wrong.
And don't raise the global `expect.timeout` because of one slow page.

---

## 8. `expect.soft`: keep going after a failure

```ts
await expect.soft(page.getByRole('radio', { name: 'Free' })).toBeChecked();
await expect.soft(page.getByLabel('Country')).toHaveValue('');
await expect.soft(page.getByRole('checkbox', { name: 'I agree to the terms' })).not.toBeChecked();
```

A failed soft assertion is recorded, the test continues, and at the end the test is marked as failed with
**all** the failures listed. Great for checking many independent things on one page (a form's default state,
labels, a summary). Don't use it when the next step depends on this check: the test would just fail later with a confusing error.

---

## 9. `expect.poll`: retry any value

Web-first assertions work on locators and pages. For anything else that changes over time (an API, a computed number),
`expect.poll` turns a function into a retrying assertion:

```ts
await expect.poll(async () => {
  const response = await page.request.get('/api/cart');   // page.request shares the page's cookies (login)
  const cart = await response.json();
  return cart.count;
}).toBe(1);
```

### 🧩 Anatomy

```
await expect.poll( async () => { ...; return value; } ).toBe( 1 );
                   └──────────────┬───────────────┘     └──┬──┘
           called again and again until...       ...this generic matcher passes (or 5 s)
```

### 🗣️ Say it

> "**Await expect poll** this function **to be** 1." ("keep asking until the answer is 1")

Options: `expect.poll(fn, { timeout: 10_000, intervals: [500, 1_000] })`.

## 10. `toPass`: retry a whole block

```ts
await expect(async () => {
  const text = await page.getByTestId('progress-status').textContent();
  expect(text).toBe('Complete!');
}).toPass({ timeout: 5_000 });
```

The block is re-run until it passes without throwing. Use it when several steps must succeed **together**
(click a "refresh" button, then check), or when you must use a non-retrying check.
⚠️ `toPass` has **no** default timeout limit of its own besides the test timeout: always pass `{ timeout }`.

| Need | Use |
|---|---|
| A locator or the page | `await expect(locator).toX()` |
| A value from a function (API, calculation) | `await expect.poll(fn).toX()` |
| Several steps that must pass together | `await expect(async () => { ... }).toPass({ timeout })` |

---

## 11. Generic matchers you'll use in tests

The ones from the TypeScript modules, now on real data (API JSON, arrays of texts):

```ts
const products: Product[] = await (await request.get('/api/products')).json();
const names = products.map((p) => p.name);
const total = products.reduce((sum, p) => sum + p.price, 0);

expect(response.status()).toBe(200);                        // exact, primitives
expect(names).toEqual(['Backpack', 'Bike Light' /* ... */]);  // deep equality: arrays, objects
expect(names).toContain('Onesie');                          // an item of an array / part of a string
expect(names).toHaveLength(6);
expect(products.length).toBeGreaterThan(3);                 // also toBeLessThan, toBeGreaterThanOrEqual
expect(total).toBeCloseTo(129.94);                          // decimals! 0.1 + 0.2 !== 0.3
expect(order.id).toMatch(/^ORD-\d+$/);                      // string vs regex
expect(user.token).toBeTruthy();                            // not '', 0, null, undefined, false
expect(product.description).toBeDefined();
expect(products[0]).toHaveProperty('price', 29.99);
expect(products[0]).toMatchObject({ name: 'Backpack', category: 'bags' });  // these fields; extra fields OK
expect(products[0]).toEqual(expect.objectContaining({ id: expect.any(Number) }));
expect(names).toEqual(expect.arrayContaining(['Onesie', 'Backpack']));     // contains these, any order
```

| Matcher | Checks | Example |
|---|---|---|
| `toBe` | same primitive value | `toBe(200)` |
| `toEqual` | same content (deep) | `toEqual({ id: 1 })` |
| `toBeCloseTo` | decimals, almost equal (2 digits by default) | `toBeCloseTo(59.98)` |
| `toMatchObject` | has at least these fields/values | `toMatchObject({ role: 'admin' })` |
| `expect.any(Type)` | any value of a type, inside `toEqual` | `{ id: expect.any(Number) }` |
| `expect.objectContaining` | an object with at least these fields | inside `toEqual` / `toContainEqual` |
| `expect.arrayContaining` | an array with at least these items | inside `toEqual` |

### Why `toBeCloseTo` for prices?

```ts
0.1 + 0.2              // 0.30000000000000004
9.99 + 49.99           // 59.980000000000004  (Bike Light + Fleece Jacket!)
expect(0.1 + 0.2).toBe(0.3);          // ❌ fails
expect(0.1 + 0.2).toBeCloseTo(0.3);   // ✅
```

Computers store decimals in binary, so sums of prices are often a tiny bit off. Always `toBeCloseTo` for money you computed.

---

## 🎭 In Playwright you'll see

```ts
test('cart total is right', async ({ page }) => {
  // ...logged in, Backpack and Bike Light added
  await page.goto('/cart');

  const rows = page.getByTestId('cart-row');
  await expect(rows).toHaveCount(2);
  await expect(rows.first()).toContainText('Backpack');
  await expect(page.getByTestId('cart-total')).toHaveText('Total: $39.98');

  // collect data, then compute: generic matchers
  const subtotals = await rows.getByRole('cell').filter({ hasText: '$' }).allTextContents();
  const sum = subtotals.map((s) => Number(s.replace('$', ''))).reduce((a, b) => a + b, 0);
  expect(sum).toBeCloseTo(39.98);

  await expect(page.getByRole('link', { name: 'Checkout' }), 'checkout must be possible').toBeVisible();
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Expected: "Complete!"` `Received: "Downloading..."` (with `expect(received).toBe`) | You read the text once, too early | `await expect(locator).toHaveText('Complete!')` |
| `Error: expect(locator).toHaveText(expected) failed` ... `Received: "0"` `Timeout: 5000ms` ... `14 × locator resolved to <output ...>0</output>` `- unexpected value "0"` | It retried for 5 s; the element was found but the text never matched | Is the expected value right? Did the step before really happen? |
| `Error: expect(locator).toBeVisible() failed` ... `Error: element(s) not found` | The locator matches nothing | Fix the locator (module 12) |
| `Error: expect(locator).toHaveCount(expected) failed` `Expected: 4` `Received: 5` | Different number of elements | Check the locator is not too wide/narrow |
| `Error: expect(locator).not.toBeVisible() failed` `Expected: not visible` `Received: visible` | `.not` waited 5 s, the element stayed | Is it really supposed to disappear? |
| Test passes but the assertion never ran / `Error: ... Received: ""` after the test ended | `expect(locator).toX()` **without `await`** | Every web-first assertion starts with `await` |
| `Received has type: object` `Received has value: Promise {}` | A generic matcher got a Promise: missing `await` before `locator.count()` / `allTextContents()` | `const names = await locator.allTextContents();` |
| `Expected: 0.3` `Received: 0.30000000000000004` | Decimal maths | `toBeCloseTo` |
| `Timeout 1000ms exceeded while waiting on the predicate` | `expect.poll` / `toPass` never passed in time | Check the logic; give a realistic `timeout` |

---

## ✍️ Type it (warm-up, 5 minutes)

In `my-katas/14-warmup.spec.ts`, **type** (don't paste) and run with `npm run kata 14-warmup`:

```ts
import { test, expect } from '@playwright/test';

test('watch auto-waiting', async ({ page }) => {
  await page.goto('/playground');
  await page.getByRole('button', { name: 'Start download' }).click();
  console.log('right away:', await page.getByTestId('progress-status').textContent());
  await expect(page.getByTestId('progress-status')).toHaveText('Complete!');
  console.log('after await expect:', await page.getByTestId('progress-status').textContent());
});
```

Then run it with `npm run kata 14-warmup -- --headed` and watch the status change. Replace the `await expect`
with `expect(await ...textContent()).toBe('Complete!')` and see it fail.

## 🏋️ Exercises

```bash
npm run check 14
```

## 🥋 Kata

Close everything. In `my-katas/14-assertions.spec.ts`, from memory, on `/playground`:

1. click "Show message" and assert the slow message is visible and has the text `'Loaded after a delay!'`
2. assert the "Locked button" is disabled, check "Enable the button", assert it's enabled
3. add two to-dos and assert the list items have a count of 2 and `todo-count` is `'2 items'`
4. three `expect.soft` checks on the form defaults (Free checked, terms not checked, Country value `''`)
5. with the `request` fixture, get `/api/products` and assert: length 6, the first one `toMatchObject({ name: 'Backpack' })`,
   and the sum of all prices `toBeCloseTo(129.94)`

Run it with `npm run kata 14`.

## 🧠 Remember

```ts
await expect(locator).toHaveText('x');      // page things: await + locator -> waits & retries
expect(value).toBe('x');                    // data you already have: no await, checks once
// ❌ expect(await loc.textContent()).toBe('x')   ✅ await expect(loc).toHaveText('x')
await expect(loc).not.toBeVisible();   await expect(loc, 'my message').toBeVisible({ timeout: 10_000 });
await expect.soft(loc).toBeChecked();  await expect.poll(async () => getCount()).toBe(1);
expect(total).toBeCloseTo(59.98);      expect(obj).toMatchObject({ name: 'Backpack' });
```

## ✅ Done when

- [ ] `npm run check 14` is all green with 0 type errors
- [ ] You can explain, without looking, why `expect(await loc.textContent()).toBe(...)` is flaky
- [ ] Kata done without looking
- [ ] `npm run drill`
