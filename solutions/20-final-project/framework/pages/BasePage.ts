import type { Page } from '@playwright/test';

/** What every page object has: the page, its own path, and goto(). */
export abstract class BasePage {
  abstract readonly path: string;

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }
}
