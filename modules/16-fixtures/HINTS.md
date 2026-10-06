# Hints · Module 16

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**16.1** There are three answers possible: `'chromium'`, `'firefox'`, `'webkit'`. Which engine is inside Chrome?

**16.2** Open `playwright.config.ts` and find `baseURL`. The answer is a string like `'something'`, not the whole URL.

**16.3** The title is the first argument of `test(...)`, exactly as written, emoji included. Copy it.

**16.4** Asking for `page` created ONE page in the context. Then the test opens one more. Both pages are in the same context, so `===` gives...?

**16.5** Two lines, both with `await`: `const otherContext = await browser.newContext();` then a page from `otherContext`.

**16.6** One line: `await use('QA Shop');`. Delete the `todo(...)` line.

**16.7** Two lines: first `await page.goto(...)`, then `await use(page);`. Setup always comes BEFORE `use`.

**16.8** When the test body runs, only the code BEFORE `await use(...)` has run. Which fixtures did the test ask for?

**16.9** `server` has `database` in its `{ }`, so Playwright must build `database` first. Three items in the array.

**16.10** Look at the `session` fixture just above the test. Which line starts the test? What word is missing in front of it? (Lesson section 4.)

**16.11** Two lines after the `// ✍️` comment: `await use(product);` and then the `await request.delete(...)` with `{ headers }`.

**16.12** Three lines: `await request.post('/api/reset');`, `resetLog.push(testInfo.title);`, `await use();`.

**16.13** The option's default is the FIRST item of the array `['...', { option: true }]`. The `role` comes from logging in as that user.

**16.14** One line inside the `as admin` describe, outside the test: `optionTest.use({ shopUser: '...' });`

**16.15** Hand an OBJECT to the test: `await use({ username: '...', password: '...' });`

**16.16** In `fixtures.ts`: copy the shape of the `cartPage` fixture, with `LoginPage` instead of `CartPage`.

**16.17** In `fixtures.ts`: `await loginPage.goto();`, `await loginPage.login(...)`, `await expect(page).toHaveURL(/\/products/);`, then `await use(new ProductsPage(page));`.

**16.18** `await shopExpect(cartPage.rows).toHaveCount(2);` and a second one with `toHaveText(...)` on `cartPage.total`.

**16.19** The worker fixture runs once per worker. How many times has `adminLogins++` run when the first test that needs it starts?

**16.20** `expect(response.status()).toBe(201);` and `expect(adminLogins).toBe(...)`. Did the worker fixture run again for this second test?
