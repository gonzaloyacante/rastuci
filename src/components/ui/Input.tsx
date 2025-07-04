import React, { useId } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  icon?: string; // Nuevo prop para soportar iconos
  iconPosition?: "left" | "right"; // Posición del icono
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helpText,
      id,
      icon,
      iconPosition = "left",
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const inputId = id || reactId;

    // Función para renderizar el icono basado en el nombre
    const renderIcon = () => {
      if (!icon) return null;

      switch (icon.toLowerCase()) {
        case "mail":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          );
        case "lock":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          );
        case "search":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          );
        case "user":
          return (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          );
        default:
          return null;
      }
    };

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {renderIcon()}
            </div>
          )}
          <input
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-red-500 focus-visible:ring-red-500",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {renderIcon()}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
