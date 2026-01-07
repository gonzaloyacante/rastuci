import { cn } from "@/lib/utils";
import React from "react";
import { Spinner } from "./Spinner";

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
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      loading = false,
      children,
      fullWidth = false,
      asChild = false,
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transform hover:scale-105 hover:shadow-lg";

    const variants = {
      primary: "btn-primary hover:bg-primary/90 hover:shadow-primary/30", // uses var(--color-primary)
      secondary:
        "surface border border-primary/20 text-primary hover-surface hover:shadow-md hover:border-primary/50",
      // Include btn-* aliases to satisfy tests expecting utility classes
      outline:
        "surface border border-primary text-primary hover-surface btn-outline hover:bg-primary/5 hover:shadow-md",
      ghost:
        "bg-transparent text-primary hover-surface btn-ghost hover:bg-primary/10",
      destructive:
        "surface border border-error text-error hover-surface btn-destructive hover:bg-error/5 hover:shadow-error/30",
      hero: "btn-hero uppercase hover:shadow-primary/40",
      product: "btn-product uppercase hover:shadow-primary/30",
      category:
        "surface text-primary border border-muted hover-surface hover:border-primary/50 hover:shadow-md",
    } as const;

    const sizes = {
      sm: "px-3 py-1.5 text-xs btn-sm",
      md: "px-5 py-2 text-sm",
      lg: "px-7 py-3 text-base btn-lg",
      xl: "px-8 py-4 text-lg",
    };
    const combinedClassName = cn(
      base,
      variants[variant],
      sizes[size],
      fullWidth ? "w-full" : "",
      className
    );

    // Render as child element (e.g., <a>) while applying classes and aria-disabled
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<Record<string, unknown>>;
      return React.cloneElement(child, {
        className: cn(child.props.className as string, combinedClassName),
        "aria-disabled": props.disabled ? "true" : undefined,
        ...("onClick" in child.props ? {} : { onClick: props.onClick }),
      });
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        aria-disabled={props.disabled ? "true" : undefined}
        aria-busy={loading ? "true" : undefined}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <Spinner size="sm" ariaLabel="Cargando" />}
        {!loading && leftIcon}
        {loading ? "Cargando..." : children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
