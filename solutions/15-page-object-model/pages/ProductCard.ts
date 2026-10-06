import { expect, type Locator } from '@playwright/test';

/**
 * ONE product card on the products page. A component object:
 * it gets a ROOT locator (the card) and finds everything INSIDE it.
 */
export class ProductCard {
  readonly root: Locator;
  readonly name: Locator;
  readonly price: Locator;
  readonly cartButton: Locator;

  constructor(root: Locator) {
    this.root = root;
    this.name = root.getByRole('heading');
    this.price = root.locator('.price');
    this.cartButton = root.getByRole('button'); // 'Add to cart', 'Remove' or 'Sold out'
  }

  /** '$49.99' -> 49.99 */
  async getPrice(): Promise<number> {
    const text = await this.price.textContent();
    return Number((text ?? '').replace('$', ''));
  }

  async addToCart(): Promise<void> {
    await this.cartButton.click();
    // A waiting helper inside a page object is fine: the action is only "done" when the shop has updated.
    await expect(this.cartButton).toHaveText('Remove');
  }
}
