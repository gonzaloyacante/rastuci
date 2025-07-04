import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  // Estilos base para todas las variantes
  const baseStyles =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";

  // Estilos específicos para cada variante
  const variantStyles: Record<string, string> = {
    default: "bg-[#E91E63] text-white hover:bg-[#C2185B]",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    destructive: "bg-red-100 text-red-800 hover:bg-red-200",
    outline: "border border-gray-300 text-gray-800",
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${
    className || ""
  }`;

  return <div className={combinedClassName} {...props} />;
}

// Exportamos una versión simulada de badgeVariants para compatibilidad
const badgeVariants = {
  variants: {
    default: "bg-[#E91E63] text-white hover:bg-[#C2185B]",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    destructive: "bg-red-100 text-red-800 hover:bg-red-200",
    outline: "border border-gray-300 text-gray-800",
  },
};

export { Badge, badgeVariants };
