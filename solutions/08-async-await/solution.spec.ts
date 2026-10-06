// Module 08 · Async / Await — reference solution
// Run:  npm run solution 08
// Only look here after you tried! If you peek: close this file, wait 5 minutes, write it from memory.

import { test, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// A FAKE API (don't change it). Every function answers after ~20 ms, like a real
// server would. It lets you practise async code without a browser.
// ─────────────────────────────────────────────────────────────────────────────
type User = { id: number; username: string; name: string; role: 'admin' | 'user' };
type Product = { id: number; name: string; price: number; stock: number };
type Cart = { items: { productId: number; quantity: number }[]; total: number };

const USERS: User[] = [
  { id: 1, username: 'standard_user', name: 'Sam Standard', role: 'user' },
  { id: 2, username: 'admin', name: 'Ada Admin', role: 'admin' },
  { id: 3, username: 'locked_user', name: 'Lou Locked', role: 'user' },
];

const PRODUCTS: Product[] = [
  { id: 1, name: 'Backpack', price: 29.99, stock: 10 },
  { id: 2, name: 'Bike Light', price: 9.99, stock: 25 },
  { id: 3, name: 'Bolt T-Shirt', price: 15.99, stock: 40 },
  { id: 4, name: 'Fleece Jacket', price: 49.99, stock: 5 },
  { id: 5, name: 'Onesie', price: 7.99, stock: 0 },
  { id: 6, name: 'Red T-Shirt', price: 15.99, stock: 12 },
];

/** GET /api/users/:id  -> the user, or rejects with 'User <id> not found' */
function fakeFetchUser(id: number): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = USERS.find((u) => u.id === id);
      if (user) resolve({ ...user });
      else reject(new Error(`User ${id} not found`));
    }, 20);
  });
}

/** GET /api/products  -> all products */
function fakeFetchProducts(): Promise<Product[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(PRODUCTS.map((p) => ({ ...p }))), 20);
  });
}

/** POST /api/login  -> a token like 'token-admin', or rejects */
function fakeLogin(username: string, password: string): Promise<string> {
  const passwords: Record<string, string> = { standard_user: 'secret123', admin: 'admin123', locked_user: 'secret123' };
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (passwords[username] !== password) reject(new Error('Invalid username or password'));
      else if (username === 'locked_user') reject(new Error('User is locked'));
      else resolve(`token-${username}`);
    }, 20);
  });
}

/** GET /api/cart (needs a token)  -> the cart of that user, or rejects with 'Unauthorized' */
function fakeGetCart(token: string): Promise<Cart> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (token === 'token-standard_user') resolve({ items: [{ productId: 1, quantity: 2 }], total: 59.98 });
      else if (token === 'token-admin') resolve({ items: [], total: 0 });
      else reject(new Error('Unauthorized'));
    }, 20);
  });
}
// ─────────────────────────────────────────────────────────────────────────────

test.describe('promises and await', () => {
  test('8.1 🔮 an async function always returns a Promise', async () => {
    async function getStatus(): Promise<number> {
      return 200;
    }
    const result = getStatus();
    expect(result instanceof Promise).toBe(true); // even `return 200` is wrapped in a Promise
    expect(await result).toBe(200); // await unwraps it
  });

  test('8.2 🐛 the forgotten await', async () => {
    const user = await fakeFetchUser(1); // without await, user is a Promise and .name is undefined
    expect(user.name).toBe('Sam Standard');
  });

  test('8.3 ✍️ await a value', async () => {
    const admin = await fakeFetchUser(2);
    expect(admin.name).toBe('Ada Admin');
    expect(admin.role).toBe('admin');
  });

  test('8.4 ✍️ write an async function', async () => {
    async function getUserName(id: number): Promise<string> {
      const user = await fakeFetchUser(id);
      return user.name;
    }
    expect(await getUserName(1)).toBe('Sam Standard');
    expect(await getUserName(3)).toBe('Lou Locked');
  });

  test('8.5 ✍️ write an async ARROW function', async () => {
    const getRole = async (id: number): Promise<string> => {
      const user = await fakeFetchUser(id);
      return user.role;
    };
    expect(await getRole(2)).toBe('admin');
    expect(await getRole(1)).toBe('user');
  });

  test('8.6 ✍️ write sleep(ms)', async () => {
    function sleep(ms: number): Promise<void> {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45); // timers can fire a millisecond early
  });

  test('8.7 🔮 in which order do things happen?', async () => {
    const log: string[] = [];
    async function task(): Promise<void> {
      log.push('task started');
      await fakeFetchUser(1);
      log.push('task finished');
    }
    const promise = task(); // runs until its first await, then hands control back
    log.push('after calling task');
    await promise;
    log.push('after await');
    expect(log).toEqual(['task started', 'after calling task', 'task finished', 'after await']);
  });
});

test.describe('errors with async', () => {
  test('8.8 🔮 try / catch with await', async () => {
    let message = 'no error';
    try {
      await fakeFetchUser(99);
      message = 'found it'; // never runs: await threw
    } catch (error) {
      if (error instanceof Error) message = error.message;
    }
    expect(message).toBe('User 99 not found');
  });

  test('8.9 🧪 assert a rejection', async () => {
    // Pass the PROMISE (no arrow) and await the whole expect.
    await expect(fakeFetchUser(99)).rejects.toThrow('User 99 not found');
  });

  test('8.10 🧪 assert what a promise resolves to', async () => {
    await expect(fakeFetchUser(2)).resolves.toMatchObject({ username: 'admin', role: 'admin' });
    expect((await fakeFetchUser(3)).name).toBe('Lou Locked');
  });

  test('8.11 🐛 the catch never runs', async () => {
    async function getUserOrNull(id: number): Promise<User | null> {
      try {
        // `return await`: we wait HERE, inside the try, so a rejection is caught below.
        // Plain `return fakeFetchUser(id)` hands the promise out and the try is already over.
        return await fakeFetchUser(id);
      } catch {
        return null;
      }
    }
    expect(await getUserOrNull(1)).toMatchObject({ name: 'Sam Standard' });
    expect(await getUserOrNull(99)).toBe(null);
  });

  test('8.12 🐛 forEach does not wait', async () => {
    const names: string[] = [];
    const ids = [1, 2, 3];
    for (const id of ids) {
      const user = await fakeFetchUser(id); // for...of really waits here, one by one
      names.push(user.name);
    }
    expect(names).toEqual(['Sam Standard', 'Ada Admin', 'Lou Locked']);
  });
});

test.describe('sequential vs parallel', () => {
  test('8.13 ✍️ two requests at the same time', async () => {
    const [sam, ada] = await Promise.all([fakeFetchUser(1), fakeFetchUser(2)]);
    expect(sam.username).toBe('standard_user');
    expect(ada.username).toBe('admin');
  });

  test('8.14 🔮 how long does it take?', async () => {
    const slow = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

    let start = Date.now();
    await slow(80);
    await slow(80);
    const sequentialMs = Date.now() - start; // ~160 ms: one after the other

    start = Date.now();
    await Promise.all([slow(80), slow(80)]);
    const parallelMs = Date.now() - start; // ~80 ms: both at the same time

    expect(sequentialMs >= 150).toBe(true);
    expect(parallelMs >= 150).toBe(false);
  });

  test('8.15 🐛 Promise.all needs an await too', async () => {
    const users = await Promise.all([fakeFetchUser(1), fakeFetchUser(2)]);
    expect(users.length).toBe(2);
    expect(users[1].name).toBe('Ada Admin');
  });

  test('8.16 ✍️ map + Promise.all', async () => {
    const ids = [3, 1, 2];
    const users = await Promise.all(ids.map((id) => fakeFetchUser(id)));
    // Promise.all keeps the order of the input, even if some answers arrive earlier.
    expect(users.map((user) => user.name)).toEqual(['Lou Locked', 'Sam Standard', 'Ada Admin']);
  });
});

test.describe('helpers you will meet in real projects', () => {
  test('8.17 ✍️ a polling helper (how auto-waiting works)', async () => {
    async function waitUntil(condition: () => boolean, timeoutMs: number): Promise<void> {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        if (condition()) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      throw new Error(`Timed out after ${timeoutMs}ms`);
    }
    let ready = false;
    setTimeout(() => {
      ready = true;
    }, 50);
    await waitUntil(() => ready, 1000);
    expect(ready).toBe(true);

    await expect(waitUntil(() => false, 50)).rejects.toThrow('Timed out after 50ms');
  });

  test('8.18 ✍️ a timeout with Promise.race', async () => {
    function withTimeout(promise: Promise<User>, ms: number): Promise<User> {
      const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms));
      return Promise.race([promise, timeout]); // whichever settles first wins
    }
    const slowUser = new Promise<User>((resolve) => setTimeout(() => resolve(USERS[0]), 200));
    await expect(withTimeout(fakeFetchUser(1), 100)).resolves.toMatchObject({ name: 'Sam Standard' });
    await expect(withTimeout(slowUser, 50)).rejects.toThrow('Timeout after 50ms');
  });

  test('8.19 🐛 old .then() code that loses the value', async () => {
    const name = await fakeFetchUser(1).then((user) => {
      return user.name; // or without braces: .then((user) => user.name)
    });
    expect(name).toBe('Sam Standard');
  });

  test('8.20 ✍️ rewrite a .then() chain with await', async () => {
    const user = await fakeFetchUser(2);
    const shout = user.role.toUpperCase();
    expect(shout).toBe('ADMIN');
  });
});

test.describe('combine everything', () => {
  test('8.21 ✍️ login, then load the cart (sequential, with errors)', async () => {
    async function cartSummary(username: string, password: string): Promise<string> {
      try {
        const token = await fakeLogin(username, password);
        const cart = await fakeGetCart(token); // needs the token, so it must wait for the login
        return `Total: $${cart.total}`;
      } catch (error) {
        if (error instanceof Error) return `Error: ${error.message}`;
      }
      return 'Error: unknown';
    }
    expect(await cartSummary('standard_user', 'secret123')).toBe('Total: $59.98');
    expect(await cartSummary('admin', 'admin123')).toBe('Total: $0');
    expect(await cartSummary('locked_user', 'secret123')).toBe('Error: User is locked');
    expect(await cartSummary('admin', 'wrong')).toBe('Error: Invalid username or password');
  });

  test('8.22 ✍️ load a dashboard (parallel)', async () => {
    async function loadDashboard(userId: number): Promise<{ greeting: string; inStock: number }> {
      // user and products don't depend on each other: load them at the same time
      const [user, products] = await Promise.all([fakeFetchUser(userId), fakeFetchProducts()]);
      return {
        greeting: `Hello, ${user.name}!`,
        inStock: products.filter((product) => product.stock > 0).length,
      };
    }
    expect(await loadDashboard(1)).toEqual({ greeting: 'Hello, Sam Standard!', inStock: 5 });
    await expect(loadDashboard(99)).rejects.toThrow('User 99 not found');
  });

  test('8.23 🧪 assert the login API', async () => {
    await expect(fakeLogin('locked_user', 'secret123')).rejects.toThrow('User is locked');
    await expect(fakeLogin('admin', 'wrong')).rejects.toThrow('Invalid username or password');
    await expect(fakeLogin('admin', 'admin123')).resolves.toBe('token-admin');
  });

  test('8.24 ✍️ retry an async action', async () => {
    async function retryAsync(action: () => Promise<boolean>, maxAttempts: number): Promise<number> {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        if (await action()) return attempt; // await INSIDE the loop: one attempt at a time
      }
      throw new Error(`Failed after ${maxAttempts} attempts`);
    }
    let calls = 0;
    const flakyCheck = async (): Promise<boolean> => {
      calls++;
      await fakeFetchUser(1);
      return calls >= 2; // fails once, then works
    };
    expect(await retryAsync(flakyCheck, 3)).toBe(2);

    const alwaysFalse = async (): Promise<boolean> => false;
    await expect(retryAsync(alwaysFalse, 3)).rejects.toThrow('Failed after 3 attempts');
  });
});
