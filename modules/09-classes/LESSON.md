# Module 09 · Classes

> **Why this matters for Playwright:** the most popular way to organise Playwright tests is the
> **Page Object Model** (module 15): one class per page, like `LoginPage` with a `login()` method.
> API clients, test-data builders and custom reporters are classes too. This module teaches the syntax
> with fake pages (no browser), so module 15 can focus on the pattern.

## 🎯 After this module you can

- Write a class with properties, a `constructor` and methods, and create objects with `new`
- Use `this` correctly (and fix the "lost `this`" bug)
- Use `public`, `private`, `protected` and `readonly`
- Write the **parameter property** shortcut: `constructor(private readonly page: Page) {}`
- Write getters (`get total()`) and `static` members
- Extend a class (`extends` / `super`): the `BasePage` idea
- Make a class `implements` an interface, and check objects with `instanceof`

---

## 1. Why classes?

So far you used plain objects and functions. A **class** is a *blueprint* that bundles
**data** (properties) and **behaviour** (methods) together. You create as many objects from it as you want.

```ts
class Cart {
  items: string[] = [];             // a property (data), starts empty

  add(name: string): void {         // a method (behaviour)
    this.items.push(name);
  }

  count(): number {
    return this.items.length;
  }
}

const cart = new Cart();   // create an object (an "instance") from the blueprint
cart.add('Backpack');
cart.count();              // 1
```

---

## 2. Properties, the constructor, `this`

```ts
class TestUser {
  username: string;
  role: string;

  constructor(username: string, role: string) {
    this.username = username;
    this.role = role;
  }

  describe(): string {
    return `${this.username} (${this.role})`;
  }
}

const admin = new TestUser('admin', 'admin');
admin.describe();   // 'admin (admin)'
```

### 🧩 Anatomy

```
class TestUser {                       ← class name: PascalCase
  username: string;                    ← property declaration: name + type
                                       
  constructor(username: string) {      ← runs ONCE, when you write `new TestUser(...)`
    this.username = username;          ← this.username = the property
  }                                       username      = the parameter

  describe(): string {                 ← a method: a function that belongs to the object
    return this.username;              ← `this` = "the object this method was called on"
  }
}
```

### 🗣️ Say it

`const admin = new TestUser('admin', 'admin');`
> "constant admin equals a **new** TestUser, with 'admin' and 'admin'"

`this.username = username;`
> "**this object's** username equals the username parameter"

**Inside a class, you always reach the object's own things through `this.`**. Forgetting `this.` is the most common class bug:
`username = username` just assigns the parameter to itself, and the property stays `undefined`.

---

## 3. `new` creates independent objects

```ts
const cartA = new Cart();
const cartB = new Cart();
cartA.add('Backpack');
cartA.count();   // 1
cartB.count();   // 0   ← each object has its OWN items
```

Forgetting `new`:

```ts
const cart = Cart();
// TypeScript: Value of type 'typeof Cart' is not callable. Did you mean to include 'new'?
// Runtime:    TypeError: Class constructor Cart cannot be invoked without 'new'
```

---

## 4. `public`, `private`, `protected`, `readonly`

| Keyword | Who can read it? | Who can change it? |
|---|---|---|
| `public` (the default) | everyone | everyone |
| `private` | only code **inside this class** | only inside this class |
| `protected` | this class **and classes that extend it** | the same |
| `readonly` | (combine with the others) | nobody after the constructor |

```ts
class TestUser {
  readonly username: string;
  private password: string;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  checkPassword(attempt: string): boolean {
    return attempt === this.password;    // ✅ inside the class: allowed
  }
}

const user = new TestUser('admin', 'admin123');
user.password;           // ❌ Property 'password' is private and only accessible within class 'TestUser'.
user.username = 'x';     // ❌ Cannot assign to 'username' because it is a read-only property.
```

> `private` and `readonly` are **TypeScript-only** checks. At runtime the value is still there.
> (JavaScript has its own truly private fields with `#`: `#password`. You'll see both. Playwright code usually uses `private`.)

**Why bother?** `private` hides details so tests use the class the intended way (`login()`, not poking at internals).
`readonly` protects things that must never change, like the `page` of a page object.

---

## 5. Parameter properties: the page-object shortcut

Declaring a property + a constructor parameter + `this.x = x` is so common that TypeScript has a shortcut.
Put an access keyword **in front of the constructor parameter**:

```ts
// LONG version
class ProductsPage {
  private readonly page: FakePage;
  constructor(page: FakePage) {
    this.page = page;
  }
}

// SHORT version: exactly the same result
class ProductsPage {
  constructor(private readonly page: FakePage) {}
}
```

### 🧩 Anatomy

```
constructor(  private readonly  page  :  FakePage  )  {}
              └──────┬───────┘   │        └───┬───┘   └┬┘
       "also make this a          name       type    empty body: nothing else to do
        property of the object"
```

### 🗣️ Say it

> "the constructor takes a **private readonly page** of type Page, and stores it on the object"

You'll write this line in every page object: `constructor(private readonly page: Page) {}`.
Then every method can use `this.page`.

---

## 6. Getters: a method that looks like a property

```ts
class Cart {
  items: { name: string; price: number }[] = [];

  get total(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

cart.total;     // ✅ no parentheses: it reads like a property
cart.total();   // ❌ This expression is not callable because it is a 'get' accessor. Did you mean to use it without '()'?
                //    Runtime: TypeError: cart.total is not a function
```

### 🧩 Anatomy

```
get  total ( ) : number  {  return ...;  }
 │                                        
 └── "when someone reads cart.total, run this and give back the result"
```

Use a getter for a value that is **calculated** from other data (a total, a count, a full name).

---

## 7. `static`: belongs to the class, not to the objects

```ts
class TestUser {
  static readonly DEFAULT_PASSWORD = 'secret123';

  constructor(readonly username: string, readonly password: string) {}

  static standard(): TestUser {
    return new TestUser('standard_user', TestUser.DEFAULT_PASSWORD);
  }
}

TestUser.DEFAULT_PASSWORD;          // 'secret123'   (on the CLASS)
const user = TestUser.standard();   // a "factory" method: a nice way to build test data
```

| | Instance member | `static` member |
|---|---|---|
| Belongs to | each object | the class itself |
| Used as | `user.username` | `TestUser.DEFAULT_PASSWORD` |
| Typical use | the object's own data | constants, counters, factory methods (`TestUser.admin()`) |

---

## 8. Inheritance: `extends` and `super`

Pages share things: every page has a `page`, a path and an `open()` method. Put the shared part in a **base class**:

```ts
type FakePage = { visited: string[]; goto(url: string): Promise<void> };

class BasePage {
  constructor(protected readonly page: FakePage, readonly path: string) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }
}

class LoginPage extends BasePage {
  constructor(page: FakePage) {
    super(page, '/login');                 // call the BasePage constructor FIRST
  }

  async login(username: string, password: string): Promise<void> {
    await this.open();                     // inherited from BasePage
    // ... fill the form with this.page
  }
}
```

### 🧩 Anatomy

```
class LoginPage  extends  BasePage {      ← LoginPage gets everything BasePage has
  constructor(page: FakePage) {
    super(page, '/login');                ← runs BasePage's constructor. MUST come before any `this`
  }
}
```

### 🗣️ Say it

> "class LoginPage **extends** BasePage. Its constructor calls **super** with the page and '/login'."

- A child class can **override** a method: write a method with the same name, and the child's version wins.
- Inside an override, `super.methodName()` calls the parent's version.
- Without `super(...)` in a child constructor: `Constructors for derived classes must contain a 'super' call.`
  At runtime: `ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor`.

> Don't build tall towers (`BasePage → ShopPage → ProductPage → ...`). One base class is usually enough.
> Many teams prefer small page objects with no inheritance at all.

---

## 9. `implements`: a class that promises a shape

An interface (module 05) describes a shape. `implements` makes TypeScript check that the class has it:

```ts
interface Reporter {
  onTestEnd(title: string, status: string): void;
  summary(): string;
}

class CountingReporter implements Reporter {
  private passed = 0;
  onTestEnd(title: string, status: string): void {
    if (status === 'passed') this.passed++;
  }
  summary(): string {
    return `${this.passed} passed`;
  }
}
```

If a method is missing:

```
Class 'CountingReporter' incorrectly implements interface 'Reporter'.
  Property 'summary' is missing in type 'CountingReporter' but required in type 'Reporter'.
```

🎭 Real Playwright: a **custom reporter** is a class that `implements Reporter` from `@playwright/test/reporter`.

---

## 10. `instanceof` and classes as types

A class name is also a **type**: `const page: LoginPage = new LoginPage(fake);`

`instanceof` asks "was this object made by this class (or a child of it)?":

```ts
const login = new LoginPage(fake);
login instanceof LoginPage;   // true
login instanceof BasePage;    // true  (LoginPage extends BasePage)
```

You already used it in module 06: `if (error instanceof Error)`. You can make your own error classes:

```ts
class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

try {
  throw new ApiError(404, 'Product not found');
} catch (error) {
  if (error instanceof ApiError) console.log(error.status);   // 404
}
```

---

## 11. The lost `this`

`this` is decided by **how a method is called**, not where it was written:

```ts
const cart = new Cart();
cart.add('Backpack');                   // ✅ this = cart

['Backpack', 'Bike Light'].forEach(cart.add);
// 💥 TypeError: Cannot read properties of undefined (reading 'items')
// forEach calls add() "alone", without `cart.` in front, so `this` is undefined.

['Backpack', 'Bike Light'].forEach((name) => cart.add(name));   // ✅ wrap it in an arrow
```

**Rule:** when you pass a method somewhere else, wrap it in an arrow function: `(x) => obj.method(x)`.

---

## 🎭 In Playwright you'll see

```ts
import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.error = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.error).toHaveText(message);
  }
}

// in a test:
test('locked user sees an error', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('locked_user', 'secret123');
  await loginPage.expectError('Sorry, this user has been locked out.');
});
```

Everything from this module is in there: properties with types, `readonly`, a parameter property,
`async` methods (module 08), `this.`, and `new`.

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Property 'name' has no initializer and is not definitely assigned in the constructor.` | A declared property never gets a value (often: `name = name` instead of `this.name = name`) | Assign `this.name = name` in the constructor, or give a default |
| `Value of type 'typeof Cart' is not callable. Did you mean to include 'new'?` / `TypeError: Class constructor Cart cannot be invoked without 'new'` | You called the class like a function | `new Cart()` |
| `Property 'password' is private and only accessible within class 'TestUser'.` | You used a private member from outside | Use a public method instead |
| `Cannot assign to 'username' because it is a read-only property.` | You changed a `readonly` | Create a new object instead |
| `Constructors for derived classes must contain a 'super' call.` | A child constructor without `super(...)` | Call `super(...)` as the first line |
| `ReferenceError: Must call super constructor in derived class before accessing 'this'...` | Same, at runtime | Same |
| `Class 'X' incorrectly implements interface 'Y'. Property 'z' is missing...` | The class doesn't have everything the interface asks for | Add the missing member |
| `This expression is not callable because it is a 'get' accessor. Did you mean to use it without '()'?` / `TypeError: cart.total is not a function` | You called a getter with `()` | Read it without `()`: `cart.total` |
| `TypeError: Cannot read properties of undefined (reading 'items')` in a method | Lost `this`: the method was passed around without its object | Wrap it: `(x) => cart.add(x)` |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
class Counter {
  private count = 0;
  constructor(readonly name: string) {}

  increment(): void {
    this.count++;
  }

  get value(): number {
    return this.count;
  }
}

const clicks = new Counter('clicks');
clicks.increment();
clicks.increment();
console.log(clicks.name, clicks.value, clicks instanceof Counter);
```

Then break it: remove `this.` from `this.count++`, call `Counter('x')` without `new`, and read `clicks.count`. Read each red squiggle.

## 🏋️ Exercises

```bash
npm run check 09
```

## 🥋 Kata

Close everything. In `my-katas/09-classes.spec.ts`, from memory:

1. A class `Cart` with a property `items: string[] = []`, a method `add(name: string): void`, and a getter `count` that returns the number of items
2. A class `BasePage` with `constructor(protected readonly path: string) {}` and a method `url(): string` that returns `` `http://localhost:3000${this.path}` ``
3. A class `CartPage extends BasePage` whose constructor takes no parameters and calls `super('/cart')`
4. One test: add 2 items to a new `Cart` and expect `count` to be `2`; expect `new CartPage().url()` to be `'http://localhost:3000/cart'`; expect the cart page to be `instanceof BasePage`

Run it with `npm run kata 09`.

## 🧠 Remember

```ts
class LoginPage {
  static readonly PATH = '/login';                 // on the class: LoginPage.PATH
  private attempts = 0;                            // property with a default
  constructor(private readonly page: Page) {}      // parameter property = declare + assign
  get title(): string { return 'Login'; }          // read as loginPage.title (no ())
  async open(): Promise<void> { this.attempts++; await this.page.goto(LoginPage.PATH); } // inside: always this.
}
const loginPage = new LoginPage(page);             // always new
class CartPage extends BasePage { constructor(page: Page) { super(page, '/cart'); } } // super(...) first
```

## ✅ Done when

- [ ] `npm run check 09` is all green with 0 type errors
- [ ] You can write `constructor(private readonly page: Page) {}` from memory and say what it does
- [ ] Kata done without looking
- [ ] `npm run drill`
