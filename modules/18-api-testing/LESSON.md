# Module 18 · API Testing

> **Why this matters for Playwright:** Playwright is not only a browser tool. With the `request` fixture you can test
> a REST API directly, and you can use the API inside UI tests to create data fast and to check results.
> API tests are 10-100x faster than UI tests and break less often.

## 🎯 After this module you can

- Send `get`, `post`, `put`, `patch` and `delete` requests with `data`, `headers` and `params`
- Read a response: `status()`, `ok()`, `statusText()`, `headers()`, `json()`, `text()`
- Type JSON with interfaces (`Product`, `Cart`)
- Assert with `await expect(response).toBeOK()` and check shapes with `expect.objectContaining`, `expect.any`, `expect.arrayContaining`
- Do full CRUD as admin with a Bearer token, and write negative tests (400, 401, 403, 404, 409)
- Build an API client class and an API context with `request.newContext({ baseURL, extraHTTPHeaders })`
- Write hybrid tests: seed with the API → check in the UI, act in the UI → check with the API

---

## 1. The `request` fixture

```ts
test('products API', async ({ request }) => {
  const response = await request.get('/api/products');
  expect(response.status()).toBe(200);
  const products = await response.json();
  expect(products).toHaveLength(6);
});
```

`request` is an **APIRequestContext**: an HTTP client that uses `baseURL` from the config, so you write `/api/products`.
No browser opens, so it is very fast.

### 🧩 Anatomy

```
const response = await request.get( '/api/products' , { params: { category: 'clothes' } } );
                         │      │          │             └──────────────┬───────────────┘
                         │      │      the URL path         options (all optional)
                         │      └ the HTTP method: get / post / put / patch / delete / fetch
                         └ the request fixture (or page.request, or your own context)
```

### 🗣️ Say it

> "constant **response** equals await request dot **get** slash api slash products"

---

## 2. The options: `data`, `headers`, `params`, `form`

| Option | What it does | Example |
|---|---|---|
| `data` | the body, sent as JSON (adds `Content-Type: application/json`) | `{ data: { username: 'admin', password: 'admin123' } }` |
| `headers` | extra headers for THIS request | `{ headers: { Authorization: `Bearer ${token}` } }` |
| `params` | query string, safely encoded | `{ params: { search: 'shirt' } }` → `?search=shirt` |
| `form` | an HTML form body (`application/x-www-form-urlencoded`) | `{ form: { username, password } }` |
| `failOnStatusCode` | throw if the status is not 2xx/3xx | `{ failOnStatusCode: true }` |
| `timeout` | ms for this request | `{ timeout: 10_000 }` |

You can combine them: `request.post('/api/cart', { headers, data: { productId: 1, quantity: 2 } })`.

```ts
await request.get('/api/products', { params: { category: 'clothes' } });
await request.post('/api/products', { headers, data: { name: 'Desk Lamp', price: 24.5 } });
await request.put('/api/products/2', { headers, data: { name: 'Bike Light', price: 11, stock: 3 } });
await request.patch('/api/products/2', { headers, data: { price: 12.99 } });
await request.delete('/api/products/6', { headers });
```

`PUT` usually means "replace the whole thing", `PATCH` "change some fields". (QA Shop accepts any fields with both.)

---

## 3. Reading the response

| Method | Returns | Example |
|---|---|---|
| `response.status()` | the status code (number) | `200`, `404` |
| `response.ok()` | `true` for 200-299 | `true` |
| `response.statusText()` | the text after the code | `'OK'`, `'Not Found'` |
| `response.headers()` | an object, names in **lowercase** | `response.headers()['content-type']` |
| `await response.json()` | the body, parsed | `{ token: '...' }` |
| `await response.text()` | the body as a string | `'{"status":"ok"}'` |
| `response.url()` | the final URL (after redirects) | `'http://localhost:3000/products'` |

`status()`, `ok()`, `headers()` are instant. `json()` and `text()` need `await`.

---

## 4. Typing the JSON

`response.json()` returns `any`: TypeScript knows nothing about it. Tell it what you expect, with an interface (module 05):

```ts
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
  description: string;
}

const products: Product[] = await response.json();
products[0].name;    // ✅ autocomplete works
products[0].nmae;    // ❌ Property 'nmae' does not exist on type 'Product'. Did you mean 'name'?
```

⚠️ The annotation is a **promise you make**, not a check. If the API sends something else, TypeScript won't notice.
That's why you ALSO assert the shape (section 6).

---

## 5. Asserting status codes

```ts
await expect(response).toBeOK();            // 2xx, and on failure it prints the request and response
expect(response.status()).toBe(201);        // an exact code
expect(response.ok()).toBe(false);          // anything not 2xx
```

`toBeOK()` is a web-first style matcher for responses: `await` it. When it fails you see the method, URL,
headers and body in the error, which is much more useful than `Expected: true, Received: false`.

### 🗣️ Say it

`await expect(response).toBeOK();`
> "Await, expect the response **to be OK**."

Status codes you will test all the time:

| Code | Name | QA Shop example |
|---|---|---|
| 200 | OK | `GET /api/products` |
| 201 | Created | `POST /api/products` |
| 204 | No Content (success, no body) | `DELETE /api/products/6` |
| 400 | Bad Request: your data is wrong | price as a string, quantity 0 |
| 401 | Unauthorized: who are you? | no token, wrong password |
| 403 | Forbidden: I know you, but no | a normal user creates a product, locked user |
| 404 | Not Found | `GET /api/products/999` |
| 409 | Conflict with the current state | out of stock, username exists |

---

## 6. Checking the shape: asymmetric matchers

You often can't know every value (a new id, a token, a date). Check the **shape** instead:

```ts
expect(created).toEqual({
  id: expect.any(Number),          // any number
  name: 'Desk Lamp',
  price: 24.5,
  category: 'other',
  stock: 10,
  description: expect.any(String), // any string
});

expect(created).toEqual(expect.objectContaining({ name: 'Desk Lamp', price: 24.5 }));   // only these fields

expect(products).toEqual(expect.arrayContaining([                                    // the list contains...
  expect.objectContaining({ name: 'Backpack', price: 29.99 }),                         // ...an item like this
]));
```

### 🧩 Anatomy

```
expect(list).toEqual( expect.arrayContaining( [ expect.objectContaining( { name: 'Backpack' } ) ] ) );
                      └──────── "an array that contains at least..." ─────────────────────────┘
                                                └── "an object that has at least these fields" ┘
```

### 🗣️ Say it

> "Expect list to equal an array **containing** an object **containing** name Backpack."

---

## 7. Authentication: the Bearer token

```ts
const login = await request.post('/api/login', { data: { username: 'admin', password: 'admin123' } });
const { token } = await login.json();

const response = await request.get('/api/me', {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 🧩 Anatomy

```
headers: { Authorization: `Bearer ${token}` }
           └─────┬─────┘  └──────┬────────┘
           header name    the word Bearer, ONE space, the token (a template string, module 02)
```

Put the token in a variable once: `const headers = { Authorization: `Bearer ${token}` };` then `{ headers }` (shorthand, module 05).

### 🗣️ Say it

> "Request dot **get** slash api slash me, with the **headers**: Authorization, **Bearer** and the token."

---

## 8. Negative tests

Testing what must NOT work is half of API testing. One test per rule:

```ts
test('price must be a number', async ({ request }) => {
  const response = await request.post('/api/products', { headers, data: { name: 'Sticker', price: '1.50' } });
  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: 'price must be a positive number' });
});
```

Tip: `expect(response.status(), await response.text()).toBe(201)`: the second argument of `expect` is a
**custom message**. If the status is wrong, you see the body (the API's error) in the report.

---

## 9. Your own API context and API client

The `request` fixture is perfect for most tests. Sometimes you want a context with **default headers**
(every request sends the token), or one that lives outside a test (globalSetup, worker fixtures):

```ts
import { request as playwrightRequest } from '@playwright/test';

const adminApi = await playwrightRequest.newContext({
  baseURL: 'http://localhost:3000',
  extraHTTPHeaders: { Authorization: `Bearer ${token}` },
});
await adminApi.post('/api/products', { data: { name: 'Admin Mug', price: 8 } });   // token sent automatically
await adminApi.dispose();                                                           // close it when done
```

(The import is called `request` too; renaming it to `playwrightRequest` avoids a clash with the `request` fixture.)

In bigger projects, wrap the endpoints in a class (module 09), so tests read like sentences and URLs live in one place:

```ts
class ShopApi {
  constructor(private readonly request: APIRequestContext, private readonly token: string) {}

  async addToCart(productId: number, quantity = 1): Promise<Cart> {
    const response = await this.request.post('/api/cart', {
      headers: { Authorization: `Bearer ${this.token}` },
      data: { productId, quantity },
    });
    await expect(response).toBeOK();
    return response.json();
  }
}
```

And give it to tests with a fixture (module 16): `api: async ({ request }, use) => { await use(new ShopApi(request, token)); }`.

---

## 10. Hybrid tests: API + UI

The best of both: **set up** with the API (fast, reliable), **check** what the user sees in the UI. Or the other way round.

```ts
// Seed with the API → check in the UI
await page.request.post('/api/cart', { data: { productId: 4, quantity: 2 } });
await page.goto('/cart');
await expect(page.getByTestId('cart-total')).toHaveText('Total: $99.98');

// Act in the UI → check with the API
await page.getByRole('button', { name: 'Add to cart' }).first().click();
const cart: Cart = await (await page.request.get('/api/cart')).json();
```

`page.request` shares the cookies of the page's context: if the page is logged in, so is `page.request`.
The `request` fixture has its OWN cookies (only the `storageState` option is shared, module 17).

---

## 🎭 In Playwright you'll see

```ts
test.describe('Products API', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/reset');
  });

  test('admin can create, update and delete a product', async ({ request }) => {
    const headers = { Authorization: `Bearer ${await getToken(request, 'admin')}` };

    const created = await request.post('/api/products', { headers, data: { name: 'Mug', price: 5 } });
    await expect(created).toBeOK();
    const { id } = await created.json();

    const updated = await request.patch(`/api/products/${id}`, { headers, data: { price: 6 } });
    expect(await updated.json()).toEqual(expect.objectContaining({ id, price: 6 }));

    const deleted = await request.delete(`/api/products/${id}`, { headers });
    expect(deleted.status()).toBe(204);
  });
});
```

---

## ⚠️ Common mistakes & error messages decoded

| You see | It means | Fix |
|---|---|---|
| `SyntaxError: Unexpected token '<', "<!doctype "... is not valid JSON` | You called `json()` on an HTML page. Usually a wrong URL (`/products` instead of `/api/products`) | Check the path; print `await response.text()` |
| `SyntaxError: Unexpected end of JSON input` | `json()` on an empty body (204 No Content) | Don't read the body of a 204; check `status()` |
| `expect(response).toBeOK() failed` + a call log with `← 401 Unauthorized` | Not 2xx. The log shows the request and response | Read the status and body in the log |
| `Expected: 201` `Received: 400` | The API refused your data | Add a message: `expect(response.status(), await response.text())` |
| `Received: Promise {}` | You forgot `await` before `response.json()` | `await response.json()` |
| `Property 'nmae' does not exist on type 'Product'` | Typo in a field name, caught thanks to the interface | Fix the name |
| `apiRequestContext.get: Target page, context or browser has been closed` | You used an API context after `dispose()` (or a `request` from `beforeAll` in a test) | Dispose at the very end; create the context where you use it |
| `apiRequestContext.get: Invalid URL` | Relative URL but no `baseURL` in that context | Pass `baseURL` to `newContext`, or use a full URL |

---

## ✍️ Type it (warm-up, 5 minutes)

Type this into `my-katas/18-warmup.spec.ts` and run `npm run kata 18-warmup`:

```ts
import { test, expect } from '@playwright/test';

test('API warm-up', async ({ request }) => {
  const response = await request.get('/api/products', { params: { search: 'shirt' } });
  await expect(response).toBeOK();
  const products = await response.json();
  console.log(response.status(), response.headers()['content-type'], products.length);
  expect(products).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Red T-Shirt' })]));
});
```

Then change `search: 'shirt'` to `search: 'nothing'` and predict the length before you run it.

## 🏋️ Exercises

```bash
npm run check 18
```

## 🥋 Kata

Close everything. From memory, in `my-katas/18-api.spec.ts`, write ONE test that:
1. resets the shop (`POST /api/reset`)
2. logs in as admin with `POST /api/login` and builds `headers` with the Bearer token
3. creates a product `{ name: 'Kata Mug', price: 3.5 }` → expects 201 and checks the shape with `expect.any(Number)` for the id
4. deletes it → expects 204, then `GET` it → expects 404
5. checks that creating a product WITHOUT headers gives 401

Run it with `npm run kata 18-api`.

## 🧠 Remember

```ts
const response = await request.post('/api/products', { headers, data: { name: 'Mug', price: 5 } });
const response = await request.get('/api/products', { params: { category: 'clothes' } });
const headers = { Authorization: `Bearer ${token}` };
await expect(response).toBeOK();               expect(response.status()).toBe(201);
const products: Product[] = await response.json();
expect(obj).toEqual(expect.objectContaining({ name: 'Mug', id: expect.any(Number) }));
const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: headers });  // ...api.dispose()
```

## ✅ Done when

- [ ] `npm run check 18` is all green with 0 type errors
- [ ] You can name the status codes 200, 201, 204, 400, 401, 403, 404, 409 and when each one happens
- [ ] Kata done without looking
- [ ] `npm run drill`
