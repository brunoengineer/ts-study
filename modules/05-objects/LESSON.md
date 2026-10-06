# Module 05 · Objects

> **Why this matters for Playwright:** an API response is an object (`{ token, user: { name, role } }`).
> Test data is an object (`{ username, password }`). HTTP headers are an object. And the `{ page }` in
> `test('...', async ({ page }) => { ... })` is **object destructuring**. After this module, that line will make sense.

## 🎯 After this module you can

- Create objects, read them (dot and brackets) and update them
- Describe their shape with `type` and `interface`, including optional (`?`) and `readonly` properties
- Work with nested objects and arrays of objects (`Product[]`)
- Destructure objects (rename, defaults, in function parameters) and explain `async ({ page }) =>`
- Copy and merge objects with spread (`{ ...defaults, ...overrides }`) to build test data
- Use `Object.keys/values/entries`, `Record<string, string>`, `JSON.stringify/parse`
- Choose between `toBe`, `toEqual`, `toMatchObject` and `toHaveProperty`

---

## 1. Object literals

An object groups related values under **names** (called *keys* or *properties*).

```ts
const product = {
  id: 1,
  name: 'Backpack',
  price: 29.99,
  category: 'bags',
  stock: 10,
  description: 'A sturdy backpack for all your test gear.',
};
```

### 🧩 Anatomy

```
const product = {  name : 'Backpack' ,  price : 29.99  } ;
                │   │   │     │      │
                │   │   │     │      └ comma between properties
                │   │   │     └ value (any type)
                │   │   └ colon: "is"
                │   └ key (property name)
                └ curly braces: an object
```

### 🗣️ Say it

`{ name: 'Backpack', price: 29.99 }`
> "an object where **name** is Backpack and **price** is 29.99"

> Arrays (module 04) are `[ ]` lists, found by **position**. Objects are `{ }` records, found by **name**.

### Shorthand: key and variable with the same name

```ts
const username = 'admin';
const password = 'admin123';
const credentials = { username, password };   // same as { username: username, password: password }
```

You'll see this all the time in Playwright code.

---

## 2. Reading: dot or brackets

```ts
product.name             // 'Backpack'         dot: the normal way
product['price']         // 29.99              brackets: the key is a string
const field = 'category';
product[field]           // 'bags'             brackets: the key is in a variable

const headers = { 'Content-Type': 'application/json' };
headers['Content-Type']  // keys with - or spaces need quotes AND brackets
```

| Use | When |
|---|---|
| `obj.key` | almost always |
| `obj['some-key']` | the key has `-`, spaces or other special characters |
| `obj[variable]` | the key is stored in a variable |

Reading a key that doesn't exist gives `undefined` at runtime. TypeScript catches it first:
`product.nmae` → `Property 'nmae' does not exist on type ...`.

---

## 3. Changing properties

```ts
const product = { name: 'Backpack', price: 29.99, stock: 10 };
product.stock = product.stock - 1;   // 9
product.price = 25;
product.stock--;                     // 8
```

Like arrays: a `const` object can change its **content**. `const` only stops `product = { ... }`.

But you can't **add** new keys TypeScript doesn't know about:
`product.color = 'red'` → `Property 'color' does not exist on type '{ name: string; price: number; stock: number; }'.`
Declare every property up front (or make it optional, section 5).

---

## 4. Describing the shape: `type` and `interface`

When you use the same shape many times, give it a name. There are two ways:

```ts
type User = {
  username: string;
  name: string;
  role: string;
};

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

const admin: User = { username: 'admin', name: 'Ada Admin', role: 'admin' };
```

### 🧩 Anatomy

```
type  User  =  {  username: string;  name: string;  role: string;  } ;
 │     │    │      └──────┬──────┘
 │     │    │       key: type;   (semicolons between them)
 │     │    └ "is": type has an =
 │     └ the name: PascalCase (capital first letter)
 └ keyword

interface  Product  {  id: number;  name: string;  ...  }
    │         │     └ NO = before the {
    │         └ PascalCase name
    └ keyword
```

### 🗣️ Say it

`type User = { username: string; ... }`
> "type **User** is an object with **username** of type string, ..."

`const admin: User = { ... }`
> "constant **admin**, of type **User**, equals ..." Same colon as always: "of type".

### `type` or `interface`?

| | `type User = { ... }` | `interface User { ... }` |
|---|---|---|
| Describes an object | ✅ | ✅ |
| Other things too (`string \| number`, function types) | ✅ | ❌ objects only |
| Syntax | has `=` | no `=` |
| Typical use | data shapes, unions | page objects, classes, library code |

For test data, both are fine. Pick one style per project and be consistent.
Playwright's own code uses `interface` a lot, so you'll read both.

TypeScript checks the object against the shape, both ways:

```ts
const light: Product = { id: 2, name: 'Bike Light', price: 9.99, category: 'accessories', stock: 25 };
// ❌ Property 'description' is missing in type '{ ... }' but required in type 'Product'.

const odd: User = { username: 'x', name: 'X', role: 'user', colour: 'red' };
// ❌ Object literal may only specify known properties, and 'colour' does not exist in type 'User'.
```

---

## 5. Optional `?` and `readonly`

```ts
type TestUser = {
  readonly username: string;   // can't change after creation
  password: string;
  role?: string;               // may be missing
};

const sam: TestUser = { username: 'standard_user', password: 'secret123' };   // ✅ no role: fine
sam.role             // undefined
sam.password = 'x';  // ✅
sam.username = 'y';  // ❌ Cannot assign to 'username' because it is a read-only property.
```

### 🗣️ Say it

`role?: string` > "role, **optional**, of type string" · `readonly username: string` > "**read-only** username of type string"

`readonly` is great for config objects that must never change in the middle of a test.

---

## 6. Nested objects and arrays of objects

```ts
type LoginResponse = {
  token: string;
  user: User;               // an object inside an object
};

const body: LoginResponse = {
  token: 'abc123',
  user: { username: 'admin', name: 'Ada Admin', role: 'admin' },
};
body.user.name   // 'Ada Admin'   read it like a path: body → user → name

const products: Product[] = [ /* ...6 products... */ ];   // an ARRAY of Product objects
products[0].name                                    // the first product's name
products.map((product) => product.name)             // all names (module 04)
products.find((product) => product.id === 4)?.name  // 'Fleece Jacket'
```

`find` can return `undefined` (module 04). `?.` means "if it's there, read `.name`; if not, give `undefined` instead of crashing" (module 07 covers it fully).

---

## 7. Object destructuring

Take properties **out** of an object into variables, by **name**:

```ts
const product = { id: 1, name: 'Backpack', price: 29.99 };

const { name, price } = product;           // name = 'Backpack', price = 29.99
const { name: productName } = product;     // rename: productName = 'Backpack'
const account: { username: string; role?: string } = { username: 'standard_user' };
const { role = 'user' } = account;         // default: account has no role, so role = 'user'
```

### 🧩 Anatomy

```
const {  name ,  price: cost ,  role = 'user'  } = someObject ;
         │       └────┬────┘    └─────┬─────┘
         │       take "price",   take "role"; if it's missing,
         │       call it "cost"  use 'user'
         └ take "name", call it name
```

### 🗣️ Say it

`const { name, price } = product;`
> "take **name** and **price** out of product"

`const { username: login } = account;`
> "take **username** out of account, and call it **login**"

⚠️ The colon here does **not** mean "of type". In destructuring, `username: login` means "rename". It's confusing,
and everyone mixes it up at first. Watch for the `{ }` on the **left** of the `=`.

Compare with arrays (module 04): `[a, b]` takes by **position**, `{ a, b }` takes by **name**.

---

## 8. Destructuring in parameters = Playwright fixtures

You can destructure right in a function's parameter list:

```ts
function describeProduct({ name, price }: Product): string {
  return `${name} costs $${price}`;
}
describeProduct(backpack);   // 'Backpack costs $29.99'
```

### 🧩 Anatomy

```
function describeProduct(  { name, price }  :  Product  ) : string
                           └──────┬──────┘     └──┬──┘
                    take these out of the       the type of the
                    object you receive          WHOLE object
```

**Now look at a Playwright test again:**

```ts
test('add to cart', async ({ page }) => {
  await page.goto('/products');
});
```

Playwright calls your function with ONE object full of **fixtures**: `{ page, request, context, browser, baseURL, ... }`.
`({ page })` takes just `page` out of it. Want two? `async ({ page, request }) => { ... }`.

```
test( 'add to cart' , async ( { page } ) => { ... } )
                              └───┬──┘
           "from all the fixtures Playwright gives me, take page"
```

That's why this is wrong:

```ts
test('add to cart', async (page) => { ... });
// ❌ Error: First argument must use the object destructuring pattern: page
```

Without `{ }`, `page` would be the whole fixtures object, not the page. Playwright refuses it on purpose.
(In module 16 you'll create your own fixtures, and they arrive in the same `{ }`.)

---

## 9. Spread: copy and merge

```ts
const defaults = { username: 'standard_user', password: 'secret123', role: 'user' };

const copy = { ...defaults };                         // a new object with the same content
const admin = { ...defaults, role: 'admin' };         // copy, then overwrite role
const merged = { ...defaults, ...{ password: 'x' } }; // merge two objects
```

**The last one wins.** `{ ...defaults, role: 'admin' }` → role is `'admin'`. `{ role: 'admin', ...defaults }` → role is `'user'`
(TypeScript even warns you: `'role' is specified more than once, so this usage will be overwritten.`).

### 🗣️ Say it

`{ ...defaults, ...overrides }`
> "a new object with **all of** defaults, **then all of** overrides on top"

### Copy vs reference

```ts
const original = { name: 'Backpack', stock: 10 };
const sameBox = original;          // NOT a copy: two names for the SAME object
sameBox.stock = 0;
original.stock                     // 0  😱

const realCopy = { ...original };  // a new object
```

(Spread copies one level deep. Nested objects inside are still shared. For test data that's usually fine.)

### The test data builder pattern

```ts
function buildProduct(overrides: Partial<Product> = {}): Product {
  const defaults: Product = {
    id: 100, name: 'Test Product', price: 10, category: 'other', stock: 10, description: 'Created by a test',
  };
  return { ...defaults, ...overrides };
}

buildProduct();                          // all defaults
buildProduct({ price: 0.99 });           // defaults, but cheap
buildProduct({ stock: 0, name: 'Gone' });// a sold-out product
```

`Partial<Product>` = "a Product where **every** property is optional". Each test only says what is special about its data.

---

## 10. `Object.keys`, `Object.values`, `Object.entries`

```ts
const user: User = { username: 'admin', name: 'Ada Admin', role: 'admin' };

Object.keys(user)      // ['username', 'name', 'role']                     the names
Object.values(user)    // ['admin', 'Ada Admin', 'admin']                  the values
Object.entries(user)   // [['username', 'admin'], ['name', 'Ada Admin'], ['role', 'admin']]   pairs

for (const [key, value] of Object.entries(user)) {
  console.log(`${key} = ${value}`);
}
```

All three give back **arrays**, so everything from module 04 works on them (`length`, `map`, `includes`...).

---

## 11. `Record<string, string>`: "any keys, all values the same type"

Some objects don't have a fixed list of keys, like HTTP headers or query parameters:

```ts
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};
headers['X-Request-Id'] = 'abc';   // ✅ any string key is allowed
```

### 🗣️ Say it

`Record<string, string>`
> "a record with **string** keys and **string** values"

---

## 12. JSON: objects as text

APIs send objects as **text** (JSON). Two functions convert:

```ts
const body = { productId: 1, quantity: 2 };
const text = JSON.stringify(body);   // '{"productId":1,"quantity":2}'   object → string
const back = JSON.parse(text);       // { productId: 1, quantity: 2 }    string → object

const response: LoginResponse = JSON.parse('{"token":"abc","user":{"username":"admin","name":"Ada Admin","role":"admin"}}');
```

JSON uses **double** quotes, always. `JSON.parse` returns `any`, so put a type on the variable to get autocomplete and checks back.

---

## 13. Assertions on objects

| Matcher | Passes when | Use it for |
|---|---|---|
| `toBe(x)` | it's the **same object** in memory | almost never for objects |
| `toEqual({ ... })` | **all** keys and values are equal | the whole object must match |
| `toMatchObject({ ... })` | the object has **at least** these keys/values (extras are OK) | API responses with ids, dates, tokens |
| `toHaveProperty('key')` | the key exists | "the response has a token" |
| `toHaveProperty('user.role', 'admin')` | the (nested) key has this value | a quick check deep inside |

```ts
const product = { id: 1, name: 'Backpack', price: 29.99, stock: 10 };

expect(product).toBe({ id: 1, name: 'Backpack', price: 29.99, stock: 10 });  // ❌ different objects
expect(product).toEqual({ id: 1, name: 'Backpack', price: 29.99, stock: 10 }); // ✅
expect(product).toEqual({ name: 'Backpack' });                                // ❌ id, price, stock missing
expect(product).toMatchObject({ name: 'Backpack', price: 29.99 });            // ✅ a subset is enough
expect(product).toHaveProperty('stock', 10);                                  // ✅
```

### 🗣️ Say it

`expect(body).toMatchObject({ user: { role: 'admin' } });`
> "expect body to **contain at least** a user whose role is admin"

---

## 🎭 In Playwright you'll see

```ts
// fixtures: object destructuring in the parameter
test('login API', async ({ request }) => {
  const credentials = { username: 'admin', password: 'admin123' };   // a plain object
  const response = await request.post('/api/login', { data: credentials });   // an options object
  const body = await response.json();                                 // JSON → object

  expect(body).toHaveProperty('token');
  expect(body).toMatchObject({ user: { username: 'admin', role: 'admin' } });

  const { token } = body;                                             // destructuring
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const me = await request.get('/api/me', { headers });               // shorthand { headers: headers }
  expect(await me.json()).toEqual({ username: 'admin', name: 'Ada Admin', role: 'admin' });
});

// options objects are everywhere
await page.getByRole('button', { name: 'Log in' }).click();
await expect(page.getByText('Loaded')).toBeVisible({ timeout: 10_000 });
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Received: serializes to the same string` | `toBe` on two objects with the same content | `toEqual` (or `toMatchObject`) |
| `Property 'nmae' does not exist on type 'Product'.` | Typo, or the key really isn't in the type | Check the spelling / the type |
| `Property 'description' is missing in type '{ ... }' but required in type 'Product'.` | Your object lacks a required key | Add it, or make it optional (`?`) in the type |
| `Object literal may only specify known properties, and 'colour' does not exist in type 'User'.` | Extra key not in the type (often a typo) | Remove/rename it, or add it to the type |
| `Cannot assign to 'baseUrl' because it is a read-only property.` | You changed a `readonly` property | Create a new object instead: `{ ...config, baseUrl: '...' }` |
| `Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'Product'.` | `product[key]` with `key: string`: TypeScript can't know the key exists | Use dot access, or `Record<string, ...>` for free-form objects |
| `Error: First argument must use the object destructuring pattern: page` | You wrote `async (page) =>` in a Playwright test | `async ({ page }) =>` |
| Changing a "copy" also changed the original | `const copy = original` is not a copy | `const copy = { ...original }` |
| `SyntaxError: Unexpected token ... is not valid JSON` | `JSON.parse` got text that isn't JSON (often an HTML error page) | Log the text and check the API response |
| `toEqual` fails with `- Expected` / `+ Received` lines | Some keys differ; `+` lines are what you really got | Read the diff, or use `toMatchObject` if extra keys are fine |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
type User = { username: string; name: string; role: string };

const defaults: User = { username: 'standard_user', name: 'Sam Standard', role: 'user' };
const admin: User = { ...defaults, username: 'admin', role: 'admin' };
const { username, role: adminRole } = admin;
const describeUser = ({ name, role }: User): string => `${name} (${role})`;
const json = JSON.stringify(admin);

console.log(username, adminRole, describeUser(defaults), describeUser(admin));
console.log(Object.keys(admin), json, JSON.parse(json).name);
```

Then break it: add `colour: 'red'` to `defaults`, change `role: adminRole` to `role: string`, and read the errors.

## 🏋️ Exercises

```bash
npm run check 05
```

## 🥋 Kata

Close everything. In `my-katas/05-objects.spec.ts`, from memory, write one test that:
1. declares `type Product = { id: number; name: string; price: number; stock: number }`
2. writes `function buildProduct(overrides: Partial<Product> = {}): Product` that merges defaults with overrides
3. creates `const soldOut = buildProduct({ stock: 0 })`
4. destructures `{ name, stock }` from `soldOut` and asserts `stock` is `0`
5. asserts `soldOut` matches `{ stock: 0 }` with `toMatchObject` and has the property `'price'`

Run it with `npm run kata 05`.

## 🧠 Remember

```ts
type User = { username: string; role?: string; readonly id: number };  // ? optional, readonly
const user: User = { username: 'admin', id: 1 };   user.username   user['username']
const { username, role = 'user' } = user;          // take out by name (+ default)
const { username: login } = user;                  // rename (this colon is NOT a type!)
async ({ page }) => { }                            // destructuring the fixtures object
const admin = { ...user, role: 'admin' };          // copy + override, last one wins
Object.keys(obj)   Record<string, string>   JSON.stringify(obj)   JSON.parse(text)
expect(obj).toEqual({...});  toMatchObject({...});  toHaveProperty('a.b', value);
```

## ✅ Done when

- [ ] `npm run check 05` is all green with 0 type errors
- [ ] Kata done without looking
- [ ] `npm run drill`
