import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "destructive"
    | "hero"
    | "product"
    | "category";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading,
      children,
      fullWidth = false,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer";

    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-lg",
      secondary: "bg-primary-50 text-primary-600 hover:bg-primary-100",
      outline:
        "bg-white border border-primary-200 text-primary-600 hover:bg-primary-50",
      ghost: "bg-transparent text-primary-500 hover:bg-primary-50",
      destructive: "bg-error-500 text-white hover:bg-error-600",
      hero: "bg-[#E91E63] text-white uppercase font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-[#C2185B] transform hover:scale-105",
      product:
        "bg-[#E91E63] text-white uppercase font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-[#C2185B] transform hover:scale-105",
      category:
        "bg-white text-primary-600 border border-primary-200 hover:bg-primary-50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2 text-sm",
      lg: "px-7 py-3 text-base",
      xl: "px-8 py-4 text-lg",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        {...props}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Cargando...
          </span>
        ) : (
          <span className="flex items-center gap-2">{children}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
