import React from "react";
import { cn } from "@/lib/utils";
import { getColorHex } from "@/utils/colors";

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

    // Convertir nombre de color en español a hex
    const colorHex = getColorHex(color);

    const combinedClassName = cn(
      "inline-block rounded-full border-2 border-gray-300 shadow-sm",
      sizes[size],
      className
    );

    return (
      <span
        ref={ref}
        className={combinedClassName}
        style={{ backgroundColor: colorHex }}
        title={showTooltip ? color : undefined}
        {...props}
      />
    );
  }
);

ColorChip.displayName = "ColorChip";

export default ColorChip;
