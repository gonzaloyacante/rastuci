"use client";

import { CalendarDays, Download, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface AnalyticsHeaderProps {
  range: string;
  setRange: (range: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export function AnalyticsHeader({
  range,
  setRange,
  isRefreshing,
  onRefresh,
  onExport,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Dashboard
          <span className="text-sm font-normal text-muted-foreground bg-muted/50 px-2 py-1 rounded-full border border-border/50 hidden md:inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </h1>
        <p className="text-muted-foreground mt-1 text-sm max-w-md">
          Resumen de rendimiento en tiempo real de tu tienda.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[180px] bg-background/50 backdrop-blur border-border/50 shadow-sm hover:bg-accent/50 transition-colors">
            <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Seleccionar periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Últimos 7 días</SelectItem>
            <SelectItem value="month">Este Mes</SelectItem>
            <SelectItem value="year">Este Año</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="bg-background/50 backdrop-blur border-border/50 shadow-sm hover:bg-accent/50"
        >
          <RefreshCw
            className={`w-4 h-4 text-muted-foreground ${
              isRefreshing ? "animate-spin text-primary" : ""
            }`}
          />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="bg-background/50 backdrop-blur border-border/50 shadow-sm hover:bg-accent/50"
          title="Exportar reporte"
          onClick={onExport}
        >
          <Download className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
