"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export type CalendarProps = {
  value?: Date | null;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
};

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(value || new Date());

  // Sync current month if value changes significantly (optional, but good UX)
  React.useEffect(() => {
    if (value && !isSameMonth(value, currentMonth)) {
      setCurrentMonth(value);
    }
  }, [value]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = (day: Date) => {
    if (isDisabled(day)) return;
    onChange?.(day);
  };

  const isDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(0, 0, 0, 0))) return true;
    return false;
  };

  return (
    <div className={cn("p-3 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg capitalize text-content-primary">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted mb-2">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((day) => (
          <div key={day} className="font-medium opacity-70">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = value ? isSameDay(day, value) : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const disabled = isDisabled(day);

          return (
            <button
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              disabled={disabled}
              type="button"
              className={cn(
                "h-9 w-9 p-0 rounded-md flex items-center justify-center text-sm transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                !isCurrentMonth && "text-muted/40",
                isToday(day) &&
                  !isSelected &&
                  "border border-primary text-primary font-semibold",
                isSelected &&
                  "bg-primary text-white hover:bg-primary hover:text-white shadow-md font-medium",
                disabled &&
                  "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-muted"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
