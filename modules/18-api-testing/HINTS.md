# Hints · Module 18

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**18.1** A successful GET. The most common status code there is. And `ok()` is a boolean.

**18.2** `await expect(response).toBeOK();` then `expect(product.name).toBe('...');`

**18.3** Look at the products table in `practice-app/README.md`. Index 3 is the FOURTH product. `typeof` gives a string like `'string'` or `'number'`.

**18.4** `const response = await request.get('/api/products', { params: { category: '...' } });`

**18.5** The text after 200 is two letters. Header names are lowercase; QA Shop sends `application/json`. `text()` is the raw body: `'{"status":"ok"}'` (no spaces).

**18.6** "Not found" has a famous number. `ok()` is only true for 2xx. The error text is in the README (`GET /api/products/:id`).

**18.7** `const response = await request.post('/api/login', { data: { username: '...', password: '...' } });`

**18.8** README, `POST /api/login`: wrong password → ?, locked → ?, missing fields → ?. Lesson section 5 has the table.

**18.9** `{ headers: { Authorization: `Bearer ${token}` } }` as the second argument of `request.get('/api/me', ...)`. Backticks, not quotes!

**18.10** No token at all = "who are you?". Valid token but a normal user = "I know you, but no".

**18.11** Like 18.9, but `request.post('/api/products', { headers: { ... }, data: { ... } })`: both options in ONE object.

**18.12** `expect(products).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Backpack', price: 29.99 })]));` Count the brackets!

**18.13** `request.patch('/api/products/2', { headers, data: { price: 12.99 } })`. `{ headers }` is short for `{ headers: headers }`.

**18.14** `request.delete('/api/products/6', { headers })`.

**18.15** The error says "price must be a positive number". `'1.50'` has quotes...

**18.16** README, `POST /api/cart`: out of stock, unknown product, bad quantity. Lesson section 5.

**18.17** `const adminApi = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { Authorization: `Bearer ${token}` } });`

**18.18** Copy `getCart()` and change: `post` instead of `get`, and add `data: { productId, quantity }` next to `headers: this.headers`. Delete the `todo(...)` AND the `return ___;` lines.

**18.19** `await page.request.post('/api/cart', { data: { productId: 4, quantity: 2 } });`. No headers needed: page.request has the page's cookie.

**18.20** `expect(cart.count).toBe(1);` and `expect(cart.items[0].name).toBe('Backpack');`
