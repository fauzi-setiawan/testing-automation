// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright Configuration — SauceDemo E2E Tests
 * Digunakan oleh QA Dashboard Automation Runner
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Timeout per test: 30 detik */
  timeout: 30_000,
  
  /* Expect timeout */
  expect: {
    timeout: 5_000,
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry: 1 kali saat CI, 0 saat lokal */
  retries: process.env.CI ? 1 : 0,

  /* Workers: 2 saat CI, auto saat lokal */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter: JSON + HTML */
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL dari environment variable */
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Headless di CI */
    headless: !!process.env.CI,
  },

  /* Configure projects — hanya Chromium */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
