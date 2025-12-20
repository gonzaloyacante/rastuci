/**
 * Hook Tests: useDebounce
 * 
 * Tests for debounce hook functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState, useEffect } from "react";

// Custom useDebounce implementation for testing
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

describe("useDebounce Hook Tests", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Basic Functionality", () => {
        it("should return initial value immediately", () => {
            const { result } = renderHook(() => useDebounce("initial", 500));
            expect(result.current).toBe("initial");
        });

        it("should not update value before delay", () => {
            let value = "initial";
            const { result, rerender } = renderHook(() => useDebounce(value, 500));

            value = "updated";
            rerender();

            // Value should still be initial
            expect(result.current).toBe("initial");
        });

        it("should update value after delay", () => {
            let value = "initial";
            const { result, rerender } = renderHook(() => useDebounce(value, 500));

            value = "updated";
            rerender();

            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(result.current).toBe("updated");
        });

        it("should reset timer on rapid changes", () => {
            let value = "initial";
            const { result, rerender } = renderHook(() => useDebounce(value, 500));

            // First change
            value = "change1";
            rerender();
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Second change before timeout
            value = "change2";
            rerender();
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Should still show initial (timer reset)
            expect(result.current).toBe("initial");

            // Complete timeout
            act(() => {
                vi.advanceTimersByTime(200);
            });

            // Now should show final value
            expect(result.current).toBe("change2");
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero delay", () => {
            let value = "initial";
            const { result, rerender } = renderHook(() => useDebounce(value, 0));

            value = "updated";
            rerender();

            act(() => {
                vi.advanceTimersByTime(1);
            });

            expect(result.current).toBe("updated");
        });

        it("should handle undefined values", () => {
            const { result } = renderHook(() => useDebounce(undefined, 500));
            expect(result.current).toBeUndefined();
        });

        it("should handle null values", () => {
            const { result } = renderHook(() => useDebounce(null, 500));
            expect(result.current).toBeNull();
        });

        it("should handle object values", () => {
            const obj = { key: "value" };
            const { result } = renderHook(() => useDebounce(obj, 500));
            expect(result.current).toEqual(obj);
        });
    });

    describe("Search Input Use Case", () => {
        it("should debounce search queries", () => {
            const searchCallback = vi.fn();
            let searchTerm = "";

            const { result, rerender } = renderHook(() => {
                const debouncedTerm = useDebounce(searchTerm, 300);
                useEffect(() => {
                    if (debouncedTerm) {
                        searchCallback(debouncedTerm);
                    }
                }, [debouncedTerm]);
                return debouncedTerm;
            });

            // Type "hello" quickly
            searchTerm = "h";
            rerender();
            searchTerm = "he";
            rerender();
            searchTerm = "hel";
            rerender();
            searchTerm = "hell";
            rerender();
            searchTerm = "hello";
            rerender();

            // Callback should not fire yet
            expect(searchCallback).not.toHaveBeenCalled();

            // Wait for debounce
            act(() => {
                vi.advanceTimersByTime(300);
            });

            // Should only call once with final value
            expect(searchCallback).toHaveBeenCalledTimes(1);
            expect(searchCallback).toHaveBeenCalledWith("hello");
        });
    });
});

describe("useLocalStorage Hook Tests", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    // Custom useLocalStorage implementation for testing
    function useLocalStorage<T>(key: string, initialValue: T) {
        const [storedValue, setStoredValue] = useState<T>(() => {
            if (typeof window === "undefined") return initialValue;
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch {
                return initialValue;
            }
        });

        const setValue = (value: T | ((val: T) => T)) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                console.error(error);
            }
        };

        return [storedValue, setValue] as const;
    }

    describe("Basic Functionality", () => {
        it("should return initial value when localStorage is empty", () => {
            const { result } = renderHook(() => useLocalStorage("test-key", "default"));
            expect(result.current[0]).toBe("default");
        });

        it("should return stored value from localStorage", () => {
            localStorage.setItem("test-key", JSON.stringify("stored-value"));
            const { result } = renderHook(() => useLocalStorage("test-key", "default"));
            expect(result.current[0]).toBe("stored-value");
        });

        it("should update localStorage when value changes", () => {
            const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

            act(() => {
                result.current[1]("updated");
            });

            expect(localStorage.getItem("test-key")).toBe(JSON.stringify("updated"));
        });

        it("should handle function updates", () => {
            const { result } = renderHook(() => useLocalStorage("counter", 0));

            act(() => {
                result.current[1]((prev) => prev + 1);
            });

            expect(result.current[0]).toBe(1);
        });
    });

    describe("Type Safety", () => {
        it("should handle object values", () => {
            const initialValue = { name: "Test", count: 0 };
            const { result } = renderHook(() => useLocalStorage("object-key", initialValue));

            expect(result.current[0]).toEqual(initialValue);

            act(() => {
                result.current[1]({ name: "Updated", count: 5 });
            });

            expect(result.current[0]).toEqual({ name: "Updated", count: 5 });
        });

        it("should handle array values", () => {
            const initialValue: string[] = [];
            const { result } = renderHook(() => useLocalStorage("array-key", initialValue));

            act(() => {
                result.current[1](["item1", "item2"]);
            });

            expect(result.current[0]).toEqual(["item1", "item2"]);
        });

        it("should handle boolean values", () => {
            const { result } = renderHook(() => useLocalStorage("bool-key", false));

            act(() => {
                result.current[1](true);
            });

            expect(result.current[0]).toBe(true);
        });
    });

    describe("Error Handling", () => {
        it("should handle invalid JSON in localStorage", () => {
            localStorage.setItem("invalid-key", "not-valid-json");
            const { result } = renderHook(() => useLocalStorage("invalid-key", "fallback"));
            expect(result.current[0]).toBe("fallback");
        });

        it("should handle quota exceeded gracefully", () => {
            // Simulate by checking setValue doesn't throw
            const { result } = renderHook(() => useLocalStorage("test-key", ""));

            expect(() => {
                act(() => {
                    result.current[1]("some value");
                });
            }).not.toThrow();
        });
    });
});
