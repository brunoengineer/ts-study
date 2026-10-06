import type { Locator, Page } from '@playwright/test';
import { todo } from '../../../helpers/blank';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  readonly heading: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly placeOrderButton: Locator;
  readonly errorMessage: Locator;
  readonly orderNumber: Locator; // shown on the "Thank you" page after placing the order

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Checkout' });
    this.firstNameInput = page.getByLabel('First name');
    this.lastNameInput = page.getByLabel('Last name');
    this.postalCodeInput = page.getByLabel('Postal code');
    this.placeOrderButton = page.getByRole('button', { name: 'Place order' });
    this.errorMessage = page.getByRole('alert');
    this.orderNumber = page.getByTestId('order-number');
  }

  async goto(): Promise<void> {
    await this.page.goto('/checkout');
  }

  async fillDetails(firstName: string, lastName: string, postalCode: string): Promise<void> {
    // ✍️ 15.18: fill the three inputs with the three parameters
    todo('CheckoutPage.fillDetails() in modules/15-page-object-model/pages/CheckoutPage.ts');
  }

  /** Clicks 'Place order' and returns the order number, e.g. 'ORD-1001'. */
  async placeOrder(): Promise<string> {
    // ✍️ 15.18:
    //   1. click this.placeOrderButton
    //   2. read the textContent() of this.orderNumber   (it waits until the element exists)
    //   3. return it; textContent() can be null, so return '' in that case (?? from module 06)
    todo('CheckoutPage.placeOrder() in modules/15-page-object-model/pages/CheckoutPage.ts');
  }
}
