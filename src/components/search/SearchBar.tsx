import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/Input";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar...",
  value = "",
  onChange,
  onSearch,
  debounceMs = 300,
  disabled = false,
  className = "",
  showClearButton = true,
}) => {
  const [searchValue, setSearchValue] = useState(value);

  // Debounced onChange
  const debouncedOnChange = useCallback(
    (value: string) => {
      const timeoutId = setTimeout(() => onChange(value), debounceMs);
      return () => clearTimeout(timeoutId);
    },
    [onChange, debounceMs]
  );

  useEffect(() => {
    const cleanup = debouncedOnChange(searchValue);
    return cleanup;
  }, [searchValue, debouncedOnChange]);

  // Sync external value changes
  useEffect(() => {
    if (value !== searchValue) {
      setSearchValue(value);
    }
  }, [value, searchValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
  };

  const handleClear = () => {
    setSearchValue("");
    onChange("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(searchValue);
    }
  };

  return (
    <div className={className}>
      <Input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        leftIcon={
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        onClear={showClearButton && searchValue ? handleClear : undefined}
      />
    </div>
  );
};
