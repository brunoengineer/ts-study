# Module 02 · Strings and Numbers

> **Why this matters for Playwright:** almost everything you read from a page is a **string**: a heading,
> an error message, a price like `"$29.99"`, a counter like `"6 products"`. To check it, you often have to
> clean it, cut it, or turn it into a **number**. You also build strings all day: URLs, unique emails, selectors.

## 🎯 After this module you can

- Build strings with template literals: `` `Hello, ${name}!` ``
- Use the string methods testers need: `length`, `trim`, `toLowerCase`, `includes`, `slice`, `split`, `replace`, `padStart` ...
- Turn text into numbers (`Number`, `parseInt`, `parseFloat`) and numbers into text (`String`, `toFixed`)
- Use `Math` (round, floor, ceil, max, min, random) and make a random whole number
- Explain `NaN` and the `0.1 + 0.2` problem, and use `toBeCloseTo`
- Read and write simple regular expressions: `/products/`, `/^Hello/`, `/\d+ items/i`

---

## 1. Three kinds of quotes

```ts
const a = 'single quotes';
const b = "double quotes";
const c = `backticks`;
```

All three make a `string`. This course uses single quotes `'...'` for normal text and backticks `` `...` `` when you need to put a value inside (section 2).

**Quotes inside quotes.** If your text contains the same quote you used to open it, the string ends too early:

```ts
const bad = 'It's broken';      // ❌ the string ends after It
const ok1 = "It's fine";        // ✅ use the other kind of quote
const ok2 = 'It\'s fine';       // ✅ or "escape" it with a backslash \
const ok3 = `It's fine`;        // ✅ backticks don't care about ' or "
```

The backslash `\` means "the next character is just text, not code". Two other escapes you'll see:
`\n` is a new line and `\\` is one real backslash.

---

## 2. Template literals: `${}`

A **template literal** is a string in backticks. Inside it, `${ ... }` runs a bit of code and puts the result into the text.

```ts
const username = 'standard_user';
const productId = 4;

const greeting = `Hello, ${username}!`;                     // 'Hello, standard_user!'
const url = `http://localhost:3000/products/${productId}`;  // '.../products/4'
const sum = `2 + 3 = ${2 + 3}`;                             // '2 + 3 = 5'
```

### 🧩 Anatomy

```
`Hello, ${ username }!`
│       └────┬─────┘ │
│     a "hole": any   └ more normal text
│     code goes here
└ backtick (NOT a single quote: it's the key under Esc)
```

### 🗣️ Say it

`` `Hello, ${username}!` ``
> "template string: Hello, **dollar-brace username**, exclamation mark"

The old way was `'Hello, ' + username + '!'`. It works, but it's easy to forget a space or a `+`. Prefer backticks.

**The most common bug:** using single quotes with `${}`. Then nothing is replaced:

```ts
const wrong = 'Hello, ${username}!';   // the text is literally: Hello, ${username}!
```

### Multi-line strings

Backticks can go over several lines. The new lines stay in the string:

```ts
const body = `Line one
Line two`;            // same as 'Line one\nLine two'
```

### 🧪 Unique test data

Tests that create users must not reuse the same email. `Date.now()` gives the current time in milliseconds
(a big number that changes every millisecond), so it makes text unique:

```ts
const email = `user_${Date.now()}@test.com`;   // 'user_1767225600000@test.com'
```

---

## 3. Length and single characters

```ts
const code = 'ORD-1001';
code.length    // 8         how many characters
code[0]        // 'O'       the first character (counting starts at 0!)
code[3]        // '-'
code.at(-1)    // '1'       the LAST character (negative counts from the end)
```

```
 O   R   D   -   1   0   0   1
 0   1   2   3   4   5   6   7      <- index with [ ]
-8  -7  -6  -5  -4  -3  -2  -1      <- index with .at( )
```

> `.length` has no `( )`. It's a **property** (something the string *has*), not a **method** (something the string *does*).

---

## 4. String methods: `value.method(arguments)`

A method is a function that belongs to a value. You call it with a dot.

### 🧩 Anatomy

```
'  Add to Cart  '.trim()
└──────┬──────┘ │└─┬─┘└ ( ) = "do it now"
     the value  │ method name
                └ dot: "use a tool of this value"
```

### 🗣️ Say it

`label.toLowerCase()`
> "label, **dot** toLowerCase, **call it**"

**Important: strings never change.** A method gives you a **new** string. The original stays the same:

```ts
const label = 'Log In';
label.toUpperCase();          // returns 'LOG IN' ... and you threw it away
label                         // still 'Log In'
const upper = label.toUpperCase();   // ✅ keep the result in a variable
```

### Case and spaces

| Method | Example | Result |
|---|---|---|
| `toUpperCase()` | `'Log In'.toUpperCase()` | `'LOG IN'` |
| `toLowerCase()` | `'Log In'.toLowerCase()` | `'log in'` |
| `trim()` | `'  29.99 \n'.trim()` | `'29.99'` (spaces and new lines removed at both ends) |

Text from a web page often has extra spaces or new lines. `trim()` is your friend.
To compare text without caring about upper/lower case, lower both sides: `a.toLowerCase() === b.toLowerCase()`.

### Searching: is it there? where?

```ts
const url = 'http://localhost:3000/products?sort=az';

url.includes('/products')     // true    is it anywhere inside?
url.startsWith('https')       // false   does it start with ...?
url.endsWith('sort=az')       // true    does it end with ...?
url.indexOf('?')              // 30      position of the first '?'
url.indexOf('#')              // -1      -1 means "not found"
```

These are all **case-sensitive**: `'Products'.includes('products')` is `false`.

### Cutting: `slice(start, end)`

```ts
const orderNumber = 'ORD-1001';
orderNumber.slice(4)        // '1001'      from index 4 to the end
orderNumber.slice(0, 3)     // 'ORD'       from 0 up to 3 (3 NOT included)
orderNumber.slice(-2)       // '01'        the last 2 characters
```

### 🗣️ Say it

`orderNumber.slice(0, 3)`
> "orderNumber dot slice **from 0 up to, but not including, 3**"

### Splitting: `split(separator)`

`split` cuts a string into pieces and gives you a **list** (an array, see module 04):

```ts
'Sam Standard'.split(' ')        // ['Sam', 'Standard']
'Sam Standard'.split(' ')[0]     // 'Sam'
'a,b,c'.split(',').length        // 3
```

### Replacing

```ts
'Bike Light Pro'.replace(' ', '-')       // 'Bike-Light Pro'   only the FIRST one!
'Bike Light Pro'.replaceAll(' ', '-')    // 'Bike-Light-Pro'   all of them
'$29.99'.replace('$', '')                // '29.99'            replace with nothing = delete
```

### Padding: `padStart(length, filler)`

```ts
'7'.padStart(4, '0')      // '0007'   fill on the left until the length is 4
'1001'.padStart(4, '0')   // '1001'   already long enough, nothing added
```

### Chaining

Every method returns a new string, so you can call the next method on the result:

```ts
const raw = '  Total: $59.98  ';
raw.trim().replace('Total: ', '').toLowerCase();   // '$59.98'
```

Read it left to right: trim it, **then** replace, **then** lower-case.

---

## 5. Numbers

```ts
10 + 3      // 13
10 - 3      // 7
10 * 3      // 30
10 / 4      // 2.5     (there is only one number type: decimals just work)
10 % 3      // 1       remainder ("modulo"): 10 = 3 * 3 + 1
2 ** 3      // 8       power
```

### ⚠️ `+` with a string glues, it doesn't add

```ts
'2' + 1     // '21'   string + anything = string
2 + 1       // 3
```

Values from inputs and from the page are strings. Convert them **before** you do maths.

---

## 6. Converting between text and numbers

| You have | You want | Use | Example | Result |
|---|---|---|---|---|
| `'42'` | number | `Number(x)` | `Number('42')` | `42` |
| `'42px'` | number | `parseInt(x)` | `parseInt('42px')` | `42` (stops at the first non-digit) |
| `'59.98'` | decimal number | `parseFloat(x)` | `parseFloat('59.98')` | `59.98` |
| `200` | string | `String(x)` | `String(200)` | `'200'` |
| `7.5` | string with 2 decimals | `x.toFixed(2)` | `(7.5).toFixed(2)` | `'7.50'` |

```ts
Number('42')         // 42
Number('')           // 0     ← careful: empty text becomes 0
Number('$29.99')     // NaN   the $ is not part of a number
parseFloat('29.99 USD')  // 29.99   parseFloat/parseInt read from the start and stop when it stops being a number
parseFloat('$29.99')     // NaN     ...but they can't skip a $ at the start
```

**Rule:** remove the junk first (`replace`, `slice`, `trim`), then convert.

```ts
const totalText = 'Total: $59.98';                       // what the page shows
const total = parseFloat(totalText.replace('Total: $', ''));   // 59.98 (a number!)
```

### `toFixed` gives back a STRING

```ts
const price = 7.5;
price.toFixed(2)             // '7.50'  (a string)
typeof price.toFixed(2)      // 'string'
`$${price.toFixed(2)}`       // '$7.50'  ← how you format a price
```

In `` `$${price}` `` the first `$` is just a dollar sign. The `${` starts the hole.

### 🗣️ Say it

`parseFloat(text)`
> "parse **float** of text": "parse" means "read text into a value", "float" means "a number with decimals".

---

## 7. `NaN`: Not a Number

`NaN` is what you get when a conversion fails. Its type is (funnily) `number`.

```ts
Number('free')          // NaN
typeof NaN              // 'number'
NaN === NaN             // false  ← NaN is not equal to anything, not even itself!
Number.isNaN(Number('free'))   // true  ← the right way to check
```

In tests: `expect(value).toBe(NaN)` works (Playwright compares in a smarter way), but in your own code use `Number.isNaN(x)`.
If a test shows `Received: NaN`, a conversion went wrong: look for a `$`, a space, a comma or a word in the text.

---

## 8. `Math`

| Call | Result | Meaning |
|---|---|---|
| `Math.round(2.5)` | `3` | nearest whole number (.5 goes up) |
| `Math.floor(2.9)` | `2` | always down ("floor") |
| `Math.ceil(2.1)` | `3` | always up ("ceiling") |
| `Math.max(3, 7, 1)` | `7` | the biggest |
| `Math.min(3, 7, 1)` | `1` | the smallest |
| `Math.random()` | e.g. `0.734...` | a random decimal, from 0 up to (not including) 1 |
| `Math.abs(-5)` | `5` | without the minus sign |

### A random whole number between `min` and `max`

```ts
const min = 1;
const max = 6;
const roll = Math.floor(Math.random() * (max - min + 1)) + min;   // 1, 2, 3, 4, 5 or 6
```

### 🧩 Anatomy

```
Math.floor( Math.random() * (max - min + 1) ) + min
│           └─────┬─────┘   └──────┬──────┘    └┬┘
│           0 to 0.999...   how many options   shift up so it starts at min
└ cut the decimals: 0 ... 5
```

You don't need to memorise it. Recognise it and copy it from here. (Module 03 turns it into a function you write once.)

---

## 9. The `0.1 + 0.2` problem

```ts
0.1 + 0.2            // 0.30000000000000004  (not 0.3!)
```

Computers store decimals in binary, and some decimals can't be stored exactly. This is the same in every programming language.
For tests it means: **never `toBe` a calculated decimal**. Use `toBeCloseTo`:

```ts
expect(0.1 + 0.2).toBeCloseTo(0.3);        // ✅ "close enough" (2 decimal places by default)
expect(49.99 + 9.99).toBeCloseTo(59.98);    // ✅ (49.99 + 9.99 is 59.980000000000004)
```

For money you can also round: `Number((0.1 + 0.2).toFixed(2))` is `0.3`.

---

## 10. Regular expressions (just enough for Playwright)

A **regular expression** (regex) is a pattern for text. It is written between slashes: `/products/`.
Playwright accepts a regex almost everywhere it accepts text, so you'll meet these often.

| Pattern | Matches | Example that matches |
|---|---|---|
| `/products/` | "products" anywhere | `'http://localhost:3000/products/4'` |
| `/^Hello/` | starts with "Hello" (`^` = start) | `'Hello, Sam!'` |
| `/items$/` | ends with "items" (`$` = end) | `'3 items'` |
| `/\d/` | one digit (0-9) | `'Cart (1)'` |
| `/\d+ items/` | one or more digits, then " items" | `'12 items'` |
| `/.*/` | anything (`.` = any character, `*` = zero or more) | anything |
| `/hello/i` | "hello" ignoring upper/lower case (`i` flag) | `'HELLO'`, `'Hello'` |
| `/test\.com/` | "test.com" with a real dot (`\.`) | `'a@test.com'` |

### 🧩 Anatomy

```
/ ^Hello \d+ / i
│ │      │   │ └ flags: i = ignore case
│ │      │   └ end of the pattern
│ │      └ \d = a digit,  + = "one or more"
│ └ ^ = "the text must START here"
└ start of the pattern
```

### Using a regex

```ts
/^Hello/.test('Hello, Sam!')          // true    regex.test(text) → boolean
'Loaded 6 products'.match(/\d+/)?.[0] // '6'     text.match(regex) → what was found (still a string!)
expect('6 products').toMatch(/^\d+ products$/);   // assertion with a regex
```

`match` gives back `null` when nothing is found. That's why you see `?.[0]`: "if something was found, take the first match".
(More about `null` and `?.` in module 07.)

### 🗣️ Say it

`/^\d+ products$/`
> "starts with one or more digits, then space products, then the end"

---

## 🎭 In Playwright you'll see

```ts
// regex instead of the full URL: "the URL contains products"
await expect(page).toHaveURL(/.*products/);
await expect(page.getByRole('heading')).toHaveText(/^Hello/);

// read text from the page, clean it, convert it
const totalText = await page.getByTestId('cart-total').textContent();   // 'Total: $59.98'
const total = parseFloat(totalText!.replace('Total: $', ''));
expect(total).toBeCloseTo(59.98);

// unique data and URLs with template literals
const email = `user_${Date.now()}@test.com`;
await page.goto(`/products/${productId}`);
await page.getByLabel('Email').fill(email);

// case-insensitive text match
await expect(page.getByRole('alert')).toHaveText(/locked out/i);
```

(`await` is module 08, `page` is module 11, and the `!` after `totalText` is module 07. For now, recognise the strings and regexes.)

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `Expected: "Hello, Sam!"` / `Received: "Hello, ${name}!"` | You used `'...'` instead of backticks | Use `` `...${name}...` `` |
| `Property 'toUppercase' does not exist on type 'string'` | Typo in the method name (capital C!) | `toUpperCase` |
| `Expected: 3` / `Received: "21"` | You added a string and a number: `'2' + 1` | Convert first: `Number('2') + 1` |
| `Received: NaN` | A conversion failed (`$`, a word, a comma in the text) | Clean the text before converting |
| `Expected: 0.3` / `Received: 0.30000000000000004` | Decimal maths is not exact | `toBeCloseTo(0.3)` |
| `Argument of type 'number' is not assignable to parameter of type 'string'.` | e.g. `parseFloat(59.98)`: it already IS a number | Don't convert numbers, or pass a string |
| `This condition will always return 'false'.` | You compared with `=== NaN` | `Number.isNaN(x)` |
| `'found' is possibly 'null'.` | `match()` can find nothing and return `null` | `found?.[0]` |
| `Expected pattern: /products/` / `Received string: "..."` | The text (or URL) doesn't match your regex | Read the received text, adjust the pattern |
| `toFixed` result `"7.50"` fails `toBe(7.5)` | `toFixed` returns a **string** | Compare with `'7.50'` or convert with `Number(...)` |

---

## ✍️ Type it (warm-up, 5 minutes)

Open `scratch/playground.ts`, **type** (don't paste!) this, and run `npm run play`:

```ts
const name = '  Sam Standard  ';
const clean = name.trim();
const firstName = clean.split(' ')[0];
const email = `${firstName.toLowerCase()}_${Date.now()}@test.com`;
const price = parseFloat('Total: $59.98'.replace('Total: $', ''));
console.log(clean.length, firstName, email);
console.log(price, typeof price, `$${(price / 2).toFixed(2)}`);
console.log(0.1 + 0.2, Math.round(2.5), /^\d+ items$/.test('12 items'));
```

Then break it: remove the `.trim()`, use single quotes in the email, convert `'$59.98'` without removing the `$`.

## 🏋️ Exercises

```bash
npm run check 02
```

## 🥋 Kata

Close everything. In `my-katas/02-strings.spec.ts`, from memory, write one test that:
1. builds `const email` with a template literal: `user_` + `Date.now()` + `@test.com`
2. asserts the email matches the regex `/^user_\d+@test\.com$/` (use `toMatch`)
3. turns `'Total: $59.98'` into the number `59.98` (`replace` + `parseFloat`) and asserts it with `toBeCloseTo`
4. formats the number `7.5` as `'$7.50'` (template literal + `toFixed(2)`) and asserts it with `toBe`

Run it with `npm run kata 02`.

## 🧠 Remember

```ts
`Hello, ${name}!`                 // backticks + ${} = put a value in text
text.trim().toLowerCase()         // methods return NEW strings
text.includes('x')  text.slice(0, 3)  text.split(' ')  text.replaceAll('a', 'b')
parseFloat('59.98')  Number('42')  String(200)  price.toFixed(2) // ← string!
Math.floor(Math.random() * 6) + 1 // random 1..6
expect(0.1 + 0.2).toBeCloseTo(0.3);
expect(url).toMatch(/products/);  // /^start/  /end$/  /\d+/  /x/i
```

## ✅ Done when

- [ ] `npm run check 02` is all green with 0 type errors
- [ ] Kata done without looking
- [ ] `npm run drill`
