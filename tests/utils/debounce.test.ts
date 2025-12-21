/**
 * Hook Tests: useDebounce (Pure Logic)
 *
 * Tests for debounce logic without React hooks.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Debounce Logic Tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Debounce Function", () => {
    const debounce = <T extends (...args: unknown[]) => void>(
      func: T,
      delay: number
    ) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      return (...args: Parameters<T>) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
          func(...args);
        }, delay);
      };
    };

    it("should call function after delay", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn("test");
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should reset timer on rapid calls", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 500);

      debouncedFn("a");
      vi.advanceTimersByTime(200);
      debouncedFn("b");
      vi.advanceTimersByTime(200);
      debouncedFn("c");
      vi.advanceTimersByTime(500);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith("c");
    });

    it("should handle zero delay", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn("test");
      vi.advanceTimersByTime(1);
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should pass all arguments", () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn("arg1", "arg2", "arg3");
      vi.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledWith("arg1", "arg2", "arg3");
    });
  });

  describe("Throttle Function", () => {
    const throttle = <T extends (...args: unknown[]) => void>(
      func: T,
      limit: number
    ) => {
      let inThrottle = false;

      return (...args: Parameters<T>) => {
        if (!inThrottle) {
          func(...args);
          inThrottle = true;
          setTimeout(() => {
            inThrottle = false;
          }, limit);
        }
      };
    };

    it("should call function immediately", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 500);

      throttledFn("test");
      expect(mockFn).toHaveBeenCalledWith("test");
    });

    it("should prevent rapid calls", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 500);

      throttledFn("a");
      throttledFn("b");
      throttledFn("c");

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("should allow calls after limit", () => {
      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 500);

      throttledFn("a");
      vi.advanceTimersByTime(500);
      throttledFn("b");

      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});

describe("LocalStorage Utilities", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("safeGetItem", () => {
    const safeGetItem = <T>(key: string, defaultValue: T): T => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    };

    it("should return default when key not found", () => {
      expect(safeGetItem("nonexistent", "default")).toBe("default");
    });

    it("should parse stored JSON", () => {
      localStorage.setItem("test", JSON.stringify({ key: "value" }));
      expect(safeGetItem("test", {})).toEqual({ key: "value" });
    });

    it("should return default on invalid JSON", () => {
      localStorage.setItem("invalid", "not-json");
      expect(safeGetItem("invalid", "fallback")).toBe("fallback");
    });
  });

  describe("safeSetItem", () => {
    const safeSetItem = <T>(key: string, value: T): boolean => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    };

    it("should store JSON value", () => {
      safeSetItem("test", { key: "value" });
      expect(localStorage.getItem("test")).toBe('{"key":"value"}');
    });

    it("should return true on success", () => {
      expect(safeSetItem("test", "value")).toBe(true);
    });
  });
});
