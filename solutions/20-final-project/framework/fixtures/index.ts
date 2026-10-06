// The ONE import of every spec file:  import { test, expect } from '../../fixtures';
import { test as base, expect } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

type ShopFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  api: ApiClient;
};

export const test = base.extend<ShopFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  api: async ({ request }, use) => {
    await use(new ApiClient(request));
  },
});

export { expect };
