# Hints · Module 20

Read only the hint for the exercise you're stuck on. Try again before reading the next one.
The full contract is in section 3 of LESSON.md. The reference framework is in `solutions/20-final-project/framework/`:
open ONE file, read it, close it, write yours from memory.

## Milestone 1 · the config

**20.1** The folder is `final-project/` at the ROOT of the repository (next to `modules/` and `package.json`), not inside `modules/20-final-project/`.
The file needs `import { defineConfig } from '@playwright/test';` and `export default defineConfig({ ... });`.

**20.2** Read the red message: it names the one setting that is missing. Copy the skeleton in Milestone 1.
`webServer.command` is relative to `final-project/`, so the practice app is ONE level up: `node ../practice-app/server.mjs`.
`baseURL` must use `PORT`: `` `http://localhost:${PORT}` `` with `const PORT = Number(process.env.PORT ?? 3000);`.

## Milestone 2 · page objects

**20.3** `pages/BasePage.ts`: `export abstract class BasePage { abstract readonly path: string; constructor(readonly page: Page) {} async goto() {...} }`.
`pages/LoginPage.ts`: `export class LoginPage extends BasePage`, `readonly path = '/login';`, constructor calls `super(page)` FIRST. Module 09 (classes) and 15 (POM).

**20.4** `this.errorMessage = page.getByRole('alert');` in the LoginPage constructor.

**20.5** `productCards = page.getByTestId('product-card')`, `cartCount = page.getByTestId('cart-count')`.
`productCard(name)` filters `productCards` by a heading with that name. `addToCart(name)` clicks "Add to cart" inside that card,
then waits until the card shows a "Remove" button.

**20.6** `rows = page.getByTestId('cart-row')`, `total = page.getByTestId('cart-total')`, `emptyMessage = page.getByTestId('empty-cart')`.
`removeItem(name)`: the row that has the text `name` (`this.rows.filter({ hasText: name })`), then its "Remove" button.

## Milestone 3 · test data and the API client

**20.7** `utils/data.ts` imports `NewProduct` from `./types`. `uniqueName` = module 19 (19.3).
`buildProduct` returns `{ name: uniqueName('Product'), price: 9.99, ...overrides }` (and more defaults if you like).

**20.8** `getProducts(params = {})` → `this.request.get('/api/products', { params })`. `getProduct(id)` → `` `/api/products/${id}` ``. Return `response.json()`.

**20.9** `login()` stores the token in a private field (`this.token = body.token;`) and returns it. `createProduct` and `deleteProduct`
send `{ headers: this.headers() }`, a method that returns `{ Authorization: `Bearer ${this.token}` }`.

**20.10** `getCart()` → GET `/api/cart`, `addToCart(productId, quantity = 1)` → POST `/api/cart` with `data: { productId, quantity }`, `reset()` → POST `/api/reset`. All with the headers.

**20.11** In EVERY method, after the request: `if (!response.ok()) throw new Error(`... failed: ${response.status()}`);`
Tip: write one private method `check(response, action)` and call it everywhere.

## Milestone 4 · fixtures

**20.12** `fixtures/index.ts` = module 16 section 11. Four fixtures, each `async ({ page }, use) => { await use(new X(page)); }`
(the `api` fixture uses `{ request }`). Don't forget `export { expect };`.

## Milestone 5 · authentication

**20.13** Module 17 sections 5 and 8. Add `{ name: 'setup', testMatch: /.*\.setup\.ts/ }` and a project with `dependencies: ['setup']`
and `use: { storageState: USER_STATE }`, where `USER_STATE` is an ABSOLUTE path ending in `.auth/user.json`
(`path.join(import.meta.dirname, '.auth', 'user.json')` in the config).

## Milestone 6 · the tests

**20.14** The message says which folder needs more tests. Folders: `tests/ui/`, `tests/api/`, `tests/hybrid/`.
Tags: `test('title', { tag: '@smoke' }, async ({ ... }) => { ... });`. Spec files import `{ test, expect }` from `'../../fixtures'`.

## Milestone 7 · the whole suite

**20.15** Run `npx playwright test -c final-project` yourself and fix the first red test. Common causes:
the `ui` tests share data (add `test.beforeEach(async ({ api }) => { await api.reset(); });`),
login tests run logged in (add `test.use({ storageState: { cookies: [], origins: [] } });`),
the hybrid API client is not logged in as standard_user.
