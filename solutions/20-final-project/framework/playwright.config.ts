// Reference framework for the final project (module 20).
// Your own version lives in final-project/playwright.config.ts. The only difference: the path to the
// practice app in webServer.command (this folder is one level deeper).
//
// Run it:  npx playwright test -c solutions/20-final-project/framework
import { defineConfig, devices } from '@playwright/test';
import { PORT, USER_STATE } from './utils/env';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1, // QA Shop has ONE shared database: run one test at a time
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // 1) Logs in once and writes .auth/user.json and .auth/admin.json
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // 2) Browser tests: start logged in as standard_user
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], storageState: USER_STATE },
      dependencies: ['setup'],
    },
    {
      name: 'hybrid',
      testDir: './tests/hybrid',
      use: { ...devices['Desktop Chrome'], storageState: USER_STATE },
      dependencies: ['setup'],
    },

    // 3) API tests: no browser, no login state (the ApiClient logs in with a token)
    { name: 'api', testDir: './tests/api' },
  ],

  webServer: {
    command: 'node ../../../practice-app/server.mjs',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    timeout: 10_000,
    env: { PORT: String(PORT) },
  },
});
