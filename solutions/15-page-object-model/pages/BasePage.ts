import type { Page } from '@playwright/test';
import { Header } from './Header';

/**
 * What EVERY page object has: the Playwright page and the header.
 * Other page objects extend it (module 09): `class CartPage extends BasePage`.
 */
export class BasePage {
  readonly page: Page;
  readonly header: Header;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
  }
}
