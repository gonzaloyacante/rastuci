"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";

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
  searchable?: boolean;
  clearable?: boolean;
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
  searchable = false,
  clearable = false,
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

  // Filtrar opciones basado en la búsqueda (si searchable)
  const filteredOptions = options.filter((option) =>
    !searchable
      ? true
      : option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOption = options.find((option) => option.value === value);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const _handleKeyDown = (e: React.KeyboardEvent) => {
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
        className={`form-input text-left text-sm transition-all duration-200 flex items-center justify-between ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        } ${error ? "border-error" : ""}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        id={id}
        name={name}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate flex-1 min-w-0 mr-2">
          <span className={value ? "" : "muted"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        {clearable && value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
              }
            }}
            className="p-1 rounded hover-surface mr-1 cursor-pointer inline-flex items-center justify-center"
            aria-label="Limpiar selección"
          >
            <X className="w-4 h-4 muted" />
          </button>
        )}
        <svg
          className={`w-5 h-5 ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          } muted`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
          className="absolute z-20 mt-2 w-full surface border border-muted rounded-lg shadow-lg max-h-60 overflow-auto py-1 text-sm"
          role="listbox"
        >
          {searchable && (
            <li className="px-2 pb-1 sticky top-0 surface">
              <input
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full text-sm"
                placeholder="Buscar..."
                aria-label="Buscar opción"
                autoFocus
              />
            </li>
          )}
          {options.length === 0 && (
            <li className="px-4 py-2 muted">Sin opciones</li>
          )}
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              className={`px-4 py-2 cursor-pointer transition-colors rounded mx-1 ${
                option.value === value
                  ? "bg-primary text-white font-semibold"
                  : "hover:bg-surface-secondary hover:text-primary"
              }`}
              onClick={() => handleOptionClick(option.value)}
              role="option"
              aria-selected={option.value === value}
            >
              <div className="flex items-center gap-2">
                {option.value === value && (
                  <Check className="w-4 h-4 text-white" />
                )}
                <span className="truncate">{option.label}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p className="mt-1 text-xs text-error font-medium">Campo requerido</p>
      )}
    </div>
  );
};

export default Select;
