import React from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6C63FF] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600",
      secondary: "bg-primary-50 text-primary-600 hover:bg-primary-100",
      outline:
        "bg-white border border-primary-200 text-primary-600 hover:bg-primary-50",
      ghost: "bg-transparent text-primary-500 hover:bg-primary-50",
      destructive: "bg-error-500 text-white hover:bg-error-600",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-5 py-2 text-sm",
      lg: "px-7 py-3 text-base",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
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
