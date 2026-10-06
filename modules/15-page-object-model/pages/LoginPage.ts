import type { Locator, Page } from '@playwright/test';
import { todo } from '../../../helpers/blank';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page); // runs the BasePage constructor: sets this.page and this.header
    this.usernameInput = page.getByLabel('Username');

    // ✍️ 15.2: set the three missing locators (same style as usernameInput):
    //   this.passwordInput -> the field labelled 'Password'
    //   this.loginButton   -> the BUTTON named 'Log in'
    //   this.errorMessage  -> the element with the role 'alert'
  }

  async goto(): Promise<void> {
    // ✍️ 15.1: open '/login'. Inside a class you reach the page with `this.page`.
    // Shape: await this.page.goto('...');
    todo('LoginPage.goto() in modules/15-page-object-model/pages/LoginPage.ts');
  }

  async login(username: string, password: string): Promise<void> {
    // ✍️ 15.3: fill usernameInput with `username`, passwordInput with `password`, click loginButton.
    // Use the PROPERTIES: this.usernameInput, this.passwordInput, this.loginButton
    todo('LoginPage.login() in modules/15-page-object-model/pages/LoginPage.ts');
  }
}
