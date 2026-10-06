# Module 07 · Union Types and Narrowing

> **Why this matters for Playwright:** real values are often "this OR that". `getAttribute()` gives a `string | null`.
> A browser name is `'chromium' | 'firefox' | 'webkit'`. An API answer is "the data OR an error".
> Union types describe these values, and *narrowing* is how you safely find out which one you have.

## 🎯 After this module you can

- Write union types (`string | number`) and literal unions (`'admin' | 'user'`) with a `type` alias
- Narrow a union with `typeof`, `===`, truthiness, `in`, `Array.isArray` and `instanceof`
- Handle `string | null` and `undefined` without crashes
- Model API results with **discriminated unions** (`{ ok: true; data } | { ok: false; error }`)
- Use `as const`, and know what enums are (and why many teams use unions instead)
- Explain `any` vs `unknown`, and why `as` and `!` are dangerous

---

## 1. Union types: "this OR that"

```ts
let id: string | number;
id = 42;        // ✅
id = 'abc-42';  // ✅
id = true;      // ❌ Type 'boolean' is not assignable to type 'string | number'.
```

### 🧩 Anatomy

```
let  id  :  string  |  number ;
            └──┬─┘  │  └──┬─┘
          option 1  │  option 2
                    └ read "|" as "or"
```

### 🗣️ Say it

> "let **id**, of type **string or number**"

A union only lets you use what **all** its members have. `id.toUpperCase()` is an error,
because a number has no `toUpperCase`:

```
Property 'toUpperCase' does not exist on type 'string | number'.
```

You must first find out which one you have. That is called **narrowing** (section 3).

---

## 2. Literal types and type aliases

A **literal type** is one exact value used as a type. A union of literals is a list of allowed values:

```ts
type Role = 'admin' | 'user';
type TestStatus = 'passed' | 'failed' | 'skipped';
type BrowserName = 'chromium' | 'firefox' | 'webkit';

const role: Role = 'admin';       // ✅
const other: Role = 'superadmin'; // ❌ Type '"superadmin"' is not assignable to type 'Role'.
```

### 🧩 Anatomy

```
type  Role  =  'admin'  |  'user' ;
 │     │       └──────────┬──────┘
 │     │         the allowed values
 │   the name (PascalCase)
 └ "I'm creating a name for a type"
```

### 🗣️ Say it

> "**type** Role **is** 'admin' **or** 'user'"

This is one of the most useful things TypeScript gives you: **typos become errors**, and VS Code
**autocompletes** the allowed values (press `Ctrl+Space` inside the quotes).

`type` gives a name to *any* type, not only unions (module 05 used it for objects).
Use it whenever you write the same union twice.

---

## 3. Narrowing: finding out which one you have

Inside an `if`, TypeScript **remembers** what you checked. The type gets *narrower*.

| Check | Use it for | Example |
|---|---|---|
| `typeof x === 'string'` | primitives (`string`, `number`, `boolean`) | `if (typeof id === 'number')` |
| `x === 'admin'` | literal values | `if (status === 'failed')` |
| `if (x)` / `x !== null` | removing `null` / `undefined` | `if (text !== null)` |
| `'error' in body` | objects with different properties | `if ('error' in body)` |
| `Array.isArray(x)` | "one thing or a list" | `if (Array.isArray(tags))` |
| `x instanceof Error` | class instances (module 09) | `catch (e) { if (e instanceof Error) }` |

```ts
function formatId(id: string | number): string {
  if (typeof id === 'number') {
    return `#${id}`;          // here id is: number
  }
  return id.toUpperCase();    // here id is: string (number was handled above)
}
```

Hover over `id` in VS Code inside each branch: you'll see the type change. That's narrowing.

### `in`: "does this object have that property?"

```ts
type LoginSuccess = { token: string };
type LoginFailure = { error: string };

function loginMessage(body: LoginSuccess | LoginFailure): string {
  if ('error' in body) {
    return `Failed: ${body.error}`;   // body is LoginFailure
  }
  return `Token: ${body.token}`;      // body is LoginSuccess
}
```

### `Array.isArray`: "one or many"

Playwright's `tag` option accepts `'@smoke'` **or** `['@smoke', '@login']`. Code that handles it:

```ts
function toList(tag: string | string[]): string[] {
  return Array.isArray(tag) ? tag : [tag];
}
```

> Why not `typeof tag === 'object'`? Because `typeof []` is `'object'`, and so is `typeof null`.
> `Array.isArray` is the reliable check for arrays.

---

## 4. `null` and `undefined` in unions

Strict TypeScript makes "maybe missing" values **visible** in the type:

```ts
const text: string | null = await page.getByTestId('cart-count').textContent();
text.trim();            // ❌ 'text' is possibly 'null'.
text?.trim();           // ✅ string | undefined
(text ?? '').trim();    // ✅ string: empty string when null
if (text !== null) {
  text.trim();          // ✅ narrowed to string
}
```

| You have | Safe options |
|---|---|
| `string \| null` | `if (x !== null)`, `x ?? 'default'`, `x?.method()` |
| `string \| undefined` (optional property, `.find()` result) | `if (x !== undefined)`, `x ?? 'default'`, `x?.prop` |
| `number \| undefined` | `x ?? 0`, and **don't** use `if (x)` (0 is falsy: module 06) |

---

## 5. Discriminated unions: the API result pattern

Many APIs answer with "data" **or** "an error". Give every member a common property with a **literal** value,
the *discriminant*. Then checking that one property narrows the whole object:

```ts
type ProductResult =
  | { ok: true; data: Product[] }
  | { ok: false; error: string };

function countProducts(result: ProductResult): number {
  if (result.ok) {
    return result.data.length;        // TypeScript knows: data exists here
  }
  throw new Error(result.error);      // and error exists here
}
```

### 🧩 Anatomy

```
type ProductResult =
  | { ok: true;  data: Product[] }    ← member 1
  | { ok: false; error: string };     ← member 2
      └──┬───┘
   the discriminant: same name, different LITERAL value
   (the leading | is optional, it just lines things up)
```

### 🗣️ Say it

> "A ProductResult is **either** ok true with data, **or** ok false with an error."

You can't read `result.data` before checking:

```
Property 'data' does not exist on type 'ProductResult'.
  Property 'data' does not exist on type '{ ok: false; error: string; }'.
```

That error is TypeScript **protecting you** from the classic crash `Cannot read properties of undefined`.

A discriminant is often called `type` or `kind`, and works great with `switch`:

```ts
type Step =
  | { type: 'goto'; url: string }
  | { type: 'click'; selector: string }
  | { type: 'fill'; selector: string; value: string };

function describeStep(step: Step): string {
  switch (step.type) {
    case 'goto':
      return `go to ${step.url}`;
    case 'click':
      return `click ${step.selector}`;
    case 'fill':
      return `fill ${step.selector} with ${step.value}`;
  }
}
```

---

## 6. `as const`

By default TypeScript *widens* values: `const roles = ['admin', 'user']` becomes `string[]`.
`as const` says "keep the exact values, and make it read-only":

```ts
const SORT_OPTIONS = ['az', 'za', 'lohi', 'hilo'] as const;
// type: readonly ['az', 'za', 'lohi', 'hilo']

type SortOption = (typeof SORT_OPTIONS)[number];
// 'az' | 'za' | 'lohi' | 'hilo'  ← a union made from the array!

const TIMEOUTS = { short: 1_000, long: 30_000 } as const;
TIMEOUTS.short = 5;  // ❌ Cannot assign to 'short' because it is a read-only property.
```

The nice part: one list gives you **both** the runtime values (to loop over) **and** the type.
`as const` only exists for TypeScript: at runtime it's a normal array.

### 🗣️ Say it

`type SortOption = (typeof SORT_OPTIONS)[number];`
> "SortOption is the type of **any item** of SORT_OPTIONS"

---

## 7. Enums (and why many teams prefer unions)

You will meet enums in older code and other languages:

```ts
enum Priority { Low, Medium, High }       // numeric: Low = 0, Medium = 1, High = 2
enum Status { Passed = 'passed', Failed = 'failed' } // string enum

Priority.High;     // 2
Priority[2];       // 'High'  (numeric enums also map backwards!)
Status.Passed;     // 'passed'
```

| | Union of literals `'passed' \| 'failed'` | `enum Status { ... }` |
|---|---|---|
| Value you write | `'passed'` | `Status.Passed` (must import `Status`) |
| JSON from an API | ✅ plain strings match directly | needs conversion / comparison |
| Runtime code | none (disappears) | creates a real object |
| Node.js "type stripping", `erasableSyntaxOnly` | ✅ | ❌ not supported |
| Surprises | none | numeric enums accept any number, map backwards |

**Recommendation:** use **unions of literals** in your tests. Read enums when you meet them.

---

## 8. `any` vs `unknown`

| | `any` | `unknown` |
|---|---|---|
| Means | "turn TypeScript off for this value" | "I don't know yet, I'll check" |
| `value.name` | ✅ allowed (even if it crashes!) | ❌ `'value' is of type 'unknown'.` |
| Where you meet it | `JSON.parse()`, `response.json()` | `catch (error)`, safe API code |

```ts
const body: any = JSON.parse('{"user":{"name":"Sam"}}');
body.user.nmae;       // typo! TypeScript says nothing. Value: undefined

function readName(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'name' in data && typeof data.name === 'string') {
    return data.name;  // narrowed step by step: now TypeScript is sure
  }
  return 'unknown';
}
```

**Rule:** avoid `any`. If you don't know the type, use `unknown` and narrow it. Or describe the type (module 05)
and annotate: `const products: Product[] = await response.json();` (module 10 shows more).

---

## 9. The dangerous escape hatches: `as` and `!`

### Type assertion: `as`

`as` tells TypeScript "trust me, it's this type". **TypeScript does not check it. Nothing checks it at runtime.**

```ts
const raw = JSON.parse('{"status":"200"}') as { status: number };
raw.status + 1;   // TypeScript thinks: number. Reality: '200' + 1 = '2001' 😱
```

### Non-null assertion: `!`

`x!` tells TypeScript "this is not null or undefined, trust me".

```ts
const user = users.find((u) => u.username === 'ghost')!;
user.name;   // 💥 TypeError: Cannot read properties of undefined (reading 'name')
```

### 🧩 Anatomy

```
value as Product        "pretend value is a Product"       (no check!)
value!                  "pretend value is not null"         (no check!)
```

| Instead of | Prefer |
|---|---|
| `x!.name` | `x?.name ?? 'default'`, or `if (!x) throw new Error('x not found');` |
| `data as Product` | check it (narrowing), or annotate where the data enters: `const p: Product = await res.json()` |

You'll see `process.env.PASSWORD!` in many projects. It works only if the variable really exists.
A clear error is better:

```ts
const password = process.env.PASSWORD;   // string | undefined
if (!password) throw new Error('PASSWORD is not set');
// from here on, password is: string
```

---

## 🎭 In Playwright you'll see

```ts
import { test, expect } from '@playwright/test';

test('cart badge', async ({ page, browserName }) => {
  // browserName is 'chromium' | 'firefox' | 'webkit': a literal union
  test.skip(browserName === 'webkit', 'Not supported yet');

  // textContent() and getAttribute() return string | null
  const count: string | null = await page.getByTestId('cart-count').textContent();
  expect(count ?? '').toBe('0');

  const expanded = await page.getByRole('button', { name: 'Toggle details' }).getAttribute('aria-expanded');
  if (expanded === null) throw new Error('aria-expanded is missing');
  expect(expanded).toBe('false');

  // options are literal unions: autocomplete shows the allowed values
  await page.goto('/products', { waitUntil: 'domcontentloaded' });  // 'load' | 'domcontentloaded' | 'networkidle' | 'commit'
  await page.getByRole('button', { name: 'Show message' }).waitFor({ state: 'visible' }); // 'attached' | 'detached' | 'visible' | 'hidden'
});

// one tag or many: string | string[]
test('search', { tag: ['@smoke', '@products'] }, async ({ page }) => { /* ... */ });
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Type '"superadmin"' is not assignable to type 'Role'.` | That value is not in the union | Use one of the allowed values (Ctrl+Space shows them) |
| `Property 'toUpperCase' does not exist on type 'string \| number'.` | Only methods that ALL members share are allowed | Narrow first: `if (typeof id === 'string')` |
| `Property 'data' does not exist on type 'ProductResult'.` | You read a property that only one member has | Check the discriminant first: `if (result.ok)` |
| `'text' is possibly 'null'.` | The value can be `null` | `if (text !== null)`, `text ?? ''`, `text?.trim()` |
| `Argument of type 'string \| null' is not assignable to parameter of type 'string'.` | A function wants a `string`, you have maybe-null | Handle null before the call |
| `'data' is of type 'unknown'.` | You must check `unknown` before using it | Narrow with `typeof`, `in`, `instanceof` |
| `This comparison appears to be unintentional because the types '"admin"' and '"guest"' have no overlap.` | You compare with a value that can never match | Fix the value, or the type |
| `TypeError: Cannot read properties of null (reading 'trim')` | At runtime it WAS null (a `!` or `as` lied) | Remove the `!`/`as`, handle `null` |
| `'200' + 1` gives `'2001'` | An `as` said "number" but the value was a string | Convert: `Number(value)`, don't trust `as` |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
type Role = 'admin' | 'user';
type Result = { ok: true; data: string[] } | { ok: false; error: string };

function landing(role: Role): string {
  return role === 'admin' ? '/admin' : '/products';
}

function show(result: Result): string {
  if (result.ok) return `Got ${result.data.length} items`;
  return `Error: ${result.error}`;
}

console.log(landing('admin'));
console.log(show({ ok: true, data: ['Backpack'] }));
console.log(show({ ok: false, error: 'Unauthorized' }));
```

Then break it: call `landing('guest')`, and try `result.data` before the `if`. Read both red squiggles.

## 🏋️ Exercises

```bash
npm run check 07
```

## 🥋 Kata

Close everything. In `my-katas/07-unions.spec.ts`, from memory:

1. Write `type Role = 'admin' | 'user';`
2. Write `type LoginResult = { ok: true; token: string } | { ok: false; error: string };`
3. Write `function message(result: LoginResult): string` that returns `` `Token: ${token}` `` or `` `Error: ${error}` `` using `if (result.ok)`
4. Write `function cleanText(text: string | null): string` that returns `''` for null, otherwise the trimmed text
5. One test with an `expect` for each function (both branches)

Run it with `npm run kata 07`.

## 🧠 Remember

```ts
type Role = 'admin' | 'user';                          // literal union: | means "or"
let id: string | number;                               // narrow before using
if (typeof id === 'number') { } if ('error' in body) { } if (Array.isArray(x)) { }
type Result = { ok: true; data: string[] } | { ok: false; error: string };  if (result.ok) { result.data }
text ?? ''      text?.trim()      if (text !== null) { }
const LIST = ['a', 'b'] as const;  type Item = (typeof LIST)[number];
unknown > any.   `as` and `!` = "trust me": no check at all.
```

## ✅ Done when

- [ ] `npm run check 07` is all green with 0 type errors
- [ ] You can write the `{ ok: true; data } | { ok: false; error }` type from memory
- [ ] Kata done without looking
- [ ] `npm run drill`
