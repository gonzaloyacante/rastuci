import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { LucideIcon } from "lucide-react";
import {
  Calendar,
  Download,
  Minus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// Page Header with Actions
// ============================================================================

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

// ============================================================================
// Date Range Filter
// ============================================================================

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  children?: ReactNode;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  children,
}: DateRangeFilterProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Metric Card
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "improving" | "declining" | "stable";
  trendValue?: string;
  icon?: LucideIcon;
  valueColor?: "default" | "success" | "warning" | "error";
}

function getTrendIcon(trend?: string) {
  switch (trend) {
    case "improving":
      return <TrendingUp className="h-4 w-4 text-success" />;
    case "declining":
      return <TrendingDown className="h-4 w-4 text-error" />;
    default:
      return <Minus className="h-4 w-4 text-muted" />;
  }
}

function getTrendLabel(trend?: string) {
  switch (trend) {
    case "improving":
      return "Mejorando";
    case "declining":
      return "Declinando";
    default:
      return "Estable";
  }
}

function getTrendVariant(
  trend?: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (trend) {
    case "improving":
      return "default";
    case "declining":
      return "destructive";
    default:
      return "secondary";
  }
}

const valueColorMap = {
  default: "",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  valueColor = "default",
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${valueColorMap[valueColor]}`}>
              {value}
            </div>
            {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon(trend)}
              <Badge variant={getTrendVariant(trend)}>
                {trendValue || getTrendLabel(trend)}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Metrics Grid
// ============================================================================

interface MetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
}

const metricsGridColsMap = {
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

export function MetricsGrid({ children, columns = 4 }: MetricsGridProps) {
  return (
    <div className={`grid ${metricsGridColsMap[columns]} gap-4`}>
      {children}
    </div>
  );
}

// ============================================================================
// Progress Bar
// ============================================================================

interface ProgressBarProps {
  label: string;
  value: number;
  count?: number;
  percentage?: number;
  color?: "primary" | "success" | "warning" | "error";
}

const progressColorMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

export function ProgressBar({
  label,
  value,
  count,
  percentage,
  color = "primary",
}: ProgressBarProps) {
  const displayPercentage = percentage ?? value;

  return (
    <div className="flex items-center justify-between">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-32 bg-surface-secondary rounded-full h-2">
          <div
            className={`${progressColorMap[color]} h-2 rounded-full`}
            style={{ width: `${Math.min(displayPercentage, 100)}%` }}
          />
        </div>
        <span className="text-sm text-muted w-20 text-right">
          {count !== undefined
            ? `${count} (${displayPercentage}%)`
            : `${displayPercentage}%`}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Distribution Chart (simple bar chart)
// ============================================================================

interface DistributionItem {
  label: string;
  count: number;
  percentage?: number;
}

interface DistributionChartProps {
  title: string;
  items: DistributionItem[];
}

export function DistributionChart({ title, items }: DistributionChartProps) {
  const maxCount = Math.max(...items.map((i) => i.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <ProgressBar
              key={item.label}
              label={item.label}
              value={(item.count / maxCount) * 100}
              count={item.count}
              percentage={item.percentage}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Data Table
// ============================================================================

interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, row: T) => ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  title: string;
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  emptyMessage = "No hay datos disponibles",
}: DataTableProps<T>) {
  const alignMap = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-center text-muted py-8">{emptyMessage}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`${alignMap[col.align || "left"]} py-2 px-2 font-medium`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b last:border-0">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`${alignMap[col.align || "left"]} py-2 px-2`}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Region Select
// ============================================================================

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  regions?: { label: string; value: string }[];
}

const defaultRegions = [
  { label: "Todas las regiones", value: "" },
  { label: "Buenos Aires", value: "Buenos Aires" },
  { label: "Córdoba", value: "Córdoba" },
  { label: "Rosario", value: "Rosario" },
  { label: "Mendoza", value: "Mendoza" },
  { label: "Santa Fe", value: "Santa Fe" },
  { label: "Tucumán", value: "Tucumán" },
];

export function RegionSelect({
  value,
  onChange,
  regions = defaultRegions,
}: RegionSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">Región</label>
      <Select
        value={value}
        onChange={(v: string) => onChange(v)}
        placeholder="Todas las regiones"
        options={regions}
      />
    </div>
  );
}

// ============================================================================
// Status Badge
// ============================================================================

type TrackingStatus =
  | "pending"
  | "in-transit"
  | "delivered"
  | "delayed"
  | "error";

interface TrackingStatusBadgeProps {
  status: TrackingStatus;
}

const trackingStatusConfig: Record<
  TrackingStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  "in-transit": {
    label: "En tránsito",
    className: "bg-blue-100 text-blue-800",
  },
  delivered: { label: "Entregado", className: "bg-green-100 text-green-800" },
  delayed: { label: "Retrasado", className: "bg-red-100 text-red-800" },
  error: { label: "Error", className: "bg-red-100 text-red-800" },
};

export function TrackingStatusBadge({ status }: TrackingStatusBadgeProps) {
  const config = trackingStatusConfig[status] || trackingStatusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// Alert Badge
// ============================================================================

type AlertLevel = "none" | "warning" | "error";

interface AlertBadgeProps {
  level: AlertLevel;
  message?: string;
}

export function AlertBadge({ level, message }: AlertBadgeProps) {
  if (level === "none") return null;

  const className =
    level === "error"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      title={message}
    >
      {level === "error" ? "Error" : "Alerta"}
    </span>
  );
}

// ============================================================================
// Bulk Actions Bar
// ============================================================================

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "ghost" | "secondary";
}

interface BulkActionsBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActionsBar({
  selectedCount,
  actions,
  onClear,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-4 p-4 surface-secondary rounded-lg border">
      <span className="text-sm font-medium">
        {selectedCount} elemento{selectedCount !== 1 ? "s" : ""} seleccionado
        {selectedCount !== 1 ? "s" : ""}
      </span>
      <div className="flex gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            size="sm"
            onClick={action.onClick}
            variant={action.variant || "outline"}
          >
            {action.label}
          </Button>
        ))}
        <Button size="sm" onClick={onClear} variant="ghost">
          Limpiar selección
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// CSV Export Helper
// ============================================================================

export function downloadCSV(
  data: (string | number)[][],
  filename: string
): void {
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
