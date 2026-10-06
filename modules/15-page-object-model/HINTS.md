# Hints · Module 15

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

Most of the work is in `modules/15-page-object-model/pages/`. Inside a class, everything you stored is reached with `this.`: `this.page`, `this.loginButton`...

**15.1** In `pages/LoginPage.ts`, replace the `todo(...)` line in `goto()` with `await this.page.goto('/login');`.

**15.2** In the constructor of `LoginPage`, copy the `usernameInput` line three times and change the names: `getByLabel('Password')`, `getByRole('button', { name: 'Log in' })`, `getByRole('alert')`.

**15.3** Three lines in `login()`: `await this.usernameInput.fill(username);`, the same for the password, then `await this.loginButton.click();`. Use the parameters, not fixed strings.

**15.4** `await expect(loginPage.errorMessage).toHaveText('...');` in the test file.

**15.5** In `pages/Header.ts`: `this.cartCount = this.root.getByTestId('cart-count');` and the same shape for `userName`.

**15.6** `goto()`: one line with `this.page.goto`. `expectLoaded()`: `await expect(this.page).toHaveURL(/\/products/);` and `await expect(this.heading).toBeVisible();`.

**15.7** Copy the shape from the comment. The role inside the card is `'heading'`. Don't forget `return`.

**15.8** `await this.searchBox.fill(term);`.

**15.9** `await this.sortSelect.selectOption({ label });` (`{ label }` is short for `{ label: label }`).

**15.10** `const card = this.cards.filter({ has: this.page.getByRole('heading', { name, exact: true }) });` then `return new ProductCard(card);`. No `await`: nothing touches the browser here.

**15.11** Constructor: `this.price = root.locator('.price');`. `getPrice()`: `const text = await this.price.textContent();` then `return Number((text ?? '').replace('$', ''));`.

**15.12** Constructor: `this.cartButton = root.getByRole('button');`. `addToCart()`: click it, then `await expect(this.cartButton).toHaveText('Remove');`.

**15.13** Read `BasePage.ts`: does `CartPage` extend it? Both page objects got the same `page` from the test. And `header`: each constructor ran `new Header(page)` once... how many Header objects is that?

**15.14** `await this.header.cartLink.click();` then `return new CartPage(this.page);`.

**15.15** The innerText of the first cell of a row: `await row.getByRole('cell').first().innerText()`.

**15.16** `await this.rows.filter({ hasText: name }).getByRole('button', { name: 'Remove' }).click();`.

**15.17** Same shape as 15.14, with `this.checkoutLink` and `CheckoutPage`.

**15.18** `fillDetails`: three `fill` lines using the parameters. `placeOrder`: click, `const text = await this.orderNumber.textContent();`, `return text ?? '';`.

**15.19** `getProductNames()` is `async`: what do you write in front of the call?

**15.20** Follow the 5 steps. Each step is 1-3 lines. Start with `const loginPage = new LoginPage(page);`. For step 2: `await productsPage.productCard('Bike Light').addToCart();`. For step 5: `expect(orderNumber).toMatch(/^ORD-\d+$/);` and `await expect(checkoutPage.header.cartCount).toHaveText('0');`.
