# Module 10 · Modules and Generics

> **Why this matters for Playwright:** a real test project has many files: page objects, fixtures, test data,
> helpers. `import` and `export` connect them. And every Playwright type you'll use is **generic**:
> `Promise<T>`, `Array<T>`, `test.extend<MyFixtures>`, `Partial<User>`. After this module, `<T>` stops looking scary.

## 🎯 After this module you can

- Share code between files with `export` and `import` (named and default)
- Use `import type`, re-exports and an `index.ts` "barrel" file
- Write relative paths (`./`, `../`) without guessing
- Read and write generic functions: `function first<T>(items: T[]): T | undefined`
- Write generic types like `ApiResponse<T>`, and constraints like `<T extends { id: number }>`
- Use `keyof` and the utility types `Partial`, `Required`, `Pick`, `Omit`, `Record`, `Readonly`

> This module has extra files: some exercises are solved in `modules/10-modules-and-generics/utils/`.

---

## Part 1 · Modules

## 1. Every file is a module

Each `.ts` file has its **own scope**. A `const` or `function` inside a file is invisible to other files,
unless the file **exports** it and the other file **imports** it.

```ts
// utils/urls.ts
export const BASE_URL = 'http://localhost:3000';

export function buildUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

function secretHelper(): void {}   // no export: only this file can use it
```

```ts
// tests/login.spec.ts
import { BASE_URL, buildUrl } from '../utils/urls';

buildUrl('/login');   // 'http://localhost:3000/login'
```

### 🧩 Anatomy

```
import  { BASE_URL, buildUrl }  from  '../utils/urls' ;
        └──────────┬─────────┘        └──────┬──────┘
     the exported names you want      the file (relative path, NO .ts at the end)
     (exact names, in { })
```

### 🗣️ Say it

> "**import** BASE_URL and buildUrl **from** utils slash urls"

You have done this since module 00: `import { test, expect } from '@playwright/test';`
A path **without** `./` or `../` (like `'@playwright/test'`) is a **package** from `node_modules`.
A path **with** `./` or `../` is **your own file**.

---

## 2. Named exports vs default export

| | Named export | Default export |
|---|---|---|
| Write | `export function buildUrl() {}` | `export default function log() {}` |
| How many per file | as many as you want | only ONE |
| Import | `import { buildUrl } from './urls';` | `import log from './logger';` |
| Name when importing | must match (`{ buildUrl }`) | you choose any name |
| Rename | `import { buildUrl as url } from './urls';` | just pick another name |

```ts
// utils/logger.ts
export default function log(message: string): string {
  return `[test] ${message}`;
}

// a test file
import log from './utils/logger';          // no { } for a default export
```

**Named exports are the usual choice** in test projects: the names stay the same everywhere,
and VS Code can auto-import them. You'll see a default export in one famous place:

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';   // named imports
export default defineConfig({ ... });                        // a default export
```

---

## 3. `import type`, and re-exports

### Importing only a type

```ts
import type { Page, Locator } from '@playwright/test';
import { test, expect, type Page } from '@playwright/test';   // mix: `type` in front of one name
```

`import type` says "I only need this as a **type**". It disappears completely when the code runs.
Use it for types and interfaces (it makes intent clear, and some tools require it).

### Re-exporting

A file can pass on exports from other files:

```ts
export { slugify } from './strings';          // re-export one name
export * from './users';                      // re-export everything (named) from users.ts
export { expect } from '@playwright/test';    // you'll see this in fixture files!
```

### Barrel files: `index.ts`

A file called `index.ts` that only re-exports is called a **barrel**. Importing a **folder** loads its `index.ts`:

```ts
// utils/index.ts
export * from './urls';
export * from './users';

// a test
import { buildUrl, createUser } from './utils';   // = './utils/index'
```

Barrels make imports shorter. Don't overdo them: one per folder (like `pages/index.ts`) is plenty.

---

## 4. `import * as`: everything in one object

```ts
import * as money from './utils/money';

money.formatPrice(29.99);   // every export becomes a property of `money`
```

You'll see this with Node's built-in modules: `import * as fs from 'node:fs';`, `import * as path from 'node:path';`.

**Why the exercises use it:** if a file forgets an export, a normal import **crashes the whole test file**
(see the error table below). With `import * as`, the missing function is just `undefined`, so only one exercise fails.

---

## 5. Relative paths: `./` and `../`

| Path starts with | Means |
|---|---|
| `./` | "in the folder of **this** file" |
| `../` | "go **up** one folder" (repeat: `../../` = up two) |
| nothing (`'@playwright/test'`) | a package from `node_modules` |

```
ts-study/
├── helpers/
│   └── blank.ts
└── modules/
    └── 10-modules-and-generics/
        ├── exercises.spec.ts        ← you are here
        └── utils/
            └── urls.ts
```

From `exercises.spec.ts`:
- `./utils/urls` → same folder, then into `utils/`
- `../../helpers/blank` → up to `modules/`, up to `ts-study/`, then into `helpers/`

> No `.ts` at the end. Let VS Code write paths for you: type the name, accept the auto-import suggestion.
> If you move a file, VS Code offers to update the imports.

---

## Part 2 · Generics

## 6. Why generics?

Here is a function that returns the first item of an array of strings:

```ts
function firstString(items: string[]): string | undefined {
  return items[0];
}
```

You'd need another one for numbers, another for products... With `any` you'd lose all type checks.
A **generic** function has a **type parameter**: a placeholder for "whatever type you give me".

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

first(['standard_user', 'admin']);   // T = string  → returns string | undefined
first([404, 500]);                   // T = number  → returns number | undefined
first(products);                     // T = Product → returns Product | undefined
```

### 🧩 Anatomy

```
function  first <T> ( items: T[] ) : T | undefined  {  ...  }
                 │          │        │
                 │          │        └── returns: a T (or undefined)
                 │          └── takes: an array of T
                 └── "T is a type placeholder. The caller decides what it is."
```

### 🗣️ Say it

> "function **first of T**: takes items, an array of T, and returns a T or undefined"

`T` is just a name (short for "Type"). You'll also see `K` (key), `V` (value), or longer names like `TData`.

**Usually you don't write `<string>` when calling: TypeScript infers T from the arguments.**
You *can* write it explicitly: `first<string>(names)`. Do it when TypeScript can't guess (see `getJson<Product[]>` below).

---

## 7. You already use generics every day

| You write | It means |
|---|---|
| `string[]` = `Array<string>` | an array of strings (two spellings of the same type) |
| `Promise<User>` | a promise of a User (module 08) |
| `Record<string, number>` | an object with string keys and number values (module 05) |
| `Map<string, User>` | a map from string to User |

So `<...>` after a type name always means "**filled in with** this type".

> 🗣️ `Promise<User>`: "Promise **of** User". `Array<Product>`: "Array **of** Product".

---

## 8. Generic types

You can give type aliases (and interfaces) type parameters too:

```ts
type ApiResponse<T> = {
  status: number;
  data: T;
};

const productsResponse: ApiResponse<Product[]> = { status: 200, data: products };
const meResponse: ApiResponse<User> = { status: 200, data: { username: 'admin', name: 'Ada Admin', role: 'admin' } };
```

One shape for **every** endpoint: only the data type changes.

```ts
async function getJson<T>(path: string): Promise<ApiResponse<T>> { /* ... */ }

const products = await getJson<Product[]>('/api/products');   // we choose T when calling
products.data[0].name;                                         // ✅ typed!
```

---

## 9. Constraints: `<T extends ...>`

Inside a generic function, TypeScript only lets you do what works for **every possible** T.
T could be a number, so `item.id` is an error:

```ts
function getIds<T>(items: T[]): number[] {
  return items.map((item) => item.id);   // ❌ Property 'id' does not exist on type 'T'.
}
```

A **constraint** limits what T can be:

```ts
function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find((item) => item.id === id);   // ✅ every T has an id
}

findById(products, 4);   // ✅ products have an id, and you get a Product back (not just { id })
findById([1, 2], 1);     // ❌ Type 'number' is not assignable to type '{ id: number; }'.
```

### 🗣️ Say it

> "`<T extends { id: number }>`: T can be **any type, as long as it has** an id that is a number"

---

## 10. `keyof`: the property names as a type

```ts
type Product = { id: number; name: string; price: number };
type ProductKey = keyof Product;   // 'id' | 'name' | 'price'
```

Combined with generics, you get functions that only accept real property names:

```ts
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key]);
}

pluck(products, 'name');    // string[]
pluck(products, 'price');   // number[]
pluck(products, 'nmae');    // ❌ Argument of type '"nmae"' is not assignable to parameter of type 'keyof Product'.
```

`T[K]` means "the type of property K in T" (`Product['price']` is `number`).

---

## 11. Utility types: new types from old ones

TypeScript has built-in generic types that transform other types. These are the ones you'll use:

| Utility | Result | Typical use in tests |
|---|---|---|
| `Partial<User>` | every property optional | overrides for a test data builder |
| `Required<Options>` | every property required | options after defaults are applied |
| `Readonly<Config>` | every property read-only | config that must not change |
| `Pick<Product, 'id' \| 'name'>` | only those properties | a summary / a smaller view |
| `Omit<Product, 'id'>` | everything except those | the body to CREATE something (the server gives the id) |
| `Record<Role, string[]>` | an object with those keys and that value type | lookup tables, permissions |

```ts
type User = { username: string; password: string; role: 'admin' | 'user' };

function buildUser(overrides: Partial<User> = {}): User {
  return { username: 'qa_bot', password: 'secret123', role: 'user', ...overrides };
}

buildUser();                       // the defaults
buildUser({ role: 'admin' });      // only change what matters for THIS test
```

### 🧩 Anatomy

```
function buildUser( overrides: Partial<User> = {} ): User
                               └─────┬─────┘   └┬┘
                    "some or none of User's      default: no overrides
                     properties"
```

**Types don't change values.** `Pick<Product, 'id' | 'name'>` doesn't remove properties at runtime;
it only changes what TypeScript lets you use. If you return the full product, it's still the full product.

You may also meet these two (no need to write them yet):

```ts
type Status = ReturnType<typeof getStatus>;          // the type a function returns
type Products = Awaited<ReturnType<typeof getAll>>;  // unwrap a Promise<...>: what you get after await
```

---

## 🎭 In Playwright you'll see

```ts
// pages/login-page.ts
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly submit: Locator;
  constructor(private readonly page: Page) {
    this.submit = page.getByRole('button', { name: 'Log in' });
  }
}

// pages/index.ts (a barrel)
export { LoginPage } from './login-page';
export { ProductsPage } from './products-page';

// fixtures.ts: test.extend is GENERIC: you tell it the type of your fixtures
import { test as base } from '@playwright/test';
import { LoginPage, ProductsPage } from './pages';

type MyFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
});
export { expect } from '@playwright/test';

// a spec file
import { test, expect } from '../fixtures';
import type { Product } from '../types';

test('API returns all products', async ({ request }) => {
  const response = await request.get('/api/products');
  const products: Product[] = await response.json();   // json() returns Promise<any>: annotate it!
  expect(products).toHaveLength(6);
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `SyntaxError: The requested module './utils/money' does not provide an export named 'formatPrice'` (the whole file fails to load) | You import a name the file doesn't export (missing `export`, typo, or it's a default export) | Add `export` in that file / fix the name / use a default import |
| `Module '"./utils/money"' declares 'formatPrice' locally, but it is not exported.` | The same, found by TypeScript: the function exists but has no `export` | Add `export` in front of it |
| `Module '"./utils/urls"' has no exported member 'buildUrls'.` | No export with that name (typo?) | Fix the name (Ctrl+Space lists the exports) |
| `Module '"./utils/logger"' has no exported member 'log'. Did you mean to use 'import log from "./utils/logger"' instead?` | It's a default export, you used `{ }` | `import log from './utils/logger';` |
| `Cannot find module './utils/urls' or its corresponding type declarations.` | Wrong path | Check `./` vs `../`; let VS Code auto-import |
| `Cannot find name 'Role'.` | You use a type from another file without importing it | `import type { Role } from './types';` |
| `Property 'id' does not exist on type 'T'.` | T could be anything | Add a constraint: `<T extends { id: number }>` |
| `Type 'Promise<any>' is missing the following properties from type 'Product[]': length, pop, push...` | Forgot `await` before `response.json()` | `await response.json()` |
| `Argument of type '"nmae"' is not assignable to parameter of type 'keyof Product'.` | That property doesn't exist | Fix the typo (Ctrl+Space lists the keys) |
| A default replaced your test data | Spread order: `{ ...overrides, ...defaults }` | Defaults first, overrides last: `{ ...defaults, ...overrides }` |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
import { buildUrl } from '../modules/10-modules-and-generics/utils/urls';

type ApiResponse<T> = { status: number; data: T };

function first<T>(items: T[]): T | undefined {
  return items[0];
}

function ok<T>(data: T): ApiResponse<T> {
  return { status: 200, data };
}

console.log(buildUrl('/products'));
console.log(first(['Backpack', 'Onesie']), first([]));
console.log(ok({ username: 'admin' }));
```

Hover over each `first(...)` and `ok(...)` call: see how TypeScript fills in `T`.
Then remove the `export` from `buildUrl` in `utils/urls.ts` and read the error (put it back afterwards!).

## 🏋️ Exercises

```bash
npm run check 10
```

Some exercises ask you to edit files in `modules/10-modules-and-generics/utils/`. The comments tell you which.

## 🥋 Kata

Close everything. From memory:

1. Create `my-katas/kata-utils.ts` with:
   - a **named** export `function slug(text: string): string` (lower case, spaces → `-`)
   - a generic, named export `function last<T>(items: T[]): T | undefined`
   - an exported `type ApiResponse<T> = { status: number; data: T };`
2. Create `my-katas/10-modules.spec.ts` that imports `slug` and `last` with a named import,
   and `ApiResponse` with `import type`
3. One test: `slug('Red T-Shirt')` is `'red-t-shirt'`, `last([1, 2, 3])` is `3`, and a constant of type
   `ApiResponse<string[]>` has `data` with length 2
4. In the same test, write `function buildUser(overrides: Partial<{ name: string; role: string }> = {})`
   returning `{ name: 'qa', role: 'user', ...overrides }`, and check `buildUser({ role: 'admin' }).role`

Run it with `npm run kata 10`.

## 🧠 Remember

```ts
export function buildUrl(path: string): string { }     import { buildUrl } from './utils/urls';
export default function log() { }                      import log from './utils/logger';
import type { Page } from '@playwright/test';          export { slugify } from './strings';
function first<T>(items: T[]): T | undefined { }       // T = the caller's type
type ApiResponse<T> = { status: number; data: T };
function findById<T extends { id: number }>(items: T[], id: number) { }
Partial<User>  Required<X>  Pick<P, 'a' | 'b'>  Omit<P, 'id'>  Record<K, V>  keyof T
```

## ✅ Done when

- [ ] `npm run check 10` is all green with 0 type errors
- [ ] You can read `function first<T>(items: T[]): T | undefined` aloud
- [ ] You know when to use `{ }` in an import (named) and when not (default)
- [ ] Kata done without looking
- [ ] `npm run drill`
