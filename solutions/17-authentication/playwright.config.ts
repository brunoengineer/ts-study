// Module 17 has its OWN config, because it needs a "setup" project that logs in before the tests.
// `npm run solution 17` runs it for you with:  npx playwright test -c solutions/17-authentication
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);

export default defineConfig({
  testDir: '.',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: 'list',

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ...devices['Desktop Chrome'],
  },

  projects: [
    // 1) Runs first: logs in and saves the state files in .auth/ (see auth.setup.ts).
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    // 2) Runs after setup finished (and only if it passed).
    { name: 'solutions', testMatch: 'solution.spec.ts', dependencies: ['setup'] },
  ],

  // Starts QA Shop. The path is relative to THIS folder (solutions/17-authentication).
  webServer: {
    command: 'node ../../practice-app/server.mjs',
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    timeout: 10_000,
    env: { PORT: String(PORT) },
  },
});
