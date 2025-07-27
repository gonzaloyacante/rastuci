"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
      <button
        type="button"
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border-2 border-[#E0E0E0] rounded-lg bg-white focus:border-[#E91E63] focus:ring-2 focus:ring-[#E91E63] focus:ring-opacity-20 transition-all duration-200 cursor-pointer appearance-none ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}>
        <div className="flex items-center gap-2 min-w-0">
          {leftIcon && <span className="text-[#E91E63]">{leftIcon}</span>}
          <span
            className={`truncate ${
              !selected ? "text-gray-400" : "text-[#333333]"
            }`}>
            {selected ? selected.label : placeholder}
          </span>
        </div>
        <span className="ml-2 flex items-center">
          {arrowIcon || <ChevronDown className="w-5 h-5 text-[#757575]" />}
        </span>
      </button>
      {open && (
        <ul
          className={`absolute z-20 mt-2 w-full bg-white border-2 border-[#E0E0E0] rounded-lg shadow-lg max-h-60 overflow-y-auto ${dropdownClassName}`}
          role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`flex items-center gap-2 px-4 py-3 hover:bg-[#FCE4EC] transition-colors duration-150 ${optionClassName} ${
                value === opt.value
                  ? "bg-[#F8BBD9] text-[#E91E63] font-semibold"
                  : "text-[#333333]"
              }`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === opt.value}>
              {opt.icon && <span>{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
