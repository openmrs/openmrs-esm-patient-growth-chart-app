import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

process.env.TZ = 'UTC';

const r = (relativePath: string) => fileURLToPath(new URL(relativePath, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [{ find: /^.*\.s?css$/, replacement: 'identity-obj-proxy' }],
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    clearMocks: true,
    setupFiles: [r('./setup-tests.ts')],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      include: ['**/src/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/src/**/*.test.*', '**/src/**/*.d.ts', '**/e2e/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    server: {
      deps: {
        inline: [/@openmrs/, /@carbon\/charts/, /^d3/],
      },
    },
    fakeTimers: {
      toFake: [
        'setTimeout',
        'clearTimeout',
        'setInterval',
        'clearInterval',
        'setImmediate',
        'clearImmediate',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'Date',
      ],
    },
    alias: [
      { find: '@carbon/charts/interfaces', replacement: r('../__mocks__/@carbon/charts/interfaces.js') },
      { find: /^@openmrs\/esm-framework$/, replacement: '@openmrs/esm-framework/mock' },
      { find: 'react-i18next', replacement: r('../__mocks__/react-i18next.js') },
      { find: /^@hooks\/(.*)$/, replacement: r('../src/hooks/') + '$1' },
      { find: /^@resources\/(.*)$/, replacement: r('../src/resources/') + '$1' },
      { find: /^@utils\/(.*)$/, replacement: r('../src/utils/') + '$1' },
    ],
  },
});
