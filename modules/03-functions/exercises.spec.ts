// Module 03 · Functions
// Run:  npm run check 03
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('function declarations', () => {
  test('3.1 🔮 call a function', () => {
    function double(n: number): number {
      return n * 2;
    }
    expect(double(21)).toBe(___);
    expect(double(double(5))).toBe(___);
  });

  test('3.2 ✍️ your first function', () => {
    // Write a function DECLARATION called greet.
    // It takes a parameter `name` of type string and returns a string: 'Hello, ' + name + '!'
    // Shape: function greet(name: string): string { return ...; }
    // ✍️ your code here

    todo();
    expect(greet('Sam')).toBe('Hello, Sam!');
    expect(greet('Ada')).toBe('Hello, Ada!');
  });

  test('3.3 🐛 the function gives back nothing', () => {
    // Read the Received value and the red squiggle. What is missing inside the function?
    function add(a: number, b: number): number {
      a + b;
    }
    expect(add(2, 3)).toBe(5);
  });

  test('3.4 🐛 the parameter has no type (types only)', () => {
    // The test passes, but TypeScript complains: "Parameter 'price' implicitly has an 'any' type."
    // Give the parameter a type, and give the function a return type too.
    function formatPrice(price) {
      return `$${price.toFixed(2)}`;
    }
    expect(formatPrice(29.99)).toBe('$29.99');
  });

  test('3.5 ✍️ formatPrice', () => {
    // Write a function DECLARATION formatPrice: takes price (number), returns a string like '$7.50'.
    // (Module 02: template literal + toFixed(2).)
    // ✍️ your code here

    todo();
    expect(formatPrice(29.99)).toBe('$29.99');
    expect(formatPrice(7.5)).toBe('$7.50');
    expect(formatPrice(10)).toBe('$10.00');
  });

  test('3.6 🔮 the order of the arguments', () => {
    function buildUrl(baseUrl: string, path: string): string {
      return `${baseUrl}${path}`;
    }
    expect(buildUrl('http://localhost:3000', '/login')).toBe(___);
    expect(buildUrl('/login', 'http://localhost:3000')).toBe(___);
  });
});

test.describe('arrow functions', () => {
  test('3.7 🔮 an arrow with an expression body', () => {
    const square = (n: number): number => n * n;
    const isAdmin = (role: string): boolean => role === 'admin';
    expect(square(4)).toBe(___);
    expect(isAdmin('admin')).toBe(___);
    expect(isAdmin('Admin')).toBe(___);
  });

  test('3.8 ✍️ write an arrow function', () => {
    // Write an ARROW function in a constant called buildProductUrl.
    // It takes id (number) and returns a string: 'http://localhost:3000/products/' + id
    // Use an expression body (no { }, no return).
    // Shape: const buildProductUrl = (id: number): string => `...`;
    // ✍️ your code here

    todo();
    expect(buildProductUrl(4)).toBe('http://localhost:3000/products/4');
  });

  test('3.9 🐛 the arrow has { } but no return', () => {
    const getSubtotal = (price: number, quantity: number): number => {
      price * quantity;
    };
    expect(getSubtotal(10, 3)).toBe(30);
  });

  test('3.10 ✍️ an arrow with a block body', () => {
    // Write an ARROW function applyDiscount with a BLOCK body ({ } and return).
    // It takes price (number) and percent (number) and returns the price minus the discount.
    // Inside, first create `const discount = price * percent / 100;` then return the new price.
    // ✍️ your code here

    todo();
    expect(applyDiscount(50, 10)).toBe(45);
    expect(applyDiscount(80, 25)).toBe(60);
  });

  test('3.11 🐛 returning an object from an arrow', () => {
    // We expect an object back, but we get undefined. The { } is read as a block body!
    // Fix it with the trick from lesson section 4. (toEqual compares the content of objects, see module 05.)
    const makeUser = (name: string) => { username: name };
    expect(makeUser('standard_user')).toEqual({ username: 'standard_user' });
  });
});

test.describe('optional and default parameters', () => {
  test('3.12 🔮 a default parameter', () => {
    function buildUrl(path: string, baseUrl: string = 'http://localhost:3000'): string {
      return `${baseUrl}${path}`;
    }
    expect(buildUrl('/cart')).toBe(___);
    expect(buildUrl('/cart', 'https://staging.qa-shop.com')).toBe(___);
  });

  test('3.13 🔮 an optional parameter', () => {
    function describeUser(name: string, role?: string): string {
      return `${name} (${role})`;
    }
    expect(describeUser('Ada', 'admin')).toBe(___);
    expect(describeUser('Sam')).toBe(___);
  });

  test('3.14 ✍️ randomEmail with a default domain', () => {
    // Write an ARROW function randomEmail. It takes domain (string) with the DEFAULT value 'test.com'
    // and returns `user_` + Date.now() + `@` + domain.
    // Shape: const randomEmail = (domain: string = '...'): string => `...`;
    // ✍️ your code here

    todo();
    expect(randomEmail()).toMatch(/^user_\d+@test\.com$/);
    expect(randomEmail('qa-shop.com')).toMatch(/^user_\d+@qa-shop\.com$/);
  });

  test('3.15 🔮 void', () => {
    function logStep(step: string): void {
      console.log(`STEP: ${step}`);
    }
    const result = logStep('open the login page');
    expect(result).toBe(___);
  });
});

test.describe('functions as values', () => {
  test('3.16 🔮 fn vs fn()', () => {
    function getBaseUrl(): string {
      return 'http://localhost:3000';
    }
    expect(typeof getBaseUrl).toBe(___);
    expect(typeof getBaseUrl()).toBe(___);
  });

  test('3.17 🐛 the function is never called', () => {
    function getBaseUrl(): string {
      return 'http://localhost:3000';
    }
    // Read the Received value, then the red squiggle on the next line.
    const url: string = getBaseUrl;
    expect(url).toBe('http://localhost:3000');
  });

  test('3.18 ✍️ pass a function (a callback)', () => {
    function applyRule(price: number, rule: (p: number) => number): number {
      return rule(price);
    }
    // 1. Create a constant halfPrice: an arrow that takes p (number) and returns p / 2.
    // 2. Create a constant withShipping = applyRule(20, ...) where ... is an arrow written right there
    //    that adds 5 to p.
    // 3. Create a constant half = applyRule(50, halfPrice)   <- pass halfPrice, don't call it!
    // ✍️ your code here

    todo();
    expect(withShipping).toBe(25);
    expect(half).toBe(25);
  });

  test('3.19 ✍️ a function type', () => {
    // Declare a constant toCents, OF TYPE "a function that takes price (number) and returns a number".
    // Its value: an arrow that returns Math.round(price * 100).
    // Shape: const toCents: (price: number) => number = (price) => ...;
    // ✍️ your code here

    todo();
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
    expect(sum(1, 2, 3)).toBe(___);
    expect(sum(10)).toBe(___);
    expect(sum()).toBe(___);
  });
});

test.describe('combine everything: the tester toolbox', () => {
  test('3.21 ✍️ isValidEmail', () => {
    // Write an ARROW function isValidEmail: takes email (string), returns a boolean.
    // Use this regex with .test(): /^\S+@\S+\.\S+$/
    // ✍️ your code here

    todo();
    expect(isValidEmail('sam@test.com')).toBe(true);
    expect(isValidEmail('sam.test.com')).toBe(false);
    expect(isValidEmail('sam@test')).toBe(false);
    expect(isValidEmail('sam @test.com')).toBe(false);
  });

  test('3.22 ✍️ parsePrice', () => {
    // Write a function parsePrice (declaration or arrow, your choice): takes text (string), returns a number.
    // It must work for all the texts below. Idea: keep only what comes AFTER the '$'
    // (indexOf + slice), then parseFloat. Or: replace(/[^\d.]/g, '') then parseFloat.
    // ✍️ your code here

    todo();
    expect(parsePrice('$29.99')).toBe(29.99);
    expect(parsePrice('Total: $59.98')).toBe(59.98);
    expect(parsePrice('Subtotal: $7.50')).toBe(7.5);
  });

  test('3.23 🧪 test the helpers', () => {
    const formatPrice = (price: number): string => `$${price.toFixed(2)}`;
    const parsePrice = (text: string): number => parseFloat(text.replace(/[^\d.]/g, ''));
    // Write TWO assertions:
    //  - formatting 15.99 and then parsing the result gives back the number 15.99
    //    (call parsePrice WITH the result of formatPrice: parsePrice(formatPrice(...)))
    //  - parsing 'Total: $59.98', dividing by 2 and formatting it gives '$29.99'
    // ✍️ your code here

    todo();
  });

  test('3.24 🐛 a helper called the wrong way', () => {
    function buildProductUrl(id: number, baseUrl: string = 'http://localhost:3000'): string {
      return `${baseUrl}/products/${id}`;
    }
    // The call below is wrong. Read the red squiggle. Fix the CALL, not the function.
    const url = buildProductUrl('https://staging.qa-shop.com', 4);
    expect(url).toBe('https://staging.qa-shop.com/products/4');
  });
});
