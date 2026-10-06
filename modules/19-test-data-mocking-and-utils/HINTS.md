# Hints · Module 19

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**19.1** (top of the file) One line: `return { name: 'Test Product', price: 9.99, category: 'other', stock: 10, ...overrides };`. Delete the `todo(...)` and the `return ___;` lines.

**19.2** With spread, the LAST object wins when two have the same key. In `wrong`, which object comes last?

**19.3** (top of the file) A template string: `` `${prefix}-${Date.now()}-${randomUUID()}` ``. Optional: `.slice(0, 8)` makes the UUID shorter.

**19.4** The line `const username = 'qa_tester';` is the problem: the same name twice gives 409. Use your `uniqueName('qa_tester')` from 19.3.

**19.5** Nothing is set, so `??` gives the right side. `Number('2')` is a number. `undefined === 'true'` is...?

**19.6** `return Number(text.replace('$', ''));`

**19.7** `toFixed(2)` gives a string with 2 decimals. Put a `$` in front with a template string.

**19.8** Shape:
`let lastError: unknown;` → `for (let attempt = 1; attempt <= attempts; attempt++) { try { return await action(); } catch (error) { lastError = error; } }` → after the loop: `throw lastError;`

**19.9** `expect(prices).toHaveLength(6);` and `expect(total).toBeCloseTo(129.94);`

**19.10** Two lines: `const response = await request.get('/api/products', { params: { search: term } });` and `expect(await response.json()).toHaveLength(expected);`. Write them ONCE, the loop makes 3 tests.

**19.11** Change the three `status: ___` in `loginCases`. Module 18 (18.8) had the same three cases.

**19.12** First `await test.step('open the playground', async () => { ... });`. Then `const count = await test.step('load the products', async () => { ...click, expect...; return page.getByTestId('loaded-products').getByRole('listitem').count(); });`

**19.13** Change the first line of the test: `test('19.13 ✍️ tag a test', { tag: '@smoke' }, async () => {`. Keep the title exactly the same.

**19.14** Same place as the tag: `{ annotation: { type: 'issue', description: '...' } }` between the title and the function.

**19.15** `await test.info().attach('products.json', { body: JSON.stringify(products, null, 2), contentType: 'application/json' });`

**19.16** `await page.route('**/api/products', (route) => route.fulfill({ json: MOCK_PRODUCTS }));`

**19.17** Same as 19.16, but the handler is `(route) => route.abort()`.

**19.18** `await page.route('**/api/products', async (route) => { ...the 4 lines from the comment... });`. Note the `async` before `(route)`.

**19.19** `expect(response.status()).toBe(200);` and `expect(await response.json()).toHaveLength(6);`

**19.20** `await test.step('attach evidence', async () => { const screenshot = await page.screenshot(); await test.info().attach('mocked-products', { body: screenshot, contentType: 'image/png' }); });`
