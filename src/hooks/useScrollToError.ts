import { useCallback } from "react";

/**
 * useScrollToError
 *
 * Returns a function that, given a react-hook-form errors object (or a plain
 * Record<string, unknown>), finds the first errored field in the DOM and
 * smoothly scrolls to it + focuses it.
 *
 * Lookup order per field key:
 *   1. document.getElementById(key)
 *   2. document.querySelector(`[name="${key}"]`)
 *   3. document.querySelector(`[data-field="${key}"]`)
 */
export function useScrollToError() {
  return useCallback((errors: Record<string, unknown>) => {
    const firstKey = Object.keys(errors)[0];
    if (!firstKey) return;

    // Small delay so that react-hook-form has already re-rendered error state
    setTimeout(() => {
      const el =
        document.getElementById(firstKey) ??
        document.querySelector<HTMLElement>(`[name="${firstKey}"]`) ??
        document.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if (typeof el.focus === "function") el.focus();
      }
    }, 50);
  }, []);
}
