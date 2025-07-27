import React, { useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: string; // Nuevo prop para soportar iconos
  iconPosition?: "left" | "right"; // Posición del icono
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      icon,
      iconPosition = "left",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#222] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#888] pointer-events-none">
              <i className={`icon-${icon}`}></i>
            </span>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border border-[#E0E0E0] bg-[#FAFAFA] px-4 py-3 text-sm text-[#222] placeholder-[#BDBDBD] focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:border-[#6C63FF] transition-all duration-200 ${
              icon && iconPosition === "left" ? "pl-10" : ""
            } ${icon && iconPosition === "right" ? "pr-10" : ""} ${
              error ? "border-[#E53935]" : ""
            } ${className}`}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#888] pointer-events-none">
              <i className={`icon-${icon}`}></i>
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-[#E53935] font-medium">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-xs text-[#888]">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
