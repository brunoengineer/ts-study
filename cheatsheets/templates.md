# Templates

Skeletons for every kind of file you'll write. **While you're learning:** don't paste them, type them
(it's practice). **At work:** paste freely. They all target QA Shop, so you can try them in `my-katas/`.

---

## 1. A UI test file

```ts
import { test, expect } from '@playwright/test';

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill('standard_user');
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('shows 6 products', async ({ page }) => {
    await expect(page.getByTestId('product-card')).toHaveCount(6);
  });

  test('search filters the list', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search products' }).fill('shirt');
    await expect(page.getByTestId('product-card').filter({ visible: true })).toHaveCount(2);
  });
});
```

## 2. A page object

```ts
// pages/LoginPage.ts
import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly submitButton: Locator;
  readonly error: Locator;

  constructor(readonly page: Page) {
    this.username = page.getByLabel('Username');
    this.password = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Log in' });
    this.error = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(username: string, password: string) {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.error).toHaveText(message);
  }
}
```

## 3. A component object (a piece of a page)

```ts
// pages/components/ProductCard.ts
import { type Locator } from '@playwright/test';

export class ProductCard {
  readonly name: Locator;
  readonly price: Locator;
  readonly cartButton: Locator;

  constructor(readonly root: Locator) {
    this.name = root.getByRole('heading');
    this.price = root.locator('.price');
    this.cartButton = root.getByRole('button');
  }

  async addToCart() {
    await this.root.getByRole('button', { name: 'Add to cart' }).click();
  }
}

// usage inside ProductsPage:
// card(name: string) { return new ProductCard(this.page.getByTestId('product-card').filter({ hasText: name })); }
```

## 4. Fixtures file (your own `test` and `expect`)

```ts
// fixtures/index.ts
import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

type Pages = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
});

export { expect };

// in a test file:
// import { test, expect } from '../fixtures';
// test('...', async ({ loginPage }) => { await loginPage.goto(); });
```

## 5. A fixture with setup and teardown

```ts
type DataFixtures = { tempProduct: Product };

export const test = base.extend<DataFixtures>({
  tempProduct: async ({ request }, use) => {
    // setup: create via API
    const login = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
    const { token } = await login.json();
    const headers = { Authorization: `Bearer ${token}` };
    const created = await request.post('/api/products', { headers, data: { name: `Temp ${Date.now()}`, price: 5 } });
    const product: Product = await created.json();

    await use(product); // ← the test runs here

    // teardown: clean up
    await request.delete(`/api/products/${product.id}`, { headers });
  },
});
```

## 6. Auth setup + config

```ts
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const users = [
  { name: 'user', username: 'standard_user', password: 'secret123' },
  { name: 'admin', username: 'admin', password: 'admin123' },
];

for (const user of users) {
  setup(`authenticate as ${user.name}`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill(user.username);
    await page.getByLabel('Password').fill(user.password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page).toHaveURL(/\/products/);
    await page.context().storageState({ path: `.auth/${user.name}.json` });
  });
}
```

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'node ../practice-app/server.mjs',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: true,
  },
});
```

```ts
// a test that needs admin
test.use({ storageState: '.auth/admin.json' });

// a test that needs to be logged out
test.use({ storageState: { cookies: [], origins: [] } });
```

## 7. An API test file

```ts
import { test, expect } from '@playwright/test';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

test.describe('Products API', () => {
  let token: string;

  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
    const response = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
    token = (await response.json()).token;
  });

  test('lists products', async ({ request }) => {
    const response = await request.get('/api/products');
    await expect(response).toBeOK();
    const products: Product[] = await response.json();
    expect(products).toHaveLength(6);
    expect(products[0]).toEqual(expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }));
  });

  test('creates a product', async ({ request }) => {
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Mug', price: 12.5 },
    });
    expect(response.status()).toBe(201);
    const product: Product = await response.json();
    expect(product).toMatchObject({ name: 'Mug', price: 12.5 });
  });

  test('rejects a request without a token', async ({ request }) => {
    const response = await request.post('/api/products', { data: { name: 'Mug', price: 12.5 } });
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });
});
```

## 8. An API client class

```ts
// api/ApiClient.ts
import { type APIRequestContext, expect } from '@playwright/test';

export class ApiClient {
  private token = '';

  constructor(private readonly request: APIRequestContext) {}

  async login(username: string, password: string) {
    const response = await this.request.post('/api/login', { data: { username, password } });
    await expect(response).toBeOK();
    this.token = (await response.json()).token;
  }

  private get headers() {
    return { Authorization: `Bearer ${this.token}` };
  }

  async addToCart(productId: number, quantity = 1) {
    const response = await this.request.post('/api/cart', { headers: this.headers, data: { productId, quantity } });
    await expect(response).toBeOK();
    return response.json();
  }
}
```

## 9. A test data builder

```ts
// utils/data.ts
export interface NewUser {
  username: string;
  password: string;
  name: string;
}

export function buildUser(overrides: Partial<NewUser> = {}): NewUser {
  const id = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    username: `user_${id}`,
    password: 'secret123',
    name: 'Test User',
    ...overrides,
  };
}

// buildUser()                          → a unique valid user
// buildUser({ password: '123' })       → same, but with an invalid password
```

## 10. Data-driven tests

```ts
const invalidLogins = [
  { username: '', password: 'secret123', error: 'Username is required' },
  { username: 'standard_user', password: '', error: 'Password is required' },
  { username: 'nobody', password: 'wrong', error: 'Invalid username or password' },
  { username: 'locked_user', password: 'secret123', error: 'Sorry, this user has been locked out.' },
];

for (const { username, password, error } of invalidLogins) {
  test(`login fails: ${error}`, async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.getByRole('alert')).toHaveText(error);
  });
}
```

## 11. Mocking a response

```ts
test('shows an error when the API fails', async ({ page }) => {
  await page.route('**/api/products', (route) => route.fulfill({ status: 500 }));
  await page.goto('/playground');
  await page.getByRole('button', { name: 'Load products' }).click();
  await expect(page.getByTestId('load-status')).toHaveText('Failed to load products');
});
```

## 12. GitHub Actions CI

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```
