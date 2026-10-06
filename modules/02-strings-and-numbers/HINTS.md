# Hints · Module 02

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**2.1** Replace each `${...}` with its value. Your answers are strings, so they need quotes. `${cartCount + 1}` calculates first.

**2.2** Two holes in one template literal: `` `${baseUrl}/products/${productId}` ``. Backticks, not quotes!

**2.3** Look at the quotes around `'Hello, ${username}!'`. Only one kind of quote fills `${}` (lesson section 2).

**2.4** Same shape as 2.2: `` `user_${...}@test.com` ``.

**2.5** Count the characters (the `-` counts too). `[0]` is the first one, `.at(-1)` the last one. Single characters are strings: `'O'`.

**2.6** `trim()` removes spaces at both ends. Then ask: did `buttonText` itself change? (Strings never change.) Count the original, spaces included.

**2.7** `startsWith('https')`: the URL starts with `http:` ... `includes` is case-sensitive. `indexOf` gives `-1` when it finds nothing.

**2.8** `slice(4)` = from index 4 to the end. `slice(0, 3)` = from 0 up to (not including) 3.

**2.9** `split(' ')` cuts at each space. How many pieces? The first piece is `[0]`.

**2.10** `replace` only changes the first match. Which method changes all of them?

**2.11** `id.padStart(4, '0')` fills the left side with `'0'` until the length is 4. Put it in a hole: `` `ORD-${...}` ``.

**2.12** `expect(message).toContain('...');` and `expect(message.startsWith('...')).toBe(true);`

**2.13** `parseInt` stops reading at the first non-digit. `Number` can't read a `$`: the answer is `NaN` (no quotes). `String(200)` gives text, so quotes.

**2.14** `'2' + 1` glues text: `'21'`. Convert `quantity` with `Number(...)` before adding.

**2.15** `totalText.replace('Total: $', '')` gives `'59.98'` (still text). Wrap it: `parseFloat(...)`.

**2.16** `price.toFixed(2)` gives `'7.50'`. Add a dollar sign in front: `` `$${...}` `` (the first `$` is just text).

**2.17** round = nearest (.5 goes up), floor = always down, ceil = always up.

**2.18** Read the Received value: it is not exactly `59.98`. Change `toBe` to the matcher for decimals from lesson section 9.

**2.19** `NaN` is not equal to anything. `Number.isNaN` is the correct check. And `typeof NaN` is surprising: lesson section 7.

**2.20** `Math.random() * 6` gives 0 to 5.999. `Math.floor` makes it 0 to 5. Then add 1.

**2.21** `^` = must start there. Without the `i` flag, case matters. `\d+` = one or more digits. `match` finds TEXT, so the last answer has quotes.

**2.22** `expect(resultCount).toMatch(/^\d+ products$/);` Now write the second one for `url` with a simpler pattern.

**2.23** Do it in two lines: first `const total = parseFloat(...)` (like 2.15), then the template literal with `(total / itemCount).toFixed(2)`.

**2.24** Three lines: `toMatch(/.../)`, `toContain('@')`, and `expect(email.endsWith('@test.com')).toBe(true)`.

**2.25** Chain two methods: `headingOnPage.trim().toLowerCase()`. In the assertion, also call `.toLowerCase()` on `expectedHeading`.
