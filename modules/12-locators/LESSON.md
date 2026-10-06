# Module 12 · Locators

> **Why this matters for Playwright:** every action and every assertion starts with "find the element".
> Good locators make tests that survive redesigns. Bad locators make flaky tests that break every sprint.
> This module is the one you'll come back to the most.

## 🎯 After this module you can

- Explain what a locator is (a *description*, not an element) and why creating one needs no `await`
- Use the user-facing locators: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, plus `getByTestId`
- Use the options `name`, `exact`, `level` and regex names
- Chain locators (a locator inside a locator) and `filter` them with `hasText`, `has`, `hasNot`, `hasNotText`
- Pick one of many with `first()`, `last()`, `nth()`, and count them with `count()`
- Read and fix a **strict mode violation**
- Read text with `textContent()`, `innerText()`, `allTextContents()`
- Choose the right locator with the priority table, and find accessible names in DevTools and with "Pick locator"

---

## 1. A locator is a description, not an element

```ts
const loginButton = page.getByRole('button', { name: 'Log in' });  // no await: nothing happens yet
await loginButton.click();                                          // NOW Playwright looks for it
```

A locator is like a sentence: "the button called Log in". Playwright only goes looking when you **use** it
(click, fill, expect...), and it looks **again** every time. If the page re-renders, the locator still works.

| Line | Touches the browser? | `await`? |
|---|---|---|
| `const btn = page.getByRole('button', { name: 'Add' });` | ❌ only describes | no |
| `await btn.click();` | ✅ | yes |
| `await expect(btn).toBeVisible();` | ✅ | yes |
| `const n = await btn.count();` | ✅ | yes |

### 🗣️ Say it

> "Constant **loginButton** equals page **get by role** button, **name** 'Log in'." (no await: it's just a description)

---

## 2. `getByRole`: the first choice

```ts
page.getByRole('button', { name: 'Log in' })
page.getByRole('link', { name: 'Products' })
page.getByRole('heading', { name: 'Employees', level: 2 })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('checkbox', { name: 'I agree to the terms' })
page.getByRole('radio', { name: 'Pro' })
page.getByRole('combobox', { name: 'Country' })      // a <select>
page.getByRole('table', { name: 'Employees' })
page.getByRole('row')  page.getByRole('cell', { name: 'QA' })
page.getByRole('listitem')  page.getByRole('list', { name: 'To-do items' })
page.getByRole('alert')                                // error messages with role="alert"
```

### 🧩 Anatomy

```
page.getByRole( 'heading' , { name: 'Employees' , exact: true , level: 2 } )
                    │               │                  │            └ only for headings: <h2>
                    │               │                  └ the WHOLE name must match (default: false)
                    │               └ the accessible name: a string or a /regex/
                    └ the role: what kind of element
```

### 🗣️ Say it

> "Page **get by role** heading, **name** Employees, **level** 2."

### How `name` matches

| You write | Matches the names | Why |
|---|---|---|
| `{ name: 'Open' }` | "Open alert", "Open confirm", "Open prompt" | default: **contains**, ignoring upper/lower case |
| `{ name: 'Open', exact: true }` | nothing | exact: the whole name, same case |
| `{ name: /^Open (alert\|prompt)$/ }` | "Open alert", "Open prompt" | a regex gives you full control |

### Where does the name come from?

The **accessible name** is what a screen reader says. For a button it's its text. For an input it's its `<label>`.
An `aria-label="Delete Buy milk"` replaces the text. A table gets its name from `aria-label` or a `<caption>`.

### Common roles

| HTML | Role |
|---|---|
| `<button>`, `<input type="submit">` | `button` |
| `<a href>` | `link` |
| `<h1>`...`<h6>` | `heading` (with `level`) |
| `<input>` (text, email), `<textarea>` | `textbox` |
| `<input type="search">` | `searchbox` |
| `<input type="number">` | `spinbutton` |
| `<input type="checkbox">` / `radio` | `checkbox` / `radio` |
| `<select>` | `combobox` |
| `<table>`, `<tr>`, `<td>`, `<th>` | `table`, `row`, `cell`, `columnheader` |
| `<ul>`/`<ol>`, `<li>` | `list`, `listitem` |
| `<nav>` | `navigation` |
| `role="alert"` | `alert` |
| `<input type="password">` | ⚠️ **none**: use `getByLabel('Password')` |

---

## 3. The other user-facing locators

```ts
page.getByLabel('Email')                        // the input whose <label> says "Email"
page.getByPlaceholder('What needs to be done?') // the input with that placeholder
page.getByText('Loaded after a delay!')          // an element by its visible text
page.getByText('QA', { exact: true })            // exact text only
page.getByText(/hello, sam/i)                    // regex, i = ignore case
page.getByTestId('cart-count')                   // data-testid="cart-count"
page.getByAltText('QA Shop logo')                // <img alt="...">  (QA Shop has no images)
page.getByTitle('Close')                         // title="Close" attribute
```

### `getByText` matches parts of texts

`page.getByText('QA')` on the playground finds **3** elements: the two "QA" cells in the Employees table,
**and** the "QA Shop" link in the header. Add `{ exact: true }` and only the 2 cells are left.
Same rule as `name`: by default it's "contains, ignoring case".

### `getByTestId`: a contract with the developers

`data-testid` attributes exist only for tests. They don't change when the text or the design changes.
Use them when there's no good user-facing way: a counter, a status, a total.

```html
<span data-testid="cart-count">0</span>
```
```ts
await expect(page.getByTestId('cart-count')).toHaveText('0');
```

---

## 4. CSS (and XPath): the last resort

```ts
page.locator('.price')                 // class
page.locator('#locked-button')         // id
page.locator('[data-id="3"]')          // attribute
page.locator('li.product-card h2')     // descendant
page.locator('//button[text()="Add"]') // XPath (starts with //), avoid
```

CSS depends on how the page is **built**, not on what the user **sees**. A developer renames a class and
your test breaks while the page still works perfectly. Use it when nothing else fits (like `.price` inside a card).

---

## 5. The locator priority table

| Priority | Locator | Example | Why |
|---|---|---|---|
| 1 | `getByRole` | `getByRole('button', { name: 'Log in' })` | What users and screen readers see. Also tests accessibility |
| 2 | `getByLabel` | `getByLabel('Password')` | Form fields: the label is what the user reads |
| 3 | `getByPlaceholder` | `getByPlaceholder('Jane Doe')` | When there is no label |
| 4 | `getByText` | `getByText('Your cart is empty.')` | Non-interactive text: messages, paragraphs |
| 5 | `getByAltText` / `getByTitle` | `getByAltText('logo')` | Images, tooltips |
| 6 | `getByTestId` | `getByTestId('cart-total')` | Stable contract, when there is no user-facing option |
| 7 | `locator('css')` | `locator('.price')` | Last resort, ideally **scoped** inside a better locator |

---

## 6. Chaining: a locator inside a locator

```ts
const table = page.getByRole('table', { name: 'Employees' });
const rows = table.getByRole('row');               // only rows INSIDE this table
const nav = page.getByRole('navigation', { name: 'Main' });
await nav.getByRole('link', { name: 'Products' }).click();
```

### 🧩 Anatomy

```
page.getByRole('table', { name: 'Employees' }) .getByRole('row')
└────────────────┬───────────────────────────┘ └──────┬───────┘
          search area (the parent)              what to find INSIDE it
```

### 🗣️ Say it

> "Inside the **table** Employees, get by role **row**."

Chaining is how you make a vague locator precise: "the Edit button" → "the Edit button **in Eva's row**".

---

## 7. `filter`: keep only some of the matches

```ts
const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');

rows.filter({ hasText: 'Carla Souza' })                              // rows containing this text
rows.filter({ hasNotText: 'QA' })                                    // rows NOT containing it
rows.filter({ has: page.getByRole('button') })                       // rows that CONTAIN a button
rows.filter({ hasNot: page.getByRole('cell', { name: 'QA' }) })      // rows WITHOUT a QA cell
rows.filter({ hasText: /^Bruno/ })                                   // regex works too
page.getByTestId('product-card').filter({ visible: true })           // only the visible ones
```

### 🧩 Anatomy

```
rows.filter( { hasText: 'Carla Souza' } ).getByRole('button', { name: 'Edit' }).click();
 │      │      └────────┬────────────┘   └──────────────┬──────────────────┘
 │      │      the condition              then go INSIDE the row that is left
 │      └ keep only some
 └ many rows
```

### 🗣️ Say it

> "Rows, **filter** has text 'Carla Souza', then get by role button Edit, **click**."

| Option | Keeps the elements that... | Value |
|---|---|---|
| `hasText` | contain this text somewhere inside | string or regex |
| `hasNotText` | do NOT contain this text | string or regex |
| `has` | contain an element matching this locator | a locator (start it from `page`) |
| `hasNot` | do NOT contain such an element | a locator |
| `visible` | are visible (`true`) or hidden (`false`) | boolean |

⚠️ `hasNotText: 'QA'` on table rows also keeps the **header row** (it doesn't contain "QA").
Use `has: page.getByRole('button')` (or `has: page.getByRole('cell')`) to keep only data rows.

---

## 8. One of many: `first()`, `last()`, `nth()`, and `count()`

```ts
const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
rows.first()    // the header row
rows.nth(1)     // the 2nd row: Alice. nth starts at 0!
rows.last()     // Eva

const n = await rows.count();   // 6 (await: it asks the page)
```

`nth()` depends on **order**. If the order changes (sorting, a new item), the test clicks the wrong thing
without failing. Prefer `filter` when you can describe the element ("the row with Eva").
Use `first()`/`nth()` when the position IS what you test ("the first product after sorting by price").

---

## 9. Strict mode: one action, one element

Actions (`click`, `fill`, `check`...) and most assertions need **exactly one** element.
If your locator matches more, Playwright refuses to guess:

```ts
await page.getByRole('button', { name: 'Edit' }).click();
```

```
Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Edit' }) resolved to 5 elements:
    1) <button>Edit</button> aka getByRole('button', { name: 'Edit' }).first()
    2) <button>Edit</button> aka getByRole('button', { name: 'Edit' }).nth(1)
    3) <button>Edit</button> aka getByRole('button', { name: 'Edit' }).nth(2)
    4) <button>Edit</button> aka getByRole('button', { name: 'Edit' }).nth(3)
    5) <button>Edit</button> aka getByRole('button', { name: 'Edit' }).nth(4)
```

This is a **good** error: it saves you from clicking the wrong button. Fix it by making the locator more precise:

```ts
await page.getByRole('row').filter({ hasText: 'Eva Rocha' }).getByRole('button', { name: 'Edit' }).click();
```

Don't fix it with `.first()` unless you really mean "the first one".

Strict mode does NOT apply to methods made for many elements: `count()`, `allTextContents()`, `toHaveCount()`, `filter()`.

---

## 10. Reading text from elements

```ts
await page.getByTestId('todo-count').textContent();     // '0 items'  (raw text, also hidden parts)
await page.getByTestId('todo-count').innerText();       // '0 items'  (text as rendered)
await rows.nth(1).getByRole('cell').allTextContents();  // ['Alice Martins', 'QA', '5200', 'Edit']
await rows.allInnerTexts();                             // one string per row
await page.getByLabel('Email').inputValue();            // the value typed in an input
```

| Method | Returns | Notes |
|---|---|---|
| `textContent()` | `string \| null` | raw text, keeps spaces/newlines from the HTML |
| `innerText()` | `string` | the text as the user sees it (layout-aware) |
| `allTextContents()` | `string[]` | one per matched element, **no strict mode** |
| `allInnerTexts()` | `string[]` | same, with innerText |
| `inputValue()` | `string` | for `<input>`, `<textarea>`, `<select>` |

These read the value **once**. They are for collecting data (a list of names, a price to compare).
To CHECK text, use `await expect(locator).toHaveText(...)`, which waits and retries (module 14).

---

## 11. `or()` and `and()` (light)

```ts
// Either one: useful when the page shows A or B
const cartButton = page.getByRole('button', { name: 'Add to cart' })
  .or(page.getByRole('button', { name: 'Sold out' }));

// Both conditions on the SAME element
const saveButton = page.getByRole('button').and(page.getByTitle('Save'));
```

---

## 12. Finding accessible names and good locators

1. **"Pick locator"** (the best one): run `npx playwright codegen http://localhost:3000/playground`,
   click the 🎯 "Pick locator" button in the Inspector, then hover over the page. Playwright shows the locator it
   would use. Click to copy it. The same button exists in UI mode (`npm run check 12 ui`) and in `page.pause()`.
2. **DevTools** (F12): Elements → select the element → the **Accessibility** tab (Chrome) shows **Role** and **Name**.
   This is exactly what `getByRole` uses.
3. **The Playwright VS Code extension** has "Pick locator" too.

Then **test your locator** in the DevTools console while the Inspector is open:
`playwright.locator('...')` or in UI mode, type it in the "Locator" field and see what lights up.

---

## 🎭 In Playwright you'll see

```ts
test('edit an employee from the table', async ({ page }) => {
  await page.goto('/playground');

  const table = page.getByRole('table', { name: 'Employees' });
  const evaRow = table.getByRole('row').filter({ hasText: 'Eva Rocha' });

  await expect(evaRow).toContainText('Development');
  await evaRow.getByRole('button', { name: 'Edit' }).click();

  await expect(page.getByTestId('table-result')).toHaveText('Editing Eva Rocha');
});

test('product card shows the right price', async ({ page }) => {
  // ...logged in, on /products
  const card = page.getByTestId('product-card').filter({ hasText: 'Backpack' });
  await expect(card.getByRole('heading')).toHaveText('Backpack');
  await expect(card.locator('.price')).toHaveText('$29.99');
  await expect(card.getByRole('button', { name: 'Add to cart' })).toBeEnabled();
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Error: locator.click: Error: strict mode violation: getByRole('button', { name: 'Edit' }) resolved to 5 elements` | Your locator matches several elements, and an action needs one | Chain / `filter` to make it unique (or `exact: true`) |
| `Error: expect(locator).toBeVisible() failed` `Error: element(s) not found` | Nothing matches: typo in the name, wrong role, element on another page | Check role + name with "Pick locator" or the Accessibility tab |
| `Test timeout of 30000ms exceeded.` `Error: locator.click: Test timeout of 30000ms exceeded.` `- waiting for getByRole('button', { name: 'Logn' })` | The click waited (until the whole test timed out) for an element that never appeared | Same: fix the locator |
| `getByRole('textbox', { name: 'Password' })` finds nothing | Password inputs have no role | `getByLabel('Password')` |
| `getByText('QA')` finds more than you think | `getByText` and `name` match **parts** of texts, ignoring case | `{ exact: true }` or a regex `/^QA$/` |
| `rows.filter({ hasNotText: 'QA' })` gives one row too many | The header row matches too | Filter by `has: page.getByRole('button')` or another real cell |
| `Expected: 5` `Received: Promise {}` | `count()` without `await` | `const n = await locator.count();` |
| `await page.getByRole(...)` with no action | Harmless but useless: creating a locator does nothing | Remove the `await`, or add the action |

---

## ✍️ Type it (warm-up, 10 minutes)

1. `npm run app`, open http://localhost:3000/playground, press F12.
2. Click the "Edit" button of Carla Souza in the Elements tab, open the **Accessibility** tab: read its role and name.
3. Run `npx playwright codegen http://localhost:3000/playground`. Use **Pick locator** on: the Email field, the "Pro" radio,
   the to-do input, Carla's Edit button. Write down what Playwright suggests.
4. In `my-katas/12-warmup.spec.ts`, **type** (don't paste):

```ts
import { test, expect } from '@playwright/test';

test('warm-up', async ({ page }) => {
  await page.goto('/playground');
  const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
  console.log(await rows.count());
  console.log(await rows.filter({ hasText: 'QA' }).allInnerTexts());
  await rows.filter({ hasText: 'Diego Lima' }).getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByTestId('table-result')).toHaveText('Editing Diego Lima');
});
```

Run it with `npm run kata 12-warmup`. Then break it: remove the `filter` and read the strict mode violation.

## 🏋️ Exercises

```bash
npm run check 12
```

## 🥋 Kata

Close everything. In `my-katas/12-locators.spec.ts`, from memory, write one test on `/playground` that:

1. fills the field labelled "Full name" with your name, and the field with placeholder "What needs to be done?" with "Learn locators"
2. creates `const rows` = the rows of the table "Employees"
3. asserts `rows` has a count of 6
4. clicks the Edit button in the row with "Bruno Costa" and asserts `table-result` has the text "Editing Bruno Costa"
5. asserts that the rows that have a cell named exactly "Development" have a count of 2

Run it with `npm run kata 12`.

## 🧠 Remember

```ts
page.getByRole('button', { name: 'Log in' })                // 1st choice. name = contains, ignores case
page.getByRole('heading', { name: 'Cart', exact: true, level: 1 })
page.getByLabel('Email')  page.getByPlaceholder('...')  page.getByText('...')  page.getByTestId('id')
table.getByRole('row')                                      // chain: inside table
rows.filter({ hasText: 'Eva' })  rows.filter({ has: page.getByRole('button') })
rows.first()  rows.nth(1)  rows.last()  await rows.count()
// strict mode: actions need ONE element -> make the locator precise
```

## ✅ Done when

- [ ] `npm run check 12` is all green with 0 type errors
- [ ] You used "Pick locator" and the Accessibility tab at least once
- [ ] Kata done without looking
- [ ] `npm run drill`
