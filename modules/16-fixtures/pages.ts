// Module 16 · small page objects for QA Shop (PROVIDED, you don't need to change this file).
// They are the same idea as module 15: one class per page, locators as readonly properties,
// actions as async methods. In this module you will hand them to your tests with FIXTURES.

import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }
}

export class ProductsPage {
  readonly heading: Locator;
  readonly productCards: Locator;
  readonly cartCount: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Products' });
    this.productCards = page.getByTestId('product-card');
    this.cartCount = page.getByTestId('cart-count');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  card(name: string): Locator {
    return this.productCards.filter({ has: this.page.getByRole('heading', { name }) });
  }

  async addToCart(name: string): Promise<void> {
    const card = this.card(name);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    // The shop saves the cart in the background. Wait until the button says "Remove":
    // then the item is really in the cart and it's safe to leave the page.
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
  }
}

export class CartPage {
  readonly heading: Locator;
  readonly rows: Locator;
  readonly total: Locator;
  readonly emptyMessage: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Your Cart' });
    this.rows = page.getByTestId('cart-row');
    this.total = page.getByTestId('cart-total');
    this.emptyMessage = page.getByTestId('empty-cart');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }
}
