# Module 03 · Functions

> **Why this matters for Playwright:** every test you write *is* a function: `test('name', async ({ page }) => { ... })`.
> And the moment you write the same 3 lines twice (log in, format a price, build a URL), you'll move them into a
> helper function. This is the syntax you will type the most in your career. Take it slowly.

## 🎯 After this module you can

- Write a function declaration with typed parameters and a return type
- Write the same function as an arrow function, with an expression body or a block body
- Use optional (`?`) and default (`= value`) parameters, and `void`
- Pass a function to another function (a "callback") and write a function type `(a: number) => number`
- Tell the difference between `fn` (the function itself) and `fn()` (calling it)
- Write the helpers testers use every day: `formatPrice`, `parsePrice`, `buildUrl`, `isValidEmail`, `randomEmail`

---

## 1. What is a function?

A function is a **named recipe**: you write the steps once, then **call** it as many times as you want,
with different **inputs**, and it gives back an **output**.

```ts
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

formatPrice(29.99);   // '$29.99'
formatPrice(7.5);     // '$7.50'
```

### 🧩 Anatomy: function declaration

```
function  formatPrice ( price : number ) : string  {
   │          │          │       │         │
   │          │          │       │         └ return type: what comes OUT
   │          │          │       └ parameter type
   │          │          └ parameter name: what goes IN
   │          └ function name (a verb!)
   └ keyword

  return `$${price.toFixed(2)}`;
    │    └──────────┬─────────┘
    │          the value to give back
    └ "give this back and STOP here"
}
```

### 🗣️ Say it

> "function **formatPrice**, takes **price** of type number, returns a **string**.
> It returns dollar plus price to-fixed 2."

Notice the colon again: `price: number` = "price **of type** number", and `): string` = "returns **of type** string".
It's the same `:` from module 01.

---

## 2. Calling a function

```ts
const label = formatPrice(29.99);
```

### 🧩 Anatomy: a call

```
const label = formatPrice( 29.99 );
                 │         └─┬─┘
                 │       argument: the real value for `price`
                 └ the name, then ( ) = "run it NOW"
```

- **Parameter** = the name in the definition (`price`). A placeholder.
- **Argument** = the real value you pass when you call it (`29.99`).

### `return`

- `return` gives a value back **and stops** the function. Lines after it never run.
- No `return` → the function gives back `undefined`.

```ts
function add(a: number, b: number): number {
  return a + b;
}
add(2, 3);   // 5
```

**Several parameters** are separated by commas, and the arguments go in **the same order**:

```ts
function buildUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${path}`;
}
buildUrl('http://localhost:3000', '/login');   // 'http://localhost:3000/login'
buildUrl('/login', 'http://localhost:3000');   // '/loginhttp://localhost:3000'  ← wrong order, no error!
```

TypeScript can't catch the wrong order when both are strings. Read your calls carefully.

---

## 3. Types: always on parameters, often on the return

```ts
function isAdmin(role: string): boolean {
  return role === 'admin';
}
```

| Where | Required? | Why |
|---|---|---|
| Parameter types `(role: string)` | **Yes** (always) | TypeScript can't guess what callers will pass. Without it: `Parameter 'role' implicitly has an 'any' type.` |
| Return type `): boolean` | Optional (it's inferred) | Writing it is a promise. If you forget a `return`, TypeScript tells you. Recommended for helpers. |

---

## 4. Arrow functions

The same function, shorter. You'll see this style everywhere in Playwright.

```ts
const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
```

### 🧩 Anatomy: arrow function

```
const formatPrice = ( price: number ): string  =>  `$${price.toFixed(2)}` ;
  │       │         └──────┬──────┘ └───┬───┘  │   └─────────┬─────────┘
  │       │           parameters    return type │     the body (returned automatically)
  │       │                                     └ the arrow: "gives"
  │       └ the name lives in a normal constant
  └ const, like any variable
```

### 🗣️ Say it

> "constant **formatPrice** equals a function that takes **price** of type number, returns a string,
> **arrow**: dollar plus price to-fixed 2."

### Expression body vs block body

| | Expression body | Block body |
|---|---|---|
| Looks like | `(a: number) => a * 2` | `(a: number) => { const b = a * 2; return b; }` |
| `return`? | **Automatic** | **You must write `return`** |
| Use it when | the result fits in one expression | you need several lines |

```ts
// expression body: no { }, no return
const double = (n: number): number => n * 2;

// block body: { } and return
const calculateTotal = (price: number, quantity: number): number => {
  const subtotal = price * quantity;
  return subtotal;
};
```

**The #1 arrow bug:** adding `{ }` and forgetting `return`.

```ts
const double = (n: number): number => { n * 2; };   // ❌ returns undefined
```

### Returning an object needs `( )`

`{` right after `=>` means "a block body starts". To return an object, wrap it in `( )`:

```ts
const makeUser = (username: string) => ({ username: username, role: 'user' });   // ✅
const broken  = (username: string) => { username: username };                     // ❌ a block, returns undefined
```

(Objects are module 05. For now: `{ key: value }` is an object, and `toEqual` compares its content.)

### Parameters with no types?

In callbacks (section 8) TypeScript already knows the types, so you'll often see `(p) => p * 2`.
When you write a **new** function, always type the parameters.

---

## 5. Declaration or arrow?

Both are fine. A common style:

| Use | For |
|---|---|
| `function name(...) { }` | top-level helpers in a helpers file |
| `const name = (...) => ...` | short helpers and **callbacks** (functions you pass to other functions) |

One real difference: you can call a **function declaration** before the line where it's written.
With an arrow in a `const`, you can't:

```ts
greet('Sam');                    // ✅ works: function declarations are "hoisted" (moved to the top)
function greet(name: string): string { return `Hi ${name}`; }

shout('Sam');                    // ❌ ReferenceError: Cannot access 'shout' before initialization
const shout = (name: string): string => name.toUpperCase();
```

---

## 6. Optional and default parameters

```ts
// default: if you don't pass it, it uses this value
function buildUrl(path: string, baseUrl: string = 'http://localhost:3000'): string {
  return `${baseUrl}${path}`;
}
buildUrl('/login');                               // 'http://localhost:3000/login'
buildUrl('/login', 'https://staging.qa-shop.com'); // 'https://staging.qa-shop.com/login'

// optional: you may leave it out, then it is undefined
function describeUser(name: string, role?: string): string {
  return `${name} (${role})`;
}
describeUser('Sam', 'admin');   // 'Sam (admin)'
describeUser('Sam');            // 'Sam (undefined)'   ← careful!
```

### 🧩 Anatomy

```
function buildUrl( path: string, baseUrl: string = 'http://localhost:3000' )
                   └────┬─────┘  └───────────────────┬─────────────────────┘
                    required      default: "= value" after the type

function describeUser( name: string, role?: string )
                                     └──────┬─────┘
                            optional: "?" before the colon. Type becomes string | undefined
```

### 🗣️ Say it

`role?: string` > "role, **optional**, of type string"
`baseUrl: string = '...'` > "baseUrl of type string, **defaults to** ..."

| | `role?: string` | `baseUrl = 'http://...'` |
|---|---|---|
| Can the caller leave it out? | yes | yes |
| Value when left out | `undefined` | the default |
| Use it when | "no value" is OK and you handle it | there's a sensible normal value |

**Rule:** required parameters first, then optional/default ones.
`function login(username?: string, password: string)` → `A required parameter cannot follow an optional parameter.`

---

## 7. `void`: functions that return nothing

Some functions **do** something instead of **calculating** something:

```ts
function logStep(step: string): void {
  console.log(`STEP: ${step}`);
}
const result = logStep('open the login page');   // result is undefined
```

`void` = "this function doesn't give anything back. Don't use its result." Your test bodies are like this too.

---

## 8. Functions are values

A function is a value, like a string or a number. You can put it in a variable and pass it to another function.

### `fn` vs `fn()`

```ts
function getBaseUrl(): string {
  return 'http://localhost:3000';
}

getBaseUrl      // the function ITSELF (the recipe)    typeof → 'function'
getBaseUrl()    // CALL it and get the result (the cake) typeof → 'string'
```

### 🗣️ Say it

`getBaseUrl` > "the function getBaseUrl" · `getBaseUrl()` > "**call** getBaseUrl"

Forgetting the `( )` is a very common bug: `const url: string = getBaseUrl;` →
`Type '() => string' is not assignable to type 'string'.` TypeScript is telling you: "that's a function, not its result".

### Callbacks

A **callback** is a function you give to another function, so it can call it later.

```ts
function applyDiscount(price: number, rule: (p: number) => number): number {
  return rule(price);
}

applyDiscount(50, (p) => p - 10);        // 40   (an arrow written right there)
const halfPrice = (p: number): number => p / 2;
applyDiscount(50, halfPrice);            // 25   (a named function: NO parentheses, we pass it, we don't call it)
```

You already use callbacks: `test('name', () => { ... })`. The arrow function is a callback, and Playwright calls it when it runs the test.

### Function types

```ts
let formatter: (value: number) => string;
formatter = (value) => `$${value}`;    // the types of value and the result come from the annotation
```

### 🧩 Anatomy: a function TYPE

```
( p: number ) => number
└─────┬─────┘    └──┬──┘
 takes a number   gives back a number
```

### 🗣️ Say it

> "a function that takes **p** of type number and **returns** a number"

It looks like an arrow function, but after the `=>` there's a **type**, not code.

---

## 9. Rest parameters (just so you recognise them)

`...name: type[]` collects any number of arguments into a list (an array, module 04):

```ts
function logAll(...messages: string[]): void {
  console.log(messages.join(' | '));
}
logAll('one');               // 'one'
logAll('one', 'two', 'six'); // 'one | two | six'
```

`Math.max(3, 7, 1)` from module 02 works like this: it takes any number of arguments.

---

## 10. Naming: start with a verb

| Starts with | Returns | Examples |
|---|---|---|
| `get...` | a value | `getBaseUrl()`, `getProductName(id)` |
| `build...` / `create...` | a new thing | `buildUrl(path)`, `createUser()` |
| `format...` | display text | `formatPrice(7.5)` → `'$7.50'` |
| `parse...` | a value read from text | `parsePrice('$7.50')` → `7.5` |
| `is...` / `has...` / `can...` | a boolean | `isValidEmail(email)`, `hasError()` |
| `random...` | random test data | `randomEmail()`, `randomInt(1, 6)` |

---

## 11. The tester's toolbox

Helpers like these end up in a `helpers.ts` file in almost every test project:

```ts
const formatPrice = (price: number): string => `$${price.toFixed(2)}`;

const parsePrice = (text: string): number => parseFloat(text.replace(/[^\d.]/g, ''));
// /[^\d.]/g = "every character that is NOT a digit or a dot" (g = all of them) → removed

const buildUrl = (path: string, baseUrl: string = 'http://localhost:3000'): string => `${baseUrl}${path}`;

const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);
// \S = any character that is not a space

const randomEmail = (domain: string = 'test.com'): string => `user_${Date.now()}@${domain}`;

const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
```

---

## 🎭 In Playwright you'll see

```ts
// the test body is an arrow function (a callback) that Playwright calls for you
test('add to cart', async ({ page }) => {
  await page.goto(buildUrl('/products'));
  const priceText = await page.locator('.price').first().textContent();
  expect(parsePrice(priceText!)).toBeGreaterThan(0);
});

// a helper function with typed parameters, reused in many tests
async function login(page: Page, username: string, password: string = 'secret123'): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
}

// a callback: Playwright calls it when a dialog opens
page.on('dialog', (dialog) => dialog.accept());
```

`async`, `await` and `Promise<void>` are module 08, `{ page }` is module 05, and the `!` after `priceText` is module 07.
The shape is what matters now: **name, typed parameters, return type, body**.

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Received: undefined` | Your function didn't `return` anything | Add `return`, or remove the `{ }` of an arrow |
| `A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.` | You promised a return type but there is no `return` | Add `return ...` |
| `Parameter 'price' implicitly has an 'any' type.` | A parameter without a type | `(price: number)` |
| `Expected 2 arguments, but got 1.` | You called it with too few arguments | Pass all required ones (or make one optional/default) |
| `Argument of type 'string' is not assignable to parameter of type 'number'.` | Wrong type of argument, often the **wrong order** | Check the order in the definition |
| `Type '() => string' is not assignable to type 'string'.` | You used `fn` where you meant `fn()` | Add `( )` to call it |
| `This expression is not callable.` | You used `( )` on something that is not a function, e.g. `baseUrl()` | Remove the `( )` |
| `A required parameter cannot follow an optional parameter.` | `(a?: string, b: string)` | Put required parameters first |
| `ReferenceError: Cannot access 'shout' before initialization` | You called an arrow `const` above the line that creates it | Move the call below, or use a `function` declaration |
| `Cannot find name 'formatPrice'.` | The function doesn't exist here: typo, or declared inside another `{ }` | Check spelling and where it's declared |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
const double = (n: number): number => n * 2;
const buildUrl = (path: string, baseUrl: string = 'http://localhost:3000'): string => {
  return `${baseUrl}${path}`;
};
const apply = (value: number, fn: (n: number) => number): number => fn(value);

console.log(formatPrice(7.5), double(21), buildUrl('/login'));
console.log(apply(10, double), apply(10, (n) => n + 1));
console.log(typeof double, typeof double(2));
```

Then break it: remove a `return`, remove the `( )` from a call, call `buildUrl()` with no argument. Read each error.

## 🏋️ Exercises

```bash
npm run check 03
```

## 🥋 Kata

Close everything. In `my-katas/03-functions.spec.ts`, from memory, write one test that:
1. declares `function formatPrice(price: number): string` that returns e.g. `'$7.50'`
2. declares an arrow `const buildUrl` with a `path` parameter and a `baseUrl` parameter that **defaults** to `'http://localhost:3000'`
3. declares an arrow `const isAdmin` that takes `role: string` and returns a `boolean` (expression body)
4. asserts `formatPrice(7.5)` is `'$7.50'`, `buildUrl('/cart')` is `'http://localhost:3000/cart'` and `isAdmin('admin')` is `true`

Run it with `npm run kata 03`.

## 🧠 Remember

```ts
function name(param: Type): ReturnType { return value; }   // declaration
const name = (param: Type): ReturnType => value;           // arrow, expression body (auto return)
const name = (param: Type): ReturnType => { return value; }; // arrow, block body (write return!)
(a: string, b?: string, c: number = 5)                     // required, optional, default
const make = () => ({ key: 'value' });                     // returning an object: ( )
fn  = the function itself     fn() = call it               // (p: number) => number = a function TYPE
```

## ✅ Done when

- [ ] `npm run check 03` is all green with 0 type errors
- [ ] Kata done without looking
- [ ] `npm run drill`
