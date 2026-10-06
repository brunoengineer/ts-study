# Hints · Module 05

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**5.1** Look at the first product in `getProducts` at the top of the file. `product['price']` is the same as `product.price`. `product[field]` uses the VALUE of `field` as the key.

**5.2** `const user: User = { username: '...', name: '...', role: '...' };` Commas between the properties.

**5.3** Do it line by line: 10 → 9 → 8. The second answer is a whole object: `{ name: 'Backpack', price: ..., stock: ... }`.

**5.4** Read the property name carefully, letter by letter.

**5.5** `type Credentials = { username: string; password: string };` then `const admin: Credentials = { ... };`

**5.6** An interface has no `=`: `interface CartItem { productId: number; ... }`. Then `const item: CartItem = { ... };`

**5.7** The squiggle says which property is missing in type `Product`. Add `description: '...'` to the object.

**5.8** An optional property you didn't give is `undefined`. `Object.keys` lists only the keys that are really in the object.

**5.9** The line `config.baseUrl = ...` breaks `readonly`. Delete it.

**5.10** Follow the path: `body.user.name` = first `body`, then its `user`, then that user's `name`.

**5.11** `const product = products.find((p) => p.id === 4);`

**5.12** Like 4.23: `products.filter((p) => ...).map((p) => p.name)`. For the stock: `products.reduce((sum, p) => sum + p.stock, 0)`.

**5.13** `testBody` takes `page` and `baseURL` out of the object and puts them in a template literal. `const { request } = fixtures;` takes `request` out.

**5.14** `const { username: login, role = 'user' } = account;` Try to type it yourself and say it aloud: "take username, call it login; take role, default user".

**5.15** `function describeProduct({ name, price }: Product): string {` and return a template literal: `` `${name} costs $${price}` ``.

**5.16** In `{ ...a, key: value }` the later one wins. In `{ key: value, ...a }`, `a` comes later, so `a` wins.

**5.17** `const copy = original` doesn't copy, it gives the same object a second name. Make a real copy with spread.

**5.18** `return { ...defaults, ...overrides };` (and delete the `todo();` and `return defaults;` lines).

**5.19** keys = the names, values = the values, entries = `[key, value]` pairs. The order is the order in which they were written.

**5.20** Shape:
```
const headers: Record<string, string> = {
  'Content-Type': '...',
  Authorization: `...`,
};
```

**5.21** `JSON.stringify` makes text with no spaces: `'{"productId":1,"quantity":2}'`. Single quotes outside, double quotes inside.

**5.22** Lesson section 13: the matcher that passes when the object has AT LEAST these keys and values.

**5.23** `expect(body).toHaveProperty('token');` For the nested one, give a dot path and the value: `toHaveProperty('user.role', 'admin')`.

**5.24** `items.reduce((sum, item) => sum + item.price * item.quantity, 0)` and `` items.map(({ name, quantity }) => `${quantity} x ...`) ``.

**5.25** Line 1: `const body: LoginResponse = JSON.parse(responseText);` Line 2: `const { token, user } = body;` Line 3: `{ ...user, name: '...' }`.
