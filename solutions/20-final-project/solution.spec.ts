// Module 20 · Final Project — reference solution
// Run:  npm run solution 20
//
// The SAME acceptance tests as modules/20-final-project/exercises.spec.ts, run against the reference
// framework in ./framework/ (same contract as your final-project/). Read the framework only after you tried:
// open it file by file, compare with yours, then close it and improve yours from memory.
//
// Run the reference suite itself:  npx playwright test -c solutions/20-final-project/framework

import { test, expect, type Page } from '@playwright/test';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '../..');
const PROJECT = path.join(import.meta.dirname, 'framework'); // <- the reference framework
const LABEL = path.relative(ROOT, PROJECT).replace(/\\/g, '/');
const PLAYWRIGHT_CLI = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');

// ---------------------------------------------------------------------------
// Helpers (you don't need to read these to do the project)
// ---------------------------------------------------------------------------
function requireFile(relativePath: string, milestone: string): string {
  const fullPath = path.join(PROJECT, relativePath);
  expect(fs.existsSync(fullPath), `📁 Missing ${LABEL}/${relativePath}. Create it: see ${milestone} in modules/20-final-project/LESSON.md`).toBe(true);
  return fullPath;
}

function readSource(relativePath: string, milestone: string): string {
  return fs.readFileSync(requireFile(relativePath, milestone), 'utf8');
}

// Imports one of your TypeScript files while the test runs.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function load(relativePath: string, milestone: string): Promise<any> {
  const fullPath = requireFile(relativePath, milestone);
  return import(pathToFileURL(fullPath).href);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exported(module: any, name: string, relativePath: string): any {
  expect(module[name], `${LABEL}/${relativePath} must export ${name} (export class ${name} ... / export function ${name} ...)`).toBeDefined();
  return module[name];
}

// Logs the browser in without the UI (module 17), so page-object tests don't depend on your LoginPage.
async function logIn(page: Page, baseURL: string | undefined, username: string, password: string): Promise<void> {
  const response = await page.request.post('/api/login', { data: { username, password } });
  const { token } = await response.json();
  await page.context().addCookies([{ name: 'session', value: token, url: baseURL }]);
}

// Runs YOUR suite in a separate Playwright process and returns its JSON report.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runYourSuite(extraArgs: string[]): Promise<{ report: any; output: string }> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-final-project-'));
  const reportFile = path.join(tempDir, 'report.json');
  const env: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (/^(TEST_|PW_|PLAYWRIGHT_)/.test(key) && key !== 'PLAYWRIGHT_BROWSERS_PATH') continue;
    env[key] = value;
  }
  env.PLAYWRIGHT_JSON_OUTPUT_NAME = reportFile;
  env.FORCE_COLOR = '0';
  const args = [PLAYWRIGHT_CLI, 'test', '-c', PROJECT, '--reporter=json', '--output', path.join(tempDir, 'results'), ...extraArgs];
  const output = await new Promise<string>((resolve) => {
    const child = spawn(process.execPath, args, { cwd: ROOT, env });
    let text = '';
    child.stdout.on('data', (chunk) => (text += chunk));
    child.stderr.on('data', (chunk) => (text += chunk));
    child.on('close', () => resolve(text));
  });
  const report = fs.existsSync(reportFile) ? JSON.parse(fs.readFileSync(reportFile, 'utf8')) : null;
  fs.rmSync(tempDir, { recursive: true, force: true });
  return { report, output };
}

type ListedTest = { title: string; file: string; tags: string[]; ok: boolean };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function flatten(report: any): ListedTest[] {
  const tests: ListedTest[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (suite: any) => {
    for (const spec of suite.specs ?? []) {
      tests.push({ title: spec.title, file: String(spec.file).replace(/\\/g, '/'), tags: spec.tags ?? [], ok: spec.ok });
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report?.suites ?? []) walk(suite);
  return tests;
}

test.beforeEach(async ({ request }) => {
  await request.post('/api/reset');
});

// ---------------------------------------------------------------------------
test.describe('Milestone 1 · the config', () => {
  test('20.1 ✍️ M1 playwright.config.ts exists and loads', async () => {
    const module = await load('playwright.config.ts', 'Milestone 1');
    expect(module.default, 'playwright.config.ts must have: export default defineConfig({ ... })').toBeDefined();
    expect(typeof module.default).toBe('object');
  });

  test('20.2 ✍️ M1 baseURL, webServer, testDir and the HTML reporter', async () => {
    const config = (await load('playwright.config.ts', 'Milestone 1')).default;
    const port = process.env.PORT ?? '3000';
    expect(config.testDir, "testDir must be './tests'").toMatch(/tests\/?$/);
    expect(config.use?.baseURL, `use.baseURL must be http://localhost:${port} (use the PORT env variable)`).toBe(`http://localhost:${port}`);
    expect(config.webServer, 'add a webServer that starts QA Shop').toBeDefined();
    expect(config.webServer.url, 'webServer.url must point to /api/health').toContain('/api/health');
    expect(config.webServer.reuseExistingServer, 'webServer.reuseExistingServer must be true').toBeTruthy();
    const script = String(config.webServer.command).match(/node\s+(\S+\.mjs)/)?.[1];
    expect(script, "webServer.command must be like 'node ../practice-app/server.mjs'").toBeTruthy();
    const scriptPath = path.resolve(PROJECT, config.webServer.cwd ?? '.', script ?? '');
    expect(fs.existsSync(scriptPath), `webServer.command: ${script} does not exist (seen from ${LABEL}/)`).toBe(true);
    expect(JSON.stringify(config.reporter ?? ''), "reporter must include 'html'").toContain('html');
  });
});

// ---------------------------------------------------------------------------
test.describe('Milestone 2 · page objects', () => {
  test('20.3 ✍️ M2 BasePage and LoginPage log in', async ({ page }) => {
    const BasePage = exported(await load('pages/BasePage.ts', 'Milestone 2'), 'BasePage', 'pages/BasePage.ts');
    const LoginPage = exported(await load('pages/LoginPage.ts', 'Milestone 2'), 'LoginPage', 'pages/LoginPage.ts');
    const loginPage = new LoginPage(page);
    expect(loginPage, 'LoginPage must extend BasePage').toBeInstanceOf(BasePage);
    expect(loginPage.page, 'BasePage keeps the page: constructor(readonly page: Page)').toBe(page);
    expect(loginPage.path).toBe('/login');
    await loginPage.goto();
    await expect(page).toHaveURL(/\/login/);
    await loginPage.login('standard_user', 'secret123');
    await expect(page).toHaveURL(/\/products/);
  });

  test('20.4 ✍️ M2 LoginPage shows the error message', async ({ page }) => {
    const LoginPage = exported(await load('pages/LoginPage.ts', 'Milestone 2'), 'LoginPage', 'pages/LoginPage.ts');
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('locked_user', 'secret123');
    await expect(loginPage.errorMessage).toHaveText('Sorry, this user has been locked out.');
  });

  test('20.5 ✍️ M2 ProductsPage adds to the cart', async ({ page, baseURL }) => {
    const ProductsPage = exported(await load('pages/ProductsPage.ts', 'Milestone 2'), 'ProductsPage', 'pages/ProductsPage.ts');
    await logIn(page, baseURL, 'standard_user', 'secret123');
    const productsPage = new ProductsPage(page);
    expect(productsPage.path).toBe('/products');
    await productsPage.goto();
    await expect(productsPage.productCards).toHaveCount(6);
    await expect(productsPage.productCard('Backpack')).toContainText('$29.99');
    await productsPage.addToCart('Backpack');
    await expect(productsPage.cartCount).toHaveText('1');
  });

  test('20.6 ✍️ M2 CartPage shows rows, total and removes items', async ({ page, baseURL }) => {
    const CartPage = exported(await load('pages/CartPage.ts', 'Milestone 2'), 'CartPage', 'pages/CartPage.ts');
    await logIn(page, baseURL, 'standard_user', 'secret123');
    await page.request.post('/api/cart', { data: { productId: 1, quantity: 2 } });
    const cartPage = new CartPage(page);
    expect(cartPage.path).toBe('/cart');
    await cartPage.goto();
    await expect(cartPage.rows).toHaveCount(1);
    await expect(cartPage.total).toHaveText('Total: $59.98');
    await cartPage.removeItem('Backpack');
    await expect(cartPage.emptyMessage).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
test.describe('Milestone 3 · test data and the API client', () => {
  test('20.7 ✍️ M3 uniqueName and buildProduct', async () => {
    const data = await load('utils/data.ts', 'Milestone 3');
    readSource('utils/types.ts', 'Milestone 3');
    const uniqueName = exported(data, 'uniqueName', 'utils/data.ts');
    const buildProduct = exported(data, 'buildProduct', 'utils/data.ts');
    const first = uniqueName('order');
    expect(first.startsWith('order')).toBe(true);
    expect(uniqueName('order'), 'uniqueName must return a different value every call').not.toBe(first);
    const product = buildProduct();
    expect(typeof product.name).toBe('string');
    expect(product.price).toBeGreaterThan(0);
    expect(buildProduct().name, 'buildProduct must give a unique name every call').not.toBe(product.name);
    expect(buildProduct({ price: 1.5 }).price, 'overrides must win').toBe(1.5);
  });

  test('20.8 ✍️ M3 ApiClient reads products', async ({ request }) => {
    const ApiClient = exported(await load('api/ApiClient.ts', 'Milestone 3'), 'ApiClient', 'api/ApiClient.ts');
    const api = new ApiClient(request);
    expect(await api.getProducts()).toHaveLength(6);
    expect(await api.getProducts({ category: 'clothes' })).toHaveLength(4);
    expect((await api.getProduct(1)).name).toBe('Backpack');
  });

  test('20.9 ✍️ M3 ApiClient creates and deletes as admin', async ({ request }) => {
    const ApiClient = exported(await load('api/ApiClient.ts', 'Milestone 3'), 'ApiClient', 'api/ApiClient.ts');
    const { buildProduct } = await load('utils/data.ts', 'Milestone 3');
    const api = new ApiClient(request);
    const token = await api.login('admin', 'admin123');
    expect(typeof token, 'login() must return the token').toBe('string');
    const created = await api.createProduct(buildProduct({ price: 4.5 }));
    expect(created).toEqual(expect.objectContaining({ id: expect.any(Number), price: 4.5 }));
    expect((await api.getProduct(created.id)).name).toBe(created.name);
    await api.deleteProduct(created.id);
    await expect(api.getProduct(created.id), 'getProduct must throw for a 404').rejects.toThrow();
  });

  test('20.10 ✍️ M3 ApiClient manages the cart', async ({ request }) => {
    const ApiClient = exported(await load('api/ApiClient.ts', 'Milestone 3'), 'ApiClient', 'api/ApiClient.ts');
    const api = new ApiClient(request);
    await api.login('standard_user', 'secret123');
    const cart = await api.addToCart(1, 2);
    expect(cart.count).toBe(2);
    expect((await api.getCart()).total).toBe(59.98);
    await api.reset();
    expect((await api.getCart()).count, 'reset() must empty the cart').toBe(0);
  });

  test('20.11 ✍️ M3 ApiClient throws when the API says no', async ({ request }) => {
    const ApiClient = exported(await load('api/ApiClient.ts', 'Milestone 3'), 'ApiClient', 'api/ApiClient.ts');
    const api = new ApiClient(request);
    await expect(api.createProduct({ name: 'Nope', price: 1 }), 'createProduct without login must throw (401)').rejects.toThrow();
    await expect(api.login('standard_user', 'wrong'), 'login with a wrong password must throw (401)').rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
test.describe('Milestone 4 · fixtures', () => {
  test('20.12 ✍️ M4 fixtures/index.ts exports test and expect', async () => {
    const fixtures = await load('fixtures/index.ts', 'Milestone 4');
    const source = readSource('fixtures/index.ts', 'Milestone 4');
    expect(typeof fixtures.test, 'fixtures/index.ts must export `test` (made with base.extend)').toBe('function');
    expect(typeof fixtures.test.extend).toBe('function');
    expect(typeof fixtures.expect, 'fixtures/index.ts must export `expect`').toBe('function');
    for (const name of ['loginPage', 'productsPage', 'cartPage', 'api']) {
      expect(source, `fixtures/index.ts must define the fixture ${name}`).toMatch(new RegExp(`\\b${name}\\s*:\\s*async`));
    }
  });
});

// ---------------------------------------------------------------------------
test.describe('Milestone 5 · authentication', () => {
  test('20.13 ✍️ M5 setup project, dependencies and storageState', async () => {
    const setupSource = readSource('tests/auth.setup.ts', 'Milestone 5');
    expect(setupSource, 'tests/auth.setup.ts must save the state with storageState({ path })').toContain('storageState(');
    const config = (await load('playwright.config.ts', 'Milestone 1')).default;
    const projects: { name?: string; dependencies?: string[]; use?: { storageState?: unknown } }[] = config.projects ?? [];
    expect(projects.map((project) => project.name), "add a project named 'setup'").toContain('setup');
    const loggedIn = projects.filter((project) => project.dependencies?.includes('setup') && typeof project.use?.storageState === 'string');
    expect(loggedIn.length, "add a project with dependencies: ['setup'] and use: { storageState: <path to user.json> }").toBeGreaterThan(0);
    expect(String(loggedIn[0].use?.storageState)).toMatch(/\.auth[\\/]user\.json$/);
  });
});

// ---------------------------------------------------------------------------
test.describe('Milestone 6 · the test suite', () => {
  test('20.14 ✍️ M6 tests in ui/, api/ and hybrid/, with @smoke tags', async () => {
    test.setTimeout(60_000);
    requireFile('tests', 'Milestone 6');
    const { report, output } = await runYourSuite(['--list']);
    expect(report, `could not list your tests:\n${output.slice(0, 2000)}`).toBeTruthy();
    const tests = flatten(report);
    const count = (folder: string) => tests.filter((t) => new RegExp(`(^|/)${folder}/`).test(t.file)).length;
    expect(count('ui'), 'write at least 3 tests in tests/ui/').toBeGreaterThanOrEqual(3);
    expect(count('api'), 'write at least 3 tests in tests/api/').toBeGreaterThanOrEqual(3);
    expect(count('hybrid'), 'write at least 2 tests in tests/hybrid/').toBeGreaterThanOrEqual(2);
    const smoke = tests.filter((t) => t.tags.includes('@smoke') || t.tags.includes('smoke'));
    expect(smoke.length, "tag at least 3 tests with { tag: '@smoke' }").toBeGreaterThanOrEqual(3);
    const specFiles = tests.filter((t) => /\.spec\.ts$/.test(t.file)).map((t) => path.join(PROJECT, 'tests', t.file));
    const usesFixtures = specFiles.some((file) => fs.existsSync(file) && /from\s+['"](\.\.\/)+fixtures/.test(fs.readFileSync(file, 'utf8')));
    expect(usesFixtures, "your spec files must import { test, expect } from '../../fixtures'").toBe(true);
  });
});

// ---------------------------------------------------------------------------
test.describe('Milestone 7 · the whole suite', () => {
  test('20.15 ✍️ M7 the whole suite is green', async () => {
    test.setTimeout(180_000);
    requireFile('tests', 'Milestone 6');
    for (const state of ['user.json', 'admin.json']) fs.rmSync(path.join(PROJECT, '.auth', state), { force: true });
    const { report, output } = await runYourSuite([]);
    expect(report, `your suite did not run:\n${output.slice(0, 2000)}`).toBeTruthy();
    const failed = flatten(report).filter((t) => !t.ok).map((t) => `${t.file} › ${t.title}`);
    expect(failed, `these tests fail. Run: npx playwright test -c ${LABEL}`).toEqual([]);
    expect(report.stats.expected, 'your suite should have at least 10 passing tests (setup included)').toBeGreaterThanOrEqual(10);
    expect(fs.existsSync(path.join(PROJECT, '.auth', 'user.json')), 'the setup must write .auth/user.json').toBe(true);
    expect(fs.existsSync(path.join(PROJECT, '.auth', 'admin.json')), 'the setup must write .auth/admin.json').toBe(true);
  });
});
