// Module 09 · Classes
// Run:  npm run check 09
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

// ─────────────────────────────────────────────────────────────────────────────
// A FAKE page (don't change it). It has a few async methods like Playwright's Page,
// but instead of a browser it writes every call into `actions`, so tests can check them.
// Read it: it's a class too!
// ─────────────────────────────────────────────────────────────────────────────
class FakePage {
  readonly actions: string[] = [];

  async goto(url: string): Promise<void> {
    this.actions.push(`goto ${url}`);
  }

  async fill(label: string, value: string): Promise<void> {
    this.actions.push(`fill ${label}=${value}`);
  }

  async click(name: string): Promise<void> {
    this.actions.push(`click ${name}`);
  }
}
// ─────────────────────────────────────────────────────────────────────────────

test.describe('class basics', () => {
  test('9.1 🔮 new, constructor and properties', () => {
    class TestUser {
      username: string;
      role: string;

      constructor(username: string, role: string) {
        this.username = username;
        this.role = role;
      }
    }
    const user = new TestUser('standard_user', 'user');
    expect(user.username).toBe(___);
    expect(user.role).toBe(___);
    expect(typeof user).toBe(___);
  });

  test('9.2 ✍️ write your first class', () => {
    // Write a class Product with two properties: name (string) and price (number).
    // The constructor takes (name: string, price: number) and stores both with this.
    // ✍️ your code here

    todo();
    const backpack = new Product('Backpack', 29.99);
    expect(backpack.name).toBe('Backpack');
    expect(backpack.price).toBe(29.99);
  });

  test('9.3 🐛 the property stays empty', () => {
    // Read the red squiggle on `name: string;`, then look at the constructor. Something is missing.
    class Product {
      name: string;

      constructor(name: string) {
        name = name;
      }
    }
    const product = new Product('Backpack');
    expect(product.name).toBe('Backpack');
  });

  test('9.4 ✍️ methods', () => {
    // Write a class Cart with:
    //  - a property items: string[] that starts as []
    //  - a method add(name: string): void        -> pushes name into this.items
    //  - a method count(): number                -> returns how many items there are
    //  - a method clear(): void                  -> sets this.items back to []
    // ✍️ your code here

    todo();
    const cart = new Cart();
    cart.add('Backpack');
    cart.add('Bike Light');
    expect(cart.count()).toBe(2);
    expect(cart.items).toEqual(['Backpack', 'Bike Light']);
    cart.clear();
    expect(cart.count()).toBe(0);
  });

  test('9.5 🔮 every object has its own data', () => {
    class Counter {
      count = 0;

      increment(): void {
        this.count++;
      }
    }
    const a = new Counter();
    const b = new Counter();
    a.increment();
    a.increment();
    b.increment();
    expect(a.count).toBe(___);
    expect(b.count).toBe(___);
  });

  test('9.6 🐛 a class is not a function', () => {
    class Cart {
      items: string[] = [];
    }
    const cart = Cart();
    expect(cart.items).toEqual([]);
  });
});

test.describe('access modifiers and parameter properties', () => {
  test('9.7 🐛 reading a private property (types only)', () => {
    // This test passes already: `private` is a TypeScript check, not a runtime one.
    // But TypeScript is right to complain. Change the ASSERTION to use the public method checkPassword
    // instead: expect checkPassword('admin123') to be true.
    class TestUser {
      readonly username: string;
      private password: string;

      constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
      }

      checkPassword(attempt: string): boolean {
        return attempt === this.password;
      }
    }
    const user = new TestUser('admin', 'admin123');
    expect(user.password === 'admin123').toBe(true);
  });

  test('9.8 ✍️ the parameter property shortcut', () => {
    // Write a class ApiClient using the SHORT form:
    //   constructor(private readonly baseUrl: string) {}
    // and a method url(path: string): string that returns baseUrl + path (use this.baseUrl)
    // ✍️ your code here

    todo();
    const client = new ApiClient('http://localhost:3000');
    expect(client.url('/api/products')).toBe('http://localhost:3000/api/products');
  });

  test('9.9 🔮 what does the shortcut create?', () => {
    class Session {
      constructor(
        public readonly username: string,
        public token: string,
      ) {}
    }
    const session = new Session('admin', 'token-admin');
    // Object.keys gives the names of an object's properties, as an array
    expect(Object.keys(session)).toEqual(___);
    expect(session.token).toBe(___);
  });
});

test.describe('getters and static', () => {
  test('9.10 ✍️ a getter', () => {
    class Cart {
      items: { name: string; price: number; quantity: number }[] = [];

      add(name: string, price: number, quantity = 1): void {
        this.items.push({ name, price, quantity });
      }

      // ✍️ your code here: a getter called total (a number): the sum of price * quantity of all items
      // Shape: get total(): number { return this.items.reduce(...); }
    }
    todo();
    const cart = new Cart();
    cart.add('Backpack', 29.99, 2);
    cart.add('Bike Light', 9.99);
    // toBeCloseTo: "equal, up to 2 decimals" (decimal numbers are never 100% exact)
    expect(cart.total).toBeCloseTo(69.97, 2);
  });

  test('9.11 🐛 a getter is not called with ()', () => {
    class TestRun {
      results: string[] = ['passed', 'failed', 'passed'];

      get passRate(): number {
        const passed = this.results.filter((result) => result === 'passed').length;
        return Math.round((passed / this.results.length) * 100);
      }
    }
    const run = new TestRun();
    expect(run.passRate()).toBe(67);
  });

  test('9.12 ✍️ static members: factory methods for test data', () => {
    class TestUser {
      constructor(
        readonly username: string,
        readonly password: string,
        readonly role: string,
      ) {}

      // ✍️ your code here: add three static members
      //  - static readonly DEFAULT_PASSWORD = 'secret123'
      //  - static standard(): TestUser  -> a new TestUser('standard_user', TestUser.DEFAULT_PASSWORD, 'user')
      //  - static admin(): TestUser     -> a new TestUser('admin', 'admin123', 'admin')
    }
    todo();
    expect(TestUser.DEFAULT_PASSWORD).toBe('secret123');
    expect(TestUser.standard()).toEqual(new TestUser('standard_user', 'secret123', 'user'));
    expect(TestUser.admin().role).toBe('admin');
  });

  test('9.13 🔮 a static counter', () => {
    class ApiRequest {
      static count = 0;

      constructor(readonly path: string) {
        ApiRequest.count++;
      }
    }
    new ApiRequest('/api/products');
    new ApiRequest('/api/cart');
    const last = new ApiRequest('/api/me');
    expect(ApiRequest.count).toBe(___);
    expect(last.path).toBe(___);
  });
});

test.describe('inheritance and interfaces', () => {
  // A base class for all pages (used by the tests in this group)
  class BasePage {
    constructor(
      protected readonly page: FakePage,
      readonly path: string,
    ) {}

    async open(): Promise<void> {
      await this.page.goto(this.path);
    }

    title(): string {
      return 'QA Shop';
    }
  }

  test('9.14 🔮 extends, super and override', async () => {
    class ProductsPage extends BasePage {
      constructor(page: FakePage) {
        super(page, '/products');
      }

      title(): string {
        return `Products · ${super.title()}`;
      }
    }
    const page = new FakePage();
    const productsPage = new ProductsPage(page);
    await productsPage.open();
    expect(productsPage.path).toBe(___);
    expect(productsPage.title()).toBe(___);
    expect(page.actions).toEqual(___);
  });

  test('9.15 ✍️ write a page that extends BasePage', async () => {
    // Write a class CartPage that extends BasePage:
    //  - constructor(page: FakePage) -> calls super with the page and '/cart'
    //  - async checkout(): Promise<void> -> clicks 'Checkout'  (await this.page.click(...))
    // ✍️ your code here

    todo();
    const page = new FakePage();
    const cartPage = new CartPage(page);
    await cartPage.open();
    await cartPage.checkout();
    expect(page.actions).toEqual(['goto /cart', 'click Checkout']);
  });

  test('9.16 🐛 a child constructor without super', () => {
    // The admin page lives at '/admin'. Run it and read the error.
    class AdminPage extends BasePage {
      readonly heading: string;

      constructor(page: FakePage) {
        this.heading = 'Admin Dashboard';
      }
    }
    const adminPage = new AdminPage(new FakePage());
    expect(adminPage.path).toBe('/admin');
    expect(adminPage.heading).toBe('Admin Dashboard');
  });

  test('9.17 ✍️ implements an interface', () => {
    interface MiniReporter {
      onTestEnd(title: string, status: string): void;
      summary(): string;
    }
    // Write a class CountingReporter that implements MiniReporter:
    //  - two private properties: passed = 0 and failed = 0
    //  - onTestEnd(title, status): add 1 to passed when status is 'passed', to failed when it is 'failed'
    //  - summary(): returns `${passed} passed, ${failed} failed`   (use this.)
    // ✍️ your code here

    todo();
    const reporter: MiniReporter = new CountingReporter();
    reporter.onTestEnd('login works', 'passed');
    reporter.onTestEnd('checkout works', 'failed');
    reporter.onTestEnd('search works', 'passed');
    expect(reporter.summary()).toBe('2 passed, 1 failed');
  });

  test('9.18 🔮 instanceof', () => {
    class LoginPage extends BasePage {
      constructor(page: FakePage) {
        super(page, '/login');
      }
    }
    const loginPage = new LoginPage(new FakePage());
    const home = new BasePage(new FakePage(), '/');
    expect(loginPage instanceof LoginPage).toBe(___);
    expect(loginPage instanceof BasePage).toBe(___);
    expect(home instanceof LoginPage).toBe(___);
  });

  test('9.19 ✍️ your own error class', () => {
    // Write a class ApiError that extends Error:
    //   constructor(readonly status: number, message: string)
    //   inside: call super(message), then set this.name = 'ApiError'
    // ✍️ your code here

    todo();
    function getProduct(id: number): string {
      if (id > 6) throw new ApiError(404, 'Product not found');
      return 'Backpack';
    }
    expect(() => getProduct(99)).toThrow('Product not found');

    let status = 0;
    try {
      getProduct(99);
    } catch (error) {
      if (error instanceof ApiError) status = error.status;
    }
    expect(status).toBe(404);
  });

  test('9.20 🐛 the lost this', () => {
    // Run it and read the error. forEach calls `add` on its own, without `cart.` in front.
    // Fix the forEach line (wrap the method in an arrow function).
    class Cart {
      items: string[] = [];

      add(name: string): void {
        this.items.push(name);
      }
    }
    const cart = new Cart();
    ['Backpack', 'Bike Light'].forEach(cart.add);
    expect(cart.items).toEqual(['Backpack', 'Bike Light']);
  });
});

test.describe('combine everything', () => {
  class BasePage {
    constructor(
      protected readonly page: FakePage,
      readonly path: string,
    ) {}

    async open(): Promise<void> {
      await this.page.goto(this.path);
    }
  }

  test('9.21 ✍️ a login page object', async () => {
    // Write a class LoginPage that extends BasePage:
    //  - constructor(page: FakePage) -> super with the page and '/login'
    //  - async login(username: string, password: string): Promise<void>
    //      1. open the page (await this.open())
    //      2. fill 'Username' with username      (await this.page.fill(...))
    //      3. fill 'Password' with password
    //      4. click 'Log in'
    // This is exactly the shape of a real page object (module 15)!
    // ✍️ your code here

    todo();
    const page = new FakePage();
    const loginPage = new LoginPage(page);
    await loginPage.login('standard_user', 'secret123');
    expect(page.actions).toEqual([
      'goto /login',
      'fill Username=standard_user',
      'fill Password=secret123',
      'click Log in',
    ]);
  });

  test('9.22 ✍️ an API client with a fake transport', async () => {
    type FakeResponse = { status: number; body: unknown };
    type Transport = (method: string, path: string, body?: unknown) => Promise<FakeResponse>;
    // A fake server: only POST /api/login with admin / admin123 works.
    const fakeTransport: Transport = async (method, path, body) => {
      if (method === 'POST' && path === '/api/login') {
        const { username, password } = body as { username: string; password: string };
        if (username === 'admin' && password === 'admin123') return { status: 200, body: { token: 'token-admin' } };
        return { status: 401, body: { error: 'Invalid username or password' } };
      }
      return { status: 404, body: { error: 'Not found' } };
    };
    // Write a class ApiClient:
    //  - constructor(private readonly transport: Transport) {}
    //  - a private property token: string | null = null
    //  - a getter isLoggedIn (boolean): true when token is not null
    //  - async login(username: string, password: string): Promise<void>
    //      const response = await this.transport('POST', '/api/login', { username, password });
    //      if response.status is not 200: throw new Error(`Login failed with status ${response.status}`)
    //      otherwise: this.token = (response.body as { token: string }).token;
    // ✍️ your code here

    todo();
    const client = new ApiClient(fakeTransport);
    expect(client.isLoggedIn).toBe(false);
    await expect(client.login('admin', 'wrong')).rejects.toThrow('Login failed with status 401');
    expect(client.isLoggedIn).toBe(false);
    await client.login('admin', 'admin123');
    expect(client.isLoggedIn).toBe(true);
  });

  test('9.23 🧪 test a class', () => {
    class ShoppingCart {
      private items: { name: string; price: number }[] = [];

      add(name: string, price: number): void {
        this.items.push({ name, price });
      }

      remove(name: string): void {
        this.items = this.items.filter((item) => item.name !== name);
      }

      get count(): number {
        return this.items.length;
      }

      get total(): number {
        const sum = this.items.reduce((total, item) => total + item.price, 0);
        return Math.round(sum * 100) / 100;
      }

      get isEmpty(): boolean {
        return this.items.length === 0;
      }
    }
    const cart = new ShoppingCart();
    cart.add('Backpack', 29.99);
    cart.add('Bike Light', 9.99);
    cart.add('Onesie', 7.99);
    cart.remove('Bike Light');
    // Write FOUR assertions:
    //  - cart.count is 2
    //  - cart.total is 37.98
    //  - cart.isEmpty is false
    //  - a brand new ShoppingCart is empty (isEmpty is true)
    // ✍️ your code here

    todo();
  });
});
