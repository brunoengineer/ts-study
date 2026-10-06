# Hints · Module 09

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**9.1** The constructor stores the two values with `this.`. And what kind of thing is an instance? (`typeof` gives a string.)

**9.2** `class Product { name: string; price: number; constructor(name: string, price: number) { this.name = name; ... } }`

**9.3** `name = name` assigns the parameter to itself. To store it on the object you need one more word in front.

**9.4** A property with a default: `items: string[] = [];`. Methods use `this.items`. `clear()` can do `this.items = [];`.

**9.5** `a` and `b` are two different objects. Count the `increment()` calls for each one.

**9.6** Classes can only be created with one special word.

**9.7** Replace the assertion with `expect(user.checkPassword('admin123')).toBe(true);`

**9.8** `class ApiClient { constructor(private readonly baseUrl: string) {} url(path: string): string { return ...; } }`. Inside a method, reach the property with `this.baseUrl`.

**9.9** A parameter property creates a real property for each parameter, in order. `Object.keys(...)` gives an array of strings.

**9.10** `get total(): number { return this.items.reduce((sum, item) => sum + item.price * item.quantity, 0); }`. Then delete `todo();`.

**9.11** A getter is read like a property. Remove something from `run.passRate()`.

**9.12** Inside the class: `static readonly DEFAULT_PASSWORD = 'secret123';` and `static standard(): TestUser { return new TestUser(...); }` (and the same for `admin`).

**9.13** `static count` belongs to the class, so there is only ONE count, shared by every `new`. How many times was `new ApiRequest` called?

**9.14** `open()` comes from BasePage but uses `this.path`, which the child set with `super`. `super.title()` is the BasePage version.

**9.15** `class CartPage extends BasePage { constructor(page: FakePage) { super(page, '/cart'); } async checkout(): Promise<void> { await this.page.click('Checkout'); } }`

**9.16** Add `super(page, '/admin');` as the FIRST line of the constructor.

**9.17** `class CountingReporter implements MiniReporter { private passed = 0; ... onTestEnd(title: string, status: string): void { if (status === 'passed') this.passed++; ... } summary(): string { return ...; } }`

**9.18** `instanceof` is true for the class itself and for every class it extends. Not the other way round.

**9.19** `class ApiError extends Error { constructor(readonly status: number, message: string) { super(message); this.name = 'ApiError'; } }`

**9.20** Change `.forEach(cart.add)` to `.forEach((name) => cart.add(name))`.

**9.21** Like 9.15, with a `login` method that has 4 `await` lines: `this.open()`, `this.page.fill(...)` twice, `this.page.click(...)`.

**9.22** Order inside the class: `private token: string | null = null;`, the constructor, `get isLoggedIn(): boolean { return this.token !== null; }`, then the `async login(...)` method from the comment.

**9.23** Four lines of `expect(...).toBe(...)`. Getters have no `()`: `cart.count`, `cart.total`, `cart.isEmpty`, `new ShoppingCart().isEmpty`.
