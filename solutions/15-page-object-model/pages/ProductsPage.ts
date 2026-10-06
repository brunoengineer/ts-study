import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CartPage } from './CartPage';
import { ProductCard } from './ProductCard';

export class ProductsPage extends BasePage {
  readonly heading: Locator;
  readonly searchBox: Locator;
  readonly sortSelect: Locator;
  readonly resultCount: Locator;
  readonly cards: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Products', level: 1 });
    this.searchBox = page.getByRole('searchbox', { name: 'Search products' });
    this.sortSelect = page.getByRole('combobox', { name: 'Sort by' });
    this.resultCount = page.getByTestId('result-count');
    this.cards = page.getByTestId('product-card');
  }

  async goto(): Promise<void> {
    await this.page.goto('/products');
  }

  /** A small assertion helper: "am I really on this page?" */
  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/products/);
    await expect(this.heading).toBeVisible();
  }

  /** Returns DATA: the names of the visible products, in the order shown. */
  async getProductNames(): Promise<string[]> {
    // Search hides cards (they stay in the page), so keep only the visible ones.
    return this.cards.filter({ visible: true }).getByRole('heading').allTextContents();
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
  }

  /** label: 'Name (A to Z)', 'Name (Z to A)', 'Price (low to high)', 'Price (high to low)' */
  async sortBy(label: string): Promise<void> {
    await this.sortSelect.selectOption({ label });
  }

  /** Returns a COMPONENT object for one card. Not async: creating locators touches nothing. */
  productCard(name: string): ProductCard {
    const card = this.cards.filter({ has: this.page.getByRole('heading', { name, exact: true }) });
    return new ProductCard(card);
  }

  /** Navigation method: returns the NEXT page object. */
  async openCart(): Promise<CartPage> {
    await this.header.cartLink.click();
    return new CartPage(this.page);
  }
}
