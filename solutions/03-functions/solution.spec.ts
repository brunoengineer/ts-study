// Module 03 · Functions — reference solution
// Run:  npm run solution 03
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('function declarations', () => {
  test('3.1 🔮 call a function', () => {
    function double(n: number): number {
      return n * 2;
    }
    expect(double(21)).toBe(42);
    expect(double(double(5))).toBe(20); // inside first: double(5) = 10, then double(10) = 20
  });

  test('3.2 ✍️ your first function', () => {
    function greet(name: string): string {
      return `Hello, ${name}!`;
    }
    expect(greet('Sam')).toBe('Hello, Sam!');
    expect(greet('Ada')).toBe('Hello, Ada!');
  });

  test('3.3 🐛 the function gives back nothing', () => {
    function add(a: number, b: number): number {
      return a + b; // without return, the function gives back undefined
    }
    expect(add(2, 3)).toBe(5);
  });

  test('3.4 🐛 the parameter has no type (types only)', () => {
    function formatPrice(price: number): string {
      return `$${price.toFixed(2)}`;
    }
    expect(formatPrice(29.99)).toBe('$29.99');
  });

  test('3.5 ✍️ formatPrice', () => {
    function formatPrice(price: number): string {
      return `$${price.toFixed(2)}`;
    }
    expect(formatPrice(29.99)).toBe('$29.99');
    expect(formatPrice(7.5)).toBe('$7.50');
    expect(formatPrice(10)).toBe('$10.00');
  });

  test('3.6 🔮 the order of the arguments', () => {
    function buildUrl(baseUrl: string, path: string): string {
      return `${baseUrl}${path}`;
    }
    expect(buildUrl('http://localhost:3000', '/login')).toBe('http://localhost:3000/login');
    // Arguments are matched by POSITION, not by name. Both are strings, so TypeScript can't help here.
    expect(buildUrl('/login', 'http://localhost:3000')).toBe('/loginhttp://localhost:3000');
  });
});

test.describe('arrow functions', () => {
  test('3.7 🔮 an arrow with an expression body', () => {
    const square = (n: number): number => n * n;
    const isAdmin = (role: string): boolean => role === 'admin';
    expect(square(4)).toBe(16);
    expect(isAdmin('admin')).toBe(true);
    expect(isAdmin('Admin')).toBe(false); // === is case-sensitive
  });

  test('3.8 ✍️ write an arrow function', () => {
    const buildProductUrl = (id: number): string => `http://localhost:3000/products/${id}`;
    expect(buildProductUrl(4)).toBe('http://localhost:3000/products/4');
  });

  test('3.9 🐛 the arrow has { } but no return', () => {
    // Option 1: keep the block body and add return
    const getSubtotal = (price: number, quantity: number): number => {
      return price * quantity;
    };
    // Option 2 (shorter): expression body, return is automatic
    // const getSubtotal = (price: number, quantity: number): number => price * quantity;
    expect(getSubtotal(10, 3)).toBe(30);
  });

  test('3.10 ✍️ an arrow with a block body', () => {
    const applyDiscount = (price: number, percent: number): number => {
      const discount = (price * percent) / 100;
      return price - discount;
    };
    expect(applyDiscount(50, 10)).toBe(45);
    expect(applyDiscount(80, 25)).toBe(60);
  });

  test('3.11 🐛 returning an object from an arrow', () => {
    const makeUser = (name: string) => ({ username: name }); // ( ) around the object
    expect(makeUser('standard_user')).toEqual({ username: 'standard_user' });
  });
});

test.describe('optional and default parameters', () => {
  test('3.12 🔮 a default parameter', () => {
    function buildUrl(path: string, baseUrl: string = 'http://localhost:3000'): string {
      return `${baseUrl}${path}`;
    }
    expect(buildUrl('/cart')).toBe('http://localhost:3000/cart'); // default used
    expect(buildUrl('/cart', 'https://staging.qa-shop.com')).toBe('https://staging.qa-shop.com/cart');
  });

  test('3.13 🔮 an optional parameter', () => {
    function describeUser(name: string, role?: string): string {
      return `${name} (${role})`;
    }
    expect(describeUser('Ada', 'admin')).toBe('Ada (admin)');
    expect(describeUser('Sam')).toBe('Sam (undefined)'); // an optional parameter you don't pass is undefined
  });

  test('3.14 ✍️ randomEmail with a default domain', () => {
    const randomEmail = (domain: string = 'test.com'): string => `user_${Date.now()}@${domain}`;
    expect(randomEmail()).toMatch(/^user_\d+@test\.com$/);
    expect(randomEmail('qa-shop.com')).toMatch(/^user_\d+@qa-shop\.com$/);
  });

  test('3.15 🔮 void', () => {
    function logStep(step: string): void {
      console.log(`STEP: ${step}`);
    }
    const result = logStep('open the login page');
    expect(result).toBe(undefined); // a function without return gives back undefined
  });
});

test.describe('functions as values', () => {
  test('3.16 🔮 fn vs fn()', () => {
    function getBaseUrl(): string {
      return 'http://localhost:3000';
    }
    expect(typeof getBaseUrl).toBe('function'); // the recipe
    expect(typeof getBaseUrl()).toBe('string'); // the result of running it
  });

  test('3.17 🐛 the function is never called', () => {
    function getBaseUrl(): string {
      return 'http://localhost:3000';
    }
    const url: string = getBaseUrl(); // ( ) = call it
    expect(url).toBe('http://localhost:3000');
  });

  test('3.18 ✍️ pass a function (a callback)', () => {
    function applyRule(price: number, rule: (p: number) => number): number {
      return rule(price);
    }
    const halfPrice = (p: number): number => p / 2;
    const withShipping = applyRule(20, (p) => p + 5); // p is a number: TypeScript knows it from applyRule's type
    const half = applyRule(50, halfPrice); // no ( ) after halfPrice: we GIVE the function, applyRule calls it
    expect(withShipping).toBe(25);
    expect(half).toBe(25);
  });

  test('3.19 ✍️ a function type', () => {
    const toCents: (price: number) => number = (price) => Math.round(price * 100);
    // Math.round is needed: 29.99 * 100 is 2998.9999999999995 (module 02, decimals)
    expect(toCents(29.99)).toBe(2999);
    expect(toCents(7.5)).toBe(750);
  });

  test('3.20 🔮 rest parameters', () => {
    function sum(...numbers: number[]): number {
      let total = 0;
      for (const n of numbers) {
        total += n;
      }
      return total;
    }
    expect(sum(1, 2, 3)).toBe(6);
    expect(sum(10)).toBe(10);
    expect(sum()).toBe(0); // no numbers: the loop never runs, total stays 0
  });
});

test.describe('combine everything: the tester toolbox', () => {
  test('3.21 ✍️ isValidEmail', () => {
    const isValidEmail = (email: string): boolean => /^\S+@\S+\.\S+$/.test(email);
    expect(isValidEmail('sam@test.com')).toBe(true);
    expect(isValidEmail('sam.test.com')).toBe(false);
    expect(isValidEmail('sam@test')).toBe(false);
    expect(isValidEmail('sam @test.com')).toBe(false);
  });

  test('3.22 ✍️ parsePrice', () => {
    function parsePrice(text: string): number {
      return parseFloat(text.slice(text.indexOf('$') + 1)); // +1 = start AFTER the $
    }
    // Also fine: const parsePrice = (text: string): number => parseFloat(text.replace(/[^\d.]/g, ''));
    expect(parsePrice('$29.99')).toBe(29.99);
    expect(parsePrice('Total: $59.98')).toBe(59.98);
    expect(parsePrice('Subtotal: $7.50')).toBe(7.5);
  });

  test('3.23 🧪 test the helpers', () => {
    const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
    const parsePrice = (text: string): number => parseFloat(text.replace(/[^\d.]/g, ''));
    expect(parsePrice(formatPrice(15.99))).toBe(15.99); // read inside-out: format first, then parse
    expect(formatPrice(parsePrice('Total: $59.98') / 2)).toBe('$29.99');
  });

  test('3.24 🐛 a helper called the wrong way', () => {
    function buildProductUrl(id: number, baseUrl: string = 'http://localhost:3000'): string {
      return `${baseUrl}/products/${id}`;
    }
    const url = buildProductUrl(4, 'https://staging.qa-shop.com'); // same order as the definition: id first
    expect(url).toBe('https://staging.qa-shop.com/products/4');
  });
});
