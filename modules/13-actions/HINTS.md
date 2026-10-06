# Hints · Module 13

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**13.1** Two lines: `await page.getByLabel('...').fill('...');`.

**13.2** `fill` throws away what was there. `pressSequentially` types keys at the end, like a person.

**13.3** There is an action with exactly that name: `await comments.c....();`.

**13.4** Three lines: `check()` twice, then `uncheck()` once. `newsletter` and `terms` are already locators.

**13.5** `await page.getByRole('radio', { name: 'Enterprise' }).check();` and then `.setChecked(wantsNewsletter)` on the newsletter checkbox.

**13.6** `await page.getByLabel('Country').selectOption({ label: 'Japan' });`.

**13.7** `selectOption` returns an array of the selected VALUES. After choosing the label "United States", what is the VALUE of that option? (the list is in the comment)

**13.8** `fill` only accepts strings. What do you add around `30`?

**13.9** Five actions: two `fill`, one `selectOption({ label })`, two `check` (the radio and the terms), then one `click`. Seven lines in total.

**13.10** `const newTodo = page.getByLabel('New to-do');` then `fill(...)` and `press('Enter')` on it.

**13.11** `await newTodo.focus();` then `await page.keyboard.type('...');` then `await page.keyboard.press('...');`.

**13.12** The checkbox "Enable the button" enables the button. Check it BEFORE the click.

**13.13** One line: find the button named `'Hover me'` and call `.hover()`.

**13.14** Copy the shape from the comment and fill in the 3 values. `Buffer` is built into Node, no import needed.

**13.15** `page.once('dialog', (dialog) => dialog.accept());` FIRST, then click the button `'Open confirm'`.

**13.16** Swap the two lines: the listener must exist BEFORE the click opens the prompt.

**13.17** The alert button shows "Hello from an alert!". `dialog.type()` returns the kind of dialog in lower case.

**13.18** Three lines, exactly as in the comment. The middle one clicks the link `'Open products in a new tab'`. Note: `const newTab = await newTabPromise;` must use the name `newTab`.

**13.19** `await cards.filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click();` then `await expect(cartCount).toHaveText('1');` then the same click for 'Bike Light'.

**13.20** `await expect(page.getByTestId('cart-row')).toHaveCount(1);` and the same shape with `toHaveText` for the total.

**13.21** Copy the first two lines of 13.19 (only the Backpack). Then `getByRole('link', { name: /^Cart/ })`, `getByRole('link', { name: 'Checkout' })`, three `getByLabel(...).fill(...)`, and the button `'Place order'`.
