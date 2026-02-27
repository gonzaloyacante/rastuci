"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useGlobalKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input/textarea/contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // EXCEPT for Escape key (which should blur/close)
        if (e.key !== "Escape") return;
      }

      // Search: / or Ctrl+K / Cmd+K
      if (e.key === "/" || ((e.ctrlKey || e.metaKey) && e.key === "k")) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          "#search-input, [data-search-input]"
        );
        searchInput?.focus();
      }

      // Cart: C (only if no modifiers)
      if (
        e.key.toLowerCase() === "c" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        router.push("/cart");
      }

      // Home: H (only if no modifiers)
      if (
        e.key.toLowerCase() === "h" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        e.preventDefault();
        router.push("/");
      }

      // Help: ? (Shift + /)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        // Open keyboard shortcuts modal
        window.dispatchEvent(new CustomEvent("open-shortcuts-modal"));
      }

      // Escape: Close all modals/panels
      if (e.key === "Escape") {
        // We don't preventDefault here always because other components might need it,
        // but we dispatch our global close event.
        // Specific UI components (like Modals) usually handle StopPropagation if open.
        // But for global "close everything", we dispatch this.
        window.dispatchEvent(new CustomEvent("close-all-modals"));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
