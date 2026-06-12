import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // jsdom only exposes localStorage when the document has a real (non-opaque) origin;
    // the setup file additionally polyfills it if the environment still doesn't provide one.
    environmentOptions: { jsdom: { url: 'http://localhost/' } },
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
