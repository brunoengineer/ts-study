import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  readonly path = '/products';
  readonly heading: Locator;
  readonly productCards: Locator;
  readonly cartCount: Locator;
  readonly searchBox: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Products' });
    this.productCards = page.getByTestId('product-card');
    this.cartCount = page.getByTestId('cart-count');
    this.searchBox = page.getByRole('searchbox', { name: 'Search products' });
  }

  productCard(name: string): Locator {
    return this.productCards.filter({ has: this.page.getByRole('heading', { name, exact: true }) });
  }

  async addToCart(name: string): Promise<void> {
    const card = this.productCard(name);
    await card.getByRole('button', { name: 'Add to cart' }).click();
    // The cart is saved in the background: wait until the button says "Remove".
    await expect(card.getByRole('button', { name: 'Remove' })).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
  }
}
