# Module 00 · Start Here

> **Why this matters:** every exercise in this course is a test. You learn TypeScript and
> testing at the same time, because you are always *reading and writing tests*.

## 🎯 After this module you can

- Read a test file and say what every line does
- Run the exercises with `npm run check`
- Read a failing test: **Expected** vs **Received**
- Fill a blank (`___`), remove a `todo()` line and write your first `expect`

---

## 1. Your first test, piece by piece

```ts
import { test, expect } from '@playwright/test';

test('2 + 2 is 4', () => {
  const result = 2 + 2;
  expect(result).toBe(4);
});
```

### 🧩 Anatomy

```
import { test, expect } from '@playwright/test';
         └──┬───────┘        └───────┬───────┘
   the 2 tools we want     the library they come from

test(  '2 + 2 is 4'  ,  () => {   ...   }  );
 │          │              └──────┬──────┘
 │     the test name         the test body: an arrow function
 └─ "here is a test"          (the code that runs)

expect( result ).toBe( 4 );
          │        │     └─ what it SHOULD be (expected)
          │        └─ the "matcher": how to compare
          └─ what it IS (actual)
```

### 🗣️ Say it out loud

Reading code aloud helps it stick. Read the example like this:

> "Import **test** and **expect** from Playwright.
> **Test** called '2 + 2 is 4', which runs this function:
> a constant **result** equals 2 plus 2.
> **Expect** result **to be** 4."

Say it every time you write one. It feels silly for a week, and then the syntax starts to come back on its own.

### The pattern you will use 10,000 times

```ts
expect(whatItIs).toBe(whatItShouldBe);
```

Actual goes inside `expect(...)` and the expected value goes inside the matcher. It's the same shape every time.

---

## 2. Running exercises

Open a terminal in VS Code (`` Ctrl+` ``) and run:

```bash
npm run check 00
```

The check:

1. runs the tests of module 00, **one at a time, stopping at the first failure** (one problem at a time)
2. shows you which exercises pass ✔, which fails ✘ and which haven't run yet ○
3. tells you the file and line to open next (Ctrl+click it)
4. shows TypeScript errors (the red squiggles in VS Code)

Other variations:

| Command | What it does |
|---|---|
| `npm run check 00` | Check module 00, stop at the first failure |
| `npm run check 00 all` | Run *all* exercises of the module, even after a failure |
| `npm run check 00 ui` | Open Playwright's UI mode (great for browser tests later) |
| `npm run solution 00` | Run the reference solution |
| `npm run progress` | Dashboard of the whole course |

---

## 3. Reading a failure

When a test fails you see something like:

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 6
Received: 5

   7 |   expect(10 - 4).toBe(5);
     |                  ^
```

- **Expected**: what you wrote inside `.toBe(...)`
- **Received**: what the code actually produced
- **The arrow `^`**: the exact line

Get into the habit of reading the error before you change any code. Most errors already tell you what's wrong.

---

## 4. The exercise types

You'll meet four kinds of exercises. The emoji in the comment tells you which kind:

| Emoji | Type | What you do |
|---|---|---|
| 🔮 | **Predict** | Replace `___` with what you *think* the code produces. Guess first, then run. |
| ✍️ | **Write** | Write the code that's missing. Delete the `todo()` line when done. |
| 🐛 | **Fix** | The code is broken. Find the bug and fix it. |
| 🧪 | **Assert** | The code works, but the `expect` is missing. Write the assertion. |

### The blank: `___`

```ts
expect(typeof 42).toBe(___);   // 🔮 what is typeof 42?
```
becomes
```ts
expect(typeof 42).toBe('number');
```

### The `todo()` line

```ts
test('0.5 ...', () => {
  // ✍️ your code here
  todo();                       // <- delete this line when you have written your code
  expect(myName.length).toBeGreaterThan(0);
});
```

`todo()` throws an error on purpose, so the test stays red until you've done the work and removed it.

---

## 5. The playground

Want to try something without a test? Open `scratch/playground.ts`, write code, then run:

```bash
npm run play
```

Anything you `console.log(...)` is printed in the terminal. Use it as often as you like. Trying things out there costs nothing.

---

## 🏋️ Exercises

Open [exercises.spec.ts](exercises.spec.ts) and run:

```bash
npm run check 00
```

Stuck? Follow this order: re-read the lesson → [HINTS.md](HINTS.md) → `npm run solution 00`.

---

## 🥋 Kata (blank page challenge)

Close every file. Create `my-katas/00-first-test.spec.ts` and write **from memory**:

1. The import line
2. A test called `'my first kata'`
3. Inside it: `const total = 10 + 5;` and an `expect` that `total` is `15`

Run it: `npm run kata 00`

If you got stuck, look at section 1 of this lesson, then **delete your file and write it again from memory**.
Keep going until you can write it without looking. It's three lines, and you'll use them for the rest of your career.

---

## 🧠 Remember (the minimum)

```ts
import { test, expect } from '@playwright/test';

test('name of the test', () => {
  expect(actual).toBe(expected);
});
```

## ✅ Done when

- [ ] `npm run check 00` shows everything green
- [ ] You did the kata without looking
- [ ] You ran `npm run drill` once
