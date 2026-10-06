// Module 00 · Start Here — reference solution
// Run:  npm run solution 00
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

test('0.1 🔮 replace the blank with true', () => {
  expect(true).toBe(true);
});

test('0.2 🔮 numbers', () => {
  expect(2 + 3).toBe(5);
});

test('0.3 🔮 joining text', () => {
  // A string needs quotes. 'Playwright' (with quotes) is text; Playwright (without) would be a variable name.
  expect('Play' + 'wright').toBe('Playwright');
});

test('0.4 🐛 fix the expected value', () => {
  // Received was 6, so the expected value must be 6.
  expect(10 - 4).toBe(6);
});

test('0.5 ✍️ your first line of code', () => {
  const myName = 'Ada';
  expect(myName.length).toBeGreaterThan(0);
});

test('0.6 🧪 your first assertion', () => {
  const tool = 'Playwright';
  expect(tool).toBe('Playwright');
});

test('0.7 🧪 assert a calculation', () => {
  const total = 3 * 7;
  expect(total).toBe(21);
});

test('0.8 🔮 how many items?', () => {
  expect(['login', 'search', 'checkout']).toHaveLength(3);
});

test('0.9 🐛 not', () => {
  expect(1 + 1).not.toBe(3);
});

test('0.10 ✍️ write a whole test body', () => {
  const greeting = 'hello';
  expect(greeting.toUpperCase()).toBe('HELLO');
});
