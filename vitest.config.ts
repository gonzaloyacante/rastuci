import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@/components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@/lib', replacement: path.resolve(__dirname, 'src/lib') },
      { find: '@/app', replacement: path.resolve(__dirname, 'src/app') },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'src/**/__tests__/**/*.test.tsx', 'src/**/__tests__/**/*.test.ts'],
    deps: {
      inline: [
        '@testing-library/react',
        '@testing-library/jest-dom'
      ]
    }
  }
});
