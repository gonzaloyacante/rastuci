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

function Badge({
  className = "",
  variant = "default",
  size = "sm",
  ...props
}: BadgeProps) {
  // Estilos base para todas las variantes
  const baseStyles =
    "inline-flex items-center rounded-full font-semibold transition-colors";

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
    secondary:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:brightness-95",
    success: "bg-emerald-500 text-white hover:brightness-90",
    warning: "bg-amber-500 text-white hover:brightness-90",
    info: "bg-blue-500 text-white hover:brightness-90",
    error: "bg-red-500 text-white hover:brightness-90",
    // Mantener 'destructive' por compatibilidad; alias a 'error'
    destructive: "bg-red-500 text-white hover:brightness-90",
    outline: "border border-muted text-primary bg-transparent",
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
    secondary:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:brightness-95",
    success: "bg-emerald-500 text-white hover:brightness-90",
    warning: "bg-amber-500 text-white hover:brightness-90",
    info: "bg-blue-500 text-white hover:brightness-90",
    error: "bg-red-500 text-white hover:brightness-90",
    destructive: "bg-red-500 text-white hover:brightness-90",
    outline: "border border-muted text-primary bg-transparent",
  },
};

export { Badge, badgeVariants };
export default Badge;
