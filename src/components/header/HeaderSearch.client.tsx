"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import SmartSearch from "@/components/search/SmartSearch";

export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir buscador"
        className="p-2 muted hover:text-primary transition-colors rounded-md hover:bg-surface"
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Search panel */}
          <div className="relative w-full max-w-2xl z-10">
            <div className="relative surface rounded-xl shadow-2xl p-4">
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar buscador"
                className="absolute top-3 right-3 p-1.5 muted hover:text-primary transition-colors rounded-md hover:bg-surface z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <SmartSearch
                size="lg"
                className="w-full"
                onSearch={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
