// Module 18 · API Testing
// Run:  npm run check 18
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line
//
// The QA Shop API is described in practice-app/README.md (section "REST API"). Keep it open.

import { test, expect, request as playwrightRequest, type APIRequestContext, type Page } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

// The shapes of the JSON the API sends back (copied from the README).
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  total: number;
  count: number;
}

// PROVIDED helper: logs in with the API and returns the token.
async function loginAs(request: APIRequestContext, username: string, password: string): Promise<string> {
  const response = await request.post('/api/login', { data: { username, password } });
  await expect(response).toBeOK();
  const body = await response.json();
  return body.token;
}

// Every test starts with the default products, users and empty carts.
test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
});

test.describe('GET and the response object', () => {
  test('18.1 🔮 status() and ok()', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(___);
    expect(response.ok()).toBe(___);
  });

  test('18.2 🧪 one product', async ({ request }) => {
    const response = await request.get('/api/products/1');
    const product: Product = await response.json();
    // Write TWO assertions:
    //  - the response is OK (2xx), with the web-first matcher for responses (don't forget await)
    //  - product.name is 'Backpack'
    // ✍️ your code here

    todo();
  });

  test('18.3 🔮 typed JSON', async ({ request }) => {
    const response = await request.get('/api/products');
    const products: Product[] = await response.json();
    expect(products.length).toBe(___);
    expect(products[3].name).toBe(___);
    expect(typeof products[0].price).toBe(___);
  });

  test('18.4 ✍️ query parameters', async ({ request }) => {
    // GET /api/products, but only the category 'clothes'. Use the `params` option (not a hand-made ?...).
    // Name the result `response`.
    // ✍️ your code here

    todo();
    const products: Product[] = await response.json();
    expect(products).toHaveLength(4);
    expect(products.every((product) => product.category === 'clothes')).toBe(true);
  });

  test('18.5 🔮 statusText(), headers() and text()', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.statusText()).toBe(___);
    expect(response.headers()['content-type']).toBe(___);
    expect(await response.text()).toBe(___);
  });

  test('18.6 🔮 a product that does not exist', async ({ request }) => {
    const response = await request.get('/api/products/999');
    expect(response.status()).toBe(___);
    expect(response.ok()).toBe(___);
    const body = await response.json();
    expect(body.error).toBe(___);
  });
});

test.describe('login and tokens', () => {
  test('18.7 ✍️ POST with a JSON body', async ({ request }) => {
    // POST /api/login with the JSON body { username: 'standard_user', password: 'secret123' }.
    // Name the result `response`. (The `data` option sends JSON.)
    // ✍️ your code here

    todo();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({ username: 'standard_user', name: 'Sam Standard', role: 'user' });
  });

  test('18.8 🔮 logins that fail', async ({ request }) => {
    const wrongPassword = await request.post('/api/login', { data: { username: 'standard_user', password: 'nope' } });
    const locked = await request.post('/api/login', { data: { username: 'locked_user', password: 'secret123' } });
    const noPassword = await request.post('/api/login', { data: { username: 'standard_user' } });
    expect(wrongPassword.status()).toBe(___);
    expect(locked.status()).toBe(___);
    expect(noPassword.status()).toBe(___);
  });

  test('18.9 ✍️ send the token in a header', async ({ request }) => {
    const token = await loginAs(request, 'admin', 'admin123');
    // GET /api/me with the header  Authorization: Bearer <token>   (a template string!)
    // Name the result `response`.
    // ✍️ your code here

    todo();
    const me = await response.json();
    expect(me.role).toBe('admin');
  });

  test('18.10 🔮 401 or 403?', async ({ request }) => {
    const userToken = await loginAs(request, 'standard_user', 'secret123');
    const noToken = await request.post('/api/products', { data: { name: 'Hack', price: 1 } });
    const notAdmin = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${userToken}` },
      data: { name: 'Hack', price: 1 },
    });
    expect(noToken.status()).toBe(___);
    expect(notAdmin.status()).toBe(___);
  });
});

test.describe('CRUD as admin', () => {
  test('18.11 ✍️ create a product', async ({ request }) => {
    const token = await loginAs(request, 'admin', 'admin123');
    // POST /api/products as admin (Bearer header) with the data { name: 'Desk Lamp', price: 24.5 }.
    // Name the result `response`.
    // ✍️ your code here

    todo();
    expect(response.status()).toBe(201);
    const created: Product = await response.json();
    expect(created).toEqual(expect.objectContaining({ name: 'Desk Lamp', price: 24.5, category: 'other', stock: 10 }));
  });

  test('18.12 🧪 check the shape of a list', async ({ request }) => {
    const response = await request.get('/api/products');
    const products: Product[] = await response.json();
    // Write ONE assertion: the list contains a product with name 'Backpack' and price 29.99
    // (we don't care about its other fields, or about the other products).
    // Shape: expect(list).toEqual(expect.arrayContaining([expect.objectContaining({ ... })]));
    // ✍️ your code here

    todo();
  });

  test('18.13 ✍️ update a product', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'admin', 'admin123')}` };
    // PATCH /api/products/2 with the data { price: 12.99 } and the headers above. Name the result `response`.
    // ✍️ your code here

    todo();
    expect(response.status()).toBe(200);
    const check = await request.get('/api/products/2');
    expect((await check.json()).price).toBe(12.99);
  });

  test('18.14 ✍️ delete a product', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'admin', 'admin123')}` };
    // DELETE /api/products/6 with the headers above. Name the result `response`.
    // ✍️ your code here

    todo();
    expect(response.status()).toBe(204);
    const check = await request.get('/api/products/6');
    expect(check.status()).toBe(404);
  });

  test('18.15 🐛 the API says 400', async ({ request }) => {
    // Run it and read the response body in the error. Then fix the DATA (not the expected status).
    const headers = { Authorization: `Bearer ${await loginAs(request, 'admin', 'admin123')}` };
    const response = await request.post('/api/products', { headers, data: { name: 'Sticker', price: '1.50' } });
    expect(response.status(), await response.text()).toBe(201);
  });

  test('18.16 🔮 cart errors', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'standard_user', 'secret123')}` };
    const soldOut = await request.post('/api/cart', { headers, data: { productId: 5 } }); // Onesie, stock 0
    const unknown = await request.post('/api/cart', { headers, data: { productId: 999 } });
    const zero = await request.post('/api/cart', { headers, data: { productId: 1, quantity: 0 } });
    expect(soldOut.status()).toBe(___);
    expect(unknown.status()).toBe(___);
    expect(zero.status()).toBe(___);
  });
});

// ---------------------------------------------------------------------------
// Your own API client
// ---------------------------------------------------------------------------
class ShopApi {
  private readonly headers: Record<string, string>;

  constructor(private readonly request: APIRequestContext, token: string) {
    this.headers = { Authorization: `Bearer ${token}` };
  }

  // ✅ Example (complete)
  async getCart(): Promise<Cart> {
    const response = await this.request.get('/api/cart', { headers: this.headers });
    await expect(response).toBeOK();
    return response.json();
  }

  // 18.18 ✍️ POST /api/cart with the data { productId, quantity } and this.headers.
  // Check the response is OK, and return the JSON (the cart). Same shape as getCart().
  async addToCart(productId: number, quantity: number): Promise<Cart> {
    // ✍️ your code here (then delete BOTH lines below)

    todo('18.18: write ShopApi.addToCart (above the tests)');
    return ___;
  }
}

test.describe('your own API client', () => {
  test('18.17 ✍️ an API context with default headers', async ({ request, baseURL }) => {
    const token = await loginAs(request, 'admin', 'admin123');
    // Create `adminApi` with playwrightRequest.newContext(...). Give it:
    //   baseURL (the fixture)  and  extraHTTPHeaders: { Authorization: `Bearer ${token}` }
    // Now EVERY request of adminApi sends the token, without writing headers again.
    // ✍️ your code here

    todo();
    const response = await adminApi.post('/api/products', { data: { name: 'Admin Mug', price: 8 } });
    expect(response.status()).toBe(201);
    await adminApi.dispose(); // contexts you create, you dispose
  });

  test('18.18 ✍️ a method for the API client', async ({ request }) => {
    const api = new ShopApi(request, await loginAs(request, 'standard_user', 'secret123'));
    await api.addToCart(1, 2);
    const cart = await api.getCart();
    expect(cart.count).toBe(2);
    expect(cart.total).toBe(59.98);
  });
});

// ---------------------------------------------------------------------------
// Hybrid tests: API + UI together
// ---------------------------------------------------------------------------
async function loginInUi(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret123');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByTestId('user-name')).toHaveText('Sam Standard');
}

test.describe('hybrid: API and UI together', () => {
  test('18.19 ✍️ seed with the API, check in the UI', async ({ page }) => {
    await loginInUi(page);
    // page.request shares the page's cookies, so it is logged in as standard_user too.
    // Add 2 Fleece Jackets (productId 4, quantity 2) to the cart with page.request (POST /api/cart).
    // ✍️ your code here

    todo();
    await page.goto('/cart');
    await expect(page.getByTestId('cart-row')).toHaveCount(1);
    await expect(page.getByTestId('cart-total')).toHaveText('Total: $99.98');
  });

  test('18.20 🧪 act in the UI, check with the API', async ({ page }) => {
    await loginInUi(page);
    await page.goto('/products');
    const backpack = page.getByTestId('product-card').filter({ hasText: 'Backpack' });
    await backpack.getByRole('button', { name: 'Add to cart' }).click();
    await expect(backpack.getByRole('button', { name: 'Remove' })).toBeVisible();

    const response = await page.request.get('/api/cart');
    const cart: Cart = await response.json();
    // Write TWO assertions:
    //  - cart.count is 1
    //  - the first item's name is 'Backpack'
    // ✍️ your code here

    todo();
  });
});
