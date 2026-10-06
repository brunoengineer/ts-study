// Module 16 · fixtures file — reference solution (exercises 16.16 and 16.17).
//
// This is the professional pattern: ONE file that extends Playwright's `test` with your own
// fixtures and exports `test` and `expect`. Spec files then import from here instead of '@playwright/test':
//
//     import { test, expect } from './fixtures';

import { test as base, expect } from '@playwright/test';
import { CartPage, LoginPage, ProductsPage } from './pages';

// 1) The TYPE: which fixtures exist, and what each one gives to the test.
type ShopFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
};

// 2) The IMPLEMENTATION: one async function per fixture.
export const test = base.extend<ShopFixtures>({
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // 16.16
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // 16.17 — a fixture can depend on another fixture: Playwright builds loginPage first.
  productsPage: async ({ loginPage, page }, use) => {
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');
    await expect(page).toHaveURL(/\/products/); // make sure the login finished before the test starts
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },
});

// 3) Export expect too, so spec files need only ONE import line.
export { expect };
