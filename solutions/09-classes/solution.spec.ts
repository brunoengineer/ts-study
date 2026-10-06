// Module 09 · Classes — reference solution
// Run:  npm run solution 09
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

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
    expect(user.username).toBe('standard_user');
    expect(user.role).toBe('user');
    expect(typeof user).toBe('object'); // an instance is an object
  });

  test('9.2 ✍️ write your first class', () => {
    class Product {
      name: string;
      price: number;

      constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
      }
    }
    const backpack = new Product('Backpack', 29.99);
    expect(backpack.name).toBe('Backpack');
    expect(backpack.price).toBe(29.99);
  });

  test('9.3 🐛 the property stays empty', () => {
    class Product {
      name: string;

      constructor(name: string) {
        this.name = name; // `name = name` only assigned the parameter to itself
      }
    }
    const product = new Product('Backpack');
    expect(product.name).toBe('Backpack');
  });

  test('9.4 ✍️ methods', () => {
    class Cart {
      items: string[] = [];

      add(name: string): void {
        this.items.push(name);
      }

      count(): number {
        return this.items.length;
      }

      clear(): void {
        this.items = [];
      }
    }
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
    expect(a.count).toBe(2);
    expect(b.count).toBe(1); // b has its own count
  });

  test('9.6 🐛 a class is not a function', () => {
    class Cart {
      items: string[] = [];
    }
    const cart = new Cart(); // classes always need `new`
    expect(cart.items).toEqual([]);
  });
});

test.describe('access modifiers and parameter properties', () => {
  test('9.7 🐛 reading a private property (types only)', () => {
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
    expect(user.checkPassword('admin123')).toBe(true); // use the public method, not the private data
  });

  test('9.8 ✍️ the parameter property shortcut', () => {
    class ApiClient {
      constructor(private readonly baseUrl: string) {}

      url(path: string): string {
        return this.baseUrl + path;
      }
    }
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
    // The shortcut really creates the two properties, in the order of the parameters.
    expect(Object.keys(session)).toEqual(['username', 'token']);
    expect(session.token).toBe('token-admin');
  });
});

test.describe('getters and static', () => {
  test('9.10 ✍️ a getter', () => {
    class Cart {
      items: { name: string; price: number; quantity: number }[] = [];

      add(name: string, price: number, quantity = 1): void {
        this.items.push({ name, price, quantity });
      }

      get total(): number {
        return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    }
    const cart = new Cart();
    cart.add('Backpack', 29.99, 2);
    cart.add('Bike Light', 9.99);
    expect(cart.total).toBeCloseTo(69.97, 2); // a getter is read like a property: no ()
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
    expect(run.passRate).toBe(67);
  });

  test('9.12 ✍️ static members: factory methods for test data', () => {
    class TestUser {
      constructor(
        readonly username: string,
        readonly password: string,
        readonly role: string,
      ) {}

      static readonly DEFAULT_PASSWORD = 'secret123';

      static standard(): TestUser {
        return new TestUser('standard_user', TestUser.DEFAULT_PASSWORD, 'user');
      }

      static admin(): TestUser {
        return new TestUser('admin', 'admin123', 'admin');
      }
    }
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
    expect(ApiRequest.count).toBe(3); // ONE counter, shared by the class: every `new` added 1
    expect(last.path).toBe('/api/me');
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
        return `Products · ${super.title()}`; // super.title() = the BasePage version
      }
    }
    const page = new FakePage();
    const productsPage = new ProductsPage(page);
    await productsPage.open(); // inherited from BasePage, uses this.path = '/products'
    expect(productsPage.path).toBe('/products');
    expect(productsPage.title()).toBe('Products · QA Shop');
    expect(page.actions).toEqual(['goto /products']);
  });

  test('9.15 ✍️ write a page that extends BasePage', async () => {
    class CartPage extends BasePage {
      constructor(page: FakePage) {
        super(page, '/cart');
      }

      async checkout(): Promise<void> {
        await this.page.click('Checkout'); // `page` is protected: allowed in a child class
      }
    }
    const page = new FakePage();
    const cartPage = new CartPage(page);
    await cartPage.open();
    await cartPage.checkout();
    expect(page.actions).toEqual(['goto /cart', 'click Checkout']);
  });

  test('9.16 🐛 a child constructor without super', () => {
    class AdminPage extends BasePage {
      readonly heading: string;

      constructor(page: FakePage) {
        super(page, '/admin'); // super(...) must run before any `this`
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
    class CountingReporter implements MiniReporter {
      private passed = 0;
      private failed = 0;

      onTestEnd(title: string, status: string): void {
        if (status === 'passed') this.passed++;
        if (status === 'failed') this.failed++;
      }

      summary(): string {
        return `${this.passed} passed, ${this.failed} failed`;
      }
    }
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
    expect(loginPage instanceof LoginPage).toBe(true);
    expect(loginPage instanceof BasePage).toBe(true); // a LoginPage IS a BasePage (extends)
    expect(home instanceof LoginPage).toBe(false); // but a BasePage is not a LoginPage
  });

  test('9.19 ✍️ your own error class', () => {
    class ApiError extends Error {
      constructor(
        readonly status: number,
        message: string,
      ) {
        super(message);
        this.name = 'ApiError';
      }
    }
    function getProduct(id: number): string {
      if (id > 6) throw new ApiError(404, 'Product not found');
      return 'Backpack';
    }
    expect(() => getProduct(99)).toThrow('Product not found');

    let status = 0;
    try {
      getProduct(99);
    } catch (error) {
      if (error instanceof ApiError) status = error.status; // narrowed to ApiError: .status exists
    }
    expect(status).toBe(404);
  });

  test('9.20 🐛 the lost this', () => {
    class Cart {
      items: string[] = [];

      add(name: string): void {
        this.items.push(name);
      }
    }
    const cart = new Cart();
    ['Backpack', 'Bike Light'].forEach((name) => cart.add(name)); // called WITH `cart.`: this = cart
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
    class LoginPage extends BasePage {
      constructor(page: FakePage) {
        super(page, '/login');
      }

      async login(username: string, password: string): Promise<void> {
        await this.open();
        await this.page.fill('Username', username);
        await this.page.fill('Password', password);
        await this.page.click('Log in');
      }
    }
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
    const fakeTransport: Transport = async (method, path, body) => {
      if (method === 'POST' && path === '/api/login') {
        const { username, password } = body as { username: string; password: string };
        if (username === 'admin' && password === 'admin123') return { status: 200, body: { token: 'token-admin' } };
        return { status: 401, body: { error: 'Invalid username or password' } };
      }
      return { status: 404, body: { error: 'Not found' } };
    };
    class ApiClient {
      private token: string | null = null;

      constructor(private readonly transport: Transport) {}

      get isLoggedIn(): boolean {
        return this.token !== null;
      }

      async login(username: string, password: string): Promise<void> {
        const response = await this.transport('POST', '/api/login', { username, password });
        if (response.status !== 200) {
          throw new Error(`Login failed with status ${response.status}`);
        }
        this.token = (response.body as { token: string }).token;
      }
    }
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
    expect(cart.count).toBe(2);
    expect(cart.total).toBe(37.98);
    expect(cart.isEmpty).toBe(false);
    expect(new ShoppingCart().isEmpty).toBe(true);
  });
});
