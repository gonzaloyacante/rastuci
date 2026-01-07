"use client";

import React, { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message or boolean to show error state */
  error?: boolean | string;
  /** Help text displayed below the input */
  helpText?: string;
  /** Icon displayed on the left side (React node, e.g., Lucide icon) */
  leftIcon?: React.ReactNode;
  /** Icon displayed on the right side (React node, e.g., Lucide icon) */
  rightIcon?: React.ReactNode;
  /** @deprecated Use leftIcon/rightIcon instead */
  icon?: string;
  /** @deprecated Use leftIcon/rightIcon instead */
  iconPosition?: "left" | "right";
  /** Visual variant */
  variant?: "default" | "filled" | "ghost";
  /** Size variant */
  inputSize?: "sm" | "md" | "lg";
  /** Callback when clear button is clicked (shows X button when provided and value exists) */
  onClear?: () => void;
  /** Show password toggle button for password inputs */
  allowPasswordToggle?: boolean;
  /** Mark field as required (shows asterisk) */
  required?: boolean;
  /** Container class name */
  containerClassName?: string;
}

const sizeClasses = {
  sm: "h-8 text-xs px-2.5",
  md: "h-10 text-sm px-3",
  lg: "h-12 text-base px-4",
};

const variantClasses = {
  default:
    "border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
  filled:
    "border-0 bg-[var(--color-surface-secondary)] focus:bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
  ghost:
    "border-0 bg-transparent hover:bg-[var(--color-surface-secondary)] focus:bg-[var(--color-surface-secondary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      icon, // deprecated
      iconPosition = "left", // deprecated
      variant = "default",
      inputSize = "md",
      onClear,
      allowPasswordToggle,
      required,
      className = "",
      containerClassName,
      value,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const {
      id: restId,
      type: restType,
      onChange: restOnChange,
      ["aria-label"]: restAria,
      disabled,
      ...restProps
    } = rest || {};

    const id = restId || `input-${generatedId}`;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = restType === "password";
    const showToggle = isPassword && allowPasswordToggle;
    const effectiveType = showToggle && showPassword ? "text" : restType;
    const ariaLabel =
      restAria || (!label && isPassword ? "password" : undefined);

    // Support legacy icon prop
    const hasLeftIcon = leftIcon || (icon && iconPosition === "left");
    const hasRightIcon = rightIcon || (icon && iconPosition === "right");
    const showClearButton = onClear && value && !disabled;

    // Calculate padding based on icons and buttons
    const leftPadding = hasLeftIcon ? "pl-10" : "";
    const rightPaddingNeeds = [
      hasRightIcon && "pr-10",
      showClearButton && "pr-10",
      showToggle && "pr-12",
      showClearButton && showToggle && "pr-20",
    ].filter(Boolean);
    const rightPadding = rightPaddingNeeds[rightPaddingNeeds.length - 1] || "";

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-2 text-[var(--color-text)]"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {/* Left Icon */}
          {hasLeftIcon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text-muted)] pointer-events-none">
              {leftIcon || <i className={`icon-${icon}`} />}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={effectiveType}
            value={value}
            disabled={disabled}
            aria-label={ariaLabel}
            aria-invalid={!!error}
            aria-describedby={helpText || error ? `${id}-help` : undefined}
            aria-required={required}
            onChange={(e) => {
              if (typeof restOnChange === "function") {
                restOnChange(e);
              }
            }}
            className={cn(
              // Base styles
              "w-full rounded-lg outline-none transition-all duration-200",
              "placeholder:text-[var(--color-text-muted)]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              // Size
              sizeClasses[inputSize],
              // Variant
              variantClasses[variant],
              // Icons padding
              leftPadding,
              rightPadding,
              // Error state
              error && "border-error focus:border-error focus:ring-error/20",
              // Custom classes
              className
            )}
            {...restProps}
          />

          {/* Right Icon (static) */}
          {hasRightIcon && !showClearButton && !showToggle && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--color-text-muted)] pointer-events-none">
              {rightIcon || <i className={`icon-${icon}`} />}
            </span>
          )}

          {/* Clear Button */}
          {showClearButton && (
            <button
              type="button"
              aria-label="Limpiar"
              onClick={onClear}
              className={cn(
                "absolute inset-y-0 flex items-center justify-center",
                "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                "focus:outline-none transition-colors",
                showToggle ? "right-10" : "right-3"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Password Toggle */}
          {showToggle && (
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] focus:outline-none transition-colors"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.86 2.98-5.12 5.3-6.42M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && typeof error === "string" && (
          <p
            id={`${id}-help`}
            className="mt-1.5 text-xs text-error font-medium"
          >
            {error}
          </p>
        )}

        {/* Help Text */}
        {helpText && !error && (
          <p
            id={`${id}-help`}
            className="mt-1.5 text-xs text-[var(--color-text-muted)]"
          >
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
