// Module 00 · Start Here
// Run:  npm run check 00
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

test('0.1 🔮 replace the blank with true', () => {
  // Replace ___ with: true   (no quotes!)
  expect(true).toBe(true);
});

test('0.2 🔮 numbers', () => {
  // What is 2 + 3?
  expect(2 + 3).toBe(5);
});

test('0.3 🔮 joining text', () => {
  // Text in quotes is called a "string". + glues two strings together.
  // Your answer must also be a string, so it needs quotes: 'like this'
  expect('Play' + 'wright').toBe('Playwright');
});

test('0.4 🐛 fix the expected value', () => {
  // This assertion is wrong. Run the check, read "Expected" and "Received", then fix it.
  expect(10 - 4).toBe(6);
});

test('0.5 ✍️ your first line of code', () => {
  // Create a constant called myName that holds your name as a string.
  // Example of the shape:   const city = 'Lisbon';
  // ✍️ your code here

  const myName = 'Bruno';
  expect(myName.length).toBeGreaterThan(0);
});

test('0.6 🧪 your first assertion', () => {
  const tool = 'Playwright';
  // Write an assertion that checks that `tool` is 'Playwright'.
  // Shape:   expect(actual).toBe(expected);
  // ✍️ your code here

  expect(tool).toBe('Playwright');
});

test('0.7 🧪 assert a calculation', () => {
  const total = 3 * 7;
  // Write an assertion that checks that `total` is 21.
  // ✍️ your code here

  expect(total).toBe(21);
});

test('0.8 🔮 how many items?', () => {
  // [ ] is a list (an "array"). toHaveLength checks how many items it has.
  expect(['login', 'search', 'checkout']).toHaveLength(3);
});

test('0.9 🐛 not', () => {
  // .not flips any matcher:   expect(a).not.toBe(b)   ->  "expect a NOT to be b"
  // This test fails. Add .not so it reads: "expect 1 + 1 NOT to be 3"
  expect(1 + 1).not.toBe(3);
});

test('0.10 ✍️ write a whole test body', () => {
  // Create a constant called `greeting` with the value 'hello'
  // Then write an assertion that greeting.toUpperCase() is 'HELLO'
  // ✍️ your code here

  const greeting = 'hello';

  expect(greeting.toUpperCase()).toBe('HELLO');
});
