import { test, expect } from '../../fixtures';
import { USER } from '../../utils/env';

// Login tests must start logged out (the 'ui' project gives everyone the user state).
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('login', { tag: '@login' }, () => {
  test('a standard user can log in', { tag: '@smoke' }, async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login(USER.username, USER.password);
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
  });

  test('a locked user sees an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('locked_user', 'secret123');
    await expect(loginPage.errorMessage).toHaveText('Sorry, this user has been locked out.');
  });

  test('a wrong password shows an error', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login(USER.username, 'wrong-password');
    await expect(loginPage.errorMessage).toHaveText('Invalid username or password');
  });
});
