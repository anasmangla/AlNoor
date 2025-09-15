import { defineConfig } from '@playwright/test';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const baseURL = `http://localhost:3000${basePath}`;

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});

