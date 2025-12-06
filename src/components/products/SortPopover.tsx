"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

interface SortPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  options: Array<{ value: string; label: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export function SortPopover({
  isOpen,
  onClose,
  options,
  selectedValue,
  onSelect,
  triggerRef,
}: SortPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
    onClose();
  };

  const content = (
    <div
      ref={popoverRef}
      className="fixed right-4 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fade-in"
      style={{
        top: triggerRef.current
          ? `${triggerRef.current.getBoundingClientRect().bottom + 8}px`
          : "auto",
      }}
      role="menu"
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
            option.value === selectedValue ? "bg-primary/5" : ""
          }`}
          role="menuitem"
        >
          <span
            className={`text-sm ${
              option.value === selectedValue
                ? "font-semibold text-primary"
                : "text-gray-700"
            }`}
          >
            {option.label}
          </span>
          {option.value === selectedValue && (
            <Check size={16} className="text-primary" />
          )}
        </button>
      ))}
    </div>
  );

  return createPortal(content, document.body);
}
