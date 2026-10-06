# Module 04 · Arrays

> **Why this matters for Playwright:** pages are full of lists: products, table rows, menu items, error messages.
> `await locator.allTextContents()` gives you a `string[]`, and then you check it: does it contain "Backpack"?
> Are there 6 items? Is it sorted by price? This module gives you the tools: `map`, `filter`, `find`, `sort` and friends.

## 🎯 After this module you can

- Create typed arrays (`string[]`, `Array<number>`) and read them (`[0]`, `.at(-1)`, `.length`)
- Add, remove and search (`push`, `pop`, `includes`, `indexOf`)
- Transform and search lists with callbacks: `map`, `filter`, `find`, `findIndex`, `some`, `every`, `reduce`
- Sort correctly (numbers need a compare function!) without changing the original
- Use `join`, `slice`, spread `[...a]`, and array destructuring `const [first] = list`
- Assert on lists: `toEqual`, `toContain`, `toHaveLength`, and "is it sorted?"

---

## 1. Creating an array

An array is an **ordered list** of values.

```ts
const users: string[] = ['standard_user', 'admin', 'locked_user'];
const prices: Array<number> = [29.99, 9.99, 15.99];   // same as number[]
const statusCodes = [200, 201, 404];                  // inferred: number[]
const cart: string[] = [];                            // empty: write the type!
```

### 🧩 Anatomy

```
const  users : string[]  =  [ 'standard_user', 'admin', 'locked_user' ] ;
                 │   │      │ └──────────────┬───────────────────────┘ │
                 │   │      │      the items, separated by commas      │
                 │   │      └ square brackets open the list ───────────┘
                 │   └ [] = "a list of"
                 └ the type of each item
```

### 🗣️ Say it

`const users: string[] = [...]`
> "constant **users**, of type **string array**, equals a list of ..."

`string[]` and `Array<string>` mean exactly the same. `string[]` is more common; you'll see `Array<...>` in some code bases.

All items should have the same type. TypeScript stops you from mixing:
`users.push(42)` → `Argument of type 'number' is not assignable to parameter of type 'string'.`

---

## 2. Reading items

```ts
const users = ['standard_user', 'admin', 'locked_user'];

users[0]        // 'standard_user'   first item (index 0!)
users[2]        // 'locked_user'
users.at(-1)    // 'locked_user'     last item
users.length    // 3
users[3]        // undefined         no item there, and NO error
```

Same rules as characters in a string (module 02): counting starts at 0, the last index is `length - 1`.

---

## 3. Changing and searching

```ts
const cart: string[] = [];
cart.push('Backpack');          // add at the end   → ['Backpack']
cart.push('Bike Light');        //                  → ['Backpack', 'Bike Light']
const last = cart.pop();        // remove the last one and give it back → last = 'Bike Light'

cart.includes('Backpack')       // true   is it in the list?
cart.indexOf('Backpack')        // 0      where? (-1 = not found)
```

> **`const` arrays CAN change their content.** `const` only means the variable can't point to a *different* array.
> `cart.push(...)` is fine. `cart = []` is not.

---

## 4. Looping: `for...of`

```ts
const quantities = [2, 1, 3];
let totalItems = 0;
for (const quantity of quantities) {
  totalItems += quantity;
}
// totalItems is 6
```

### 🧩 Anatomy

```
for ( const quantity  of  quantities ) {  ...  }
        │       │      │      │            └ runs once per item
        │       │      │      └ the array
        │       │      └ "of": take each item OF the list
        │       └ a new name for the current item (singular!)
        └ const: a fresh variable each time
```

### 🗣️ Say it

> "for each **quantity** of **quantities**, do ..."

Name the array in the plural (`quantities`) and the item in the singular (`quantity`). It makes the code read like English.
In test code you'll use loops less than you think: the methods below usually do the job in one line.

---

## 5. Methods with callbacks: `map`, `filter`, `find` ...

These methods take a **callback** (module 03): a function that the method calls **once for every item**.

```ts
const prices = [29.99, 9.99, 15.99, 49.99, 7.99];

prices.map((price) => price * 2)          // [59.98, 19.98, 31.98, 99.98, 15.98]   transform each
prices.filter((price) => price < 20)      // [9.99, 15.99, 7.99]                    keep some
prices.find((price) => price < 20)        // 9.99                                   first match
prices.findIndex((price) => price < 20)   // 1                                      index of first match
prices.some((price) => price > 40)        // true                                   at least one?
prices.every((price) => price > 0)        // true                                   all of them?
```

### 🧩 Anatomy

```
const cheap = prices.filter( (price) => price < 20 );
                       │      └──┬──┘    └───┬────┘
                       │    each item     return true = KEEP it
                       │    (you choose the name)
                       └ the method
```

### 🗣️ Say it

`prices.filter((price) => price < 20)`
> "prices, **filter**: keep each **price** where price is less than 20"

`names.map((name) => name.toUpperCase())`
> "names, **map** each **name** to name to-upper-case"

### Which one do I need?

| Method | The callback returns | The method gives back | Example question |
|---|---|---|---|
| `map` | the new value | a new array, **same length** | "all the names in upper case" |
| `filter` | `true`/`false` | a new array with the items that got `true` | "only the products under $20" |
| `find` | `true`/`false` | the **first item** that got `true`, or `undefined` | "the product called Onesie" |
| `findIndex` | `true`/`false` | its **index**, or `-1` | "where is the first error?" |
| `some` | `true`/`false` | `true` if **at least one** got `true` | "is any product sold out?" |
| `every` | `true`/`false` | `true` if **all** got `true` | "are all prices positive?" |

None of these change the original array. They give you a new value.

**`find` can return `undefined`.** TypeScript knows that, so `const first = names.find(...)` has the type `string | undefined`.
If you then write `first.length`, you get `'first' is possibly 'undefined'.` Module 07 shows how to handle it. In assertions it's fine: `expect(first).toBe('Backpack')`.

---

## 6. `reduce`: many values → one value

The classic: add up all the prices in the cart.

```ts
const cartPrices = [29.99, 9.99, 15.99];
const total = cartPrices.reduce((sum, price) => sum + price, 0);   // 55.97
```

### 🧩 Anatomy

```
cartPrices.reduce( (sum, price) => sum + price ,  0  )
                    │     │        └────┬────┘    │
                    │     │   the NEW sum (returned) │
                    │     └ the current item         └ the starting value of sum
                    └ the running total ("accumulator")
```

Step by step: `sum` starts at `0` → `0 + 29.99` → `29.99 + 9.99` → `39.98 + 15.99` → `55.97`.

### 🗣️ Say it

> "cartPrices **reduce**: starting from **0**, for each **price**, the new sum is sum plus price"

**Always give the starting value** (`, 0`). Without it, an empty array crashes: `TypeError: Reduce of empty array with no initial value`.
And remember module 02: the result is a calculated decimal, so assert with `toBeCloseTo`.

---

## 7. Sorting (careful!)

### Gotcha 1: `sort()` sorts numbers as TEXT

```ts
[10, 9, 100, 1].sort()                    // [1, 10, 100, 9]  ← "alphabetical": '10' comes before '9'
[10, 9, 100, 1].sort((a, b) => a - b)     // [1, 9, 10, 100]  ✅ low to high
[10, 9, 100, 1].sort((a, b) => b - a)     // [100, 10, 9, 1]  ✅ high to low
```

### 🧩 Anatomy: the compare function

```
.sort( (a, b) => a - b )
         │  │    └──┬─┘
         │  │    negative → a goes first
         │  │    positive → b goes first
         └──┴ two items being compared
```

You don't have to understand the maths. Remember: **`a - b` = low to high, `b - a` = high to low.**

Strings: `.sort()` is fine for simple names (A to Z). Note that capital letters come before small letters (`'Zebra'` before `'apple'`).
For "human" sorting use `.sort((a, b) => a.localeCompare(b))`.

### Gotcha 2: `sort()` CHANGES the original array

```ts
const names = ['Onesie', 'Backpack', 'Bike Light'];
const sorted = names.sort();
// names is now ALSO ['Backpack', 'Bike Light', 'Onesie']  😱
```

Make a copy first with the spread operator `[...names]` (section 8):

```ts
const sorted = [...names].sort();   // names stays as it was ✅
```

`.reverse()` also changes the original. Same fix: `[...names].reverse()`.

---

## 8. `join`, `slice`, spread

```ts
const names = ['Backpack', 'Bike Light', 'Onesie'];

names.join(', ')           // 'Backpack, Bike Light, Onesie'   list → one string (opposite of split)
names.slice(0, 2)          // ['Backpack', 'Bike Light']       a piece (end NOT included), original unchanged
[...names]                 // a copy
[...names, 'Red T-Shirt']  // a copy with one more at the end
[...names, ...otherNames]  // two lists joined into a new one
Math.max(...[29.99, 9.99]) // 29.99   spread the list into separate arguments
```

### 🧩 Anatomy: spread

```
[ ...names , 'Red T-Shirt' ]
  └──┬───┘
  "take every item out of names and put it here"
```

### 🗣️ Say it

`[...names]` > "a new array with **all the items of** names"

---

## 9. Array destructuring

Take items out of an array into variables, by position:

```ts
const credentials = ['standard_user', 'secret123'];
const [username, password] = credentials;   // username = 'standard_user', password = 'secret123'

const [first] = ['Backpack', 'Bike Light']; // first = 'Backpack'
const [, second] = ['Backpack', 'Bike Light']; // skip one with a comma: second = 'Bike Light'
```

### 🗣️ Say it

`const [username, password] = credentials;`
> "take the first two items of credentials, and call them **username** and **password**"

(The `{ }` version for objects is the one Playwright uses all the time. That's module 05.)

---

## 10. Arrays of objects (a first look)

Real lists usually hold objects. You read a property with a dot. Module 05 explains objects in detail.

```ts
const products = [
  { name: 'Backpack', price: 29.99, stock: 10 },
  { name: 'Onesie', price: 7.99, stock: 0 },
];

products.map((product) => product.name)               // ['Backpack', 'Onesie']
products.filter((product) => product.stock > 0)       // [ { name: 'Backpack', ... } ]
products.find((product) => product.name === 'Onesie') // { name: 'Onesie', price: 7.99, stock: 0 }
```

You can **chain** methods: `products.filter(...).map(...)` = "keep some, then transform them".

---

## 11. Assertions on arrays

| You want to check | Write |
|---|---|
| exactly these items, in this order | `expect(names).toEqual(['Backpack', 'Onesie'])` |
| contains one item | `expect(names).toContain('Backpack')` |
| how many items | `expect(names).toHaveLength(6)` |
| it is sorted A to Z | `expect(names).toEqual([...names].sort())` |
| prices sorted low to high | `expect(prices).toEqual([...prices].sort((a, b) => a - b))` |
| every item passes a check | `expect(prices.every((p) => p > 0)).toBe(true)` |

### `toBe` vs `toEqual`

```ts
expect(['a', 'b']).toBe(['a', 'b']);     // ❌ fails!
expect(['a', 'b']).toEqual(['a', 'b']);  // ✅
```

`toBe` asks "is it the **same** array (the same box in memory)?". Two arrays created separately are two different boxes,
even with the same content. `toEqual` compares the **content**.
**Rule:** `toBe` for strings, numbers and booleans. `toEqual` for arrays and objects.

### 🧩 Anatomy: "is it sorted?"

```
expect( names ).toEqual( [...names].sort() );
          │                └───┬───┘ └─┬─┘
     the list as the page    copy it   sort the copy
     shows it                (don't touch the original!)
```

> "expect names to equal **a sorted copy of** names". If the page already shows them sorted, both are the same.

---

## 🎭 In Playwright you'll see

```ts
const names = await page.getByRole('heading', { level: 2 }).allTextContents();  // string[]
expect(names).toContain('Backpack');
expect(names).toHaveLength(6);
expect(names).toEqual([...names].sort());                           // sorted A to Z?

const priceTexts = await page.locator('.price').allTextContents();  // ['$29.99', '$9.99', ...]
const prices = priceTexts.map((text) => parseFloat(text.replace('$', '')));
expect(prices).toEqual([...prices].sort((a, b) => a - b));          // sorted low to high?

// Playwright also has list assertions on locators:
await expect(page.getByTestId('product-card')).toHaveCount(6);
await expect(page.getByRole('listitem')).toHaveText(['Backpack', 'Bike Light']);
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Received: serializes to the same string` | You used `toBe` on two arrays with the same content | `toEqual` |
| `Expected: [1, 9, 10, 100]` / `Received: [1, 10, 100, 9]` | `sort()` without a compare function sorts as text | `.sort((a, b) => a - b)` |
| The original array is suddenly sorted | `sort()` / `reverse()` change the original | `[...list].sort()` |
| `Property 'lenght' does not exist on type 'string[]'. Did you mean 'length'?` | Typo | `length` |
| `Argument of type 'number' is not assignable to parameter of type 'string'.` | `push` of the wrong type into a `string[]` | Push the right type, or fix the array's type |
| `'first' is possibly 'undefined'.` | `find` may find nothing | Check it in an `expect`, or use `first?.length` |
| `No overload matches this call.` (on `reduce`) / `Received: undefined` | Callback has `{ }` but no `return` | Remove the `{ }` or add `return` |
| `TypeError: Reduce of empty array with no initial value` | `reduce` without the starting value | Add `, 0` |
| `Expected length: 6` / `Received length: 5` | `toHaveLength` failed: one item is missing (or extra) | Read the `Received array` printed below it |
| `Expected value: "Onesie"` / `Received array: [...]` (on `toContain`) | The item is not in the list (check case and spaces!) | Compare with the received list |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
const priceTexts: string[] = ['$29.99', '$9.99', '$49.99', '$7.99'];
const prices = priceTexts.map((text) => parseFloat(text.replace('$', '')));
const cheap = prices.filter((price) => price < 20);
const total = prices.reduce((sum, price) => sum + price, 0);
const sorted = [...prices].sort((a, b) => a - b);
const [cheapest] = sorted;
console.log(prices, cheap, total.toFixed(2));
console.log(sorted, cheapest, prices.includes(9.99), [10, 9, 100].sort());
```

Then break it: remove the `[...]` around `prices` in the sort line and print `prices` again. Remove the `, 0` from reduce and use an empty array.

## 🏋️ Exercises

```bash
npm run check 04
```

## 🥋 Kata

Close everything. In `my-katas/04-arrays.spec.ts`, from memory, write one test that:
1. declares `const priceTexts: string[] = ['$29.99', '$9.99', '$15.99']`
2. creates `prices` with `map` (remove the `$`, `parseFloat`)
3. asserts `prices` has length 3 and contains `9.99`
4. creates `total` with `reduce` and asserts it is close to `55.97`
5. asserts that `prices` is NOT sorted low to high: `expect(prices).not.toEqual([...prices].sort((a, b) => a - b))`

Run it with `npm run kata 04`.

## 🧠 Remember

```ts
const names: string[] = ['a', 'b'];   names[0]   names.at(-1)   names.length
names.push('c');  names.includes('a');  names.join(', ');  const [first] = names;
list.map((x) => ...)  .filter((x) => true/false)  .find(...)  .some(...)  .every(...)
list.reduce((sum, x) => sum + x, 0)            // always the starting value
[...prices].sort((a, b) => a - b)              // copy first; a - b = low to high
expect(list).toEqual([...]);  toContain(x);  toHaveLength(n);   // never toBe for arrays
```

## ✅ Done when

- [ ] `npm run check 04` is all green with 0 type errors
- [ ] Kata done without looking
- [ ] `npm run drill`
