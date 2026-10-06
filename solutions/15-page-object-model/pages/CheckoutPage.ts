import type { Locator, Page } from '@playwright/test';
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
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  /** Clicks 'Place order' and returns the order number, e.g. 'ORD-1001'. */
  async placeOrder(): Promise<string> {
    await this.placeOrderButton.click();
    const text = await this.orderNumber.textContent(); // textContent waits until the element exists
    return text ?? '';
  }
}
