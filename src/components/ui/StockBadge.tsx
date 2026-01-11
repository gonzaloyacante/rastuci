"use client";

import { Badge } from "@/components/ui/Badge";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

// Map colors to classes
const COLOR_CLASSES: Record<string, string> = {
  success:
    "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/10 dark:text-green-400",
  warning:
    "border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/10 dark:text-orange-400",
  error:
    "border-red-500 text-red-600 bg-red-50 dark:bg-red-900/10 dark:text-red-400",
  info: "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/10 dark:text-blue-400",
  muted:
    "border-gray-500 text-gray-600 bg-gray-50 dark:bg-gray-900/10 dark:text-gray-400",
  primary: "border-primary text-primary bg-primary/10",
  secondary: "border-secondary text-secondary bg-secondary/10",
  accent: "border-accent text-accent bg-accent/10",
};

export const StockBadge = ({
  stock,
  className,
}: {
  stock: number;
  className?: string;
}) => {
  const { settings } = useStoreSettings();
  const { stock: stockConfig, stockStatuses } = settings;

  const status = useMemo(() => {
    if (!stockConfig?.enableStockAlerts) return null;
    const stockVal = Number(stock);
    if (isNaN(stockVal)) return null;

    // Find the first matching rule
    // We assume rules are non-overlapping or ordered by priority.
    // The previous hardcoded logic was 0, <=5, <=10.
    // The admin UI allows creating rules.
    // We should trust the order in the array?
    // If Admin puts "0-0" first, then "1-5".
    // If I iterate in order:
    return stockStatuses?.find(
      (s) =>
        stockVal >= s.min &&
        (s.max === null || s.max === undefined || stockVal <= s.max)
    );
  }, [stock, stockConfig, stockStatuses]);

  if (!status) return null;

  const colorClass =
    COLOR_CLASSES[status.color as keyof typeof COLOR_CLASSES] ||
    COLOR_CLASSES.muted;

  return (
    <Badge
      variant="outline"
      className={cn("flex items-center gap-1", colorClass, className)}
    >
      {status.label}
    </Badge>
  );
};
