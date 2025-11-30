import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import * as React from "react";

// Context para pasar valor y handler a los items
interface RadioGroupContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

interface RadioGroupItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, onValueChange, children, ...props }, ref) => {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("grid gap-2", className)} {...props} ref={ref}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const checked = context.value === value;

    return (
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        value={value}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => context.onValueChange?.(value)}
        ref={ref}
        {...props}
      >
        <span
          className={cn(
            "flex items-center justify-center",
            checked ? "opacity-100" : "opacity-0"
          )}
        >
          <Circle className="h-2.5 w-2.5 fill-current text-current" />
        </span>
      </button>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
