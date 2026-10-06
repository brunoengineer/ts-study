// Module 12 · Locators
// Run:  npm run check 12          (watch the browser: npm run check 12 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// Most exercises use http://localhost:3000/playground. Keep it open in your browser (npm run app)
// and use DevTools (F12) or `npx playwright codegen http://localhost:3000/playground` -> "Pick locator".

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('getByRole', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('12.1 🔮 how many Edit buttons?', async ({ page }) => {
    // Look at the Employees table on the playground.
    const count = await page.getByRole('button', { name: 'Edit' }).count();
    expect(count).toBe(___);
  });

  test('12.2 🔮 name matching and exact', async ({ page }) => {
    // The Dialogs section has the buttons 'Open alert', 'Open confirm' and 'Open prompt'.
    const notExact = await page.getByRole('button', { name: 'Open' }).count();
    const exact = await page.getByRole('button', { name: 'Open', exact: true }).count();
    expect(notExact).toBe(___);
    expect(exact).toBe(___);
  });

  test('12.3 ✍️ a heading with a level', async ({ page }) => {
    // Create a constant `employeesHeading`: the heading named 'Employees', level 2.
    // Shape: page.getByRole('heading', { name: '...', level: N })
    // ✍️ your code here

    todo();
    await expect(employeesHeading).toBeVisible();
    await expect(employeesHeading).toHaveText('Employees');
  });

  test('12.4 ✍️ a radio and a checkbox', async ({ page }) => {
    // Create two constants:
    //  - freeRadio -> the radio named 'Free'
    //  - terms     -> the checkbox named 'I agree to the terms'
    // ✍️ your code here

    todo();
    await expect(freeRadio).toBeChecked(); // Free is the default plan
    await expect(terms).not.toBeChecked();
  });
});

test.describe('getByLabel, getByPlaceholder, getByText, getByTestId', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('12.5 ✍️ getByLabel', async ({ page }) => {
    // Create a constant `email`: the field with the label 'Email'. Then fill it with 'sam@qa.shop'.
    // ✍️ your code here

    todo();
    await expect(email).toHaveValue('sam@qa.shop');
  });

  test('12.6 ✍️ getByPlaceholder', async ({ page }) => {
    // 1. Fill the field with the placeholder 'What needs to be done?' with 'Write tests'
    // 2. Click the button 'Add'
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('todo-count')).toHaveText('1 item');
  });

  test('12.7 🔮 getByText finds parts of texts', async ({ page }) => {
    // The Employees table has two people in the department 'QA'.
    // But look at the WHOLE page, header included...
    const contains = await page.getByText('QA').count();
    const exact = await page.getByText('QA', { exact: true }).count();
    expect(contains).toBe(___);
    expect(exact).toBe(___);
  });

  test('12.8 🧪 getByTestId', async ({ page }) => {
    // The to-do counter has data-testid="todo-count". It starts with the text '0 items'.
    // Write ONE assertion that uses page.getByTestId(...) and toHaveText.
    // ✍️ your code here

    todo();
  });
});

test.describe('chaining and filtering (Employees table)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('12.9 🔮 rows inside the table', async ({ page }) => {
    const table = page.getByRole('table', { name: 'Employees' });
    // A locator INSIDE a locator: only rows of this table. The table has 5 employees...
    const rowCount = await table.getByRole('row').count();
    expect(rowCount).toBe(___);
  });

  test('12.10 ✍️ filter by text, then click inside the row', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    // Click the 'Edit' button of the row that has the text 'Carla Souza'.
    // Shape: rows.filter({ hasText: '...' }).getByRole('button', { name: '...' }).click()
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('table-result')).toHaveText('Editing Carla Souza');
  });

  test('12.11 🐛 strict mode violation', async ({ page }) => {
    // We want to edit Eva Rocha. Run it and read the error: "resolved to 5 elements".
    // Fix the locator so it finds ONLY Eva's Edit button (use filter, not nth).
    await page.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByTestId('table-result')).toHaveText('Editing Eva Rocha');
  });

  test('12.12 🔮 hasText and hasNotText', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    const qaRows = await rows.filter({ hasText: 'QA' }).count();
    const otherRows = await rows.filter({ hasNotText: 'QA' }).count(); // careful: what about the header row?
    expect(qaRows).toBe(___);
    expect(otherRows).toBe(___);
  });

  test('12.13 ✍️ filter with has: rows that HAVE a button', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    // The header row has no button. Create a constant `dataRows`: the rows that HAVE a button.
    // Shape: rows.filter({ has: page.getByRole('button') })
    // ✍️ your code here

    todo();
    await expect(dataRows).toHaveCount(5);
  });

  test('12.14 ✍️ filter with has: a cell with an exact name', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    // Create a constant `designRow`: the row that has a CELL named exactly 'Design'.
    // ✍️ your code here

    todo();
    await expect(designRow).toContainText('Diego Lima');
  });

  test('12.15 🧪 first, last and nth', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    // Write TWO assertions with toContainText:
    //  - rows.nth(1) contains 'Alice Martins'   (nth starts at 0, and row 0 is the header)
    //  - rows.last() contains 'Eva Rocha'
    // ✍️ your code here

    todo();
  });

  test('12.16 🔮 allTextContents', async ({ page }) => {
    const rows = page.getByRole('table', { name: 'Employees' }).getByRole('row');
    // nth(3) is the 4th row. Read all its cells as an array of strings.
    const cells = await rows.nth(3).getByRole('cell').allTextContents();
    expect(cells).toEqual(___);
  });
});

test.describe('products page', () => {
  test.beforeEach(async ({ page }) => {
    // /products needs a login.
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Username' }).fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/products/);
  });

  test('12.17 ✍️ getByText with a regex', async ({ page }) => {
    // The page says "Hello, Sam Standard! Pick something nice."
    // Create a constant `helloMessage` with getByText and a CASE-INSENSITIVE regex that matches 'hello, sam'.
    // Shape: page.getByText(/.../i)
    // ✍️ your code here

    todo();
    await expect(helloMessage).toBeVisible();
  });

  test('12.18 🔮 CSS and text counts', async ({ page }) => {
    const prices = await page.locator('.price').count(); // CSS: elements with class="price"
    const tShirts = await page.getByText('T-Shirt').count();
    expect(prices).toBe(___);
    expect(tShirts).toBe(___);
  });

  test('12.19 ✍️ the price inside one product card', async ({ page }) => {
    const cards = page.getByTestId('product-card');
    // Create a constant `fleecePrice`: inside the card that has the text 'Fleece Jacket',
    // the element with the CSS class 'price'.
    // Shape: cards.filter({ hasText: '...' }).locator('.something')
    // ✍️ your code here

    todo();
    await expect(fleecePrice).toHaveText('$49.99');
  });

  test('12.20 🧪 all product names', async ({ page }) => {
    const names = await page.getByTestId('product-card').getByRole('heading').allTextContents();
    // `names` is a plain string[] (module 04). Write TWO assertions:
    //  - it has a length of 6
    //  - it contains 'Onesie'
    // ✍️ your code here

    todo();
  });

  test('12.21 ✍️ combine: or() and the sold-out card', async ({ page }) => {
    const cards = page.getByTestId('product-card');
    // Every card has ONE cart button: 'Add to cart' OR 'Sold out'.
    // 1. Create `cartButtons`: the buttons 'Add to cart' or() the buttons 'Sold out'.
    // 2. Create `soldOutCard`: the card that HAS a button named 'Sold out'.
    // ✍️ your code here

    todo();
    await expect(cartButtons).toHaveCount(6);
    await expect(soldOutCard.getByRole('heading')).toHaveText('Onesie');
  });
});
