import { expect, type Locator } from '@playwright/test';
import { todo } from '../../../helpers/blank';

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

    // ✍️ 15.11: this.price      -> inside root, the element with the CSS class 'price'
    // ✍️ 15.12: this.cartButton -> inside root, the button (there is only one per card)
  }

  /** '$49.99' -> 49.99 */
  async getPrice(): Promise<number> {
    // ✍️ 15.11: read the text of this.price ('$49.99'), remove the '$' and return it as a number.
    // textContent() returns string | null, so use `?? ''` before .replace (module 06).
    todo('ProductCard.getPrice() in modules/15-page-object-model/pages/ProductCard.ts');
  }

  async addToCart(): Promise<void> {
    // ✍️ 15.12: click this.cartButton, then WAIT until it has the text 'Remove'
    // (the shop needs ~300 ms; a waiting assertion inside a page object is fine).
    todo('ProductCard.addToCart() in modules/15-page-object-model/pages/ProductCard.ts');
  }
}
