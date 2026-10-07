import { test, expect } from '@playwright/test';

test ('my first kata', () => {
    const total = 10 + 5;

    expect(total).toBe(15);
});