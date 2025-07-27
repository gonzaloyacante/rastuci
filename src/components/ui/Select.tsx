"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  name?: string;
  id?: string;
}

export const Select = ({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  disabled = false,
  className = "",
  error = false,
  name,
  id,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find((option) => option.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (filteredOptions.length > 0) {
        handleOptionClick(filteredOptions[0].value);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      <button
        type="button"
        className={`w-full bg-[#FAFAFA] border ${
          error ? "border-[#E53935]" : "border-[#E0E0E0]"
        } rounded-lg px-4 py-3 text-left text-sm text-[#222] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-[#6C63FF] transition-all duration-200 flex items-center justify-between ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        id={id}
        name={name}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-invalid={error}>
        <span className={value ? "" : "text-[#BDBDBD]"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } text-[#888]`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <ul
          ref={containerRef}
          className="absolute z-20 mt-2 w-full bg-white border border-[#E0E0E0] rounded-lg shadow-lg max-h-60 overflow-auto py-1 text-sm"
          role="listbox">
          {options.length === 0 && (
            <li className="px-4 py-2 text-[#888]">Sin opciones</li>
          )}
          {options.map((option) => (
            <li
              key={option.value}
              className={`px-4 py-2 hover:bg-[#F5F5F5] transition-colors rounded ${
                option.value === value
                  ? "bg-[#F5F5F5] font-semibold text-[#6C63FF]"
                  : "text-[#222]"
              }`}
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}>
              {option.label}
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-1 text-xs text-[#E53935] font-medium">
          Campo requerido
        </p>
      )}
    </div>
  );
};

export default Select;
