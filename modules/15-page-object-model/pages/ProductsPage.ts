import { expect, type Locator, type Page } from '@playwright/test';
import { todo } from '../../../helpers/blank';
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
    // ✍️ 15.6: open '/products'
    todo('ProductsPage.goto() in modules/15-page-object-model/pages/ProductsPage.ts');
  }

  /** A small assertion helper: "am I really on this page?" */
  async expectLoaded(): Promise<void> {
    // ✍️ 15.6: two web-first assertions:
    //   - this.page has a URL matching /\/products/
    //   - this.heading is visible
    todo('ProductsPage.expectLoaded() in modules/15-page-object-model/pages/ProductsPage.ts');
  }

  /** Returns DATA: the names of the visible products, in the order shown. */
  async getProductNames(): Promise<string[]> {
    // ✍️ 15.7: return the texts of the headings inside the VISIBLE cards.
    // Shape: return this.cards.filter({ visible: true }).getByRole('...').allTextContents();
    // (search hides cards but they stay in the page, that's why we keep only the visible ones)
    todo('ProductsPage.getProductNames() in modules/15-page-object-model/pages/ProductsPage.ts');
  }

  async search(term: string): Promise<void> {
    // ✍️ 15.8: fill this.searchBox with `term`
    todo('ProductsPage.search() in modules/15-page-object-model/pages/ProductsPage.ts');
  }

  /** label: 'Name (A to Z)', 'Name (Z to A)', 'Price (low to high)', 'Price (high to low)' */
  async sortBy(label: string): Promise<void> {
    // ✍️ 15.9: select the option with this LABEL in this.sortSelect
    todo('ProductsPage.sortBy() in modules/15-page-object-model/pages/ProductsPage.ts');
  }

  /** Returns a COMPONENT object for one card. Not async: creating locators touches nothing. */
  productCard(name: string): ProductCard {
    // ✍️ 15.10:
    //   1. const card = the card in this.cards that HAS a heading named exactly `name`
    //      (filter + has + this.page.getByRole('heading', { name, exact: true }))
    //   2. return new ProductCard(card);
    todo('ProductsPage.productCard() in modules/15-page-object-model/pages/ProductsPage.ts');
  }

  /** Navigation method: returns the NEXT page object. */
  async openCart(): Promise<CartPage> {
    // ✍️ 15.14: click the cart link of the header (this.header.cartLink),
    // then return a new CartPage for this.page
    todo('ProductsPage.openCart() in modules/15-page-object-model/pages/ProductsPage.ts');
  }
}
