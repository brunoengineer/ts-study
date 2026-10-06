// Module 05 · Objects — reference solution
// Run:  npm run solution 05
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

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
    expect(product.name).toBe('Backpack');
    expect(product['price']).toBe(29.99); // same as product.price
    expect(product[field]).toBe('bags'); // the key comes from the variable: product['category']
  });

  test('5.2 ✍️ create a user object', () => {
    const user: User = { username: 'standard_user', name: 'Sam Standard', role: 'user' };
    expect(user.username).toBe('standard_user');
    expect(user.name).toBe('Sam Standard');
    expect(user.role).toBe('user');
  });

  test('5.3 🔮 change properties of a const object', () => {
    const product = { name: 'Backpack', price: 29.99, stock: 10 };
    product.stock = product.stock - 1; // 9
    product.price = 25;
    product.stock--; // 8
    expect(product.stock).toBe(8);
    expect(product).toEqual({ name: 'Backpack', price: 25, stock: 8 }); // const objects CAN change their content
  });

  test('5.4 🐛 undefined instead of the name', () => {
    const product: Product = getProducts()[0];
    expect(product.name).toBe('Backpack'); // typo: nmae -> name
  });
});

test.describe('type, interface, ? and readonly', () => {
  test('5.5 ✍️ your own type', () => {
    type Credentials = { username: string; password: string };
    const admin: Credentials = { username: 'admin', password: 'admin123' };
    expect(admin).toEqual({ username: 'admin', password: 'admin123' });
  });

  test('5.6 ✍️ your own interface', () => {
    interface CartItem {
      productId: number;
      name: string;
      price: number;
      quantity: number;
    }
    const item: CartItem = { productId: 1, name: 'Backpack', price: 29.99, quantity: 2 };
    expect(item.name).toBe('Backpack');
    expect(item.price * item.quantity).toBeCloseTo(59.98);
  });

  test('5.7 🐛 a property is missing', () => {
    const light: Product = {
      id: 2,
      name: 'Bike Light',
      price: 9.99,
      category: 'accessories',
      stock: 25,
      description: 'Light up your evening rides.', // the type Product requires it
    };
    expect(light.description.length).toBeGreaterThan(0);
  });

  test('5.8 🔮 an optional property', () => {
    type TestUser = { username: string; password: string; role?: string };
    const sam: TestUser = { username: 'standard_user', password: 'secret123' };
    const ada: TestUser = { username: 'admin', password: 'admin123', role: 'admin' };
    expect(sam.role).toBe(undefined); // optional and not given = undefined
    expect(ada.role).toBe('admin');
    expect(Object.keys(sam).length).toBe(2); // role isn't there at all
  });

  test('5.9 🐛 someone changed the config', () => {
    type Config = { readonly baseUrl: string; readonly timeout: number };
    const config: Config = { baseUrl: 'http://localhost:3000', timeout: 5_000 };
    // The line that changed config.baseUrl is gone. Need another URL? Make a NEW object:
    // const stagingConfig: Config = { ...config, baseUrl: 'https://staging.qa-shop.com' };
    expect(config.baseUrl).toBe('http://localhost:3000');
  });
});

test.describe('nested objects and arrays of objects', () => {
  test('5.10 🔮 a nested object', () => {
    const body = {
      token: 'abc123',
      user: { username: 'admin', name: 'Ada Admin', role: 'admin' },
    };
    expect(body.token).toBe('abc123');
    expect(body.user.name).toBe('Ada Admin'); // read it like a path: body -> user -> name
    expect(body.user['role']).toBe('admin');
  });

  test('5.11 ✍️ find a product by id', () => {
    const products = getProducts();
    const product = products.find((p) => p.id === 4);
    expect(product?.name).toBe('Fleece Jacket');
    expect(product?.price).toBe(49.99);
  });

  test('5.12 ✍️ names of the clothes and total stock', () => {
    const products = getProducts();
    const clothesNames = products.filter((p) => p.category === 'clothes').map((p) => p.name);
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    expect(clothesNames).toEqual(['Bolt T-Shirt', 'Fleece Jacket', 'Onesie', 'Red T-Shirt']);
    expect(totalStock).toBe(92);
  });
});

test.describe('destructuring', () => {
  test('5.13 🔮 destructuring the Playwright way', () => {
    type Fixtures = { page: string; request: string; baseURL: string };
    const fixtures: Fixtures = { page: 'the page', request: 'the API client', baseURL: 'http://localhost:3000' };
    // Like async ({ page }) => ...: the function receives the whole object and takes out what it needs.
    const testBody = ({ page, baseURL }: Fixtures): string => `${page} at ${baseURL}`;
    const { request } = fixtures;
    expect(testBody(fixtures)).toBe('the page at http://localhost:3000');
    expect(request).toBe('the API client');
  });

  test('5.14 ✍️ rename and default', () => {
    type TestUser = { username: string; password: string; role?: string };
    const account: TestUser = { username: 'standard_user', password: 'secret123' };
    const { username: login, role = 'user' } = account; // "username: login" = rename, NOT a type!
    expect(login).toBe('standard_user');
    expect(role).toBe('user');
  });

  test('5.15 ✍️ destructuring in the parameters', () => {
    function describeProduct({ name, price }: Product): string {
      return `${name} costs $${price}`;
    }
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
    const notAdmin = { role: 'admin', ...defaults }; // defaults come last, so its role wins
    expect(admin.role).toBe('admin');
    expect(notAdmin.role).toBe('user');
    expect(defaults.role).toBe('user'); // spread makes a NEW object
  });

  test('5.17 🐛 the copy is not a copy', () => {
    const original = { name: 'Backpack', stock: 10 };
    const copy = { ...original }; // `= original` would just give the SAME object a second name
    copy.stock = 0;
    expect(copy.stock).toBe(0);
    expect(original.stock).toBe(10);
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
      return { ...defaults, ...overrides }; // overrides last = overrides win
    }
    expect(buildProduct().name).toBe('Test Product');
    expect(buildProduct({ price: 0.99 }).price).toBe(0.99);
    expect(buildProduct({ stock: 0, name: 'Gone' })).toMatchObject({ stock: 0, name: 'Gone', price: 10 });
  });
});

test.describe('Object helpers, Record and JSON', () => {
  test('5.19 🔮 Object.keys, values, entries', () => {
    const user: User = { username: 'admin', name: 'Ada Admin', role: 'admin' };
    expect(Object.keys(user)).toEqual(['username', 'name', 'role']);
    expect(Object.values(user)).toEqual(['admin', 'Ada Admin', 'admin']);
    expect(Object.entries(user)[0]).toEqual(['username', 'admin']);
  });

  test('5.20 ✍️ HTTP headers with Record', () => {
    const token = 'abc123';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Authorization']).toBe('Bearer abc123');
    expect(Object.keys(headers)).toHaveLength(2);
  });

  test('5.21 🔮 JSON.stringify and JSON.parse', () => {
    const body = { productId: 1, quantity: 2 };
    const text = JSON.stringify(body);
    expect(text).toBe('{"productId":1,"quantity":2}'); // no spaces, double quotes around keys
    expect(typeof text).toBe('string');
    const parsed = JSON.parse('{"status":"ok"}');
    expect(parsed.status).toBe('ok');
  });
});

test.describe('assertions on objects', () => {
  test('5.22 🐛 we only care about name and price', () => {
    const product: Product = getProducts()[0];
    // toMatchObject: "at least these keys and values". Extra keys (id, stock...) are fine.
    expect(product).toMatchObject({ name: 'Backpack', price: 29.99 });
  });

  test('5.23 🧪 check an API response', () => {
    const body = { token: 'f3a9c2e1', user: { username: 'admin', name: 'Ada Admin', role: 'admin' } };
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('user.role', 'admin'); // a dot path goes into nested objects
    expect(body).toMatchObject({ user: { username: 'admin' } });
  });
});

test.describe('combine everything', () => {
  test('5.24 ✍️ a cart summary', () => {
    type CartItem = { productId: number; name: string; price: number; quantity: number };
    const items: CartItem[] = [
      { productId: 1, name: 'Backpack', price: 29.99, quantity: 2 },
      { productId: 2, name: 'Bike Light', price: 9.99, quantity: 1 },
    ];
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const lines = items.map(({ name, quantity }) => `${quantity} x ${name}`); // destructuring in the callback
    expect(total).toBeCloseTo(69.97);
    expect(lines).toEqual(['2 x Backpack', '1 x Bike Light']);
  });

  test('5.25 ✍️ parse and check a login response', () => {
    type LoginResponse = { token: string; user: User };
    const responseText = '{"token":"f3a9c2e1","user":{"username":"admin","name":"Ada Admin","role":"admin"}}';
    const body: LoginResponse = JSON.parse(responseText); // JSON.parse returns any: the annotation gives us types back
    const { token, user } = body;
    const adminWithNewName = { ...user, name: 'Ada Lovelace' };
    expect(token).toBe('f3a9c2e1');
    expect(user).toEqual({ username: 'admin', name: 'Ada Admin', role: 'admin' });
    expect(adminWithNewName).toEqual({ username: 'admin', name: 'Ada Lovelace', role: 'admin' });
    expect(body.user.name).toBe('Ada Admin');
  });
});
