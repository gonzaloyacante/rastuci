import React from "react";
import { cn } from "@/lib/utils";

interface ColorChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  color: string;
  size?: "xs" | "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export const ColorChip = React.forwardRef<HTMLSpanElement, ColorChipProps>(
  ({ className = "", color, size = "sm", showTooltip = true, ...props }, ref) => {
    const sizes = {
      xs: "w-3 h-3",
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const combinedClassName = cn(
      "inline-block rounded-full border border-muted",
      sizes[size],
      className
    );

    return (
      <span
        ref={ref}
        className={combinedClassName}
        style={{ backgroundColor: color }}
        title={showTooltip ? color : undefined}
        {...props}
      />
    );
  }
);

ColorChip.displayName = "ColorChip";

export default ColorChip;
