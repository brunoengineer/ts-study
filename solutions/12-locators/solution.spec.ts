// Module 12 · Locators — reference solution
// Run:  npm run solution 12
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('getByRole', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('12.1 🔮 how many Edit buttons?', async ({ page }) => {
    const count = await page.getByRole('button', { name: 'Edit' }).count();
    expect(count).toBe(5); // one per employee
  });

  test('12.2 🔮 name matching and exact', async ({ page }) => {
    const notExact = await page.getByRole('button', { name: 'Open' }).count();
    const exact = await page.getByRole('button', { name: 'Open', exact: true }).count();
    expect(notExact).toBe(3); // by default, name matches a PART of the name, ignoring case
    expect(exact).toBe(0); // exact: true -> the whole name must be 'Open'. No button is called just 'Open'.
  });

  test('12.3 ✍️ a heading with a level', async ({ page }) => {
    const employeesHeading = page.getByRole('heading', { name: 'Employees', level: 2 }); // level 2 = <h2>
    await expect(employeesHeading).toBeVisible();
    await expect(employeesHeading).toHaveText('Employees');
  });

  test('12.4 ✍️ a radio and a checkbox', async ({ page }) => {
    const freeRadio = page.getByRole('radio', { name: 'Free' });
    const terms = page.getByRole('checkbox', { name: 'I agree to the terms' });
    await expect(freeRadio).toBeChecked();
    await expect(terms).not.toBeChecked();
  });
});

test.describe('getByLabel, getByPlaceholder, getByText, getByTestId', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('12.5 ✍️ getByLabel', async ({ page }) => {
    const email = page.getByLabel('Email');
    await email.fill('sam@qa.shop');
    await expect(email).toHaveValue('sam@qa.shop');
  });

  test('12.6 ✍️ getByPlaceholder', async ({ page }) => {
    await page.getByPlaceholder('What needs to be done?').fill('Write tests');
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByTestId('todo-count')).toHaveText('1 item');
  });

  test('12.7 🔮 getByText finds parts of texts', async ({ page }) => {
    const contains = await page.getByText('QA').count();
    const exact = await page.getByText('QA', { exact: true }).count();
    expect(contains).toBe(3); // the 2 'QA' cells + the 'QA Shop' link in the header
    expect(exact).toBe(2); // exact: the whole text must be 'QA', so 'QA Shop' is out
  });

  test('12.8 🧪 getByTestId', async ({ page }) => {
    await expect(page.getByTestId('todo-count')).toHaveText('0 items');
  });
});

test.describe('chaining and filtering (Employees table)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('12.9 🔮 rows inside the table', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Employees' });
    const rowCount = await table.getByRole('row').count();
    expect(rowCount).toBe(6); // 5 employees + 1 header row (Name / Department / Salary / Action)
  });

  test('12.10 ✍️ filter by text, then click inside the row', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    await rows.filter({ hasText: 'Carla Souza' }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('table-result')).toHaveText('Editing Carla Souza');
  });

  test('12.11 🐛 strict mode violation', async ({ page }) => {
    // An action (click, fill...) needs exactly ONE element. Narrow it down to Eva's row first.
    await page.getByRole('row').filter({ hasText: 'Eva Rocha' }).getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('table-result')).toHaveText('Editing Eva Rocha');
  });

  test('12.12 🔮 hasText and hasNotText', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    const qaRows = await rows.filter({ hasText: 'QA' }).count();
    const otherRows = await rows.filter({ hasNotText: 'QA' }).count();
    expect(qaRows).toBe(2); // Alice and Bruno
    expect(otherRows).toBe(4); // Carla, Diego, Eva... AND the header row
  });

  test('12.13 ✍️ filter with has: rows that HAVE a button', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    const dataRows = rows.filter({ has: page.getByRole('button') });
    await expect(dataRows).toHaveCount(5);
  });

  test('12.14 ✍️ filter with has: a cell with an exact name', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    const designRow = rows.filter({ has: page.getByRole('cell', { name: 'Design', exact: true }) });
    await expect(designRow).toContainText('Diego Lima');
  });

  test('12.15 🧪 first, last and nth', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    await expect(rows.nth(1)).toContainText('Alice Martins');
    await expect(rows.last()).toContainText('Eva Rocha');
  });

  test('12.16 🔮 allTextContents', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    const cells = await rows.nth(3).getByRole('cell').allTextContents();
    // nth(0) header, nth(1) Alice, nth(2) Bruno, nth(3) Carla
    expect(cells).toEqual(['Carla Souza', 'Development', '6100', 'Edit']);
  });
});

test.describe('products page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/products/);
  });

  test('12.17 ✍️ getByText with a regex', async ({ page }) => {
    const helloMessage = page.getByText(/hello, sam/i); // the i flag = ignore case
    await expect(helloMessage).toBeVisible();
  });

  test('12.18 🔮 CSS and text counts', async ({ page }) => {
    const prices = await page.locator('.price').count();
    const tShirts = await page.getByText('T-Shirt').count();
    expect(prices).toBe(6); // one price per product card
    expect(tShirts).toBe(2); // 'Bolt T-Shirt' and 'Red T-Shirt' (substring match)
  });

  test('12.19 ✍️ the price inside one product card', async ({ page }) => {
    const cards = page.getByTestId('product-card');
    const fleecePrice = cards.filter({ hasText: 'Fleece Jacket' }).locator('.price');
    await expect(fleecePrice).toHaveText('$49.99');
  });

  test('12.20 🧪 all product names', async ({ page }) => {
    const names = await page.getByTestId('product-card').getByRole('heading').allTextContents();
    expect(names).toHaveLength(6);
    expect(names).toContain('Onesie');
  });

  test('12.21 ✍️ combine: or() and the sold-out card', async ({ page }) => {
    const cards = page.getByTestId('product-card');
    const cartButtons = page
      .getByRole('button', { name: 'Add to cart' })
      .or(page.getByRole('button', { name: 'Sold out' }));
    const soldOutCard = cards.filter({ has: page.getByRole('button', { name: 'Sold out' }) });
    await expect(cartButtons).toHaveCount(6);
    await expect(soldOutCard.getByRole('heading')).toHaveText('Onesie');
  });
});
