/// <reference types="jest" />
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import * as React from 'react';

// Provide a `jest` alias for libraries/tests that expect Jest global
// This maps to Vitest's `vi` implementation for compatibility.
(globalThis as any).jest = vi;

// Some tests assume React is globally available (older style tests).
(globalThis as any).React = React;

// Wrap jest.mock to capture CartContext mocks (Jest hoists jest.mock; Vitest does not).
// This allows tests that call `jest.mock('@/context/CartContext', () => ({ ... }))`
// after importing modules to still provide a usable mock to components that
// import the real module at top-level. We store the factory result on
// globalThis.__TEST_CART_CONTEXT__ so the real `useCart` can pick it up.
const originalJestMock = (globalThis as any).jest.mock.bind((globalThis as any).jest);
(globalThis as any).jest.mock = (id: string, factory?: any, options?: any) => {
  try {
    if (typeof factory === 'function') {
      const res = factory();
      if (id === '@/context/CartContext' || id.endsWith('/CartContext')) {
        (globalThis as any).__TEST_CART_CONTEXT__ = res;
      }
    }
  } catch (e) {
    // ignore
  }
  return originalJestMock(id, factory, options);
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: jest.fn(),
});

// Simple in-memory localStorage mock that actually persists values for tests
const createStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  };
};

Object.defineProperty(window, 'localStorage', {
  value: createStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: createStorageMock(),
});

// Mock fetch
global.fetch = jest.fn();

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
