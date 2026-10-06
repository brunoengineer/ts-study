import { test, expect } from '../../fixtures';
import { USER } from '../../utils/env';

// The browser is logged in as standard_user (project 'hybrid' uses user.json),
// and the API client logs in as the same user: they share ONE cart.
test.beforeEach(async ({ api }) => {
  await api.reset();
  await api.login(USER.username, USER.password);
});

test.describe('cart: API and UI together', { tag: '@cart' }, () => {
  test('a cart seeded with the API shows in the UI', { tag: '@smoke' }, async ({ api, cartPage }) => {
    await api.addToCart(1, 2);
    await cartPage.goto();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.total).toHaveText('Total: $59.98');
  });

  test('a product added in the UI is in the API cart', async ({ api, productsPage }) => {
    await productsPage.goto();
    await productsPage.addToCart('Bike Light');
    const cart = await api.getCart();
    expect(cart.items).toEqual([expect.objectContaining({ name: 'Bike Light', quantity: 1 })]);
  });

  test('removing the last item empties the cart', async ({ api, cartPage }) => {
    await api.addToCart(2);
    await cartPage.goto();
    await cartPage.removeItem('Bike Light');
    await expect(cartPage.emptyMessage).toHaveText('Your cart is empty.');
    expect((await api.getCart()).count).toBe(0);
  });
});
