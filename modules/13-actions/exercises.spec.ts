// Module 13 · Actions
// Run:  npm run check 13          (watch the browser: npm run check 13 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect, type Page } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('13.1 ✍️ fill two fields', async ({ page }) => {
    // Fill the field 'Full name' with 'Jane Doe' and the field 'Email' with 'jane@qa.shop'.
    // ✍️ your code here

    todo();
    await expect(page.getByLabel('Full name')).toHaveValue('Jane Doe');
    await expect(page.getByLabel('Email')).toHaveValue('jane@qa.shop');
  });

  test('13.2 🔮 fill replaces, pressSequentially types', async ({ page }) => {
    const fullName = page.getByLabel('Full name');
    await fullName.fill('Jane');
    await fullName.fill('Doe');
    expect(await fullName.inputValue()).toBe(___);

    await fullName.pressSequentially(' Smith'); // types key by key, at the end of the text
    expect(await fullName.inputValue()).toBe(___);
  });

  test('13.3 ✍️ clear a field', async ({ page }) => {
    const comments = page.getByLabel('Comments');
    await comments.fill('temporary text');
    // Empty the Comments field (one action, no fill).
    // ✍️ your code here

    todo();
    await expect(comments).toBeEmpty();
  });

  test('13.4 ✍️ check and uncheck', async ({ page }) => {
    const newsletter = page.getByRole('checkbox', { name: 'Send me the newsletter' });
    const terms = page.getByRole('checkbox', { name: 'I agree to the terms' });
    // 1. check BOTH checkboxes
    // 2. then uncheck the newsletter
    // ✍️ your code here

    todo();
    await expect(terms).toBeChecked();
    await expect(newsletter).not.toBeChecked();
  });

  test('13.5 ✍️ a radio button and setChecked', async ({ page }) => {
    const wantsNewsletter: boolean = true; // imagine this comes from test data
    // 1. check the radio 'Enterprise'
    // 2. set the newsletter checkbox to the value of wantsNewsletter (use setChecked, not check)
    // ✍️ your code here

    todo();
    await expect(page.getByRole('radio', { name: 'Enterprise' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Free' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Send me the newsletter' })).toBeChecked();
  });

  test('13.6 ✍️ selectOption by label', async ({ page }) => {
    // Select 'Japan' in the 'Country' dropdown, using the visible LABEL of the option.
    // Shape: await locator.selectOption({ label: '...' });
    // ✍️ your code here

    todo();
    await expect(page.getByLabel('Country')).toHaveValue('jp');
  });

  test('13.7 🔮 option values vs labels', async ({ page }) => {
    const country = page.getByLabel('Country');
    // Options: "Choose a country" (''), Brazil (br), Portugal (pt), United States (us), Japan (jp)
    const selected = await country.selectOption('pt'); // a plain string = the VALUE
    expect(selected).toEqual(___); // careful: selectOption returns an ARRAY

    await country.selectOption({ label: 'United States' });
    expect(await country.inputValue()).toBe(___);
  });

  test('13.8 🐛 fill takes a string', async ({ page }) => {
    // Run it and read the error: "value: expected string, got number". VS Code is red too.
    await page.getByLabel('Age').fill(30);
    await expect(page.getByLabel('Age')).toHaveValue('30');
  });

  test('13.9 ✍️ submit the sign-up form', async ({ page }) => {
    // Fill the form and submit it:
    //  - Full name 'Sam Standard', Email 'sam@qa.shop'
    //  - Country 'Brazil' (by label)
    //  - plan 'Pro'
    //  - agree to the terms
    //  - click 'Submit'
    // ✍️ your code here

    todo();
    const result = page.getByTestId('form-result');
    await expect(result).toBeVisible();
    await expect(result).toContainText('"country": "br"');
    await expect(result).toContainText('"plan": "pro"');
    await expect(result).toContainText('"terms": true');
  });
});

test.describe('keyboard, hover and files', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('13.10 ✍️ press Enter', async ({ page }) => {
    // Fill the 'New to-do' field with 'Buy milk', then press Enter IN THAT FIELD (no click on Add).
    // Shape: await locator.press('Enter');
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('todo-count')).toHaveText('1 item');
  });

  test('13.11 ✍️ focus and the keyboard', async ({ page }) => {
    const newTodo = page.getByLabel('New to-do');
    // 1. focus the 'New to-do' field
    // 2. type 'Read the docs' with page.keyboard.type(...)
    // 3. press Enter with page.keyboard.press(...)
    // ✍️ your code here

    todo();
    await expect(page.getByRole('list', { name: 'To-do items' })).toContainText('Read the docs');
    await expect(newTodo).toBeEmpty();
  });

  test('13.12 🐛 the locked button', async ({ page }) => {
    // Run it: "element is not enabled". The click waits only 2 s here so you don't wait 30 s.
    // In the playground, how does the 'Locked button' get enabled? Add the missing step.
    await page.getByRole('button', { name: 'Locked button' }).click({ timeout: 2_000 });
    await expect(page.getByTestId('locked-result')).toHaveText('Unlocked!');
  });

  test('13.13 ✍️ hover', async ({ page }) => {
    // Hover the button 'Hover me'.
    // ✍️ your code here

    todo();
    await expect(page.getByRole('tooltip')).toHaveText('You found the tooltip!');
  });

  test('13.14 ✍️ upload a file from memory', async ({ page }) => {
    // Set the files of the input labelled 'Upload file' to ONE file made in memory:
    //   name 'report.txt', mimeType 'text/plain', buffer Buffer.from('all tests passed')
    // Shape: await locator.setInputFiles({ name: '...', mimeType: '...', buffer: Buffer.from('...') });
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('upload-result')).toHaveText('Selected: report.txt');
  });
});

test.describe('dialogs and new tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('13.15 ✍️ accept a confirm dialog', async ({ page }) => {
    // 1. tell the page: ONCE, when a dialog opens, accept it
    // 2. THEN click 'Open confirm'
    // Shape: page.once('dialog', (dialog) => dialog.accept());
    // ✍️ your code here

    todo();
    await expect(page.getByTestId('dialog-result')).toHaveText('You clicked: OK');
  });

  test('13.16 🐛 the prompt never gets my name', async ({ page }) => {
    // The result is 'No name given'. Why? Playwright DISMISSES dialogs nobody listens to.
    await page.getByRole('button', { name: 'Open prompt' }).click();
    page.once('dialog', (dialog) => dialog.accept('Bruno'));
    await expect(page.getByTestId('dialog-result')).toHaveText('Hello, Bruno!');
  });

  test('13.17 🔮 read the dialog', async ({ page }) => {
    let message = '';
    let kind = '';
    page.once('dialog', async (dialog) => {
      message = dialog.message();
      kind = dialog.type();
      await dialog.accept();
    });
    await page.getByRole('button', { name: 'Open alert' }).click();
    expect(message).toBe(___);
    expect(kind).toBe(___);
  });

  test('13.18 ✍️ a link that opens a new tab', async ({ page }) => {
    // The link 'Open products in a new tab' has target="_blank".
    // 1. START waiting for the popup (don't await yet):  const newTabPromise = page.waitForEvent('popup');
    // 2. click the link
    // 3. const newTab = await newTabPromise;
    // ✍️ your code here

    todo();
    // The new tab shares the browser context... and we never logged in. So /products sends it to /login.
    await expect(newTab).toHaveURL(/login/);
    await expect(newTab.getByRole('heading', { name: 'Login' })).toBeVisible();
  });
});

test.describe('full flows', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset'); // empty carts, default products
  });

  // A small helper you can use in this describe (you'll build better ones in module 15).
  async function logIn(page: Page, username = 'standard_user', password = 'secret123') {
    await page.goto('/login');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/products/);
  }

  test('13.19 ✍️ add two products to the cart', async ({ page }) => {
    await logIn(page);
    const cards = page.getByTestId('product-card');
    const cartCount = page.getByTestId('cart-count');
    // 1. click 'Add to cart' in the card with 'Backpack'
    // 2. wait until cartCount has the text '1'   (the shop needs ~300 ms to update)
    // 3. click 'Add to cart' in the card with 'Bike Light'
    // ✍️ your code here

    todo();
    await expect(cartCount).toHaveText('2');
    await expect(cards.filter({ hasText: 'Backpack' }).getByRole('button')).toHaveText('Remove');
  });

  test('13.20 🧪 remove a product from the cart page', async ({ page }) => {
    await logIn(page);
    const cards = page.getByTestId('product-card');
    await cards.filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    await cards.filter({ hasText: 'Bike Light' }).getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('2');

    await page.getByRole('link', { name: /Cart/ }).click();
    await page.getByTestId('cart-row').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Remove' }).click();
    // Write TWO assertions:
    //  - the cart rows (getByTestId('cart-row')) have a count of 1
    //  - the cart total (getByTestId('cart-total')) has the text 'Total: $9.99'
    // ✍️ your code here

    todo();
  });

  test('13.21 ✍️ combine: buy a backpack', async ({ page }) => {
    await logIn(page);
    // 1. add the 'Backpack' to the cart, wait until the cart count is '1'
    // 2. click the header link to the cart (its name starts with 'Cart')
    // 3. click the link 'Checkout'
    // 4. fill 'First name' Sam, 'Last name' Standard, 'Postal code' 12345
    // 5. click 'Place order'
    // ✍️ your code here

    todo();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(/ORD-\d+/);
    await expect(page.getByTestId('cart-count')).toHaveText('0');
  });
});
