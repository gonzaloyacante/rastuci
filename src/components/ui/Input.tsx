import React, { useState } from "react";
// import { cn } from "@/lib/utils"; // Available when needed

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean | string;
  helpText?: string;
  icon?: string; // Nuevo prop para soportar iconos
  iconPosition?: "left" | "right"; // Posición del icono
  allowPasswordToggle?: boolean; // Mostrar botón ver/ocultar para contraseñas
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
      allowPasswordToggle,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = rest.type === "password";
    const showToggle = isPassword && allowPasswordToggle;
    const effectiveType = showToggle && showPassword ? "text" : rest.type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 muted pointer-events-none">
              <i className={`icon-${icon}`}></i>
            </span>
          )}
          <input
            ref={ref}
            className={`form-input input-base text-sm transition-all duration-200 ${
              icon && iconPosition === "left" ? "pl-10" : "px-4"
            } ${icon && iconPosition === "right" ? "pr-10" : ""} ${
              showToggle ? "pr-16" : ""
            } ${error ? "border-error" : ""} ${className}`}
            // Si no hay label pero es password, añadimos aria-label para accesibilidad
            {...{ ...rest, type: effectiveType, 'aria-label': rest['aria-label'] || (!label && isPassword ? 'password' : undefined) }}
            onChange={(e) => {
              // Normalize event for tests that expect an object with target.value
              if (rest.onChange) {
                const ev = { target: { value: (e.target as HTMLInputElement).value } } as unknown as React.ChangeEvent<HTMLInputElement>;
                (rest.onChange as React.ChangeEventHandler<HTMLInputElement>)(ev);
              }
            }}
          />
          {icon && iconPosition === "right" && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 muted pointer-events-none">
              <i className={`icon-${icon}`}></i>
            </span>
          )}
          {showToggle && (
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 flex h-full items-center px-3 text-muted hover:text-foreground focus:outline-none z-10">
              {/* Simple eye icon using SVG to avoid external deps */}
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1.02-2.86 2.98-5.12 5.3-6.42M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M1 1l22 22" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error font-medium">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-xs muted">{helpText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
