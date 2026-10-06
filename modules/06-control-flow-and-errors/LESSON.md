# Module 06 · Control Flow and Errors

> **Why this matters for Playwright:** tests make decisions all the time. "Retry 2 times on CI, 0 times on my laptop",
> "use the BASE_URL from the environment, or localhost", "loop over every product card", "this must throw an error".
> Control flow (`if`, loops, `switch`) and errors (`throw`, `try/catch`) are how you write those decisions.

## 🎯 After this module you can

- Write `if` / `else if` / `else`, and combine conditions with `&&`, `||` and `!`
- Know which values are **truthy** and **falsy** (and the `0` trap)
- Use the ternary `? :` and `switch`
- Loop with `for...of`, classic `for`, `while`, and over an object with `Object.entries`
- Use `break` and `continue`
- Read data safely with `?.` and give defaults with `??` (and know why `??` is safer than `||`)
- `throw` your own errors, catch them with `try / catch / finally`, read `error.message`
- Test that code throws: `expect(() => fn()).toThrow('message')`

---

## 1. `if` / `else if` / `else`

```ts
function statusCategory(status: number): string {
  if (status >= 500) {
    return 'server error';
  } else if (status >= 400) {
    return 'client error';
  } else if (status >= 200 && status < 300) {
    return 'success';
  } else {
    return 'other';
  }
}
```

### 🧩 Anatomy

```
if  ( status >= 500 )  {  ...  }  else if ( status >= 400 ) { ... }  else { ... }
│     └──────┬─────┘      └─┬─┘    └───────────┬───────────┘           └──┬──┘
│        condition       runs if      checked ONLY if the            runs if nothing
│    (true or false)     true         first one was false            above was true
└ keyword
```

**The order matters.** JavaScript checks from top to bottom and stops at the **first** true condition.
`503 >= 400` is also true, so if you check `>= 400` first, a 503 becomes a "client error".

### 🗣️ Say it

> "**If** status is greater than or equal to 500, return 'server error'. **Else if** ... **else** return 'other'."

---

## 2. Comparison and logical operators

| Operator | Means | Example | Result |
|---|---|---|---|
| `===` / `!==` | equal / not equal | `200 === 200` | `true` |
| `>` `<` `>=` `<=` | bigger / smaller | `404 >= 400` | `true` |
| `&&` | AND: both must be true | `status >= 200 && status < 300` | `true` for 2xx |
| `\|\|` | OR: at least one is true | `role === 'admin' \|\| role === 'owner'` | |
| `!` | NOT: flips true/false | `!isLoggedIn` | |

### 🗣️ Say it

`if (status >= 200 && status < 300)`
> "if status is at least 200 **and** status is less than 300"

---

## 3. Truthy and falsy

`if (...)` does not need a real boolean. JavaScript converts the value to `true` or `false`.
Only **6 values are falsy**. Everything else is truthy.

| Falsy (become `false`) | Truthy (become `true`) |
|---|---|
| `false` | `true` |
| `0` | `1`, `-1`, `29.99` |
| `''` (empty string) | `'0'`, `'false'`, `' '` (any non-empty string!) |
| `null` | `[]` (even an empty array!) |
| `undefined` | `{}` (even an empty object!) |
| `NaN` | |

```ts
const username = '';
if (username) {
  // does not run: '' is falsy
}
Boolean('0');   // true  (a non-empty string)
Boolean([]);    // true
!!'hello';      // true  (!! = "convert to boolean")
```

### ⚠️ The `0` trap

```ts
function stockLabel(stock: number | undefined): string {
  if (!stock) return 'unknown';     // 🐛 stock = 0 ALSO lands here!
  return `${stock} in stock`;
}
stockLabel(0);  // 'unknown'  ← wrong: the Onesie has 0 in stock, that's a real value

// ✅ ask the exact question:
if (stock === undefined) return 'unknown';
```

Rule: when `0` or `''` is a **valid value**, don't use truthiness. Compare with `=== undefined` / `=== null`.

---

## 4. The ternary: `condition ? a : b`

A short `if/else` that **gives back a value**:

```ts
const label = stock > 0 ? 'Add to cart' : 'Sold out';
```

### 🧩 Anatomy

```
const label =  stock > 0  ?  'Add to cart'  :  'Sold out' ;
               └───┬───┘     └─────┬─────┘     └────┬───┘
              condition      value if true    value if false
```

### 🗣️ Say it

> "label equals: is stock greater than 0? **then** 'Add to cart', **otherwise** 'Sold out'."

Use it for **short** choices. If you need two lines of logic, use `if/else`.

---

## 5. `switch`

When you compare **one value** against many fixed options:

```ts
function landingPage(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'user':
      return '/products';
    default:
      return '/login';
  }
}
```

### 🧩 Anatomy

```
switch ( role ) {          ← the value to compare (with ===)
  case 'admin':            ← "if role === 'admin', start here"
    label = 'Admin';
    break;                 ← STOP. Without break, it falls into the next case!
  default:                 ← "none of the cases matched"
    label = 'Guest';
}
```

**`break` or `return`**: every `case` must end with one. A missing `break` is a classic bug called *fall-through*:
the code keeps running into the next case. With `return` you don't need `break` (return leaves the function).

---

## 6. Loops

### `for...of`: once for every item (your default loop)

```ts
const results = ['passed', 'failed', 'passed'];
let failed = 0;
for (const result of results) {
  if (result === 'failed') failed++;
}
```

### 🧩 Anatomy

```
for ( const result  of  results ) {  ...  }
        └──┬──┘          └──┬──┘     └─┬─┘
    a NEW const for     the array    runs once per item
     each item
```

### 🗣️ Say it

> "**for each** result **of** results, do this..."

### Classic `for`: when you need the number (index)

```ts
const usernames: string[] = [];
for (let i = 1; i <= 3; i++) {
  usernames.push(`user${i}`);   // user1, user2, user3
}
```

```
for ( let i = 0 ;  i < items.length ;  i++ ) { ... }
      └───┬───┘    └──────┬───────┘    └┬┘
        start      keep going while    after each round
                     this is true
```

> ⚠️ Arrays start at index `0`, so the last index is `length - 1`. Use `i < items.length`, **not** `<=`.

### `while`: repeat while a condition is true

```ts
let attempt = 0;
let success = false;
while (!success && attempt < 5) {
  attempt++;
  success = tryLogin();      // stops early when success becomes true
}
```

> ⚠️ If the condition never becomes `false`, the loop never ends. The test hangs until
> `Test timeout of 30000ms exceeded.` Always have a limit (`attempt < 5`).

### Looping over an object: `Object.entries`

`for...of` works on arrays. For an object, turn it into `[key, value]` pairs first (module 05):

```ts
const headers = { 'content-type': 'application/json', 'x-test-id': 'abc' };
for (const [key, value] of Object.entries(headers)) {
  console.log(`${key}: ${value}`);
}
```

### `break` and `continue`

| Keyword | What it does |
|---|---|
| `continue` | skip the **rest of this round**, go to the next item |
| `break` | stop the **whole loop** right now |

```ts
for (const product of products) {
  if (product.stock === 0) continue;   // skip sold-out products
  if (product.price > 40) break;       // stop at the first expensive one
  cheap.push(product.name);
}
```

> `for...of` vs `.forEach` / `.map`: both work for simple things. `for...of` can `break`, `continue`, and (module 08)
> it can `await` inside. That's why test code uses it a lot.

---

## 7. `?.` optional chaining and `??` nullish coalescing

Data from APIs is often incomplete. Reading a property of `undefined` crashes:

```ts
const user: { name: string; address?: { city: string } } = { name: 'Sam' };
user.address.city;              // 💥 TypeError: Cannot read properties of undefined (reading 'city')
user.address?.city;             // undefined, no crash
user.address?.city ?? 'unknown' // 'unknown'
```

### 🧩 Anatomy

```
user.address?.city  ??  'unknown'
            └┬┘     └┬┘  └───┬───┘
  "stop here and    "if the left side is null or undefined,
  give undefined     use this instead"
  if address is
  null/undefined"
```

### 🗣️ Say it

> "user dot address, **if it exists**, dot city, **otherwise** 'unknown'."

### `??` vs `||`: the difference that bites

| Left side | `left \|\| 5000` | `left ?? 5000` |
|---|---|---|
| `undefined` | `5000` | `5000` |
| `null` | `5000` | `5000` |
| `0` | `5000` ⚠️ | `0` ✅ |
| `''` | `5000` ⚠️ | `''` ✅ |
| `false` | `5000` ⚠️ | `false` ✅ |

`||` replaces **every falsy** value. `??` replaces only **null and undefined**.
For defaults, use `??`. A timeout of `0` or a retry count of `0` is a real value!

---

## 8. Errors: `throw`, `try`, `catch`, `finally`

### Throwing your own error

```ts
function parsePrice(text: string): number {
  const price = Number(text.replace('$', ''));
  if (Number.isNaN(price)) {
    throw new Error(`Invalid price: ${text}`);
  }
  return price;
}
```

`throw` **stops the function immediately**. The error travels up until something catches it.
If nothing catches it inside a test, **the test fails** with that message. That's how `expect` works too:
a failing `expect` simply throws an error.

### Catching an error

```ts
let message = '';
try {
  parsePrice('abc');
} catch (error) {
  if (error instanceof Error) {
    message = error.message;      // 'Invalid price: abc'
  }
} finally {
  console.log('always runs');     // runs whether there was an error or not
}
```

### 🧩 Anatomy

```
try {            ← "try this code"
  ...
} catch (error) {  ← runs ONLY if something in try threw. `error` is what was thrown
  ...
} finally {      ← runs ALWAYS, error or not (cleanup: close things, log)
  ...
}
```

### 🗣️ Say it

> "**Try** to parse the price. **If it throws**, catch the error and save its message. **Finally**, always log."

### Why `if (error instanceof Error)`?

In TypeScript the caught `error` has type **`unknown`**: JavaScript lets you `throw` anything (`throw 'oops'`, `throw 42`).
So TypeScript won't let you write `error.message` directly:

```
'error' is of type 'unknown'.
```

`error instanceof Error` checks "is this a real Error object?". Inside the `if`, TypeScript knows it has `.message`.
(Module 07 explains `unknown` and this kind of check, called *narrowing*.)

---

## 9. Testing that something throws: `toThrow`

```ts
expect(() => parsePrice('abc')).toThrow('Invalid price: abc');
```

### 🧩 Anatomy

```
expect(  () => parsePrice('abc')  ).toThrow( 'Invalid price: abc' );
         └──────────┬──────────┘             └────────┬─────────┘
   a FUNCTION that calls your code    the message (or part of it)
   (expect calls it for you, inside   that the error must contain
    its own try/catch)
```

### 🗣️ Say it

> "Expect **calling** parsePrice with 'abc' **to throw** 'Invalid price: abc'."

**Why the arrow `() =>`?** Without it, `parsePrice('abc')` runs *before* `expect` is even called.
It throws, nobody catches it, and the test crashes with the error instead of checking it.
With the arrow, you give `expect` a function, and `expect` runs it inside its own `try/catch`.

| You want to check | Write |
|---|---|
| it throws (any error) | `expect(() => fn()).toThrow()` |
| the message contains a text | `expect(() => fn()).toThrow('Invalid price')` |
| it does NOT throw | `expect(() => fn()).not.toThrow()` |
| an `async` function rejects | `await expect(fn()).rejects.toThrow('...')` (module 08) |

---

## 🎭 In Playwright you'll see

```ts
// playwright.config.ts: retry 2 times on CI, never locally (a ternary!)
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    // the environment can override the URL; otherwise localhost (?? !)
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
  },
});

// skip a test with a condition
test('drag and drop', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Not supported on WebKit yet');
  // ...
});

// loop over items
const names = ['Backpack', 'Bike Light'];
for (const name of names) {
  await page.getByRole('listitem').filter({ hasText: name })
    .getByRole('button', { name: 'Add to cart' }).click();
}

// a simple retry helper (the async version is in module 08)
function retry(action: () => boolean, maxAttempts: number): number {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (action()) return attempt;
  }
  throw new Error(`Failed after ${maxAttempts} attempts`);
}
```

`process.env.CI` is a `string` or `undefined`. On GitHub Actions it is `'true'` (truthy), on your laptop it is `undefined` (falsy).
That's why `process.env.CI ? 2 : 0` works.

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `TypeError: Cannot read properties of undefined (reading 'city')` | You read a property of something that is `undefined` | Use `?.`: `user.address?.city` |
| `'user' is possibly 'undefined'.` | TypeScript sees it *could* be undefined | Check it first (`if (user)`), or use `?.` |
| `'error' is of type 'unknown'.` | In `catch (error)`, `error` can be anything | `if (error instanceof Error) { error.message }` |
| `Matcher error: received value must be a function` | You wrote `expect(fn()).toThrow()` and `fn()` did not throw | Add the arrow: `expect(() => fn()).toThrow()` |
| The test fails with *your* error, e.g. `Error: Invalid price: abc` at the `expect` line | You wrote `expect(fn()).toThrow()` and `fn()` threw before `expect` could catch it | Add the arrow: `expect(() => fn())` |
| `Received function did not throw` | Your function returned normally | Check the condition that should `throw` |
| `Expected substring: "Password" Received message: "Username is required"` | It threw, but with a different message | Fix the message (or the input) |
| `Test timeout of 30000ms exceeded.` (in a loop) | The loop never ends | Make sure the condition becomes false; add a max attempts limit |
| A default value replaced `0` or `''` | You used `\|\|` | Use `??` |
| A `switch` gives the value of the *next* case | Missing `break` (fall-through) | Add `break;` (or `return`) at the end of every case |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
const statuses = [200, 404, 503, 0];
for (const status of statuses) {
  const label = status >= 400 ? 'error' : 'ok';
  console.log(status, label, Boolean(status));
}

const timeout = 0;
console.log(timeout || 5000, timeout ?? 5000);

try {
  throw new Error('boom');
} catch (error) {
  if (error instanceof Error) console.log('caught:', error.message);
} finally {
  console.log('finally!');
}
```

Then break it: remove `if (error instanceof Error)` and read the red squiggle.

## 🏋️ Exercises

```bash
npm run check 06
```

## 🥋 Kata

Close everything. In `my-katas/06-control-flow.spec.ts`, from memory, write:

1. A function `statusCategory(status: number): string` with `if / else if / else`:
   `'success'` (200-299), `'client error'` (400-499), `'server error'` (500+), otherwise `'other'`
2. A function `requireUsername(username: string): string` that throws `new Error('Username is required')` when the username is `''`, otherwise returns it
3. One test that checks `statusCategory(503)` is `'server error'`, and that `requireUsername('')` **throws** `'Username is required'`
4. In the same test: loop with `for...of` over `[200, 404, 500]` and count how many are errors (`>= 400`). Expect `2`.

Run it with `npm run kata 06`.

## 🧠 Remember

```ts
if (a && b) { } else if (!c) { } else { }   // && and, || or, ! not
const label = ok ? 'yes' : 'no';             // ternary
for (const item of items) { continue; break; }
for (const [key, value] of Object.entries(obj)) { }
const city = user?.address?.city ?? 'unknown'; // ?? only replaces null/undefined
throw new Error('message');
try { } catch (error) { if (error instanceof Error) error.message; } finally { }
expect(() => fn()).toThrow('message');       // arrow function!
```

## ✅ Done when

- [ ] `npm run check 06` is all green with 0 type errors
- [ ] You can explain why `??` is safer than `||` for defaults
- [ ] Kata done without looking
- [ ] `npm run drill`
