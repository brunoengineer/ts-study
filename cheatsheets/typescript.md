# TypeScript cheat sheet

The syntax you'll actually use in test automation, on one page. Module numbers in brackets.

## Variables & types [01]

```ts
const baseUrl: string = 'http://localhost:3000';  // const: can't be reassigned (use by default)
let retries = 0;                                  // let: can change. Type inferred: number
retries++;  retries += 2;  retries--;

let username: string;                // declare now, assign later
const timeout = 30_000;              // _ = readability only
typeof timeout === 'number'          // 'string' | 'number' | 'boolean' | 'undefined' | 'object' | 'function'
a === b    a !== b                   // always triple equals
```

## Strings & numbers [02]

```ts
const url = `${baseUrl}/products/${id}`;            // template literal (backticks)
text.length   text.trim()   text.toLowerCase()   text.toUpperCase()
text.includes('Cart')   text.startsWith('$')   text.endsWith('!')
text.split(',')   text.replace('$', '')   text.replaceAll(' ', '-')
text.slice(0, 5)   text.at(-1)   String(42).padStart(4, '0')   // '0042'

Number('42')   parseInt('42px')   parseFloat('29.99')   String(42)
price.toFixed(2)                                        // '29.90' (a string!)
Math.round(x)  Math.floor(x)  Math.ceil(x)  Math.max(a, b)  Math.min(a, b)
Math.floor(Math.random() * 10)                          // random int 0..9
Number.isNaN(Number('abc'))                             // true
parseFloat('Total: $59.98'.replace('Total: $', ''))     // 59.98

/products/.test(url)      /^Hello/i      /\d+ items/    // regex: \d digit, ^ start, $ end, i ignore case
```

## Functions [03]

```ts
function add(a: number, b: number): number {
  return a + b;
}
const add2 = (a: number, b: number): number => a + b;      // arrow, expression body
const log = (msg: string): void => { console.log(msg); };  // arrow, block body
const makeUser = (name: string) => ({ name, role: 'user' }); // returning an object: wrap in ( )

function greet(name: string, greeting = 'Hello', suffix?: string) {}  // default, optional
const sum = (...numbers: number[]) => numbers.reduce((t, n) => t + n, 0); // rest
type Formatter = (value: number) => string;                // function type
```

## Arrays [04]

```ts
const names: string[] = ['Backpack', 'Bike Light'];
const prices: Array<number> = [29.99, 9.99];
names.length   names[0]   names.at(-1)   names.push('Onesie')   names.pop()
names.includes('Backpack')   names.indexOf('Bike Light')   names.join(', ')

prices.map((p) => p * 2)                       // transform every item → new array
prices.filter((p) => p > 10)                   // keep matching items → new array
prices.find((p) => p > 10)                     // first match (or undefined)
prices.findIndex((p) => p > 10)                // index of first match (or -1)
prices.some((p) => p > 40)                     // at least one?  → boolean
prices.every((p) => p > 0)                     // all of them?   → boolean
prices.reduce((total, p) => total + p, 0)      // combine into one value
[...prices].sort((a, b) => a - b)              // copy, then sort numbers ascending
[...names].sort()                              // strings A→Z
const [first, second, ...rest] = names;        // destructuring
const all = [...names, 'Red T-Shirt'];         // spread
for (const name of names) { /* ... */ }
```

## Objects [05]

```ts
interface Product {                // or: type Product = { ... };
  id: number;
  name: string;
  price: number;
  description?: string;            // optional
  readonly sku: string;            // can't be changed after creation
}
const p: Product = { id: 1, name: 'Backpack', price: 29.99, sku: 'BP-1' };
p.name   p['name']   p.price = 19.99;

const { name, price } = p;                     // destructuring
const { name: productName, stock = 0 } = obj;  // rename + default
const copy = { ...p, price: 9.99 };            // copy + override
Object.keys(p)   Object.values(p)   Object.entries(p)   // [['id', 1], ['name', 'Backpack'], ...]
const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
JSON.stringify(p)   JSON.parse(text)
function show({ name, price }: Product) {}     // destructuring in parameters (like ({ page }) =>)
```

## Control flow & errors [06]

```ts
if (status === 200) { } else if (status === 404) { } else { }
const label = isAdmin ? 'Admin' : 'User';                 // ternary
switch (role) { case 'admin': /* ... */ break; default: /* ... */ }
for (let i = 0; i < 3; i++) { }     while (cond) { }     break; continue;
for (const [key, value] of Object.entries(obj)) { }

user?.address?.city                 // optional chaining: undefined instead of crashing
value ?? 'default'                  // nullish: only for null/undefined
value || 'default'                  // or: for any falsy (0, '', false, null, undefined, NaN)

try { riskyThing(); } catch (error) { console.log((error as Error).message); } finally { cleanup(); }
throw new Error('Something went wrong');
```

Falsy values: `false`, `0`, `''`, `null`, `undefined`, `NaN`. Everything else is truthy.

## Unions & narrowing [07]

```ts
type Role = 'admin' | 'user';                    // literal union
let id: string | number;
let token: string | null = null;
if (typeof id === 'string') { /* id is string here */ }
if ('error' in result) { /* has error property */ }
if (Array.isArray(x)) { }
type Result = { ok: true; data: Product } | { ok: false; error: string };  // discriminated union
if (result.ok) { result.data } else { result.error }

const ROLES = ['admin', 'user'] as const;        // readonly, literal types
enum Status { Active = 'active', Locked = 'locked' }
let data: unknown;                               // safe "anything": must narrow before use
value as Product                                 // assertion: "trust me" (careful!)
element!                                         // non-null assertion (careful!)
```

## Async / await [08]

```ts
async function getUser(id: number): Promise<User> {  // async always returns a Promise
  const response = await fetch(`/api/users/${id}`);  // await = wait for the result
  return response.json();
}
const user = await getUser(1);
const [a, b] = await Promise.all([getUser(1), getUser(2)]);   // in parallel
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

for (const id of ids) { await doSomething(id); }   // ✅ waits for each
ids.forEach(async (id) => await doSomething(id));  // ❌ does NOT wait
await expect(promise).rejects.toThrow('boom');
```

⚠️ **Forgot `await`?** You get a `Promise { <pending> }` instead of a value, and tests can pass or fail at random.
In Playwright: **every `page.` action and every `expect(locator)` needs `await`.**

## Classes [09]

```ts
class LoginPage {
  readonly usernameInput: Locator;
  constructor(readonly page: Page) {          // parameter property: declares + assigns this.page
    this.usernameInput = page.getByLabel('Username');
  }
  async goto() { await this.page.goto('/login'); }
  get title() { return 'Login'; }             // getter: loginPage.title
  static readonly URL = '/login';             // LoginPage.URL
}
class AdminPage extends BasePage {
  constructor(page: Page) { super(page); }
}
const login = new LoginPage(page);
private  public  protected  readonly  implements  instanceof
```

## Modules & generics [10]

```ts
export function formatPrice(n: number) {}     // named export
export default class LoginPage {}             // default export (one per file)
import { formatPrice } from './utils/price';  // named import (curly braces)
import LoginPage from './pages/LoginPage';    // default import (no braces)
import type { Product } from './types';       // types only
export * from './price';                      // re-export (index.ts "barrel")

function first<T>(items: T[]): T | undefined { return items[0]; }
interface ApiResponse<T> { status: number; body: T }
function byId<T extends { id: number }>(items: T[], id: number) {}
keyof Product                                 // 'id' | 'name' | 'price' | ...

Partial<User>      // all properties optional   → test data overrides
Required<User>     // all required
Pick<User, 'username' | 'role'>
Omit<User, 'password'>
Readonly<User>
Record<string, number>
Awaited<ReturnType<typeof getUser>>
```
