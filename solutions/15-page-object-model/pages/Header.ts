import type { Locator, Page } from '@playwright/test';

/**
 * The header that is on EVERY page of QA Shop.
 * It's a COMPONENT (a piece of a page), not a page: it has no goto().
 */
export class Header {
  readonly root: Locator;
  readonly cartLink: Locator;
  readonly cartCount: Locator;
  readonly userName: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.root = page.getByRole('navigation', { name: 'Main' });
    // Every locator below is searched INSIDE the nav (chaining, module 12).
    this.cartLink = this.root.getByRole('link', { name: /^Cart/ });
    this.cartCount = this.root.getByTestId('cart-count');
    this.userName = this.root.getByTestId('user-name');
    this.logoutLink = this.root.getByRole('link', { name: 'Log out' });
  }

  async logOut(): Promise<void> {
    await this.logoutLink.click();
  }
}
