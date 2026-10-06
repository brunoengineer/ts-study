// Test data: unique values and builders with sensible defaults.
import { randomUUID } from 'node:crypto';
import type { NewProduct } from './types';

/** 'order' -> 'order-1767712345678-3f9a1c2b' (different every call) */
export function uniqueName(prefix: string): string {
  return `${prefix}-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

/** A valid product for POST /api/products. Override only what your test cares about. */
export function buildProduct(overrides: Partial<NewProduct> = {}): NewProduct {
  return {
    name: uniqueName('Product'),
    price: 9.99,
    category: 'other',
    stock: 10,
    description: 'Created by an automated test',
    ...overrides,
  };
}
