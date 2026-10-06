import { test, expect } from '../../fixtures';
import { ADMIN_STATE } from '../../utils/env';

test.beforeEach(async ({ api }) => {
  await api.reset();
});

test.describe('products page', () => {
  test('shows all products', { tag: '@smoke' }, async ({ productsPage }) => {
    await productsPage.goto();
    await expect(productsPage.heading).toBeVisible();
    await expect(productsPage.productCards).toHaveCount(6);
  });

  test('adding a product updates the cart counter', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.addToCart('Backpack');
    await expect(productsPage.cartCount).toHaveText('1');
  });

  test('a sold-out product cannot be added', async ({ productsPage }) => {
    await productsPage.goto();
    await expect(productsPage.productCard('Onesie').getByRole('button', { name: 'Sold out' })).toBeDisabled();
  });
});

test.describe('admin dashboard', () => {
  test.use({ storageState: ADMIN_STATE });

  test('counts the products', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(page.getByTestId('product-total')).toHaveText('6');
  });
});
