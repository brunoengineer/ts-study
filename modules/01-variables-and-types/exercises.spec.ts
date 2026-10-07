// Module 01 · Variables and Types
// Run:  npm run check 01
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test.describe('typeof', () => {
  test('1.1 🔮 typeof a string', () => {
    expect(typeof 'standard_user').toBe('string');
  });

  test('1.2 🔮 typeof a whole number', () => {
    expect(typeof 404).toBe('number');
  });

  test('1.3 🔮 typeof a decimal number', () => {
    // Careful: is there a different type for decimals?
    expect(typeof 29.99).toBe('number');
  });

  test('1.4 🔮 typeof true', () => {
    expect(typeof true).toBe('boolean');
  });

  test('1.5 🔮 a variable with no value', () => {
    let token;
    expect(typeof token).toBe('undefined');
    expect(token).toBe(undefined);
  });

  test('1.6 🔮 the famous bug', () => {
    expect(typeof null).toBe('object');
  });
});

test.describe('const and let', () => {
  test('1.7 ✍️ declare a constant with a type annotation', () => {
    // Declare a constant called baseUrl, OF TYPE string, with the value 'http://localhost:3000'
    // ✍️ your code here

    const baseUrl: string = 'http://localhost:3000';
    expect(baseUrl).toBe('http://localhost:3000');
  });

  test('1.8 ✍️ declare a boolean', () => {
    // Declare a constant called isHeadless, of type boolean, with the value true
    // ✍️ your code here

    const isHeadless: boolean = true;
    expect(isHeadless).toBe(true);
  });

  test('1.9 🐛 this value needs to change', () => {
    // Run it and read the error (and the red squiggle). Then fix the declaration, not the assignment.
    let counter = 0;
    counter = counter + 1;
    expect(counter).toBe(1);
  });

  test('1.10 ✍️ let and ++', () => {
    // Declare a variable called retries (it must be able to change), of type number, starting at 0.
    // Then add 1 to it THREE times using ++
    // ✍️ your code here

    let retries: number = 0;
    retries++;
    retries++;
    retries++;
    expect(retries).toBe(3);
  });

  test('1.11 🔮 += and -=', () => {
    let score = 10;
    score += 5;
    score -= 3;
    score++;
    expect(score).toBe(13);
  });

  test('1.12 🔮 scope', () => {
    const message = 'outside';
    if (true) {
      const message = 'inside';
      expect(message).toBe('inside');
    }
    expect(message).toBe('outside');
  });
});

test.describe('types and annotations', () => {
  test('1.13 🐛 the type annotation is wrong (types only)', () => {
    // The test passes already! But VS Code shows a red squiggle (and check shows a type error).
    // Fix the TYPE ANNOTATION so TypeScript is happy too.
    const port: number = 3000;
    expect(port).toBe(3000);
  });

  test('1.14 🐛 a let changes type', () => {
    // TypeScript inferred `status` as a number. Now someone tries to store a string in it.
    // Fix it by storing the NUMBER 200 instead of the string '200'.
    let status = 404;
    status = 200;
    expect(status).toBe(200);
  });

  test('1.15 ✍️ declare now, assign later', () => {
    // Declare a variable called `username` OF TYPE string WITHOUT a value (no = ...).
    // Then, on the next line, assign it the value 'admin'.
    // ✍️ your code here

    let username: string;
    username = 'admin';
    expect(username).toBe('admin');
  });

  test('1.16 ✍️ UPPER_SNAKE_CASE constant', () => {
    // Fixed config values are written in UPPER_SNAKE_CASE.
    // Declare DEFAULT_TIMEOUT = 30 seconds in milliseconds. Use the _ separator for readability.
    // ✍️ your code here

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
    // Write THREE assertions:
    //  - user is 'standard_user'
    //  - loginAttempts is 3
    //  - isLocked is false

    // ✍️ your code here
    expect(user).toBe('standard_user');
    expect(loginAttempts).toBe(3);
    expect(isLocked).toBe(false);
  });

  test('1.19 🧪 assert the type', () => {
    const timeout = 5_000;
    // Write an assertion that checks that the TYPE of timeout is 'number'
    // (Hint: what goes inside expect(...)? Not timeout itself...)
    // ✍️ your code here

    expect(typeof timeout).toBe('number');
  });
});
