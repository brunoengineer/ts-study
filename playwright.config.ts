import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Modules that ship their own playwright.config.ts (for example the auth module)
// are run with `-c <folder>`, so the root config ignores them.
function foldersWithOwnConfig(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((name) => fs.existsSync(path.join(root, name, 'playwright.config.ts')))
    .map((name) => `**/${name}/**`);
}

const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  // One test at a time: easier to read the output while learning.
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  projects: [
    {
      name: 'exercises',
      testDir: './modules',
      testMatch: '**/exercises.spec.ts',
      testIgnore: foldersWithOwnConfig('./modules'),
    },
    {
      name: 'solutions',
      testDir: './solutions',
      testMatch: '**/solution.spec.ts',
      testIgnore: foldersWithOwnConfig('./solutions'),
    },
    {
      name: 'katas',
      testDir: './my-katas',
      testMatch: '**/*.spec.ts',
    },
  ],

  // Starts the practice app (QA Shop) before the tests, unless it is already running.
  webServer: {
    command: 'node practice-app/server.mjs',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    timeout: 10_000,
    env: { PORT: String(PORT) },
  },
});
