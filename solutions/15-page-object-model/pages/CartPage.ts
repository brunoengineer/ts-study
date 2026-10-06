import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CheckoutPage } from './CheckoutPage';

export class CartPage extends BasePage {
  readonly heading: Locator;
  readonly rows: Locator;
  readonly total: Locator;
  readonly checkoutLink: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Your Cart' });
    this.rows = page.getByTestId('cart-row');
    this.total = page.getByTestId('cart-total');
    this.checkoutLink = page.getByRole('link', { name: 'Checkout' });
    this.emptyMessage = page.getByTestId('empty-cart');
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }

  /** The product name of every row (the first cell of each row). */
  async getItemNames(): Promise<string[]> {
    const names: string[] = [];
    for (const row of await this.rows.all()) {
      names.push(await row.getByRole('cell').first().innerText());
    }
    return names;
  }

  async removeItem(name: string): Promise<void> {
    await this.rows.filter({ hasText: name }).getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(): Promise<CheckoutPage> {
    await this.checkoutLink.click();
    return new CheckoutPage(this.page);
  }
}
