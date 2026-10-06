// Module 16 · YOUR fixtures file (exercises 16.16 and 16.17 happen HERE).
//
// This is the professional pattern: ONE file that extends Playwright's `test` with your own
// fixtures and exports `test` and `expect`. Spec files then import from here instead of '@playwright/test':
//
//     import { test, expect } from './fixtures';
//
// The `cartPage` fixture is complete: use it as your example.

import { test as base, expect } from '@playwright/test';
import { todo } from '../../helpers/blank';
import { CartPage, LoginPage, ProductsPage } from './pages';

// 1) The TYPE: which fixtures exist, and what each one gives to the test.
type ShopFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
};

// 2) The IMPLEMENTATION: one async function per fixture.
export const test = base.extend<ShopFixtures>({
  // ✅ Example (complete): build the object, hand it to the test with use(), nothing to clean up.
  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  // 16.16 ✍️ the loginPage fixture
  // Build a LoginPage with the `page` fixture and hand it to the test with use(...).
  // Shape: same 2 lines as cartPage above (new LoginPage(page) ... await use(...)).
  loginPage: async ({ page }, use) => {
    // ✍️ your code here

    todo('16.16: write the loginPage fixture in fixtures.ts');
  },

  // 16.17 ✍️ the productsPage fixture: a page object that is ALREADY logged in
  // This fixture asks for ANOTHER fixture (loginPage) and for `page`.
  //  1. log in as standard_user / secret123 with loginPage (goto, then login)
  //  2. wait until the URL contains /products  (await expect(page).toHaveURL(/\/products/))
  //  3. build a ProductsPage and hand it to the test with use(...)
  productsPage: async ({ loginPage, page }, use) => {
    // ✍️ your code here

    todo('16.17: write the productsPage fixture in fixtures.ts');
  },
});

// 3) Export expect too, so spec files need only ONE import line.
export { expect };
