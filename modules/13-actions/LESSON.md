# Module 13 · Actions

> **Why this matters for Playwright:** a test is a user story: log in, search, add to cart, pay.
> Every step is an **action** on a locator. Knowing the 15 actions in this module covers almost every UI test you'll write,
> and knowing how Playwright *waits before acting* explains most of the errors you'll meet.

## 🎯 After this module you can

- Click (and double-click, right-click), fill, clear and type key by key
- Press keys on an element (`press('Enter')`) or on the page (`page.keyboard`)
- Check, uncheck and `setChecked` checkboxes and radios
- Choose options in a `<select>` by value and by label
- Hover, focus and upload files (also files made in memory with `Buffer.from`)
- Handle `alert` / `confirm` / `prompt` dialogs
- Catch a new tab with the "start waiting, then click" Promise pattern
- Explain **actionability**: what Playwright checks before every action, and the errors when it can't act
- Write full flows: login → add to cart → checkout

---

## 1. The shape of every action

```ts
await page.getByRole('button', { name: 'Add' }).click();
await page.getByLabel('Email').fill('sam@qa.shop');
```

### 🧩 Anatomy

```
await  page.getByLabel('Email')  .fill( 'sam@qa.shop' );
  │    └─────────┬────────────┘   └┬─┘  └─────┬─────┘
  │          the locator         action   argument (always a STRING for fill)
  └ actions return a Promise: always await
```

### 🗣️ Say it

> "**Await** page get by label Email, **fill** with sam at qa dot shop."

Pattern: **find it, then do something to it.** Store a locator in a `const` when you use it more than once:

```ts
const newTodo = page.getByLabel('New to-do');
await newTodo.fill('Buy milk');
await newTodo.press('Enter');
```

---

## 2. Actionability: Playwright waits before it acts

Before a `click()`, Playwright waits until the element is:

| Check | Means |
|---|---|
| **attached** | it exists in the page |
| **visible** | not hidden, has a size |
| **stable** | not moving (animations finished) |
| **enabled** | not `disabled` |
| **receives events** | nothing else is covering it |

`fill()` also waits until the element is **editable**. This is called **auto-waiting**. It's why you almost never need
`waitForTimeout(...)` in Playwright. If the checks never pass, the action keeps retrying until a timeout:

```
TimeoutError: locator.click: Timeout 2000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Locked button' })
    - locator resolved to <button disabled id="locked-button">Locked button</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
```

Read the **Call log**: it tells you exactly which check failed (`element is not enabled`, `element is not visible`...).
The fix is almost never "wait longer". It's "do the step that makes it enabled/visible first".

> Actions have no timeout of their own in our config, so a stuck action waits until the **test** timeout (30 s).
> You can give one action a limit: `click({ timeout: 2_000 })`.

---

## 3. Clicking

```ts
await page.getByRole('button', { name: 'Increment' }).click();
await locator.dblclick();                          // double-click
await locator.click({ button: 'right' });          // right-click (context menu)
await locator.click({ modifiers: ['Shift'] });     // Shift+click
await locator.click({ clickCount: 3 });            // triple click (selects a line of text)
await locator.click({ force: true });              // skip the actionability checks: avoid, it hides real bugs
```

`check()` on checkboxes is better than `click()`: `check()` makes sure it ends up checked
(clicking an already-checked box would uncheck it).

---

## 4. Typing: `fill`, `clear`, `pressSequentially`

```ts
await page.getByLabel('Full name').fill('Jane Doe');        // replaces the whole value at once
await page.getByLabel('Full name').clear();                 // empties it (same as fill(''))
await page.getByLabel('Full name').pressSequentially(' Smith');                 // types key by key, adds
await page.getByLabel('Full name').pressSequentially('Jane', { delay: 100 });   // slowly, like a human
```

| Use | When |
|---|---|
| `fill('text')` | 95% of the time. Fast, replaces the value |
| `clear()` | Empty a field |
| `pressSequentially('text')` | The page reacts to every key (autocomplete, a search that filters as you type, input masks) |

`fill` always takes a **string**. Even for `<input type="number">`: `fill('30')`, not `fill(30)`.

---

## 5. Keys: `press` and `page.keyboard`

```ts
await page.getByLabel('New to-do').press('Enter');    // a key on THIS element (it gets focus first)
await page.getByLabel('Full name').press('Tab');      // move to the next field
await page.getByLabel('Full name').press('Control+A');// key combinations with +

await page.getByLabel('New to-do').focus();            // put the cursor in the field, no click
await page.keyboard.type('Read the docs');             // types wherever the focus is
await page.keyboard.press('Enter');
await page.keyboard.down('Shift');  /* ... */  await page.keyboard.up('Shift');
```

### 🧩 Anatomy

```
await locator.press('Enter')          ← focus THIS element, then press
await page.keyboard.press('Enter')    ← press on whatever has the focus now
```

Key names: `'Enter'`, `'Tab'`, `'Escape'`, `'Backspace'`, `'Delete'`, `'ArrowDown'`, `'ArrowUp'`, `'Home'`, `'End'`,
`'Control+A'`, `'Shift+Tab'`, `'Meta+C'` (Mac ⌘). Letters: `'a'`, `'A'`.

---

## 6. Checkboxes and radios

```ts
const terms = page.getByRole('checkbox', { name: 'I agree to the terms' });
await terms.check();          // ends checked (does nothing if already checked)
await terms.uncheck();        // ends unchecked
await terms.setChecked(true); // ends in the state you pass: true or false

await page.getByRole('radio', { name: 'Pro' }).check();  // radios: check only, the group unchecks the others
```

`setChecked(value)` is perfect when the state comes from **test data**:

```ts
const user = { name: 'Sam', wantsNewsletter: false };
await page.getByRole('checkbox', { name: 'Send me the newsletter' }).setChecked(user.wantsNewsletter);
```

---

## 7. Dropdowns: `selectOption`

```html
<select id="country">
  <option value="">Choose a country</option>
  <option value="br">Brazil</option>
  <option value="jp">Japan</option>
</select>
```

```ts
const country = page.getByLabel('Country');
await country.selectOption('br');                   // by VALUE (a plain string)
await country.selectOption({ label: 'Japan' });     // by the visible LABEL
await country.selectOption({ index: 1 });           // by position (rare)
await country.selectOption(['br', 'jp']);           // several, for <select multiple>

const selected = await country.selectOption('br');  // returns the selected VALUES: ['br']
await expect(country).toHaveValue('br');            // the select's value is the option VALUE
```

### 🗣️ Say it

> "**Await** country **select option** with **label** Japan."

A plain string matches an option whose value **or** label is that string. Use `{ label: '...' }` when you want to be explicit:
the label is what the user sees, the value is what the developers chose.

---

## 8. Hover and focus

```ts
await page.getByRole('button', { name: 'Hover me' }).hover();
await expect(page.getByRole('tooltip')).toHaveText('You found the tooltip!');

await page.getByLabel('Email').focus();
```

Use `hover()` for menus that open on mouse-over and for tooltips.

---

## 9. Uploading files: `setInputFiles`

```ts
const upload = page.getByLabel('Upload file');

await upload.setInputFiles('test-data/report.pdf');           // a real file (path from the project root)
await upload.setInputFiles(['a.png', 'b.png']);               // several files
await upload.setInputFiles({                                  // a file made in MEMORY: no file on disk
  name: 'report.txt',
  mimeType: 'text/plain',
  buffer: Buffer.from('all tests passed'),
});
await upload.setInputFiles([]);                               // remove the selection
```

### 🧩 Anatomy

```
{ name: 'report.txt', mimeType: 'text/plain', buffer: Buffer.from('all tests passed') }
         │                    │                         └ the file CONTENT, as bytes
         │                    └ the type of file (text/plain, image/png, application/pdf...)
         └ the file name the page will see
```

`setInputFiles` works on `<input type="file">` without opening the system file dialog.

---

## 10. Dialogs: `alert`, `confirm`, `prompt`

Browser dialogs block the page. By default **Playwright dismisses them** (like clicking Cancel).
To answer one, register a **listener before** the action that opens it:

```ts
page.once('dialog', (dialog) => dialog.accept());          // OK on alert / confirm
page.once('dialog', (dialog) => dialog.dismiss());         // Cancel
page.once('dialog', (dialog) => dialog.accept('Bruno'));   // type into a prompt, then OK

await page.getByRole('button', { name: 'Open confirm' }).click();
await expect(page.getByTestId('dialog-result')).toHaveText('You clicked: OK');
```

### 🧩 Anatomy

```
page.once( 'dialog' , (dialog) => dialog.accept('Bruno') );
      │        │         └─────────────┬────────────────┘
      │        │           an arrow function (module 03) Playwright calls
      │        │           with the dialog when it appears
      │        └ the event name
      └ once = only for the NEXT dialog (page.on = for every dialog)
```

### 🗣️ Say it

> "**Once** the page fires a **dialog**, take the dialog and **accept** it with Bruno."

Reading the dialog:

```ts
page.once('dialog', async (dialog) => {
  console.log(dialog.type());     // 'alert' | 'confirm' | 'prompt' | 'beforeunload'
  console.log(dialog.message());  // 'Are you sure?'
  await dialog.accept();
});
```

⚠️ Order matters: listener **first**, click **second**. If you click first, the dialog is already dismissed.

---

## 11. New tabs: the "start waiting, then click" pattern

A link with `target="_blank"` opens a new tab. You need a `Page` object for that tab:

```ts
const newTabPromise = page.waitForEvent('popup');   // 1. start waiting (NO await yet)
await page.getByRole('link', { name: 'Open products in a new tab' }).click();  // 2. trigger it
const newTab = await newTabPromise;                 // 3. now await: you get the new Page

await expect(newTab).toHaveURL(/products|login/);
await newTab.getByRole('heading').first().click();  // use it like `page`
await newTab.close();
```

Why not `await page.waitForEvent('popup')` first? Because it would wait forever: the click that opens the tab
comes on the NEXT line and never runs. Why not after the click? Because the tab may already be open, and you'd miss
the event. So: **start** the wait (a Promise, module 08), **do** the action, **then** await the Promise.

Any new tab in the context (not only popups from this page):

```ts
const pagePromise = context.waitForEvent('page');   // { page, context } fixtures
await page.getByRole('link', { name: 'Open products in a new tab' }).click();
const newPage = await pagePromise;
```

The same pattern works for downloads (`page.waitForEvent('download')`) and responses (`page.waitForResponse(...)`).

The new tab shares the **context** (cookies) with the old one: logged in in one tab = logged in in the other.

---

## 12. Full flows

```ts
test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');   // empty carts: every test starts from the same state
});

test('buy a backpack', async ({ page }) => {
  // log in
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/products/);

  // add to cart
  const backpack = page.getByTestId('product-card').filter({ hasText: 'Backpack' });
  await backpack.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');

  // checkout
  await page.getByRole('link', { name: /^Cart/ }).click();
  await page.getByRole('link', { name: 'Checkout' }).click();
  await page.getByLabel('First name').fill('Sam');
  await page.getByLabel('Last name').fill('Standard');
  await page.getByLabel('Postal code').fill('12345');
  await page.getByRole('button', { name: 'Place order' }).click();

  await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
  await expect(page.getByTestId('order-number')).toHaveText(/ORD-\d+/);
});
```

Notice the assertion **between** two steps: `cart-count` has the text `'1'`. QA Shop updates the cart after ~300 ms.
Waiting for the visible result of one step before the next step is how you make flows stable.

---

## 🎭 In Playwright you'll see

```ts
test('sign-up form', async ({ page }) => {
  await page.goto('/playground');
  await page.getByLabel('Full name').fill('Sam Standard');
  await page.getByLabel('Email').fill('sam@qa.shop');
  await page.getByLabel('Age').fill('30');
  await page.getByLabel('Country').selectOption({ label: 'Portugal' });
  await page.getByRole('radio', { name: 'Pro' }).check();
  await page.getByLabel('Start date').fill('2026-01-31');   // date inputs take 'YYYY-MM-DD'
  await page.getByLabel('Comments').fill('Created by an automated test');
  await page.getByRole('checkbox', { name: 'I agree to the terms' }).check();
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByTestId('form-result')).toContainText('"plan": "pro"');
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `TimeoutError: locator.click: Timeout 2000ms exceeded.` ... `- element is not enabled` | The element is `disabled` | Do the step that enables it first (check a box, fill a field) |
| `... - element is not visible` | Hidden (display none, `hidden`, size 0) | Open the menu / section first; check you have the right element |
| `Test timeout of 30000ms exceeded.` `Error: locator.click: Test timeout of 30000ms exceeded.` | The action waited for the whole test time | Read the call log: element not found? not enabled? |
| `Error: locator.fill: value: expected string, got number` | `fill(30)` | `fill('30')` |
| `Argument of type 'number' is not assignable to parameter of type 'string'.` | Same, said by TypeScript | Quotes around the value |
| `Error: locator.fill: Error: Element is not an <input>, <textarea>, <select> or [contenteditable] ...` | You tried to fill a button, a div... | Locate the input itself (`getByLabel`) |
| `Error: locator.fill: Error: Cannot type text into input[type=number]` | `fill('thirty')` on a number input | Use digits |
| `TimeoutError: locator.selectOption: Timeout ...` `- did not find some options` | No option with that value/label | Check the exact value or use `{ label: '...' }` |
| Dialog result says "Cancel" / "No name given" | No listener: Playwright dismissed the dialog | `page.once('dialog', ...)` **before** the click |
| `Error: locator.click: Target page, context or browser has been closed` | You used a tab after closing it (or after the test ended) | Check the order; `await` every step |
| `newTab` is waiting forever | You wrote `await page.waitForEvent('popup')` BEFORE the click | Store the Promise, click, then await it |

---

## ✍️ Type it (warm-up, 10 minutes)

1. `npm run app`, then `npx playwright codegen http://localhost:3000/playground`.
2. Record: fill the whole sign-up form (name, email, country, Pro, terms), Submit, add two to-dos, open the confirm dialog.
   Look at how codegen writes `selectOption`, `check` and the dialog handler.
3. In `my-katas/13-warmup.spec.ts`, **type** (don't paste):

```ts
import { test, expect } from '@playwright/test';

test('warm-up', async ({ page }) => {
  await page.goto('/playground');
  await page.getByLabel('Country').selectOption({ label: 'Brazil' });
  await page.getByRole('checkbox', { name: 'I agree to the terms' }).check();
  await page.getByLabel('New to-do').fill('Practise actions');
  await page.getByLabel('New to-do').press('Enter');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Open confirm' }).click();
  await expect(page.getByTestId('dialog-result')).toHaveText('You clicked: OK');
});
```

Run it: `npm run kata 13-warmup`. Then move the `page.once` line **below** the click and watch it fail.

## 🏋️ Exercises

```bash
npm run check 13
```

## 🥋 Kata

Close everything. In `my-katas/13-actions.spec.ts`, from memory:

1. `test.beforeEach` that resets QA Shop (`POST /api/reset` with the `request` fixture)
2. a test on `/playground` that fills the sign-up form (name, email, Country by label, plan Pro, terms), submits it and asserts `form-result` contains `"plan": "pro"`
3. a test that accepts the prompt with your name and asserts `dialog-result` says `Hello, <your name>!`
4. a test that logs in, adds the "Bike Light" to the cart, waits for `cart-count` to be `'1'`, goes to the cart and asserts the total `'Total: $9.99'`

Run it with `npm run kata 13`.

## 🧠 Remember

```ts
await loc.click();   await loc.fill('text');   await loc.clear();   await loc.press('Enter');
await loc.check();   await loc.uncheck();      await loc.setChecked(true);
await loc.selectOption('br');                  await loc.selectOption({ label: 'Brazil' });
await loc.hover();   await loc.setInputFiles({ name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') });
page.once('dialog', (dialog) => dialog.accept());          // BEFORE the click
const tabPromise = page.waitForEvent('popup'); await link.click(); const tab = await tabPromise;
```

## ✅ Done when

- [ ] `npm run check 13` is all green with 0 type errors
- [ ] You can explain the 5 actionability checks
- [ ] Kata done without looking
- [ ] `npm run drill`
