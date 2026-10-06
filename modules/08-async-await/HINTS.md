# Hints · Module 08

Read only the hint for the exercise you're stuck on. Try again before reading the next one.

**8.1** Section 4 of the lesson: what does an `async` function ALWAYS return? And `await` gives you the value inside.

**8.2** `fakeFetchUser(1)` gives a Promise. Add one word before it. (The test function is already `async`.)

**8.3** `const admin = await fakeFetchUser(2);`

**8.4** `async function getUserName(id: number): Promise<string> { const user = await fakeFetchUser(id); return user.name; }`. Try to type it without copying.

**8.5** Same as 8.4 but as an arrow: `const getRole = async (id: number): Promise<string> => { ... };`

**8.6** `return new Promise((resolve) => setTimeout(resolve, ms));` inside `function sleep(ms: number): Promise<void> { }`.

**8.7** An async function runs normally until its first `await`. Then it pauses and the code after the call continues. When the user arrives, the function continues.

**8.8** `await` throws the rejection error, so the line `message = 'found it'` is skipped. What's the error message of `fakeFetchUser(99)`?

**8.9** `await expect(fakeFetchUser(99)).rejects.toThrow('User 99 not found');` Notice: no `() =>` here, you pass the promise.

**8.10** `await expect(fakeFetchUser(2)).resolves.toMatchObject({ ... });` and `expect((await fakeFetchUser(3)).name).toBe('Lou Locked');`

**8.11** The `try` is over as soon as `return` hands out the promise, so the rejection happens outside it. Wait for it inside the `try`: `return await fakeFetchUser(id);`

**8.12** `for (const id of ids) { const user = await fakeFetchUser(id); names.push(user.name); }`

**8.13** `const [sam, ada] = await Promise.all([fakeFetchUser(1), fakeFetchUser(2)]);`

**8.14** Two waits of 80 ms one after the other take about 160 ms. Two waits at the same time take about 80 ms.

**8.15** `Promise.all(...)` is a Promise too. Add one word.

**8.16** `const users = await Promise.all(ids.map((id) => fakeFetchUser(id)));`

**8.17** `async function waitUntil(condition: () => boolean, timeoutMs: number): Promise<void> { const start = Date.now(); while (...) { if (condition()) return; await new Promise(...); } throw ...; }`

**8.18** `return Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error(...)), ms))]);`

**8.19** Add `return` before `user.name`, or remove the braces: `.then((user) => user.name)`.

**8.20** Two lines: `const user = await fakeFetchUser(2);` and `const shout = user.role.toUpperCase();`

**8.21** Look at the shape in the comment line by line. The template literal is `` `Total: $${cart.total}` ``: one `$` is the dollar sign, `${...}` is the value.

**8.22** `const [user, products] = await Promise.all([fakeFetchUser(userId), fakeFetchProducts()]);` then return an object. For `inStock`: `products.filter((p) => p.stock > 0).length`.

**8.23** Three lines, each one: `await expect(fakeLogin(...)).rejects.toThrow('...');` or `.resolves.toBe('...')`.

**8.24** Like 6.24, but async: `for (let attempt = 1; attempt <= maxAttempts; attempt++) { if (await action()) return attempt; }` and the `throw` after the loop.
