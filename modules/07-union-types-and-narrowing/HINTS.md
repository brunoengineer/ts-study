# Hints · Module 07

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**7.1** `42` is a number, so the first branch runs. A string goes to the second branch. Both answers are strings.

**7.2** `type Role = 'admin' | 'user';` then `const role: Role = ...;` then `const allRoles: Role[] = [...];`

**7.3** Only three values are allowed. Which one is the Chrome engine in Playwright?

**7.4** `switch (status) { case 'passed': return '✅'; ... }`. Copy the emojis from the assertions.

**7.5** `if (typeof value === 'string') { return Number(value); }` then `return value;`

**7.6** `!count` is true for `undefined` AND for `0`. Ask the exact question: `count === undefined`.

**7.7** `if ('error' in body) { return ... }`. After the `if`, TypeScript knows body is an `ApiUser`.

**7.8** `Array.isArray(selector) ? selector.length : 1`

**7.9** `?.` on a string runs the method. `?.` on `null` gives `undefined`. `??` replaces `null`. The length of `''` is...?

**7.10** Two lines: `if (text === null) return '';` then `return text.trim();` (no `!`).

**7.11** Which branch runs for each object? Then fill in the template literal.

**7.12** `if (result.ok) { return result.data[0] ?? 'none'; }` and after the `if`: `throw new Error(result.error);`

**7.13** Add `if (!result.ok) return 0;` before the line that reads `result.data`.

**7.14** ``switch (step.type) { case 'goto': return `...`; ... }``. Inside a template literal, put the single quotes around `${step.url}`: `` `await page.goto('${step.url}');` ``

**7.15** Three lines. The middle one: `type BrowserName = (typeof BROWSERS)[number];`

**7.16** A numeric enum counts from 0: Low = 0, Medium = 1, High = 2. `Priority[1]` goes backwards: number → name. A string enum is just its string.

**7.17** The first one is in the JSON. The second one is a property that does not exist: what do you get when you read a missing property?

**7.18** Copy the shape from the comment as the `if` condition. Inside: `return data.status;`. After the `if`: `return -1;`

**7.19** `users.find(...)?.name ?? 'Unknown user'`. Remove the `!`.

**7.20** Change `as { status: number }` to `as { status: string }`. Then `Number(response.status) + 1`.

**7.21** `if (status === 200 && 'token' in body) { ... } else if ('error' in body) { ... } else { ... }`. Each branch returns an object.

**7.22** Three lines: two with `.toEqual({ ... })`, one with `.toBe(true)`.

**7.23** Check in this order: `value === null`, `typeof value === 'boolean'`, `typeof value === 'number'`. Whatever is left is a string.
