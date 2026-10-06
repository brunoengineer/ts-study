// Module 13 · Actions — reference solution
// Run:  npm run solution 13
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect, type Page } from '@playwright/test';

test.describe('forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('13.1 ✍️ fill two fields', async ({ page }) => {
    await page.getByLabel('Full name').fill('Jane Doe');
    await page.getByLabel('Email').fill('jane@qa.shop');
    await expect(page.getByLabel('Full name')).toHaveValue('Jane Doe');
    await expect(page.getByLabel('Email')).toHaveValue('jane@qa.shop');
  });

  test('13.2 🔮 fill replaces, pressSequentially types', async ({ page }) => {
    const fullName = page.getByLabel('Full name');
    await fullName.fill('Jane');
    await fullName.fill('Doe');
    expect(await fullName.inputValue()).toBe('Doe'); // fill REPLACES the whole value

    await fullName.pressSequentially(' Smith');
    expect(await fullName.inputValue()).toBe('Doe Smith'); // pressSequentially ADDS keys, like a person typing
  });

  test('13.3 ✍️ clear a field', async ({ page }) => {
    const comments = page.getByLabel('Comments');
    await comments.fill('temporary text');
    await comments.clear(); // same as fill('')
    await expect(comments).toBeEmpty();
  });

  test('13.4 ✍️ check and uncheck', async ({ page }) => {
    const newsletter = page.getByRole('checkbox', { name: 'Send me the newsletter' });
    const terms = page.getByRole('checkbox', { name: 'I agree to the terms' });
    await newsletter.check();
    await terms.check();
    await newsletter.uncheck();
    await expect(terms).toBeChecked();
    await expect(newsletter).not.toBeChecked();
  });

  test('13.5 ✍️ a radio button and setChecked', async ({ page }) => {
    const wantsNewsletter: boolean = true;
    await page.getByRole('radio', { name: 'Enterprise' }).check(); // checking a radio unchecks the others in its group
    await page.getByRole('checkbox', { name: 'Send me the newsletter' }).setChecked(wantsNewsletter);
    await expect(page.getByRole('radio', { name: 'Enterprise' })).toBeChecked();
    await expect(page.getByRole('radio', { name: 'Free' })).not.toBeChecked();
    await expect(page.getByRole('checkbox', { name: 'Send me the newsletter' })).toBeChecked();
  });

  test('13.6 ✍️ selectOption by label', async ({ page }) => {
    await page.getByLabel('Country').selectOption({ label: 'Japan' });
    await expect(page.getByLabel('Country')).toHaveValue('jp'); // the VALUE of the option, not its label
  });

  test('13.7 🔮 option values vs labels', async ({ page }) => {
    const country = page.getByLabel('Country');
    const selected = await country.selectOption('pt');
    expect(selected).toEqual(['pt']); // an array of the selected VALUES (a <select> can allow many)

    await country.selectOption({ label: 'United States' });
    expect(await country.inputValue()).toBe('us');
  });

  test('13.8 🐛 fill takes a string', async ({ page }) => {
    await page.getByLabel('Age').fill('30'); // fill always takes a string, even for number inputs
    await expect(page.getByLabel('Age')).toHaveValue('30');
  });

  test('13.9 ✍️ submit the sign-up form', async ({ page }) => {
    await page.getByLabel('Full name').fill('Sam Standard');
    await page.getByLabel('Email').fill('sam@qa.shop');
    await page.getByLabel('Country').selectOption({ label: 'Brazil' });
    await page.getByRole('radio', { name: 'Pro' }).check();
    await page.getByRole('checkbox', { name: 'I agree to the terms' }).check();
    await page.getByRole('button', { name: 'Submit' }).click();
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
    const newTodo = page.getByLabel('New to-do');
    await newTodo.fill('Buy milk');
    await newTodo.press('Enter'); // press = one key, on THIS element
    await expect(page.getByTestId('todo-count')).toHaveText('1 item');
  });

  test('13.11 ✍️ focus and the keyboard', async ({ page }) => {
    const newTodo = page.getByLabel('New to-do');
    await newTodo.focus();
    await page.keyboard.type('Read the docs'); // page.keyboard types wherever the focus is
    await page.keyboard.press('Enter');
    await expect(page.getByRole('list', { name: 'To-do items' })).toContainText('Read the docs');
    await expect(newTodo).toBeEmpty();
  });

  test('13.12 🐛 the locked button', async ({ page }) => {
    await page.getByRole('checkbox', { name: 'Enable the button' }).check(); // the missing step
    await page.getByRole('button', { name: 'Locked button' }).click({ timeout: 2_000 });
    await expect(page.getByTestId('locked-result')).toHaveText('Unlocked!');
  });

  test('13.13 ✍️ hover', async ({ page }) => {
    await page.getByRole('button', { name: 'Hover me' }).hover();
    await expect(page.getByRole('tooltip')).toHaveText('You found the tooltip!');
  });

  test('13.14 ✍️ upload a file from memory', async ({ page }) => {
    await page.getByLabel('Upload file').setInputFiles({
      name: 'report.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('all tests passed'), // no real file needed on disk
    });
    await expect(page.getByTestId('upload-result')).toHaveText('Selected: report.txt');
  });
});

test.describe('dialogs and new tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('13.15 ✍️ accept a confirm dialog', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept()); // register BEFORE the click
    await page.getByRole('button', { name: 'Open confirm' }).click();
    await expect(page.getByTestId('dialog-result')).toHaveText('You clicked: OK');
  });

  test('13.16 🐛 the prompt never gets my name', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept('Bruno')); // moved ABOVE the click
    await page.getByRole('button', { name: 'Open prompt' }).click();
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
    expect(message).toBe('Hello from an alert!');
    expect(kind).toBe('alert'); // 'alert' | 'confirm' | 'prompt' | 'beforeunload'
  });

  test('13.18 ✍️ a link that opens a new tab', async ({ page }) => {
    const newTabPromise = page.waitForEvent('popup'); // start listening BEFORE the click
    await page.getByRole('link', { name: 'Open products in a new tab' }).click();
    const newTab = await newTabPromise;
    await expect(newTab).toHaveURL(/login/);
    await expect(newTab.getByRole('heading', { name: 'Login' })).toBeVisible();
  });
});

test.describe('full flows', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

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
    await cards.filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click();
    await expect(cartCount).toHaveText('1'); // wait for the shop to finish before the next click
    await cards.filter({ hasText: 'Bike Light' }).getByRole('button', { name: 'Add to cart' }).click();
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
    await expect(page.getByTestId('cart-row')).toHaveCount(1);
    await expect(page.getByTestId('cart-total')).toHaveText('Total: $9.99');
  });

  test('13.21 ✍️ combine: buy a backpack', async ({ page }) => {
    await logIn(page);
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click();
    await expect(page.getByTestId('cart-count')).toHaveText('1');
    await page.getByRole('link', { name: /^Cart/ }).click();
    await page.getByRole('link', { name: 'Checkout' }).click();
    await page.getByLabel('First name').fill('Sam');
    await page.getByLabel('Last name').fill('Standard');
    await page.getByLabel('Postal code').fill('12345');
    await page.getByRole('button', { name: 'Place order' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();
    await expect(page.getByTestId('order-number')).toHaveText(/ORD-\d+/);
    await expect(page.getByTestId('cart-count')).toHaveText('0');
  });
});
