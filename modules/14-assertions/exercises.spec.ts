// Module 14 · Assertions
// Run:  npm run check 14          (watch the browser: npm run check 14 headed)
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect, type Page } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

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
    const message = page.getByTestId('slow-message'); // appears 2 seconds after the click
    await page.getByRole('button', { name: 'Show message' }).click();

    const visibleRightAway = await message.isVisible(); // no waiting, no retrying
    expect(visibleRightAway).toBe(___);

    await expect(message).toBeVisible(); // waits and retries up to 5 s
    const visibleNow = await message.isVisible();
    expect(visibleNow).toBe(___);
  });

  test('14.2 🐛 the flaky check', async ({ page }) => {
    // 'Start download' changes the status: Idle -> Downloading... -> 50% -> Complete! (~1.5 s)
    // Run it: "Received: Downloading...". The value was read ONCE, too early.
    // Rewrite the last line as a web-first assertion that waits.
    const status = page.getByTestId('progress-status');
    await page.getByRole('button', { name: 'Start download' }).click();
    expect(await status.textContent()).toBe('Complete!');
  });

  test('14.3 ✍️ wait for the slow message', async ({ page }) => {
    await page.getByRole('button', { name: 'Show message' }).click();
    // Write TWO web-first assertions on getByTestId('slow-message'):
    //  - it is visible
    //  - it has the text 'Loaded after a delay!'
    // ✍️ your code here

    todo();
    // This line does NOT wait. It only passes if your assertions above waited for the message.
    expect(await page.getByTestId('slow-message').isVisible()).toBe(true);
  });

  test('14.4 🐛 the assertion nobody waited for', async ({ page }) => {
    // The first expect below looks right, but something is missing in front of it...
    const status = page.getByTestId('progress-status');
    await page.getByRole('button', { name: 'Start download' }).click();
    expect(status).toHaveText('Complete!');
    // This line reads the text once. It passes only if the line above really waited.
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
    // The FULL text of the item is 'Buy milk Delete' (the Delete button's text is inside the item).
    // Write TWO assertions on `item`:
    //  - it CONTAINS the text 'Buy milk'                    (toContainText)
    //  - its whole text STARTS with 'Buy milk' (a regex)     (toHaveText with /^.../)
    // ✍️ your code here

    todo();
  });

  test('14.6 ✍️ toBeEmpty and toHaveValue', async ({ page }) => {
    const age = page.getByLabel('Age');
    // 1. assert that `age` is empty
    // 2. fill it with '42'
    // 3. assert that `age` has the value '42'
    // ✍️ your code here

    todo();
  });

  test('14.7 🧪 toHaveCount', async ({ page }) => {
    const newTodo = page.getByLabel('New to-do');
    const items = page.getByRole('list', { name: 'To-do items' }).getByRole('listitem');
    await newTodo.fill('Write tests');
    await newTodo.press('Enter');
    await newTodo.fill('Fix the flaky test');
    await newTodo.press('Enter');
    // Write TWO assertions:
    //  - `items` has a count of 2
    //  - the element with test id 'todo-count' has the text '2 items'
    // ✍️ your code here

    todo();
  });
});

test.describe('states and attributes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('14.8 ✍️ toBeDisabled and toBeEnabled', async ({ page }) => {
    const lockedButton = page.getByRole('button', { name: 'Locked button' });
    // 1. assert lockedButton is disabled
    // 2. check the checkbox 'Enable the button'
    // 3. assert lockedButton is enabled
    // ✍️ your code here

    todo();
  });

  test('14.9 ✍️ toHaveAttribute and toBeHidden', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle details' });
    const details = page.getByText('These are the secret details.');
    await toggle.click();
    // 1. assert toggle has the attribute 'aria-expanded' with the value 'true'
    // 2. click toggle again
    // 3. assert details is hidden
    // ✍️ your code here

    todo();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('14.10 ✍️ an error message and its class', async ({ page }) => {
    await page.getByRole('button', { name: 'Submit' }).click(); // empty form -> error
    const error = page.getByRole('alert');
    // Write TWO assertions on `error`:
    //  - it has the text 'Full name is required'
    //  - it has the CSS class 'error'    (toHaveClass with a regex, or toContainClass)
    // ✍️ your code here

    todo();
  });

  test('14.11 ✍️ toBeFocused', async ({ page }) => {
    await page.getByLabel('Full name').click();
    await page.keyboard.press('Tab');
    // Tab moves the focus to the next field. Assert that the field labelled 'Email' is focused.
    // ✍️ your code here

    todo();
  });
});

test.describe('messages, timeouts and soft assertions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('14.12 ✍️ a custom message', async ({ page }) => {
    await page.getByRole('button', { name: 'Increment' }).click();
    // Assert the counter (test id 'counter') has the text '1', with the custom message
    // 'counter after one click'. If it ever fails, the report shows YOUR message first.
    // Shape: await expect(locator, 'message').toHaveText('...');
    // ✍️ your code here

    todo();
  });

  test('14.13 🐛 the timeout is too short', async ({ page }) => {
    // The message needs 2 seconds. This assertion gives up after 1 second.
    await page.getByRole('button', { name: 'Show message' }).click();
    await expect(page.getByTestId('slow-message')).toBeVisible({ timeout: 1_000 });
  });

  test('14.14 ✍️ soft assertions', async ({ page }) => {
    // Check the DEFAULT state of the sign-up form with THREE soft assertions (expect.soft):
    //  - the radio 'Free' is checked
    //  - the checkbox 'I agree to the terms' is NOT checked
    //  - the field 'Country' has the value ''
    // ✍️ your code here

    todo();
    expect(test.info().errors).toHaveLength(0); // no soft assertion failed
  });

  test('14.15 ✍️ toPass: retry a whole block', async ({ page }) => {
    const status = page.getByTestId('progress-status');
    await page.getByRole('button', { name: 'Start download' }).click();
    // Wrap these two lines in `await expect(async () => { ... }).toPass({ timeout: 5_000 });`
    // so the block is retried until it passes:
    //    const text = await status.textContent();
    //    expect(text).toBe('Complete!');
    // ✍️ your code here

    todo();
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
    // Assert, in ONE assertion, the 6 names in Z-to-A order.
    // Shape: await expect(names).toHaveText(['...', '...', ...]);
    // ✍️ your code here

    todo();
  });

  test('14.17 ✍️ expect.poll: ask the API until it agrees', async ({ page }) => {
    await page.getByTestId('product-card').filter({ hasText: 'Backpack' }).getByRole('button', { name: 'Add to cart' }).click();
    // The UI sends the request in the background. Poll the API until the cart count is 1:
    // Shape:
    //   await expect.poll(async () => {
    //     const response = await page.request.get('/api/cart');   // page.request uses the page's login cookie
    //     const cart = await response.json();
    //     return cart.count;
    //   }).toBe(1);
    // ✍️ your code here

    todo();
  });
});

test.describe('generic matchers on data', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

  test('14.18 🔮 decimals', () => {
    const total = 0.1 + 0.2;
    expect(total === 0.3).toBe(___);
    expect(total).toBeCloseTo(0.3); // this one passes. Why do we need it?
  });

  test('14.19 🧪 the shape of the API data', async ({ request }) => {
    const response = await request.get('/api/products');
    const products: Product[] = await response.json();
    const backpack = products[0];
    // Write THREE generic assertions (no await, these are plain values):
    //  - products has a length of 6
    //  - backpack has the property 'price' with the value 29.99         (toHaveProperty)
    //  - backpack matches the object { name: 'Backpack', category: 'bags' }  (toMatchObject: extra fields are OK)
    // ✍️ your code here

    todo();
  });

  test('14.20 🧪 any, containing and close to', async ({ request }) => {
    const response = await request.get('/api/products?category=clothes');
    const clothes: Product[] = await response.json();
    const names = clothes.map((p) => p.name);
    const total = clothes.reduce((sum, p) => sum + p.price, 0);
    // Write FOUR assertions:
    //  - clothes[0] equals expect.objectContaining({ id: expect.any(Number), category: 'clothes' })
    //  - names equals expect.arrayContaining(['Onesie', 'Red T-Shirt'])
    //  - total is close to 89.96                    (toBeCloseTo: prices are decimals!)
    //  - clothes.length is greater than 3
    // ✍️ your code here

    todo();
  });
});

async function logIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/products/);
}
