# Hints · Module 17

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**17.1** (in `auth.setup.ts`) Same 4 login lines as in module 11 (`goto`, `fill`, `fill`, `click`), with `USER` and `USER_PASSWORD`.
Then `await expect(page).toHaveURL(/\/products/);` and `await page.context().storageState({ path: USER_STATE });`.

**17.2** (in `auth.setup.ts`) `const response = await request.post('/api/login', { data: { username: ADMIN, password: ADMIN_PASSWORD } });`
Then `toBeOK`, read `token`, `context.addCookies([...])` with ONE object, and `context.storageState({ path: ADMIN_STATE })`. Lesson section 8.

**17.3** With the session cookie, the shop does NOT redirect you. The path is the one you opened.

**17.4** `await expect(page.getByTestId('user-name')).toHaveText('...');` and `await expect(page.getByRole('link', { name: 'Log in' })).not.toBeVisible();`

**17.5** `page.request` sends the cookies of the page's context. Who is logged in? What role does that user have? (Look at the users table in `practice-app/README.md`.)

**17.6** Lesson section 4, last paragraph: is the `request` fixture logged in or not? Logged in → which status code? Not logged in → which one?

**17.7** Open `modules/17-authentication/.auth/user.json` (it exists after your setup ran). The answer for the names is an array: `['...']`.

**17.8** One line inside the describe, above the test: `test.use({ storageState: { cookies: [], origins: [] } });`

**17.9** `await page.goto('/login');`, two `fill` calls with `getByLabel`, one `click` on the "Log in" button.

**17.10** Three lines: `request.post(...)` with `data`, `const { token } = await response.json();`, then `await context.addCookies([{ name: 'session', value: token, url: baseURL }]);`

**17.11** After the login form, the shop redirects to the products page. And the shop has only ONE cookie (look at 17.7).

**17.12** One line inside the describe: `test.use({ storageState: ADMIN_STATE });`

**17.13** Read the path in the error: it looks for `.auth` in the PROJECT ROOT. Replace the string with the constant that has the absolute path.

**17.14** `const adminContext = await browser.newContext({ storageState: ADMIN_STATE });` and then `const adminPage = await adminContext.newPage();`

**17.15** Nobody set those variables, so `??` gives the right side. And `Number('10000')` is...?

**17.16** Two changes: add `test.use({ storageState: { cookies: [], origins: [] } });` in the `logging out` describe, and log in at the START of the test (the 4 UI lines from 17.9, then wait for the user name). Now "Log out" only kills that new session.
