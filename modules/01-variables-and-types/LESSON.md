# Module 01 · Variables and Types

> **Why this matters for Playwright:** every test stores things: a URL, a username, a timeout,
> a counter, a flag. Variables are the boxes you put them in, and types are the labels on the boxes.

## 🎯 After this module you can

- Choose between `const` and `let` (and know why `var` is gone)
- Use the basic types: `string`, `number`, `boolean`, `null`, `undefined`
- Write type annotations (`name: type`) and know when you don't need them
- Use `typeof`, `===`, `!==`, `+=`, `++`
- Read the 3 most common TypeScript errors

---

## 1. `const` and `let`

```ts
const baseUrl = 'http://localhost:3000';   // const: can NEVER be reassigned
let attempts = 0;                          // let:   CAN be reassigned

attempts = attempts + 1;   // ✅ fine
baseUrl = 'http://other';  // ❌ error: Cannot assign to 'baseUrl' because it is a constant
```

**Rule of thumb:** always start with `const`. Switch to `let` only when you *need* to change the value.
In real test code, about 90% of variables are `const`.

> `var` is the old way. You'll see it in old tutorials. Don't use it.

### 🗣️ Say it

`const baseUrl = 'http://localhost:3000';`
> "constant **baseUrl** equals the string http localhost 3000"

---

## 2. The basic types

| Type | Examples | In tests you'll use it for |
|---|---|---|
| `string` | `'hello'`, `"hello"`, `` `hello` `` | URLs, usernames, texts on the page |
| `number` | `42`, `3.14`, `-1`, `30_000` | timeouts, counts, prices, status codes |
| `boolean` | `true`, `false` | flags: `isVisible`, `isAdmin`, `headless` |
| `undefined` | `undefined` | "no value yet" |
| `null` | `null` | "intentionally empty" |

Notes:
- There is only **one** number type. `42` and `3.14` are both `number`.
- `30_000` is the same as `30000`. The `_` just makes it easier to read (timeouts!).
- Strings can use single `'`, double `"` or backticks `` ` ``. This course uses single quotes; backticks are covered in module 02.

---

## 3. Type annotations: `name: type`

```ts
const username: string = 'standard_user';
const timeout: number = 5_000;
const headless: boolean = true;
```

### 🧩 Anatomy

```
const  timeout  :  number  =  5_000 ;
  │       │     └───┬──┘      └─┬─┘
  │       │       type        value
  │      name
  └ keyword (const or let)
```

### 🗣️ Say it

> "constant **timeout**, of type **number**, equals 5000"

The colon `:` reads as **"of type"**. Every time you see `: something` in TypeScript, read it as "of type something".
You'll see it on variables, function parameters and object properties, and it always means the same thing.

---

## 4. Type inference: TypeScript is smart

You don't need to write the type when you give a value right away:

```ts
const username = 'standard_user';  // TypeScript KNOWS this is a string
let count = 0;                     // TypeScript KNOWS this is a number

count = 'zero';  // ❌ Type 'string' is not assignable to type 'number'
```

Once a `let` is a number, it stays a number. That's TypeScript protecting you.

**When to write the type:**
- When you declare without a value: `let username: string;`
- When you want to be explicit (in function parameters you always will, see module 03)

Hover over any variable in VS Code to see the type TypeScript inferred. Make it a habit, because it's the quickest way to learn types.

---

## 5. `typeof`: ask a value what type it is

```ts
typeof 'hello'    // 'string'
typeof 42         // 'number'
typeof true       // 'boolean'
typeof undefined  // 'undefined'
typeof null       // 'object'   <- a famous JavaScript bug from 1995, kept forever
```

`typeof` gives you back a **string**, so you compare it with a string: `typeof x === 'number'`.

---

## 6. Comparing: always `===`

```ts
5 === 5        // true   strict equal
5 === '5'      // false  (number vs string)
5 !== 6        // true   strict NOT equal

5 == '5'       // true   ← loose equal, converts types. NEVER use ==
```

`=` and `===` do completely different things:
- `=` **puts** a value into a variable (assignment)
- `===` **asks** "are these equal?" (comparison)

---

## 7. Changing numbers: `+=`, `-=`, `++`, `--`

```ts
let retries = 0;
retries = retries + 1;  // 1
retries += 1;           // 2   (same thing, shorter)
retries++;              // 3   (add exactly 1)
retries -= 2;           // 1
retries--;              // 0
```

---

## 8. Scope: where a variable lives

`const` and `let` live inside the nearest `{ }` block:

```ts
const message = 'outside';
if (true) {
  const message = 'inside';  // a DIFFERENT variable, only lives inside these { }
}
message;  // 'outside'
```

Each `test(...)` has its own `{ }`, so two tests can each have their own `const page` and they never collide.

---

## 9. Naming

| Style | Used for | Example |
|---|---|---|
| `camelCase` | almost everything | `baseUrl`, `isLoggedIn`, `maxRetries` |
| `UPPER_SNAKE_CASE` | fixed config values | `DEFAULT_TIMEOUT`, `ADMIN_PASSWORD` |
| `PascalCase` | types and classes (later) | `LoginPage`, `User` |

Booleans read best as questions: `isVisible`, `hasError`, `canEdit`.

---

## 🎭 In Playwright you'll see

```ts
const BASE_URL = 'http://localhost:3000';
const username = 'standard_user';
let attempts = 0;
const isMobile: boolean = false;

test.setTimeout(60_000);
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Cannot find name 'baseUrl'` | The variable doesn't exist *here* (typo? wrong scope? not declared?) | Check spelling and declare it |
| `Cannot assign to 'x' because it is a constant` | You tried to change a `const` | Use `let` (if it really must change) |
| `Type 'string' is not assignable to type 'number'` | You put the wrong type of value in the box | Fix the value or the annotation |
| `TypeError: Assignment to constant variable.` | Same as above, but at runtime | Use `let` |
| Test passes but VS Code is red | The *behaviour* is fine but the *types* are wrong | Read the red squiggle and fix the types |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
const site = 'QA Shop';
let visits = 0;
visits++;
visits += 10;
console.log(site, visits, typeof visits);
```

Change things and break things on purpose: assign a string to `visits` and read the red squiggle.

## 🏋️ Exercises

```bash
npm run check 01
```

## 🥋 Kata

Close everything. In `my-katas/01-variables.spec.ts`, from memory, write one test that:
1. declares `const baseUrl` (a string), `let retries` (a number, starts at 0) and `const headless` (a boolean), **all with type annotations**
2. increases `retries` by 1 using `++`
3. asserts `retries` is `1`, `typeof baseUrl` is `'string'` and `headless` is `true`

Run it with `npm run kata 01`.

## 🧠 Remember

```ts
const name: string = 'x';     // const = can't change. ": type" = "of type"
let count = 0; count++;       // let = can change. Type inferred as number
typeof value === 'number'     // typeof returns a string
a === b   a !== b             // always triple
```

## ✅ Done when

- [ ] `npm run check 01` is all green with 0 type errors
- [ ] Kata done without looking
- [ ] `npm run drill`
