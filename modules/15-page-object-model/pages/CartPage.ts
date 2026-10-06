import type { Locator, Page } from '@playwright/test';
import { todo } from '../../../helpers/blank';
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
    // ✍️ 15.15: build an array with the first cell's text of each row, and return it.
    // Shape:
    //   const names: string[] = [];
    //   for (const row of await this.rows.all()) {          // .all() -> one Locator per row
    //     names.push(/* the innerText() of the FIRST cell of this row */);
    //   }
    //   return names;
    todo('CartPage.getItemNames() in modules/15-page-object-model/pages/CartPage.ts');
  }

  async removeItem(name: string): Promise<void> {
    // ✍️ 15.16: in the row that has the text `name`, click the button 'Remove'
    todo('CartPage.removeItem() in modules/15-page-object-model/pages/CartPage.ts');
  }

  async checkout(): Promise<CheckoutPage> {
    // ✍️ 15.17: click this.checkoutLink, then return a new CheckoutPage for this.page
    todo('CartPage.checkout() in modules/15-page-object-model/pages/CartPage.ts');
  }
}
