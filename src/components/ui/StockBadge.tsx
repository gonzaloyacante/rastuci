import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";

interface StockBadgeProps {
  stock: number;
}

export const StockBadge = ({ stock }: StockBadgeProps) => {
  const stockVal = Number(stock);

  if (isNaN(stockVal)) return null;

  if (stockVal === 0) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10"
      >
        <AlertTriangle className="h-3 w-3" />
        Sin stock
      </Badge>
    );
  }
  if (stockVal <= 5) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 border-amber-500 text-amber-500 bg-amber-50 dark:bg-amber-900/10"
      >
        <AlertTriangle className="h-3 w-3" />
        Stock bajo ({stockVal})
      </Badge>
    );
  }
  if (stockVal <= 10) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1 border-blue-500 text-blue-500 bg-blue-50 dark:bg-blue-900/10"
      >
        <Package className="h-3 w-3" />
        Stock medio ({stockVal})
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1 border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 dark:text-emerald-400"
    >
      <CheckCircle className="h-3 w-3" />
      Stock bueno ({stockVal})
    </Badge>
  );
};
