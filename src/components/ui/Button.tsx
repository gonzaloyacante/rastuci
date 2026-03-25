import React from "react";

import { cn } from "@/lib/utils";

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

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transform hover:scale-105 hover:shadow-lg";

const BUTTON_VARIANTS = {
  primary: "btn-primary hover:bg-primary/90 hover:shadow-primary/30",
  secondary:
    "surface border border-primary/20 text-primary hover-surface hover:shadow-md hover:border-primary/50",
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

const BUTTON_SIZES = {
  sm: "px-3 py-1.5 text-xs btn-sm",
  md: "px-5 py-2 text-sm",
  lg: "px-7 py-3 text-base btn-lg",
  xl: "px-8 py-4 text-lg",
} as const;

function renderAsChild(
  children: React.ReactNode,
  combinedClassName: string,
  disabled: boolean | undefined,
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined
): React.ReactElement | null {
  if (!React.isValidElement(children)) return null;
  const child = children as React.ReactElement<Record<string, unknown>>;
  return React.cloneElement(child, {
    className: cn(child.props.className as string, combinedClassName),
    "aria-disabled": disabled ? "true" : undefined,
    ...("onClick" in child.props ? {} : { onClick }),
  });
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
    const combinedClassName = cn(
      BUTTON_BASE,
      BUTTON_VARIANTS[variant],
      BUTTON_SIZES[size],
      fullWidth ? "w-full" : "",
      className
    );

    if (asChild) {
      return renderAsChild(
        children,
        combinedClassName,
        props.disabled,
        props.onClick
      );
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
