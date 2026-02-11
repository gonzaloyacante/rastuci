"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Label } from "@/components/ui/Label";

interface DatePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: Date | null;
  setDate?: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}

export function DatePicker({
  date,
  setDate,
  label,
  placeholder = "Seleccionar fecha",
  minDate,
  maxDate,
  disabled,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (newDate: Date) => {
    setDate?.(newDate);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {label && <Label className="mb-2 block">{label}</Label>}

      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal h-11", // Matching input height
          !date && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {date ? (
          format(date, "PPP", { locale: es })
        ) : (
          <span className="text-muted">{placeholder}</span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-[calc(100%+0.5rem)] left-0 z-50 w-auto p-0 rounded-lg border bg-surface shadow-xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
          <Calendar
            value={date}
            onChange={handleSelect}
            minDate={minDate}
            maxDate={maxDate}
            className="rounded-md border-0"
          />
        </div>
      )}
    </div>
  );
}
