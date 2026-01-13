"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  arrowIcon?: React.ReactNode;
  className?: string;
  dropdownClassName?: string;
  optionClassName?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Selecciona...",
  leftIcon,
  arrowIcon,
  className = "",
  dropdownClassName = "",
  optionClassName = "",
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Button
        type="button"
        disabled={disabled}
        variant="ghost"
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl surface border border-muted shadow-sm hover:surface-secondary focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-pointer appearance-none h-auto min-h-0 min-w-0 bg-transparent hover:bg-transparent ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 min-w-0 font-normal">
          {leftIcon && <span className="text-primary">{leftIcon}</span>}
          <span className={`truncate ${!selected ? "muted" : "text-primary"}`}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <span className="ml-2 flex items-center">
          {arrowIcon || <ChevronDown className="w-5 h-5 muted" />}
        </span>
      </Button>
      {open && (
        <ul
          className={`absolute z-20 mt-2 w-full surface border border-muted rounded-xl shadow-lg max-h-60 overflow-y-auto ${dropdownClassName}`}
          role="listbox"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm cursor-pointer select-none transition-colors duration-150 ${optionClassName} ${
                value === opt.value
                  ? "surface-secondary text-primary font-semibold"
                  : "text-primary hover:surface-secondary"
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === opt.value}
            >
              {opt.icon && <span>{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
