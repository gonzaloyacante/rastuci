import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Package, CheckCircle } from "lucide-react";

interface StockBadgeProps {
    stock: number;
}

export const StockBadge = ({ stock }: StockBadgeProps) => {
    if (stock === 0) {
        return (
            <Badge variant="error" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sin stock
            </Badge>
        );
    }
    if (stock <= 5) {
        return (
            <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Stock bajo ({stock})
            </Badge>
        );
    }
    if (stock <= 10) {
        return (
            <Badge variant="info" className="flex items-center gap-1">
                <Package className="h-3 w-3" />
                Stock medio ({stock})
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="flex items-center gap-1 border-emerald-500 text-emerald-600 dark:text-emerald-400"
        >
            <CheckCircle className="h-3 w-3" />
            Stock bueno ({stock})
        </Badge>
    );
};
