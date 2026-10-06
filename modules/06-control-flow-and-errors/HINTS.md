# Hints · Module 06

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**6.1** `&&` needs BOTH sides true. `||` needs at least ONE side true. `!` flips. Answers are `true` or `false` (no quotes).

**6.2** Five branches: `if`, three `else if`, one `else`. For a range use `&&`: `status >= 200 && status < 300`.

**6.3** JavaScript stops at the FIRST true condition. Is `9.99 < 30` true? Then it never reaches the second check. Swap the two conditions (and their return values).

**6.4** Only 6 values are falsy: `false`, `0`, `''`, `null`, `undefined`, `NaN`. Look at section 3 of the lesson. A string with something inside is always truthy.

**6.5** `!stock` is true for `undefined` AND for `0`. Ask the exact question: `if (stock === undefined)`.

**6.6** Shape: `const buttonLabel = (stock: number): string => stock > 0 ? 'Add to cart' : 'Sold out';` Read it aloud: "is stock more than 0? then ... otherwise ...".

**6.7** `switch (option) { case 'az': return 'Name (A to Z)'; ... default: return 'Unknown sort'; }`

**6.8** Look at the end of `case 'GET':`. What do the other cases have that this one doesn't?

**6.9** Add the numbers one by one. Then count how many are bigger than 1000.

**6.10** `let failed = 0;` then `for (const result of results) { if (result === 'failed') failed++; }`

**6.11** `const usernames: string[] = [];` then `for (let i = 1; i <= 3; i++) { usernames.push(...); }` with a template literal.

**6.12** The array has 3 items, so the indexes are 0, 1 and 2. With `<=`, the last round uses index 3. Change one character.

**6.13** `while (!ready && attempt < 5) { attempt++; ready = isPageReady(attempt); }` (declare both variables with `let` first).

**6.14** Go item by item. `continue` skips only that product. `break` stops the whole loop: nothing after it is checked.

**6.15** `for (const [key, value] of Object.entries(headers)) { ... }` and inside, push a template literal: `` `${key}: ${value}` ``

**6.16** `?.` gives `undefined` (no quotes) when the left side is missing. `0 || 3` and `0 ?? 3` are different: check the table in section 7.

**6.17** One line: `return user.address?.city ?? 'unknown';`

**6.18** `return env.BASE_URL ?? 'http://localhost:3000';` and `return env.CI ? 2 : 0;`

**6.19** `throw` jumps straight to `catch`. The line after `throw` never runs. `finally` always runs last.

**6.20** `const quantity = Number(text);` then `if (Number.isNaN(quantity) || quantity < 1) { throw new Error(...); }` then `return quantity;`

**6.21** `toThrow` needs a FUNCTION: `expect(() => requirePassword('')).toThrow(...)`.

**6.22** Four lines with the same shape: `expect(() => login('...', '...')).toThrow('...');`. The last one uses `.not.toThrow()`.

**6.23** `try { login('locked_user'); } catch (error) { if (error instanceof Error) { message = error.message; } } finally { finished = true; }`

**6.24** Inside a classic for loop: `last = getStatus();` then `if (last === expected) return attempt;`. After the loop (outside the `{ }`), `throw new Error(...)` with a template literal.

**6.25** Inside the `for...of`: a `switch (result.status)` with three `case`s (each one `summary.x++; break;`), then `summary.totalMs += result.durationMs ?? 0;`. Return `summary` after the loop.
