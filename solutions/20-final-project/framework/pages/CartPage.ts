import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly path = '/cart';
  readonly heading: Locator;
  readonly rows: Locator;
  readonly total: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Your Cart' });
    this.rows = page.getByTestId('cart-row');
    this.total = page.getByTestId('cart-total');
    this.emptyMessage = page.getByTestId('empty-cart');
  }

  row(name: string): Locator {
    return this.rows.filter({ hasText: name });
  }

  async removeItem(name: string): Promise<void> {
    await this.row(name).getByRole('button', { name: 'Remove' }).click();
  }
}
