import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",

  // Output directories
  outputDir: "test-results",

  // Timeout for each test (30 seconds)
  timeout: 30000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  // Shared settings for all the projects below
  use: {
    // Base URL for navigation
    baseURL: "http://localhost:4173",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot on failure
    screenshot: "only-on-failure",

    // Video on failure
    video: "retain-on-failure",

    // Viewport size
    viewport: { width: 1280, height: 720 },
  },

  // Visual comparison settings
  expect: {
    toMatchSnapshot: {
      // Allow small pixel differences due to font rendering across platforms
      maxDiffPixelRatio: 0.05, // 5% threshold
      threshold: 0.2, // Per-pixel color difference threshold (0-1)
    },
  },

  // Configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    // Uncomment to test on Firefox and WebKit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: "npm run dev:examples",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  // Snapshot path template - store snapshots separately from git
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFilePath}/{arg}{ext}",

  // Visual comparison settings
  expect: {
    toMatchSnapshot: {
      // 0.1% threshold for pixel differences
      maxDiffPixelRatio: 0.001,
    },
  },
});
