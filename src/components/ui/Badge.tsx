import * as React from "react";

type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "info"
  | "error"
  | "destructive"
  | "outline";

type BadgeSize = "xs" | "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

function Badge({ className = "", variant = "default", size = "sm", ...props }: BadgeProps) {
  // Estilos base para todas las variantes
  const baseStyles = "inline-flex items-center rounded-full font-semibold transition-colors";

  // Estilos específicos para cada tamaño
  const sizeStyles: Record<BadgeSize, string> = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  // Estilos específicos para cada variante
  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-primary text-white hover:brightness-90",
    primary: "bg-primary text-white hover:brightness-90",
    secondary: "surface muted hover:brightness-95",
    success: "bg-success text-white hover:brightness-90",
    warning: "bg-warning text-white hover:brightness-90",
    info: "bg-info text-white hover:brightness-90",
    error: "bg-error text-white hover:brightness-90",
    // Mantener 'destructive' por compatibilidad; alias a 'error'
    destructive: "bg-error text-white hover:brightness-90",
    outline: "border border-muted text-primary",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
    className || ""
  }`;

  return <div className={combinedClassName} {...props} />;
}

// Exportamos una versión simulada de badgeVariants para compatibilidad
const badgeVariants = {
  variants: {
    default: "bg-primary text-white hover:brightness-90",
    primary: "bg-primary text-white hover:brightness-90",
    secondary: "surface muted hover:brightness-95",
    success: "bg-success text-white hover:brightness-90",
    warning: "bg-warning text-white hover:brightness-90",
    info: "bg-info text-white hover:brightness-90",
    error: "bg-error text-white hover:brightness-90",
    destructive: "bg-error text-white hover:brightness-90",
    outline: "border border-muted text-primary",
  },
};

export { Badge, badgeVariants };
export default Badge;
