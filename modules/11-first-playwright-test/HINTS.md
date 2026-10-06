# Hints · Module 11

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**11.1** The title is the text in the browser TAB, not the heading. Pattern: `'<Page name> | QA Shop'`. The page name of `/` is `Home`.

**11.2** One line: `await page.goto('/...');`. The path of the login page is in the README of the practice app (and in its title).

**11.3** Copy the shape from the line in 11.2 that is already written: `await expect(page).toHaveTitle('...');`.

**11.4** Pages that need a login send you to the login page. The answer is a path that starts with `/`.

**11.5** A regex is written between slashes, without quotes: `/login/`. Don't forget `await` in front of `expect`.

**11.6** `page.title()` returns a Promise. What word turns a Promise into its value? (module 08)

**11.7** `await page.getByRole('link', { name: 'Playground' }).click();`. Then delete `todo();`.

**11.8** Three lines, each starting with `await page.`: two `.fill('...')` and one `.click()`. Only the password uses `getByLabel`.

**11.9** Open `/login` in your browser: the header has a **link** "Log in", the form has a **button** "Log in". Which one submits the form? Change ONE word.

**11.10** The error message has role `alert`: `await expect(page.getByRole('alert')).toHaveText('...');`.

**11.11** Write it inside the describe, ABOVE the tests: `test.beforeEach(async ({ page }) => { await page.goto('...'); });`.

**11.12** The same `await page.getByRole('button', { name: 'Increment' }).click();` line, twice. No `goto` needed: the beforeEach did it.

**11.13** One click on the button named `'Toggle details'`.

**11.14** `beforeAll` runs first (once), then `beforeEach`, then the test body. Does `afterEach` run before or after the body?

**11.15** baseURL is `http://localhost:` + a port. The answer is the word between `//` and `:`.

**11.16** The config says `timeout: 30_000`. Numbers have no quotes.

**11.17** Same 3 login lines as 11.8 (different username and password), then click the **link** `'Admin'`.

**11.18** Start from your 11.8 code and change the username. Then two assertions: `getByRole('alert')` with `toHaveText`, and `toHaveURL(/login/)`.
