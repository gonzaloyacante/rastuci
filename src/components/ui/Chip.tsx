import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export type ChipVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "info"
  | "error"
  | "outline";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: ChipVariant;
  selected?: boolean;
  onRemove?: () => void;
  removable?: boolean;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className = "",
      variant = "default",
      selected = false,
      onRemove,
      removable = false,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border transition-colors";
    const variants: Record<ChipVariant, string> = {
      default: "surface text-primary border-muted",
      primary: "bg-primary text-white border-primary",
      secondary: "surface text-primary border-muted",
      success: "bg-success text-white border-success",
      warning: "bg-warning text-white border-warning",
      info: "bg-info text-white border-info",
      error: "bg-error text-white border-error",
      outline: "bg-transparent text-primary border-muted",
    };

    return (
      <div
        ref={ref}
        className={cn(
          base,
          variants[variant],
          selected && "ring-2 ring-primary/40",
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        {removable && (
          <Button
            type="button"
            variant="ghost"
            className="ml-1 rounded hover-surface px-1 p-0 h-auto min-h-0 min-w-0 hover:bg-transparent"
            aria-label="Quitar"
            onClick={onRemove}
          >
            ✕
          </Button>
        )}
      </div>
    );
  }
);

Chip.displayName = "Chip";

export default Chip;
