// Module 08 · Async / Await
// Run:  npm run check 08
//
// 🔮 Predict  -> replace ___ with your answer
// ✍️ Write    -> write the missing code, then delete the todo() line
// 🐛 Fix      -> find the bug and fix it
// 🧪 Assert   -> write the missing expect(...) line, then delete the todo() line

import { test, expect } from '@playwright/test';
import { ___, todo } from '../../helpers/blank';

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
    expect(result instanceof Promise).toBe(___);
    expect(await result).toBe(___);
  });

  test('8.2 🐛 the forgotten await', async () => {
    // Read the red squiggle on .name, run it, and look at "Received".
    const user = fakeFetchUser(1);
    expect(user.name).toBe('Sam Standard');
  });

  test('8.3 ✍️ await a value', async () => {
    // Get the user with id 2 from fakeFetchUser and store it in a constant called admin.
    // ✍️ your code here

    todo();
    expect(admin.name).toBe('Ada Admin');
    expect(admin.role).toBe('admin');
  });

  test('8.4 ✍️ write an async function', async () => {
    // Write an async function getUserName(id: number): Promise<string>
    // It awaits fakeFetchUser(id) and returns the user's name.
    // Shape: async function name(param: type): Promise<string> { const x = await ...; return ...; }
    // ✍️ your code here

    todo();
    expect(await getUserName(1)).toBe('Sam Standard');
    expect(await getUserName(3)).toBe('Lou Locked');
  });

  test('8.5 ✍️ write an async ARROW function', async () => {
    // Write a constant getRole: an async arrow function that takes (id: number), returns Promise<string>,
    // awaits fakeFetchUser(id) and returns the user's role.
    // Shape: const name = async (param: type): Promise<string> => { ... };
    // (Look at the line `test('8.5 ...', async () => {` above: same shape!)
    // ✍️ your code here

    todo();
    expect(await getRole(2)).toBe('admin');
    expect(await getRole(1)).toBe('user');
  });

  test('8.6 ✍️ write sleep(ms)', async () => {
    // Write a function sleep(ms: number): Promise<void>
    // It returns a new Promise that calls resolve after ms milliseconds (setTimeout).
    // ✍️ your code here

    todo();
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(45);
  });

  test('8.7 🔮 in which order do things happen?', async () => {
    const log: string[] = [];
    async function task(): Promise<void> {
      log.push('task started');
      await fakeFetchUser(1);
      log.push('task finished');
    }
    const promise = task(); // no await yet!
    log.push('after calling task');
    await promise;
    log.push('after await');
    // An array with the 4 messages in the order they were pushed: ['...', '...', '...', '...']
    expect(log).toEqual(___);
  });
});

test.describe('errors with async', () => {
  test('8.8 🔮 try / catch with await', async () => {
    let message = 'no error';
    try {
      await fakeFetchUser(99);
      message = 'found it';
    } catch (error) {
      if (error instanceof Error) message = error.message;
    }
    expect(message).toBe(___);
  });

  test('8.9 🧪 assert a rejection', async () => {
    // Write ONE assertion: fakeFetchUser(99) rejects with 'User 99 not found'.
    // Shape: await expect(promise).rejects.toThrow('message');   (no arrow function here!)
    // ✍️ your code here

    todo();
  });

  test('8.10 🧪 assert what a promise resolves to', async () => {
    // Write TWO assertions:
    //  - fakeFetchUser(2) resolves to an object that matches { username: 'admin', role: 'admin' }
    //    Shape: await expect(promise).resolves.toMatchObject({ ... });
    //  - the name of (await fakeFetchUser(3)) is 'Lou Locked'
    // ✍️ your code here

    todo();
  });

  test('8.11 🐛 the catch never runs', async () => {
    // getUserOrNull should return null when the user does not exist. Instead, the error escapes.
    // The catch only sees errors that happen INSIDE the try, while you are waiting. Is anything waiting?
    async function getUserOrNull(id: number): Promise<User | null> {
      try {
        return fakeFetchUser(id);
      } catch {
        return null;
      }
    }
    expect(await getUserOrNull(1)).toMatchObject({ name: 'Sam Standard' });
    expect(await getUserOrNull(99)).toBe(null);
  });

  test('8.12 🐛 forEach does not wait', async () => {
    // Run it: names is still empty when expect runs. Replace forEach with a for...of loop that awaits.
    const names: string[] = [];
    const ids = [1, 2, 3];
    ids.forEach(async (id) => {
      const user = await fakeFetchUser(id);
      names.push(user.name);
    });
    expect(names).toEqual(['Sam Standard', 'Ada Admin', 'Lou Locked']);
  });
});

test.describe('sequential vs parallel', () => {
  test('8.13 ✍️ two requests at the same time', async () => {
    // Fetch the users 1 and 2 IN PARALLEL with Promise.all, and destructure the result into sam and ada.
    // Shape: const [a, b] = await Promise.all([promiseA, promiseB]);
    // ✍️ your code here

    todo();
    expect(sam.username).toBe('standard_user');
    expect(ada.username).toBe('admin');
  });

  test('8.14 🔮 how long does it take?', async () => {
    const slow = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

    let start = Date.now();
    await slow(80);
    await slow(80);
    const sequentialMs = Date.now() - start;

    start = Date.now();
    await Promise.all([slow(80), slow(80)]);
    const parallelMs = Date.now() - start;

    // true or false?
    expect(sequentialMs >= 150).toBe(___);
    expect(parallelMs >= 150).toBe(___);
  });

  test('8.15 🐛 Promise.all needs an await too', async () => {
    const users = Promise.all([fakeFetchUser(1), fakeFetchUser(2)]);
    expect(users.length).toBe(2);
    expect(users[1].name).toBe('Ada Admin');
  });

  test('8.16 ✍️ map + Promise.all', async () => {
    const ids = [3, 1, 2];
    // Fetch ALL these users in parallel and store them in a constant users (an array of User).
    // Shape: const users = await Promise.all(ids.map((id) => ...));
    // ✍️ your code here

    todo();
    expect(users.map((user) => user.name)).toEqual(['Lou Locked', 'Sam Standard', 'Ada Admin']);
  });
});

test.describe('helpers you will meet in real projects', () => {
  test('8.17 ✍️ a polling helper (how auto-waiting works)', async () => {
    // Write an async function waitUntil(condition: () => boolean, timeoutMs: number): Promise<void>
    //  - const start = Date.now();
    //  - while (Date.now() - start < timeoutMs):
    //        if condition() is true -> return
    //        otherwise wait 10 ms:  await new Promise((resolve) => setTimeout(resolve, 10));
    //  - after the loop: throw new Error(`Timed out after ${timeoutMs}ms`)
    // ✍️ your code here

    todo();
    let ready = false;
    setTimeout(() => {
      ready = true;
    }, 50);
    await waitUntil(() => ready, 1000);
    expect(ready).toBe(true);

    await expect(waitUntil(() => false, 50)).rejects.toThrow('Timed out after 50ms');
  });

  test('8.18 ✍️ a timeout with Promise.race', async () => {
    // Write a function withTimeout(promise: Promise<User>, ms: number): Promise<User>
    // It returns Promise.race([...]) of:
    //  - the promise
    //  - a new Promise that REJECTS after ms with new Error(`Timeout after ${ms}ms`)
    //    Shape: new Promise<never>((_, reject) => setTimeout(() => reject(new Error(...)), ms))
    // ✍️ your code here

    todo();
    const slowUser = new Promise<User>((resolve) => setTimeout(() => resolve(USERS[0]), 200));
    await expect(withTimeout(fakeFetchUser(1), 100)).resolves.toMatchObject({ name: 'Sam Standard' });
    await expect(withTimeout(slowUser, 50)).rejects.toThrow('Timeout after 50ms');
  });

  test('8.19 🐛 old .then() code that loses the value', async () => {
    // With { } braces, an arrow function needs `return`. Fix the callback.
    const name = await fakeFetchUser(1).then((user) => {
      user.name;
    });
    expect(name).toBe('Sam Standard');
  });

  test('8.20 ✍️ rewrite a .then() chain with await', async () => {
    // Old code:
    //   fakeFetchUser(2)
    //     .then((user) => user.role)
    //     .then((role) => role.toUpperCase());
    // Rewrite it with await: const user = await ...; then a constant shout = the role in upper case.
    // ✍️ your code here

    todo();
    expect(shout).toBe('ADMIN');
  });
});

test.describe('combine everything', () => {
  test('8.21 ✍️ login, then load the cart (sequential, with errors)', async () => {
    // Write an async function cartSummary(username: string, password: string): Promise<string>
    //  - try:  const token = await fakeLogin(username, password);
    //          const cart = await fakeGetCart(token);         (needs the token: must be sequential!)
    //          return `Total: $${cart.total}`
    //  - catch (error): if error instanceof Error, return `Error: ${error.message}`
    //  - after the try/catch: return 'Error: unknown'   (TypeScript needs a return for every path)
    // ✍️ your code here

    todo();
    expect(await cartSummary('standard_user', 'secret123')).toBe('Total: $59.98');
    expect(await cartSummary('admin', 'admin123')).toBe('Total: $0');
    expect(await cartSummary('locked_user', 'secret123')).toBe('Error: User is locked');
    expect(await cartSummary('admin', 'wrong')).toBe('Error: Invalid username or password');
  });

  test('8.22 ✍️ load a dashboard (parallel)', async () => {
    // Write an async function loadDashboard(userId: number): Promise<{ greeting: string; inStock: number }>
    //  - fetch the user AND the products in parallel (Promise.all + destructuring)
    //  - greeting: `Hello, ${user.name}!`
    //  - inStock:  how many products have stock > 0 (filter + length)
    // ✍️ your code here

    todo();
    expect(await loadDashboard(1)).toEqual({ greeting: 'Hello, Sam Standard!', inStock: 5 });
    await expect(loadDashboard(99)).rejects.toThrow('User 99 not found');
  });

  test('8.23 🧪 assert the login API', async () => {
    // Write THREE assertions (each one starts with await):
    //  - fakeLogin('locked_user', 'secret123') rejects with 'User is locked'
    //  - fakeLogin('admin', 'wrong') rejects with 'Invalid username or password'
    //  - fakeLogin('admin', 'admin123') resolves to 'token-admin'   (.resolves.toBe(...))
    // ✍️ your code here

    todo();
  });

  test('8.24 ✍️ retry an async action', async () => {
    // Write an async function retryAsync(action: () => Promise<boolean>, maxAttempts: number): Promise<number>
    //  - classic for loop: attempt = 1 ... maxAttempts
    //  - if (await action()) is true, return the attempt number
    //  - after the loop: throw new Error(`Failed after ${maxAttempts} attempts`)
    // ✍️ your code here

    todo();
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
