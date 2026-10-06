# Hints · Module 01

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**1.1 to 1.4** `typeof` always gives back a **string**, so your answer needs quotes: `'something'`.

**1.5** Two different answers. `typeof token` is a string (with quotes). `token` itself is the value `undefined` (no quotes).

**1.6** It's not `'null'`. Check section 5 of the lesson.

**1.7** Shape: `const name: type = value;`

**1.8** Same shape as 1.7. Booleans have no quotes.

**1.9** Which keyword lets a variable be reassigned? Change the keyword on the line `const counter = 0;`.

**1.10** `let retries: number = 0;` and then `retries++;` three times (each one on its own line).

**1.11** Do it line by line: 10 → 15 → 12 → ?

**1.12** The inner `message` only exists inside its `{ }`.

**1.13** The value is `3000` (a number, no quotes). So the type should be...?

**1.14** `'200'` has quotes, so it's a string. Remove the quotes.

**1.15** Declare: `let username: string;` (no `=`). Then assign on the next line: `username = 'admin';`. Why `let`? Because assigning later counts as a change.

**1.16** 30 seconds = 30 × 1000 milliseconds. Write it as `30_000`.

**1.17** `===` checks value AND type. Is the number 200 the same as the string '200'?

**1.18** Three lines, each one `expect(...).toBe(...);`.

**1.19** You want to check the type, so put `typeof timeout` inside `expect(...)`.
