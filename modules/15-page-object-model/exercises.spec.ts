// Module 15 · Page Object Model
// Run:  npm run check 15          (watch the browser: npm run check 15 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// ⚠️ In this module most of the work is NOT in this file. It's in the page objects:
//    modules/15-page-object-model/pages/*.ts   (look for "✍️ 15.N" comments and todo() lines)
// The tests below USE those classes. When a test fails with "📝 TODO: LoginPage.goto() ...",
// open that file and write that method.

import { test, expect, type Page } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';
import { BasePage } from './pages/BasePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { ProductsPage } from './pages/ProductsPage';

// Plain helpers (not page objects), so each section works even if LoginPage is not finished yet.
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
    // Work in pages/LoginPage.ts -> goto()
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await expect(page).toHaveTitle('Login | QA Shop');
  });

  test('15.2 ✍️ LoginPage: the missing locators', async ({ page }) => {
    // Work in pages/LoginPage.ts -> the constructor.
    // "Cannot read properties of undefined (reading 'fill')" means: that property was never set.
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.usernameInput.fill('standard_user');
    await loginPage.passwordInput.fill('secret123');
    await loginPage.loginButton.click();
    await expect(page).toHaveURL(/products/);
  });

  test('15.3 ✍️ LoginPage: login()', async ({ page }) => {
    // Work in pages/LoginPage.ts -> login(username, password)
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret123');
    await expect(page).toHaveURL(/products/);
  });

  test('15.4 🧪 LoginPage: the locked user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('locked_user', 'secret123');
    // Write ONE assertion: loginPage.errorMessage has the text 'Sorry, this user has been locked out.'
    // ✍️ your code here

    todo();
  });
});

test.describe('Header component', () => {
  test('15.5 ✍️ Header: cartCount and userName', async ({ page }) => {
    // Work in pages/Header.ts -> the constructor.
    // "toHaveText can be only used with Locator object, was called with undefined" = the property was never set.
    await logIn(page);
    const productsPage = new ProductsPage(page);
    await expect(productsPage.header.userName).toHaveText('Sam Standard');
    await expect(productsPage.header.cartCount).toHaveText('0');
  });
});

test.describe('ProductsPage', () => {
  let productsPage: ProductsPage; // declared here, created fresh in beforeEach for every test

  test.beforeEach(async ({ page }) => {
    await logIn(page);
    productsPage = new ProductsPage(page);
  });

  test('15.6 ✍️ ProductsPage: goto() and expectLoaded()', async ({ page }) => {
    // Work in pages/ProductsPage.ts -> goto() and expectLoaded()
    await page.goto('/playground'); // start somewhere else
    await productsPage.goto();
    await productsPage.expectLoaded();
    expect(page.url()).toContain('/products');
  });

  test('15.7 ✍️ ProductsPage: getProductNames()', async () => {
    // Work in pages/ProductsPage.ts -> getProductNames()
    const names = await productsPage.getProductNames();
    expect(names).toEqual(['Backpack', 'Bike Light', 'Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
  });

  test('15.8 ✍️ ProductsPage: search()', async () => {
    // Work in pages/ProductsPage.ts -> search(term)
    await productsPage.search('shirt');
    await expect(productsPage.resultCount).toHaveText('2 products');
    expect(await productsPage.getProductNames()).toEqual(['Bolt T-Shirt', 'Red T-Shirt']);
  });

  test('15.9 ✍️ ProductsPage: sortBy()', async () => {
    // Work in pages/ProductsPage.ts -> sortBy(label)
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
    // Work in pages/ProductsPage.ts -> productCard(name)
    const card = productsPage.productCard('Fleece Jacket');
    await expect(card.name).toHaveText('Fleece Jacket');
  });

  test('15.11 ✍️ ProductCard: price and getPrice()', async () => {
    // Work in pages/ProductCard.ts -> this.price and getPrice()
    const card = productsPage.productCard('Fleece Jacket');
    await expect(card.price).toHaveText('$49.99');
    expect(await card.getPrice()).toBe(49.99);
  });

  test('15.12 ✍️ ProductCard: cartButton and addToCart()', async () => {
    // Work in pages/ProductCard.ts -> this.cartButton and addToCart()
    const card = productsPage.productCard('Backpack');
    await card.addToCart();
    await expect(card.cartButton).toHaveText('Remove');
    await expect(productsPage.header.cartCount).toHaveText('1');
  });
});

test.describe('how page objects fit together', () => {
  test('15.13 🔮 one page, many objects', async ({ page }) => {
    // No browser action here: just objects. Read pages/BasePage.ts and pages/CartPage.ts first.
    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    expect(cartPage instanceof BasePage).toBe(___);
    expect(cartPage.page === productsPage.page).toBe(___);
    expect(cartPage.header === productsPage.header).toBe(___);
  });
});

test.describe('CartPage and CheckoutPage', () => {
  test.beforeEach(async ({ page }) => {
    await logIn(page);
    await addToCartViaApi(page, 1); // Backpack
    await addToCartViaApi(page, 2); // Bike Light
  });

  test('15.14 ✍️ ProductsPage: openCart() returns a CartPage', async ({ page }) => {
    // Work in pages/ProductsPage.ts -> openCart()
    const productsPage = new ProductsPage(page);
    const cartPage = await productsPage.openCart();
    await expect(cartPage.heading).toBeVisible();
    await expect(cartPage.rows).toHaveCount(2);
  });

  test('15.15 ✍️ CartPage: getItemNames()', async ({ page }) => {
    // Work in pages/CartPage.ts -> getItemNames()
    const cartPage = new CartPage(page);
    await cartPage.goto();
    expect(await cartPage.getItemNames()).toEqual(['Backpack', 'Bike Light']);
  });

  test('15.16 ✍️ CartPage: removeItem(name)', async ({ page }) => {
    // Work in pages/CartPage.ts -> removeItem(name)
    const cartPage = new CartPage(page);
    await cartPage.goto();
    await cartPage.removeItem('Backpack');
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.total).toHaveText('Total: $9.99');
  });

  test('15.17 ✍️ CartPage: checkout() returns a CheckoutPage', async ({ page }) => {
    // Work in pages/CartPage.ts -> checkout()
    const cartPage = new CartPage(page);
    await cartPage.goto();
    const checkoutPage = await cartPage.checkout();
    await expect(checkoutPage.heading).toBeVisible();
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('15.18 ✍️ CheckoutPage: fillDetails() and placeOrder()', async ({ page }) => {
    // Work in pages/CheckoutPage.ts -> fillDetails() and placeOrder()
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto();
    await checkoutPage.fillDetails('Sam', 'Standard', '12345');
    const orderNumber = await checkoutPage.placeOrder();
    expect(orderNumber).toBe('ORD-1001'); // the first order after a reset
  });
});

test.describe('combine everything', () => {
  test('15.19 🐛 page methods return Promises', async ({ page }) => {
    // Needs 15.7 first. Then read the error: "Received has value: Promise {}".
    await logIn(page);
    const productsPage = new ProductsPage(page);
    const names = productsPage.getProductNames();
    expect(names).toHaveLength(6);
  });

  test('15.20 ✍️ a whole purchase with page objects only', async ({ page }) => {
    // Write the whole test using ONLY page objects (no page.getBy... in this test!):
    //  1. LoginPage: goto(), then login as 'standard_user' / 'secret123'
    //  2. ProductsPage: expectLoaded(), then add the card 'Bike Light' to the cart
    //  3. openCart() -> a CartPage. Assert getItemNames() equals ['Bike Light']
    //  4. checkout() -> a CheckoutPage. fillDetails('Sam', 'Standard', '12345'), placeOrder() -> orderNumber
    //  5. assert orderNumber matches /^ORD-\d+$/ and the header's cartCount has the text '0'
    // ✍️ your code here

    todo();
  });
});
