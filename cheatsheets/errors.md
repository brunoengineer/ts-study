# Error messages decoded

Read the error **before** changing code. Find your message below (Ctrl+F).

## How to read any error

1. **The first line** says *what* went wrong.
2. **`Expected` / `Received`** (test failures): what you asked for vs what really happened.
3. **The file and line number** (`exercises.spec.ts:42:5`): *where*. Ctrl+click it.
4. **The `>` arrow** in the code frame points at the exact line.
5. Fix the **first** error first. Later errors are often caused by the first one.

---

## TypeScript errors (red squiggles, `npm run check` "TypeScript says")

| Message | What it means | Usual fix |
|---|---|---|
| `Cannot find name 'x'` | `x` doesn't exist here | Typo? Not declared? Declared inside another `{ }`? Missing import? |
| `Type 'string' is not assignable to type 'number'` | Wrong kind of value for that variable/parameter | Fix the value or the type annotation |
| `Cannot assign to 'x' because it is a constant` | Changing a `const` | Use `let` if it must change |
| `Property 'nme' does not exist on type 'User'` | Typo, or the type doesn't have that property | Check spelling; check the interface |
| `Object is possibly 'undefined'` / `'x' is possibly 'null'` | The value might be missing (e.g. result of `.find()`) | Check first (`if (x)`), use `?.`, or give a default with `??` |
| `Argument of type 'X' is not assignable to parameter of type 'Y'` | You called a function with the wrong type | Look at the function's parameter types (hover it) |
| `Expected 2 arguments, but got 1` | Missing argument | Add it, or make the parameter optional (`?`) |
| `Parameter 'x' implicitly has an 'any' type` | A parameter has no type | Add `: type` to the parameter |
| `'x' is declared but its value is never read` | Unused variable (grey, a warning) | Use it or delete it |
| `Property 'x' has no initializer and is not definitely assigned in the constructor` | Class property never set | Assign it in the constructor |
| `This comparison appears to be unintentional because the types 'X' and 'Y' have no overlap` | Comparing things that can never be equal | Check your types / values |
| `Module '"./utils"' has no exported member 'x'` | Not exported, or a different name | Add `export`; check the name; default vs named import |
| `'await' expressions are only allowed within async functions` | `await` inside a non-async function | Add `async`: `async () => { ... }` |
| `Type 'Promise<string>' is not assignable to type 'string'` | You forgot `await` | `const x = await getThing();` |
| `Unused '@ts-expect-error' directive` | The error that comment expected is gone | Delete the `// @ts-expect-error` line |
| `Cannot redeclare block-scoped variable 'x'` | Two `const x` in the same `{ }` | Rename one |

## Test failures (`expect`)

| Message | What it means |
|---|---|
| `expect(received).toBe(expected)` · `Expected: 6 · Received: 5` | Values differ. `Received` is what your code produced. |
| `toBe` fails but the objects *look* identical | `toBe` checks it's the **same object**. For content, use `toEqual`. |
| `Expected: "29.99" · Received: 29.99` | String vs number. Note the quotes. |
| `Received: undefined` | Something returned nothing: a missing `return`? a typo in a property name? `.find()` found nothing? |
| `Received: Promise {}` | You forgot `await` |
| `📝 TODO: write your code...` | You still have a `todo()` line. Delete it after writing your code. |
| `Received: "___ (replace me with your answer)"` | You still have a `___` blank to fill |
| `ReferenceError: x is not defined` | Same as TypeScript's `Cannot find name 'x'`, but at runtime |
| `TypeError: Cannot read properties of undefined (reading 'name')` | You did `something.name` but `something` is `undefined` |
| `TypeError: x is not a function` | Calling something that isn't a function: a typo? a missing `()` somewhere? wrong import? |
| `TypeError: Assignment to constant variable.` | Changing a `const` at runtime |
| `SyntaxError: Unexpected token` / the file doesn't run at all | A missing `)` `}` `]` or quote. Look at the line *before* the one it reports. |

## Playwright errors

| Message | What it means | Usual fix |
|---|---|---|
| `strict mode violation: getByRole('button') resolved to 3 elements` | Your locator matches several elements, and Playwright refuses to guess | Make it specific: add `{ name: '...' }`, `.filter(...)`, chain from a parent, or (if you really mean it) `.first()` |
| `Timeout 5000ms exceeded.` · `waiting for getByRole(...)` | The element never appeared (or never matched) | Wrong locator (check name/role in UI mode "pick locator"), wrong page, or the element really isn't there (a real bug?) |
| `expect(locator).toHaveText(expected) failed` · `Timeout: 5000ms` · `Expected: "1" Received: "0"` | The assertion retried for 5 s and the text never matched | Look at `Received`: the app shows something else. A missing step before it? |
| `element is not visible` / `element is not enabled` / `element is outside of the viewport` | Playwright waited for the element to be actionable | Is it hidden or disabled? Do you need to do something first (open a menu, tick a checkbox)? |
| `Test timeout of 30000ms exceeded.` | The whole test took too long | Usually a locator that never matches, or a missing `await` on something before |
| `Target page, context or browser has been closed` | You used the page after the test ended | **Missing `await` somewhere**. Look for `page.` or `expect(` without `await`. |
| `Error: page.goto: net::ERR_CONNECTION_REFUSED` | The app isn't running | Check `webServer` in the config; try `npm run app` |
| `Cannot navigate to invalid URL` | `page.goto('/x')` without a `baseURL` | Set `use.baseURL` in the config, or use the full URL |
| `Error: Playwright Test did not expect test() to be called here` | `test()` called inside another test, or a duplicate Playwright version | Move `test()` to the top level / inside `describe` |
| `Error: Requiring @playwright/test second time` | Two Playwright installations | Only one `node_modules` / one version |
| `Error: ENOENT: no such file or directory, open '.auth/user.json'` | The storage state file doesn't exist | The setup project didn't run: check `dependencies: ['setup']` and `testMatch` |
| `Executable doesn't exist at ...chrome...` | Browsers not installed | `npx playwright install chromium` |
| `apiRequestContext.post: connect ECONNREFUSED` | API server down or wrong `baseURL` | Start the app / fix the URL |
| `expect(received).toBeOK()` · `← 401 Unauthorized` | API call failed | Missing or wrong `Authorization` header? Expired login? |

## "My test passes but it shouldn't" / "It passes sometimes"

- **Missing `await`** on an `expect(locator)`. The assertion never really runs. Look for `expect(page...` without `await` in front.
- **`expect(await locator.textContent()).toBe(...)`** checks once and doesn't retry. Use `await expect(locator).toHaveText(...)`.
- **Shared state**: two tests use the same user/cart. Reset or create fresh data per test.
- **`page.waitForTimeout(1000)`** (a fixed sleep) is too short on a slow day. Replace it with a web-first assertion.
