// Module 14 · Assertions — reference solution
// Run:  npm run solution 14
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect, type Page } from '@playwright/test';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

test.describe('auto-waiting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('14.1 🔮 isVisible() checks once, right now', async ({ page }) => {
    const message = page.getByTestId('slow-message');
    await page.getByRole('button', { name: 'Show message' }).click();

    const visibleRightAway = await message.isVisible();
    expect(visibleRightAway).toBe(false); // checked immediately: the 2 seconds have not passed

    await expect(message).toBeVisible();
    const visibleNow = await message.isVisible();
    expect(visibleNow).toBe(true); // the web-first assertion above waited for it
  });

  test('14.2 🐛 the flaky check', async ({ page }) => {
    const status = page.getByTestId('progress-status');
    await page.getByRole('button', { name: 'Start download' }).click();
    await expect(status).toHaveText('Complete!'); // retries until the text matches (or 5 s)
  });

  test('14.3 ✍️ wait for the slow message', async ({ page }) => {
    await page.getByRole('button', { name: 'Show message' }).click();
    await expect(page.getByTestId('slow-message')).toBeVisible();
    await expect(page.getByTestId('slow-message')).toHaveText('Loaded after a delay!');
    expect(await page.getByTestId('slow-message').isVisible()).toBe(true);
  });

  test('14.4 🐛 the assertion nobody waited for', async ({ page }) => {
    const status = page.getByTestId('progress-status');
    await page.getByRole('button', { name: 'Start download' }).click();
    await expect(status).toHaveText('Complete!'); // without await, the test moved on immediately
    expect(await status.textContent()).toBe('Complete!');
  });
});

test.describe('text, values and counts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('14.5 🧪 toHaveText vs toContainText', async ({ page }) => {
    await page.getByLabel('New to-do').fill('Buy milk');
    await page.getByLabel('New to-do').press('Enter');
    const item = page.getByRole('listitem').filter({ hasText: 'Buy milk' });
    await expect(item).toContainText('Buy milk'); // a part of the text is enough
    await expect(item).toHaveText(/^Buy milk/); // a string here would need the WHOLE text: 'Buy milk Delete'
  });

  test('14.6 ✍️ toBeEmpty and toHaveValue', async ({ page }) => {
    const age = page.getByLabel('Age');
    await expect(age).toBeEmpty();
    await age.fill('42');
    await expect(age).toHaveValue('42'); // input values are always strings
  });

  test('14.7 🧪 toHaveCount', async ({ page }) => {
    const newTodo = page.getByLabel('New to-do');
    const items = page.getByRole('list', { name: 'To-do items' }).getByRole('listitem');
    await newTodo.fill('Write tests');
    await newTodo.press('Enter');
    await newTodo.fill('Fix the flaky test');
    await newTodo.press('Enter');
    await expect(items).toHaveCount(2);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items');
  });
});

test.describe('states and attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('14.8 ✍️ toBeDisabled and toBeEnabled', async ({ page }) => {
    const lockedButton = page.getByRole('button', { name: 'Locked button' });
    await expect(lockedButton).toBeDisabled();
    await page.getByRole('checkbox', { name: 'Enable the button' }).check();
    await expect(lockedButton).toBeEnabled();
  });

  test('14.9 ✍️ toHaveAttribute and toBeHidden', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle details' });
    const details = page.getByText('These are the secret details.');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(details).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('14.10 ✍️ an error message and its class', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click();
    const error = page.getByRole('alert');
    await expect(error).toHaveText('Full name is required');
    await expect(error).toHaveClass(/error/); // the class attribute is "error": a regex matches part of it
    await expect(error).toContainClass('error'); // the same check, written as "one of the classes is..."
  });

  test('14.11 ✍️ toBeFocused', async ({ page }) => {
    await page.getByLabel('Full name').click();
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
  });
});

test.describe('messages, timeouts and soft assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('14.12 ✍️ a custom message', async ({ page }) => {
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.getByTestId('counter'), 'counter after one click').toHaveText('1');
  });

  test('14.13 🐛 the timeout is too short', async ({ page }) => {
    await page.getByRole('button', { name: 'Show message' }).click();
    // The default (5 s) is enough. If you need more for ONE slow thing, raise it here only.
    await expect(page.getByTestId('slow-message')).toBeVisible({ timeout: 3_000 });
  });

  test('14.14 ✍️ soft assertions', async ({ page }) => {
    await expect.soft(page.getByRole('radio', { name: 'Free' })).toBeChecked();
    await expect.soft(page.getByRole('checkbox', { name: 'I agree to the terms' })).not.toBeChecked();
    await expect.soft(page.getByLabel('Country')).toHaveValue('');
    expect(test.info().errors).toHaveLength(0);
  });

  test('14.15 ✍️ toPass: retry a whole block', async ({ page }) => {
    const status = page.getByTestId('progress-status');
    await page.getByRole('button', { name: 'Start download' }).click();
    await expect(async () => {
      const text = await status.textContent();
      expect(text).toBe('Complete!');
    }).toPass({ timeout: 5_000 });
    // (For a single locator, `await expect(status).toHaveText('Complete!')` is simpler. toPass is for blocks.)
  });
});

test.describe('products: arrays and polling', () => {
  test.beforeEach(async ({ request, page }) => {
    await request.post('/api/reset');
    await logIn(page);
  });

  test('14.16 ✍️ toHaveText with an array', async ({ page }) => {
    await page.getByLabel('Sort by').selectOption({ label: 'Name (Z to A)' });
    const names = page.getByTestId('product-card').getByRole('heading');
    await expect(names).toHaveText(['Red T-Shirt', 'Onesie', 'Fleece Jacket', 'Bolt T-Shirt', 'Bike Light', 'Backpack']);
  });

  test('14.17 ✍️ expect.poll: ask the API until it agrees', async ({ page }) => {
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click();
    await expect
      .poll(async () => {
        const response = await page.request.get('/api/cart');
        const cart = await response.json();
        return cart.count;
      })
      .toBe(1);
  });
});

test.describe('generic matchers on data', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

  test('14.18 🔮 decimals', () => {
    const total = 0.1 + 0.2;
    expect(total === 0.3).toBe(false); // total is 0.30000000000000004
    expect(total).toBeCloseTo(0.3); // so for prices and other decimals, use toBeCloseTo
  });

  test('14.19 🧪 the shape of the API data', async ({ request }) => {
    const response = await request.get('/api/products');
    const products: Product[] = await response.json();
    const backpack = products[0];
    expect(products).toHaveLength(6);
    expect(backpack).toHaveProperty('price', 29.99);
    expect(backpack).toMatchObject({ name: 'Backpack', category: 'bags' });
  });

  test('14.20 🧪 any, containing and close to', async ({ request }) => {
    const response = await request.get('/api/products?category=clothes');
    const clothes: Product[] = await response.json();
    const names = clothes.map((p) => p.name);
    const total = clothes.reduce((sum, p) => sum + p.price, 0);
    expect(clothes[0]).toEqual(expect.objectContaining({ id: expect.any(Number), category: 'clothes' }));
    expect(names).toEqual(expect.arrayContaining(['Onesie', 'Red T-Shirt']));
    expect(total).toBeCloseTo(89.96);
    expect(clothes.length).toBeGreaterThan(3);
  });
});

async function logIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/products/);
}
