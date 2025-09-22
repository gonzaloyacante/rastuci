import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: boolean | string;
  helpText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      leftIcon,
      rightIcon,
      className = "",
      rows = 4,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2">{label}</label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute inset-y-0 left-0 flex items-start pt-3 pl-3 muted pointer-events-none">
              {leftIcon}
            </span>
          )}
          <textarea
            ref={ref}
            rows={rows}
            className={cn(
              "form-input w-full text-sm py-3",
              leftIcon ? "pl-10" : "px-4",
              rightIcon ? "pr-10" : "",
              error ? "border-error" : "",
              className
            )}
            {...rest}
          />
          {rightIcon && (
            <span className="absolute inset-y-0 right-0 flex items-start pt-3 pr-3 muted pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-error font-medium">{error}</p>
        )}
        {helpText && !error && (
          <p className="mt-1 text-xs muted">{helpText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
