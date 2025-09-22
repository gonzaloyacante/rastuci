import React from "react";
import { cn } from "@/lib/utils";

export type SpinnerProps = {
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
};

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export const Spinner: React.FC<SpinnerProps> = ({ size = "sm", className, ariaLabel }) => {
  return (
    <svg
      className={cn("animate-spin", sizeMap[size], className)}
      viewBox="0 0 24 24"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      aria-busy="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
};

export default Spinner;
