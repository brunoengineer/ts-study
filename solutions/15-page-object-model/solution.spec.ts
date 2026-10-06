// Module 15 · Page Object Model — reference solution
// Run:  npm run solution 15
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.
// The solved page objects are in solutions/15-page-object-model/pages/

import { test, expect, type Page } from '@playwright/test';
import { BasePage } from './pages/BasePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';

// Plain helpers (not page objects), so each section works on its own.
async function logIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/products/);
}

async function addToCartViaApi(page: Page, productId: number) {
  // page.request uses the cookies of the page, so the API knows we are logged in.
  const response = await page.request.post('/api/cart', { data: { productId } });
  expect(response.status()).toBe(201);
}

test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
});

test.describe('LoginPage', () => {
  test('15.1 ✍️ LoginPage: goto()', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveTitle('Login | QA Shop');
  });

  test('15.2 ✍️ LoginPage: the missing locators', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.passwordInput.fill('secret123');
    await loginPage.loginButton.click();
    await expect(page).toHaveURL(/products/);
  });

  test('15.3 ✍️ LoginPage: login()', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');
    await expect(page).toHaveURL(/products/);
  });

  test('15.4 🧪 LoginPage: the locked user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('locked_user', 'secret123');
    // The assertion stays in the TEST: the page object gives the locator, the test decides what is right.
    await expect(loginPage.errorMessage).toHaveText('Sorry, this user has been locked out.');
  });
});

test.describe('Header component', () => {
  test('15.5 ✍️ Header: cartCount and userName', async ({ page }) => {
    await logIn(page);
    const productsPage = new ProductsPage(page);
    await expect(productsPage.header.userName).toHaveText('Sam Standard');
    await expect(productsPage.header.cartCount).toHaveText('0');
  });
});

test.describe('ProductsPage', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    await logIn(page);
    productsPage = new ProductsPage(page);
  });

  test('15.6 ✍️ ProductsPage: goto() and expectLoaded()', async ({ page }) => {
    await page.goto('/playground');
    await productsPage.goto();
    await productsPage.expectLoaded();
    expect(page.url()).toContain('/products');
  });

  test('15.7 ✍️ ProductsPage: getProductNames()', async () => {
    const names = await productsPage.getProductNames();
    expect(names).toEqual(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
  });

  test('15.8 ✍️ ProductsPage: search()', async () => {
    await productsPage.search('shirt');
    await expect(productsPage.resultCount).toHaveText('2 products');
    expect(await productsPage.getProductNames()).toEqual(['Bolt T-Shirt', 'Red T-Shirt']);
  });

  test('15.9 ✍️ ProductsPage: sortBy()', async () => {
    await productsPage.sortBy('Price (low to high)');
    const names = await productsPage.getProductNames();
    expect(names[0]).toBe('Onesie');
    expect(names[names.length - 1]).toBe('Fleece Jacket');
  });
});

test.describe('ProductCard component', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    await logIn(page);
    productsPage = new ProductsPage(page);
  });

  test('15.10 ✍️ ProductsPage: productCard(name)', async () => {
    const card = productsPage.productCard('Fleece Jacket');
    await expect(card.name).toHaveText('Fleece Jacket');
  });

  test('15.11 ✍️ ProductCard: price and getPrice()', async () => {
    const card = productsPage.productCard('Fleece Jacket');
    await expect(card.price).toHaveText('$49.99');
    expect(await card.getPrice()).toBe(49.99);
  });

  test('15.12 ✍️ ProductCard: cartButton and addToCart()', async () => {
    const card = productsPage.productCard('Backpack');
    await card.addToCart();
    await expect(card.cartButton).toHaveText('Remove');
    await expect(productsPage.header.cartCount).toHaveText('1');
  });
});

test.describe('how page objects fit together', () => {
  test('15.13 🔮 one page, many objects', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    expect(cartPage instanceof BasePage).toBe(true); // CartPage extends BasePage
    expect(cartPage.page === productsPage.page).toBe(true); // both wrap the SAME browser tab
    expect(cartPage.header === productsPage.header).toBe(false); // each constructor ran `new Header(page)`
  });
});

test.describe('CartPage and CheckoutPage', () => {
  test.beforeEach(async ({ page }) => {
    await logIn(page);
    await addToCartViaApi(page, 1); // Backpack
    await addToCartViaApi(page, 2); // Bike Light
  });

  test('15.14 ✍️ ProductsPage: openCart() returns a CartPage', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const cartPage = await productsPage.openCart();
    await expect(cartPage.heading).toBeVisible();
    await expect(cartPage.rows).toHaveCount(2);
  });

  test('15.15 ✍️ CartPage: getItemNames()', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    expect(await cartPage.getItemNames()).toEqual(['Backpack', 'Bike Light']);
  });

  test('15.16 ✍️ CartPage: removeItem(name)', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.removeItem('Backpack');
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.total).toHaveText('Total: $9.99');
  });

  test('15.17 ✍️ CartPage: checkout() returns a CheckoutPage', async ({ page }) => {
    const cartPage = new CartPage(page);
    await cartPage.goto();
    const checkoutPage = await cartPage.checkout();
    await expect(checkoutPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('15.18 ✍️ CheckoutPage: fillDetails() and placeOrder()', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    await checkoutPage.fillDetails('Sam', 'Standard', '12345');
    const orderNumber = await checkoutPage.placeOrder();
    expect(orderNumber).toBe('ORD-1001'); // the first order after a reset
  });
});

test.describe('combine everything', () => {
  test('15.19 🐛 page methods return Promises', async ({ page }) => {
    await logIn(page);
    const productsPage = new ProductsPage(page);
    const names = await productsPage.getProductNames(); // an async method: await it like any Playwright call
    expect(names).toHaveLength(6);
  });

  test('15.20 ✍️ a whole purchase with page objects only', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');

    const productsPage = new ProductsPage(page);
    await productsPage.expectLoaded();
    await productsPage.productCard('Bike Light').addToCart();

    const cartPage = await productsPage.openCart();
    expect(await cartPage.getItemNames()).toEqual(['Bike Light']);

    const checkoutPage = await cartPage.checkout();
    await checkoutPage.fillDetails('Sam', 'Standard', '12345');
    const orderNumber = await checkoutPage.placeOrder();

    expect(orderNumber).toMatch(/^ORD-\d+$/);
    await expect(checkoutPage.header.cartCount).toHaveText('0');
  });
});
