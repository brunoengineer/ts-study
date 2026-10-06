# Module 15 · Page Object Model

> **Why this matters for Playwright:** a real project has hundreds of tests that use the same pages.
> If 80 tests write `page.getByLabel('Username')` and the label changes, you fix 80 files.
> A **page object** puts the locators and steps of one page in ONE class. Change it once, every test follows.
> Almost every Playwright job uses this pattern, and you'll read page objects on your first day.

## 🎯 After this module you can

- Explain why page objects exist, and what goes in them (and what doesn't)
- Write a page class: `readonly page: Page`, `readonly` Locator properties set in the constructor, `async` methods
- Write methods that act (`login()`), navigate (`goto()`), and return data (`getProductNames()`)
- Share common parts with a `BasePage` (`extends`, `super`) and a `Header` component
- Write a **component object** that receives a root `Locator` (`ProductCard`)
- Return the **next page object** from navigation methods (`openCart(): Promise<CartPage>`)
- Decide where assertions live, and organise the files of a real project

---

## 1. The problem

Three tests, three copies of the same login steps:

```ts
test('add to cart', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  // ...
});
test('checkout', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');   // same 4 lines again
  // ...
});
```

With a page object:

```ts
test('add to cart', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret123');
  // ...
});
```

The test now reads like the test case in your test management tool: *go to login, log in, add to cart*.
**How** to find the username field lives in one place: `LoginPage`.

| Without page objects | With page objects |
|---|---|
| Locators copied in every test | Each locator written once |
| A UI change breaks many files | A UI change = one fix in one class |
| Tests full of `getByRole(...)` details | Tests read like steps: `login()`, `addToCart()` |
| Hard to reuse flows | `loginPage.login(...)` everywhere |

---

## 2. Anatomy of a page object

```ts
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### 🧩 Anatomy

```
export class LoginPage {                      ← export: other files can import it (module 10)
  readonly page: Page;                        ← a property: the browser tab. readonly = set once, never replaced
  readonly loginButton: Locator;              ← one property per element the tests need

  constructor(page: Page) {                   ← runs on `new LoginPage(page)`
    this.page = page;                         ← store the tab in the object
    this.loginButton = page.getByRole(...);   ← build the locators ONCE (no await: they're descriptions)
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);  ← inside the class, use this.something
  }
}
```

### 🗣️ Say it

> "Export class **LoginPage**. It has a readonly **page** of type Page and a readonly **loginButton** of type Locator.
> The **constructor** takes a page: **this.page** equals page; **this.loginButton** equals page get by role button Log in."

### Our style: explicit properties

In this course every page object **declares** its properties at the top and **sets** them in the constructor.
You will also see a shorter style in the wild, **parameter properties** (module 09):

```ts
export class LoginPage {
  readonly usernameInput: Locator;

  constructor(readonly page: Page) {           // `readonly page` here declares AND sets this.page in one go
    this.usernameInput = page.getByLabel('Username');
  }
}
```

Both work. We use the explicit style because the list of properties at the top is a "table of contents" of the page,
it works the same in every class (also with `extends` and `super`), and it's what the Playwright docs show.
When you see `constructor(readonly page: Page) {}` at work, read it as the same thing written shorter.

---

## 3. Using a page object in a test

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('standard user can log in', async ({ page }) => {
  const loginPage = new LoginPage(page);       // wrap the tab in a page object
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret123');
  await expect(page).toHaveURL(/products/);
});
```

### 🗣️ Say it

> "Constant **loginPage** equals **new LoginPage** with page. **Await** loginPage **go to**. **Await** loginPage **login** with standard user and secret 123."

The page object doesn't open a new browser. It **wraps** the same `page` the test received.

### Shared setup with `beforeEach`

```ts
test.describe('products', () => {
  let productsPage: ProductsPage;             // declared here...

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);    // ...created fresh for every test
    await productsPage.goto();
  });

  test('shows 6 products', async () => {
    expect(await productsPage.getProductNames()).toHaveLength(6);
  });
});
```

`let` because it gets a new value before every test (module 01). Later you'll see an even cleaner way:
**custom fixtures** (`test.extend`), where `async ({ productsPage }) =>` just works. Same idea, less code.

---

## 4. Three kinds of methods

```ts
// 1. Navigation: open the page
async goto(): Promise<void> {
  await this.page.goto('/products');
}

// 2. Actions: do something a user does. Name them like the user's intention
async search(term: string): Promise<void> {
  await this.searchBox.fill(term);
}

// 3. Queries: return DATA the test will check
async getProductNames(): Promise<string[]> {
  return this.cards.filter({ visible: true }).getByRole('heading').allTextContents();
}
```

| Kind | Returns | Example |
|---|---|---|
| navigation | `Promise<void>` | `goto()` |
| action | `Promise<void>` | `login(user, pass)`, `search('shirt')`, `sortBy('Price (low to high)')` |
| query | `Promise<string[]>`, `Promise<number>`... | `getProductNames()`, `getPrice()` |
| navigation to another page | `Promise<NextPage>` | `openCart(): Promise<CartPage>` (section 8) |

Every method that touches the browser is `async` and returns a `Promise`. So in the test, **await every call**:

```ts
const names = await productsPage.getProductNames();   // ✅ string[]
const names = productsPage.getProductNames();         // ❌ Promise<string[]>: "Received has value: Promise {}"
```

---

## 5. Where do assertions live?

| Where | What | Example |
|---|---|---|
| **In the test** (most of them) | The checks that ARE the test case: "the total is $59.98" | `await expect(cartPage.total).toHaveText('Total: $59.98');` |
| In the page object, small helpers | "Am I on the right page?" checks used by many tests | `async expectLoaded() { await expect(this.heading).toBeVisible(); }` |
| In the page object, waiting | Making an action "finished" before returning | `addToCart()` waits until the button says "Remove" |

Recommendation: **page objects know HOW, tests decide WHAT is correct.** A page object exposes locators and data;
the test asserts on them. If a page object asserts business rules (`expectTotalIs59()`), it stops being reusable.

```ts
// ✅ test decides
await expect(loginPage.errorMessage).toHaveText('Sorry, this user has been locked out.');

// ✅ fine: a reusable "loaded" check
async expectLoaded(): Promise<void> {
  await expect(this.page).toHaveURL(/\/products/);
  await expect(this.heading).toBeVisible();
}
```

To use `expect` inside a page object, import it: `import { expect, type Locator, type Page } from '@playwright/test';`

---

## 6. `BasePage` and the `Header` component

Every QA Shop page has the same header (nav, cart count, user name). Write it ONCE as a **component**:

```ts
export class Header {
  readonly root: Locator;
  readonly cartLink: Locator;
  readonly cartCount: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('navigation', { name: 'Main' });
    this.cartLink = this.root.getByRole('link', { name: /^Cart/ });   // searched INSIDE the nav
    this.cartCount = this.root.getByTestId('cart-count');
  }
}
```

Then a `BasePage` that every page **extends** (module 09):

```ts
export class BasePage {
  readonly page: Page;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
  }
}

export class CartPage extends BasePage {
  readonly rows: Locator;

  constructor(page: Page) {
    super(page);                                // FIRST: run BasePage's constructor (sets page + header)
    this.rows = page.getByTestId('cart-row');   // THEN: the things only CartPage has
  }
}
```

### 🧩 Anatomy

```
export class CartPage extends BasePage {     ← CartPage IS a BasePage, plus more
  constructor(page: Page) {
    super(page);                              ← call the parent constructor. Must come before any this.x
    this.rows = ...;
  }
}

cartPage.header.cartCount                     ← inherited property . component property
```

### 🗣️ Say it

> "Class **CartPage extends BasePage**. The constructor calls **super** with page, then sets **this.rows**."

Now every page has `.header` for free: `await expect(cartPage.header.cartCount).toHaveText('2');`

| | Inheritance (`extends`) | Composition (a property) |
|---|---|---|
| Says | "CartPage **is a** BasePage" | "every page **has a** Header" |
| Use for | what ALL pages share (`page`, `header`) | reusable pieces (header, product card, modal, table) |
| Keep it | shallow: one level is usually enough | as many components as you like |

---

## 7. Component objects with a root `Locator`

Some pieces repeat **many times on one page**: product cards, table rows, comments. A component object receives
the **root** locator of one piece and finds everything **inside** it:

```ts
export class ProductCard {
  readonly root: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly cartButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.name = root.getByRole('heading');
    this.price = root.locator('.price');
    this.cartButton = root.getByRole('button');
  }

  async getPrice(): Promise<number> {
    const text = await this.price.textContent();      // '$49.99' (or null)
    return Number((text ?? '').replace('$', ''));      // 49.99
  }
}
```

The page object creates them:

```ts
productCard(name: string): ProductCard {
  const card = this.cards.filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  return new ProductCard(card);
}
```

```ts
const card = productsPage.productCard('Fleece Jacket');
await expect(card.price).toHaveText('$49.99');
expect(await card.getPrice()).toBe(49.99);
```

`productCard()` is **not** `async`: it only builds locators, it doesn't touch the browser.
`{ name, exact: true }` is shorthand (module 05) for `{ name: name, exact: true }`.

---

## 8. Methods that return the next page object

When an action takes the user to another page, return the page object for that page:

```ts
// in ProductsPage
async openCart(): Promise<CartPage> {
  await this.header.cartLink.click();
  return new CartPage(this.page);              // same tab, new "view" of it
}

// in CartPage
async checkout(): Promise<CheckoutPage> {
  await this.checkoutLink.click();
  return new CheckoutPage(this.page);
}
```

The test then flows from page to page:

```ts
const cartPage = await productsPage.openCart();
const checkoutPage = await cartPage.checkout();
await checkoutPage.fillDetails('Sam', 'Standard', '12345');
const orderNumber = await checkoutPage.placeOrder();
```

TypeScript now knows what you can do on each step: type `cartPage.` and VS Code lists `rows`, `total`, `checkout()`...
That autocomplete is the best memory aid there is: you don't need to remember method names, just pick them from the list.

⚠️ Don't create import cycles: if `Header` imported `CartPage`, and `CartPage` (through `BasePage`) imported `Header`,
you'd get `ReferenceError: Cannot access 'BasePage' before initialization`. Keep "go to another page" methods in the page classes.

---

## 9. Organising the files

```
tests/
  pages/                    ← page objects: one class per file, file name = class name
    BasePage.ts
    Header.ts               ← components can live in pages/ or in components/
    LoginPage.ts
    ProductsPage.ts
    ProductCard.ts
    CartPage.ts
    CheckoutPage.ts
  login.spec.ts             ← tests: only steps + assertions
  cart.spec.ts
  checkout.spec.ts
```

In this module: `modules/15-page-object-model/pages/` (your work) and `exercises.spec.ts` (the tests that use them).

### What does NOT belong in a page object

- Test data (`'standard_user'` belongs in the test or a data file)
- `test(...)`, `test.beforeEach(...)`
- Business assertions ("total must be $59.98")
- Fixed waits (`waitForTimeout`)

---

## 🎭 In Playwright you'll see

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
});

test('a standard user can buy a backpack', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('standard_user', 'secret123');

  const productsPage = new ProductsPage(page);
  await productsPage.expectLoaded();
  await productsPage.productCard('Backpack').addToCart();
  await expect(productsPage.header.cartCount).toHaveText('1');

  const cartPage = await productsPage.openCart();
  expect(await cartPage.getItemNames()).toEqual(['Backpack']);
  await expect(cartPage.total).toHaveText('Total: $29.99');

  const checkoutPage = await cartPage.checkout();
  await checkoutPage.fillDetails('Sam', 'Standard', '12345');
  expect(await checkoutPage.placeOrder()).toMatch(/^ORD-\d+$/);
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Property 'passwordInput' has no initializer and is not definitely assigned in the constructor.` | You declared a property but never set it in the constructor | `this.passwordInput = page.getByLabel('Password');` |
| `TypeError: Cannot read properties of undefined (reading 'fill')` | Same, at runtime: the property is `undefined` | Set it in the constructor |
| `Error: toHaveText can be only used with Locator object, was called with undefined` | You passed a property that was never set to `expect` | Set it in the constructor |
| `Cannot find name 'page'. Did you mean the instance member 'this.page'?` | Inside a method you wrote `page` instead of `this.page` | Use `this.` for everything stored in the object |
| `A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.` | The method says it returns `Promise<string[]>` (or `CartPage`) but has no `return` | Add the `return ...;` |
| `Constructors for derived classes must contain a 'super' call.` | A class that `extends` forgot `super(page)` | Add `super(page);` as the first line |
| `'super' must be called before accessing 'this' in the constructor of a derived class.` | `this.x = ...` came before `super(page)` | Move `super(page);` to the top |
| `Received has value: Promise {}` | You forgot `await` before a page object method | `await productsPage.getProductNames()` |
| `ReferenceError: Cannot access 'BasePage' before initialization` | Circular imports between page files | Remove the cycle (section 8) |

---

## ✍️ Type it (warm-up, 10 minutes)

Create `my-katas/15-warmup.spec.ts` and **type** (don't paste) a page object and a test in the same file:

```ts
import { test, expect, type Locator, type Page } from '@playwright/test';

class CounterSection {
  readonly page: Page;
  readonly incrementButton: Locator;
  readonly value: Locator;

  constructor(page: Page) {
    this.page = page;
    this.incrementButton = page.getByRole('button', { name: 'Increment' });
    this.value = page.getByTestId('counter');
  }

  async goto(): Promise<void> {
    await this.page.goto('/playground');
  }

  async increment(times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.incrementButton.click();
    }
  }
}

test('counter page object', async ({ page }) => {
  const counter = new CounterSection(page);
  await counter.goto();
  await counter.increment(3);
  await expect(counter.value).toHaveText('3');
});
```

Run it: `npm run kata 15-warmup`. Then add a `decrementButton` and a `decrement(times)` method yourself.

## 🏋️ Exercises

```bash
npm run check 15
```

This time most of your work is in `modules/15-page-object-model/pages/*.ts`. The failing test tells you which method
to write (`📝 TODO: ProductsPage.search() in ...`). Ctrl+click the file name in the error to jump there.

## 🥋 Kata

Close everything. Create `my-katas/pages/TodoPage.ts` and `my-katas/15-pom.spec.ts`, from memory:

1. `TodoPage` with `readonly page: Page`, `readonly newTodoInput`, `readonly items` (the list items of the list "To-do items")
   and `readonly count` (test id `todo-count`), all set in the constructor
2. methods `goto()` (opens `/playground`), `add(text: string)` (fill + press Enter) and `getItems(): Promise<string[]>`
3. in the spec: `let todoPage: TodoPage;` and a `beforeEach` that creates it and calls `goto()`
4. a test that adds 3 to-dos and asserts `todoPage.items` has a count of 3 and `todoPage.count` has the text `'3 items'`
5. bonus: a `Header` component used by `TodoPage` through a `BasePage`

Run it with `npm run kata 15`.

## 🧠 Remember

```ts
export class CartPage extends BasePage {
  readonly rows: Locator;                              // declare
  constructor(page: Page) {
    super(page);                                       // parent first (sets this.page, this.header)
    this.rows = page.getByTestId('cart-row');          // set locators once
  }
  async checkout(): Promise<CheckoutPage> {            // async method -> Promise
    await this.checkoutLink.click();
    return new CheckoutPage(this.page);                // return the next page object
  }
}
// test:  const cartPage = new CartPage(page);  await cartPage.goto();  await expect(cartPage.rows).toHaveCount(1);
```

## ✅ Done when

- [ ] `npm run check 15` is all green with 0 type errors (pages included)
- [ ] You can explain where assertions belong
- [ ] Kata done without looking
- [ ] `npm run drill`
