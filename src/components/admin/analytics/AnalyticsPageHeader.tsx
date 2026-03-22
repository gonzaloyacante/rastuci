"use client";

import { Download, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";

interface AnalyticsPageHeaderProps {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  exportDisabled?: boolean;
  children?: ReactNode;
}

export function AnalyticsPageHeader({
  title,
  subtitle,
  onExport,
  onRefresh,
  refreshing,
  exportDisabled,
  children,
}: AnalyticsPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
      </div>
      <div className="flex gap-2">
        {onRefresh && (
          <Button onClick={onRefresh} disabled={refreshing} variant="outline">
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        )}
        {onExport && (
          <Button
            onClick={onExport}
            variant="outline"
            disabled={exportDisabled}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
