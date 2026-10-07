import { test, expect } from '@playwright/test';

const baseUrl: string = 'http://www.test.com';
const headless: boolean = true;

test('kata module 01', () => {
    let retries: number = 0;

    retries++;

    expect(retries).toBe(1);
    expect(typeof baseUrl).toBe('string');
    expect(headless).toBe(true);
});
