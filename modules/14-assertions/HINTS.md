# Hints · Module 14

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**14.1** `isVisible()` answers immediately, a few milliseconds after the click. The message needs 2 seconds. After `await expect(...).toBeVisible()`, what is the answer? Booleans have no quotes.

**14.2** Replace the whole last line with `await expect(status).toHaveText('...');`. See the table in section 2 of the lesson.

**14.3** Two lines, both starting with `await expect(page.getByTestId('slow-message'))`: one `.toBeVisible()`, one `.toHaveText('...')`.

**14.4** One word is missing at the start of the line `expect(status).toHaveText('Complete!');`.

**14.5** `await expect(item).toContainText('...');` and `await expect(item).toHaveText(/^Buy milk/);`. The `^` means "starts with".

**14.6** `await expect(age).toBeEmpty();`, then `await age.fill('42');`, then `toHaveValue`. The value is a string.

**14.7** `await expect(items).toHaveCount(2);` and `await expect(page.getByTestId('todo-count')).toHaveText('...');`.

**14.8** `toBeDisabled()`, then `.check()` on the checkbox named `'Enable the button'`, then `toBeEnabled()`.

**14.9** `await expect(toggle).toHaveAttribute('aria-expanded', 'true');`, then `await toggle.click();`, then `await expect(details).toBeHidden();`.

**14.10** `toHaveText('...')` and `toHaveClass(/error/)` (or `toContainClass('error')`). A string in `toHaveClass('...')` must be the WHOLE class attribute.

**14.11** One line: `await expect(page.getByLabel('Email')).toBe.......();`.

**14.12** The message is the SECOND argument of `expect`: `await expect(page.getByTestId('counter'), 'counter after one click').toHaveText('1');`.

**14.13** 1 second is less than 2 seconds. Raise the timeout (3 seconds is enough), or remove the option to use the default 5 s.

**14.14** Three lines, each `await expect.soft(locator).matcher();`. For "NOT checked" use `.not.toBeChecked()`. A `<select>` with nothing chosen has the value `''`.

**14.15** Shape:
`await expect(async () => {` the two lines `}).toPass({ timeout: 5_000 });`. The two lines go INSIDE the braces.

**14.16** Z to A order: start with the name that comes last in the alphabet. All 6 names are in the README of the practice app.

**14.17** Copy the shape from the comment, removing the `//` at the start of each line. Don't forget `await` in front of `expect.poll`.

**14.18** Try it in `scratch/playground.ts`: `console.log(0.1 + 0.2);`.

**14.19** Three lines: `expect(products).toHaveLength(6);`, `expect(backpack).toHaveProperty('price', 29.99);`, `expect(backpack).toMatchObject({ ... });`. No `await`: these are plain values.

**14.20** `expect(clothes[0]).toEqual(expect.objectContaining({ ... }));`, `expect(names).toEqual(expect.arrayContaining([...]));`, `expect(total).toBeCloseTo(89.96);`, `expect(clothes.length).toBeGreaterThan(3);`.
