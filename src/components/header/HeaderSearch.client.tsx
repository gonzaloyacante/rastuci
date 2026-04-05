"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import SmartSearch from "@/components/search/SmartSearch";

export default function HeaderSearch() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Expanding search input */}
      <div
        className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
          open ? "w-64 sm:w-80 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <SmartSearch
          size="sm"
          className="w-full"
          onSearch={() => setOpen(false)}
        />
      </div>

      {/* Search / Close toggle button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar buscador" : "Abrir buscador"}
        className="p-2 muted hover:text-primary transition-colors rounded-md hover:bg-surface shrink-0"
      >
        {open ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </button>
    </div>
  );
}
