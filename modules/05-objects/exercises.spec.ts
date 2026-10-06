// Module 05 · Objects
// Run:  npm run check 05
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

// ----- Given: the QA Shop shapes and data (read them, don't change them) -----
type Product = { id: number; name: string; price: number; category: string; stock: number; description: string };
type User = { username: string; name: string; role: string };

// A function that gives a FRESH list every time, so no test can break another one.
const getProducts = (): Product[] => [
  { id: 1, name: 'Backpack', price: 29.99, category: 'bags', stock: 10, description: 'A sturdy backpack for all your test gear.' },
  { id: 2, name: 'Bike Light', price: 9.99, category: 'accessories', stock: 25, description: 'Light up your evening rides.' },
  { id: 3, name: 'Bolt T-Shirt', price: 15.99, category: 'clothes', stock: 40, description: 'A classic tee with a lightning bolt.' },
  { id: 4, name: 'Fleece Jacket', price: 49.99, category: 'clothes', stock: 5, description: 'Warm, soft and ready for winter.' },
  { id: 5, name: 'Onesie', price: 7.99, category: 'clothes', stock: 0, description: 'Cozy onesie for the little ones. Out of stock!' },
  { id: 6, name: 'Red T-Shirt', price: 15.99, category: 'clothes', stock: 12, description: 'Bright red tee. Very visible, like a failing test.' },
];
// ------------------------------------------------------------------------------

test.describe('object literals', () => {
  test('5.1 🔮 dot and brackets', () => {
    const product: Product = getProducts()[0];
    const field = 'category';
    expect(product.name).toBe(___);
    expect(product['price']).toBe(___);
    expect(product[field]).toBe(___);
  });

  test('5.2 ✍️ create a user object', () => {
    // Create a constant user, OF TYPE User, for Sam: username 'standard_user', name 'Sam Standard', role 'user'.
    // Shape: const user: User = { key: value, key: value, key: value };
    // ✍️ your code here

    todo();
    expect(user.username).toBe('standard_user');
    expect(user.name).toBe('Sam Standard');
    expect(user.role).toBe('user');
  });

  test('5.3 🔮 change properties of a const object', () => {
    const product = { name: 'Backpack', price: 29.99, stock: 10 };
    product.stock = product.stock - 1;
    product.price = 25;
    product.stock--;
    expect(product.stock).toBe(___);
    expect(product).toEqual(___); // write the whole object: { name: ..., price: ..., stock: ... }
  });

  test('5.4 🐛 undefined instead of the name', () => {
    const product: Product = getProducts()[0];
    // Read the Received value and the red squiggle.
    expect(product.nmae).toBe('Backpack');
  });
});

test.describe('type, interface, ? and readonly', () => {
  test('5.5 ✍️ your own type', () => {
    // 1. Declare a type Credentials with two properties: username (string) and password (string).
    //    Shape: type Name = { key: type; key: type };
    // 2. Create a constant admin, OF TYPE Credentials: username 'admin', password 'admin123'.
    // ✍️ your code here

    todo();
    expect(admin).toEqual({ username: 'admin', password: 'admin123' });
  });

  test('5.6 ✍️ your own interface', () => {
    // 1. Declare an INTERFACE CartItem with: productId (number), name (string), price (number), quantity (number).
    //    Shape: interface Name { key: type; key: type; }      (no = sign!)
    // 2. Create a constant item, OF TYPE CartItem: productId 1, name 'Backpack', price 29.99, quantity 2.
    // ✍️ your code here

    todo();
    expect(item.name).toBe('Backpack');
    expect(item.price * item.quantity).toBeCloseTo(59.98);
  });

  test('5.7 🐛 a property is missing', () => {
    // Read the red squiggle under `light`. Add the missing property (any non-empty text).
    const light: Product = { id: 2, name: 'Bike Light', price: 9.99, category: 'accessories', stock: 25 };
    expect(light.description.length).toBeGreaterThan(0);
  });

  test('5.8 🔮 an optional property', () => {
    type TestUser = { username: string; password: string; role?: string };
    const sam: TestUser = { username: 'standard_user', password: 'secret123' };
    const ada: TestUser = { username: 'admin', password: 'admin123', role: 'admin' };
    expect(sam.role).toBe(___);
    expect(ada.role).toBe(___);
    expect(Object.keys(sam).length).toBe(___);
  });

  test('5.9 🐛 someone changed the config', () => {
    type Config = { readonly baseUrl: string; readonly timeout: number };
    const config: Config = { baseUrl: 'http://localhost:3000', timeout: 5_000 };
    // readonly means: never change it. Read the red squiggle, then delete the line that breaks the rule.
    config.baseUrl = 'https://staging.qa-shop.com';
    expect(config.baseUrl).toBe('http://localhost:3000');
  });
});

test.describe('nested objects and arrays of objects', () => {
  test('5.10 🔮 a nested object', () => {
    const body = {
      token: 'abc123',
      user: { username: 'admin', name: 'Ada Admin', role: 'admin' },
    };
    expect(body.token).toBe(___);
    expect(body.user.name).toBe(___);
    expect(body.user['role']).toBe(___);
  });

  test('5.11 ✍️ find a product by id', () => {
    const products = getProducts();
    // Create a constant product: the product whose id is 4. Use find (module 04).
    // ✍️ your code here

    todo();
    // ?. because find can give back undefined (lesson section 6)
    expect(product?.name).toBe('Fleece Jacket');
    expect(product?.price).toBe(49.99);
  });

  test('5.12 ✍️ names of the clothes and total stock', () => {
    const products = getProducts();
    // 1. Create a constant clothesNames: the names of the products whose category is 'clothes' (filter, then map)
    // 2. Create a constant totalStock: the sum of the stock of ALL products (reduce, start at 0)
    // ✍️ your code here

    todo();
    expect(clothesNames).toEqual(['Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
    expect(totalStock).toBe(92);
  });
});

test.describe('destructuring', () => {
  test('5.13 🔮 destructuring the Playwright way', () => {
    // This is what Playwright does with your test function: it calls it with ONE object of fixtures.
    type Fixtures = { page: string; request: string; baseURL: string };
    const fixtures: Fixtures = { page: 'the page', request: 'the API client', baseURL: 'http://localhost:3000' };
    const testBody = ({ page, baseURL }: Fixtures): string => `${page} at ${baseURL}`;
    const { request } = fixtures;
    expect(testBody(fixtures)).toBe(___);
    expect(request).toBe(___);
  });

  test('5.14 ✍️ rename and default', () => {
    type TestUser = { username: string; password: string; role?: string };
    const account: TestUser = { username: 'standard_user', password: 'secret123' };
    // With ONE line of object destructuring from account:
    //  - take username, but call the variable login
    //  - take role, with the default value 'user'
    // Shape: const { key: newName, otherKey = defaultValue } = object;
    // ✍️ your code here

    todo();
    expect(login).toBe('standard_user');
    expect(role).toBe('user');
  });

  test('5.15 ✍️ destructuring in the parameters', () => {
    // Write a function describeProduct that takes a Product and DESTRUCTURES name and price in the parameter list.
    // It returns: name + ' costs $' + price  (e.g. 'Backpack costs $29.99')
    // Shape: function describeProduct({ a, b }: Product): string { return ...; }
    // ✍️ your code here

    todo();
    const [backpack, bikeLight] = getProducts();
    expect(describeProduct(backpack)).toBe('Backpack costs $29.99');
    expect(describeProduct(bikeLight)).toBe('Bike Light costs $9.99');
  });
});

test.describe('spread: copies and builders', () => {
  test('5.16 🔮 merge with spread: the last one wins', () => {
    const defaults = { username: 'standard_user', password: 'secret123', role: 'user' };
    const admin = { ...defaults, role: 'admin' };
    // @ts-expect-error - TypeScript warns: 'role' is specified more than once, so this usage will be overwritten.
    const notAdmin = { role: 'admin', ...defaults };
    expect(admin.role).toBe(___);
    expect(notAdmin.role).toBe(___);
    expect(defaults.role).toBe(___); // did spread change defaults?
  });

  test('5.17 🐛 the copy is not a copy', () => {
    const original = { name: 'Backpack', stock: 10 };
    const copy = original;
    copy.stock = 0;
    expect(copy.stock).toBe(0);
    expect(original.stock).toBe(10); // the original must not change
  });

  test('5.18 ✍️ a test data builder', () => {
    function buildProduct(overrides: Partial<Product> = {}): Product {
      const defaults: Product = {
        id: 100,
        name: 'Test Product',
        price: 10,
        category: 'other',
        stock: 10,
        description: 'Created by a test',
      };
      // Replace the todo() and `return defaults;` with ONE return:
      // a new object with everything from defaults, then everything from overrides (overrides must win).
      // ✍️ your code here

      todo();
      return defaults;
    }
    expect(buildProduct().name).toBe('Test Product');
    expect(buildProduct({ price: 0.99 }).price).toBe(0.99);
    expect(buildProduct({ stock: 0, name: 'Gone' })).toMatchObject({ stock: 0, name: 'Gone', price: 10 });
  });
});

test.describe('Object helpers, Record and JSON', () => {
  test('5.19 🔮 Object.keys, values, entries', () => {
    const user: User = { username: 'admin', name: 'Ada Admin', role: 'admin' };
    expect(Object.keys(user)).toEqual(___);
    expect(Object.values(user)).toEqual(___);
    expect(Object.entries(user)[0]).toEqual(___); // the first [key, value] pair
  });

  test('5.20 ✍️ HTTP headers with Record', () => {
    const token = 'abc123';
    // Create a constant headers, OF TYPE Record<string, string>, with two entries:
    //   'Content-Type' -> 'application/json'          (the key needs quotes because of the -)
    //   Authorization  -> 'Bearer ' + token           (template literal)
    // ✍️ your code here

    todo();
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer abc123');
    expect(Object.keys(headers)).toHaveLength(2);
  });

  test('5.21 🔮 JSON.stringify and JSON.parse', () => {
    const body = { productId: 1, quantity: 2 };
    const text = JSON.stringify(body);
    expect(text).toBe(___); // careful with the quotes: JSON uses " inside. Wrap your answer in ' '
    expect(typeof text).toBe(___);
    const parsed = JSON.parse('{"status":"ok"}');
    expect(parsed.status).toBe(___);
  });
});

test.describe('assertions on objects', () => {
  test('5.22 🐛 we only care about name and price', () => {
    const product: Product = getProducts()[0];
    // Read the error. toBe is the wrong matcher, and toEqual would also fail (the object has MORE keys).
    // Use the matcher that checks "at least these keys and values".
    expect(product).toBe({ name: 'Backpack', price: 29.99 });
  });

  test('5.23 🧪 check an API response', () => {
    // Imagine this came from: await (await request.post('/api/login', { data: ... })).json()
    const body = { token: 'f3a9c2e1', user: { username: 'admin', name: 'Ada Admin', role: 'admin' } };
    // Write THREE assertions:
    //  - body has the property 'token'                                         (toHaveProperty)
    //  - body has the nested property 'user.role' with the value 'admin'       (toHaveProperty with 2 arguments)
    //  - body matches at least { user: { username: 'admin' } }                  (toMatchObject)
    // ✍️ your code here

    todo();
  });
});

test.describe('combine everything', () => {
  test('5.24 ✍️ a cart summary', () => {
    type CartItem = { productId: number; name: string; price: number; quantity: number };
    // The shape GET /api/cart gives back in "items":
    const items: CartItem[] = [
      { productId: 1, name: 'Backpack', price: 29.99, quantity: 2 },
      { productId: 2, name: 'Bike Light', price: 9.99, quantity: 1 },
    ];
    // 1. Create a constant total: the sum of price * quantity of every item (reduce, start at 0)
    // 2. Create a constant lines: one text per item like '2 x Backpack'.
    //    Use map, and DESTRUCTURE { name, quantity } in the callback's parameter: items.map(({ name, quantity }) => ...)
    // ✍️ your code here

    todo();
    expect(total).toBeCloseTo(69.97);
    expect(lines).toEqual(['2 x Backpack', '1 x Bike Light']);
  });

  test('5.25 ✍️ parse and check a login response', () => {
    type LoginResponse = { token: string; user: User };
    const responseText = '{"token":"f3a9c2e1","user":{"username":"admin","name":"Ada Admin","role":"admin"}}';
    // 1. Create a constant body, OF TYPE LoginResponse, by parsing responseText with JSON.parse
    // 2. Destructure token and user out of body (one line)
    // 3. Create a constant adminWithNewName: a COPY of user with name changed to 'Ada Lovelace' (spread)
    // ✍️ your code here

    todo();
    expect(token).toBe('f3a9c2e1');
    expect(user).toEqual({ username: 'admin', name: 'Ada Admin', role: 'admin' });
    expect(adminWithNewName).toEqual({ username: 'admin', name: 'Ada Lovelace', role: 'admin' });
    expect(body.user.name).toBe('Ada Admin'); // the original did not change
  });
});
