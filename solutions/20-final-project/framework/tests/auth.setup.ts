import { test as setup, expect } from '@playwright/test';
import { ApiClient } from '../api/ApiClient';
import { LoginPage } from '../pages/LoginPage';
import { ADMIN, ADMIN_STATE, USER, USER_STATE } from '../utils/env';

setup('log in as standard_user (UI) and save the state', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(USER.username, USER.password);
  await expect(page).toHaveURL(/\/products/);
  await page.context().storageState({ path: USER_STATE });
});

setup('log in as admin (API) and save the state', async ({ request, context, baseURL }) => {
  const token = await new ApiClient(request).login(ADMIN.username, ADMIN.password);
  await context.addCookies([{ name: 'session', value: token, url: baseURL }]);
  await context.storageState({ path: ADMIN_STATE });
});
