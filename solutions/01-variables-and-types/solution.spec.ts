// Module 01 · Variables and Types — reference solution
// Run:  npm run solution 01
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test.describe('typeof', () => {
  test('1.1 🔮 typeof a string', () => {
    expect(typeof 'standard_user').toBe('string');
  });

  test('1.2 🔮 typeof a whole number', () => {
    expect(typeof 404).toBe('number');
  });

  test('1.3 🔮 typeof a decimal number', () => {
    // There is only ONE number type. No int/float/double like in other languages.
    expect(typeof 29.99).toBe('number');
  });

  test('1.4 🔮 typeof true', () => {
    expect(typeof true).toBe('boolean');
  });

  test('1.5 🔮 a variable with no value', () => {
    let token;
    expect(typeof token).toBe('undefined'); // typeof always returns a STRING
    expect(token).toBe(undefined); // the value itself is undefined (no quotes)
  });

  test('1.6 🔮 the famous bug', () => {
    expect(typeof null).toBe('object');
  });
});

test.describe('const and let', () => {
  test('1.7 ✍️ declare a constant with a type annotation', () => {
    const baseUrl: string = 'http://localhost:3000';
    expect(baseUrl).toBe('http://localhost:3000');
  });

  test('1.8 ✍️ declare a boolean', () => {
    const isHeadless: boolean = true;
    expect(isHeadless).toBe(true);
  });

  test('1.9 🐛 this value needs to change', () => {
    let counter = 0; // const -> let, because we reassign it below
    counter = counter + 1;
    expect(counter).toBe(1);
  });

  test('1.10 ✍️ let and ++', () => {
    let retries: number = 0;
    retries++;
    retries++;
    retries++;
    expect(retries).toBe(3);
  });

  test('1.11 🔮 += and -=', () => {
    let score = 10;
    score += 5; // 15
    score -= 3; // 12
    score++; // 13
    expect(score).toBe(13);
  });

  test('1.12 🔮 scope', () => {
    const message = 'outside';
    if (true) {
      const message = 'inside';
      expect(message).toBe('inside');
    }
    expect(message).toBe('outside'); // the inner message died at the closing }
  });
});

test.describe('types and annotations', () => {
  test('1.13 🐛 the type annotation is wrong (types only)', () => {
    const port: number = 3000;
    expect(port).toBe(3000);
  });

  test('1.14 🐛 a let changes type', () => {
    let status = 404;
    status = 200;
    expect(status).toBe(200);
  });

  test('1.15 ✍️ declare now, assign later', () => {
    let username: string;
    username = 'admin';
    expect(username).toBe('admin');
  });

  test('1.16 ✍️ UPPER_SNAKE_CASE constant', () => {
    const DEFAULT_TIMEOUT = 30_000;
    expect(DEFAULT_TIMEOUT).toBe(30000);
  });
});

test.describe('comparisons', () => {
  test('1.17 🔮 strict equality', () => {
    const status: number = 200;
    const statusText: string = '200';
    expect(status === 200).toBe(true);
    // @ts-expect-error - TypeScript warns: a number and a string can never be strictly equal
    expect(status === statusText).toBe(false);
    expect(status !== 404).toBe(true);
  });

  test('1.18 🧪 write the assertions', () => {
    const user = 'standard_user';
    const loginAttempts = 2 + 1;
    const isLocked = false;
    expect(user).toBe('standard_user');
    expect(loginAttempts).toBe(3);
    expect(isLocked).toBe(false);
  });

  test('1.19 🧪 assert the type', () => {
    const timeout = 5_000;
    expect(typeof timeout).toBe('number');
  });
});
