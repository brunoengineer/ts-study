// Module 18 · API Testing — reference solution
// Run:  npm run solution 18
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect, request as playwrightRequest, type APIRequestContext, type Page } from '@playwright/test';

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

async function loginAs(request: APIRequestContext, username: string, password: string): Promise<string> {
  const response = await request.post('/api/login', { data: { username, password } });
  await expect(response).toBeOK();
  const body = await response.json();
  return body.token;
}

test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
});

test.describe('GET and the response object', () => {
  test('18.1 🔮 status() and ok()', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);
    expect(response.ok()).toBe(true); // ok() is true for every status from 200 to 299
  });

  test('18.2 🧪 one product', async ({ request }) => {
    const response = await request.get('/api/products/1');
    const product: Product = await response.json();
    await expect(response).toBeOK(); // on failure it prints the response: much better than toBe(true)
    expect(product.name).toBe('Backpack');
  });

  test('18.3 🔮 typed JSON', async ({ request }) => {
    const response = await request.get('/api/products');
    const products: Product[] = await response.json();
    expect(products.length).toBe(6);
    expect(products[3].name).toBe('Fleece Jacket'); // index 3 = the 4th product (id 4)
    expect(typeof products[0].price).toBe('number'); // JSON keeps numbers as numbers
  });

  test('18.4 ✍️ query parameters', async ({ request }) => {
    const response = await request.get('/api/products', { params: { category: 'clothes' } });
    const products: Product[] = await response.json();
    expect(products).toHaveLength(4);
    expect(products.every((product) => product.category === 'clothes')).toBe(true);
  });

  test('18.5 🔮 statusText(), headers() and text()', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.statusText()).toBe('OK');
    expect(response.headers()['content-type']).toBe('application/json'); // header names are lowercase
    expect(await response.text()).toBe('{"status":"ok"}'); // the raw body, as a string
  });

  test('18.6 🔮 a product that does not exist', async ({ request }) => {
    const response = await request.get('/api/products/999');
    expect(response.status()).toBe(404);
    expect(response.ok()).toBe(false);
    const body = await response.json();
    expect(body.error).toBe('Product not found');
  });
});

test.describe('login and tokens', () => {
  test('18.7 ✍️ POST with a JSON body', async ({ request }) => {
    const response = await request.post('/api/login', { data: { username: 'standard_user', password: 'secret123' } });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.user).toEqual({ username: 'standard_user', name: 'Sam Standard', role: 'user' });
  });

  test('18.8 🔮 logins that fail', async ({ request }) => {
    const wrongPassword = await request.post('/api/login', { data: { username: 'standard_user', password: 'nope' } });
    const locked = await request.post('/api/login', { data: { username: 'locked_user', password: 'secret123' } });
    const noPassword = await request.post('/api/login', { data: { username: 'standard_user' } });
    expect(wrongPassword.status()).toBe(401); // who are you? (wrong credentials)
    expect(locked.status()).toBe(403); // I know you, but you may not
    expect(noPassword.status()).toBe(400); // the request itself is wrong
  });

  test('18.9 ✍️ send the token in a header', async ({ request }) => {
    const token = await loginAs(request, 'admin', 'admin123');
    const response = await request.get('/api/me', { headers: { Authorization: `Bearer ${token}` } });
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
    expect(noToken.status()).toBe(401); // not logged in
    expect(notAdmin.status()).toBe(403); // logged in, but not allowed
  });
});

test.describe('CRUD as admin', () => {
  test('18.11 ✍️ create a product', async ({ request }) => {
    const token = await loginAs(request, 'admin', 'admin123');
    const response = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: 'Desk Lamp', price: 24.5 },
    });
    expect(response.status()).toBe(201);
    const created: Product = await response.json();
    expect(created).toEqual(expect.objectContaining({ name: 'Desk Lamp', price: 24.5, category: 'other', stock: 10 }));
  });

  test('18.12 🧪 check the shape of a list', async ({ request }) => {
    const response = await request.get('/api/products');
    const products: Product[] = await response.json();
    expect(products).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Backpack', price: 29.99 })]));
  });

  test('18.13 ✍️ update a product', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'admin', 'admin123')}` };
    const response = await request.patch('/api/products/2', { headers, data: { price: 12.99 } });
    expect(response.status()).toBe(200);
    const check = await request.get('/api/products/2');
    expect((await check.json()).price).toBe(12.99);
  });

  test('18.14 ✍️ delete a product', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'admin', 'admin123')}` };
    const response = await request.delete('/api/products/6', { headers });
    expect(response.status()).toBe(204); // 204 No Content: success, and no body
    const check = await request.get('/api/products/6');
    expect(check.status()).toBe(404);
  });

  test('18.15 🐛 the API says 400', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'admin', 'admin123')}` };
    // price must be a NUMBER: '1.50' (a string) -> 400 "price must be a positive number"
    const response = await request.post('/api/products', { headers, data: { name: 'Sticker', price: 1.5 } });
    expect(response.status(), await response.text()).toBe(201);
  });

  test('18.16 🔮 cart errors', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await loginAs(request, 'standard_user', 'secret123')}` };
    const soldOut = await request.post('/api/cart', { headers, data: { productId: 5 } });
    const unknown = await request.post('/api/cart', { headers, data: { productId: 999 } });
    const zero = await request.post('/api/cart', { headers, data: { productId: 1, quantity: 0 } });
    expect(soldOut.status()).toBe(409); // conflict with the current state (no stock)
    expect(unknown.status()).toBe(404);
    expect(zero.status()).toBe(400);
  });
});

class ShopApi {
  private readonly headers: Record<string, string>;

  constructor(private readonly request: APIRequestContext, token: string) {
    this.headers = { Authorization: `Bearer ${token}` };
  }

  async getCart(): Promise<Cart> {
    const response = await this.request.get('/api/cart', { headers: this.headers });
    await expect(response).toBeOK();
    return response.json();
  }

  async addToCart(productId: number, quantity: number): Promise<Cart> {
    const response = await this.request.post('/api/cart', { headers: this.headers, data: { productId, quantity } });
    await expect(response).toBeOK();
    return response.json();
  }
}

test.describe('your own API client', () => {
  test('18.17 ✍️ an API context with default headers', async ({ request, baseURL }) => {
    const token = await loginAs(request, 'admin', 'admin123');
    const adminApi = await playwrightRequest.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    const response = await adminApi.post('/api/products', { data: { name: 'Admin Mug', price: 8 } });
    expect(response.status()).toBe(201);
    await adminApi.dispose();
  });

  test('18.18 ✍️ a method for the API client', async ({ request }) => {
    const api = new ShopApi(request, await loginAs(request, 'standard_user', 'secret123'));
    await api.addToCart(1, 2);
    const cart = await api.getCart();
    expect(cart.count).toBe(2);
    expect(cart.total).toBe(59.98);
  });
});

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
    // Seeding with the API is fast and reliable; the UI part checks what users really see.
    await page.request.post('/api/cart', { data: { productId: 4, quantity: 2 } });
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
    expect(cart.count).toBe(1);
    expect(cart.items[0].name).toBe('Backpack');
  });
});
