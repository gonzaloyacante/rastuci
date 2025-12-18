/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";
import { vi } from "vitest";
import * as React from "react";

// Provide a `jest` alias for libraries/tests that expect Jest global
// This maps to Vitest's `vi` implementation for compatibility.
(globalThis as any).jest = vi;

// Some tests assume React is globally available (older style tests).
(globalThis as any).React = React;

// Shim jest.mock to capture CartContext factory results for legacy tests.
// Jest hoists jest.mock calls; Vitest does not. Some legacy tests rely on
// the mock factory being available to other modules. We store the factory
// return value on globalThis.__TEST_CART_CONTEXT__ so the real implementation
// can pick it up during tests.
const originalJestMockAny: any = (globalThis as any).jest.mock;
(globalThis as any).jest.mock = function (
  moduleName: string,
  factory?: any,
  options?: any
) {
  try {
    if (typeof factory === "function") {
      const res = factory();
      if (
        moduleName === "@/context/CartContext" ||
        moduleName.endsWith("/CartContext")
      ) {
        (globalThis as any).__TEST_CART_CONTEXT__ = res;
      }
    }
  } catch {
    // ignore errors from optional factories
  }
  return originalJestMockAny.call(this, moduleName, factory, options);
};

// Mock IntersectionObserver
class MockIntersectionObserver {
  root: unknown = null;
  rootMargin = "";
  thresholds: number[] = [];
  constructor() {}
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): unknown[] {
    return [];
  }
}
(globalThis as any).IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver
class MockResizeObserver {
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
}
(globalThis as any).ResizeObserver = MockResizeObserver as any;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: vi.fn(),
});

// Simple in-memory localStorage mock that actually persists values for tests
const createStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };
};

Object.defineProperty(window, "localStorage", {
  value: createStorageMock(),
});

Object.defineProperty(window, "sessionStorage", {
  value: createStorageMock(),
});

// Mock fetch
(globalThis as any).fetch = vi.fn();

// Suppress console.error spam in tests unless explicitly expected
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0] as string).includes("Warning: ReactDOM.render is deprecated")
    ) {
      return;
    }
    (originalError as unknown as (...d: unknown[]) => void).call(
      console,
      ...args
    );
  };
});

afterAll(() => {
  console.error = originalError;
});
