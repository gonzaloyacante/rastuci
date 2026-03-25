import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      {
        find: "@/components",
        replacement: path.resolve(__dirname, "src/components"),
      },
      { find: "@/lib", replacement: path.resolve(__dirname, "src/lib") },
      { find: "@/app", replacement: path.resolve(__dirname, "src/app") },
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "src/**/__tests__/**/*.test.tsx",
      "src/**/__tests__/**/*.test.ts",
    ],
    pool: "forks",
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
