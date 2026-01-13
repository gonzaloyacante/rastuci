import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import React from "react";

interface AdminTableColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface AdminTableAction<T = Record<string, unknown>> {
  label: string;
  onClick: (row: T) => void;
  variant?: "outline" | "destructive" | "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  className?: string;
  condition?: (row: T) => boolean;
}

interface AdminTableProps<T = Record<string, unknown>> {
  title?: string;
  columns: AdminTableColumn<T>[];
  data: T[];
  actions?: AdminTableAction<T>[];
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export const AdminTable = <T extends Record<string, unknown>>({
  title,
  columns,
  data,
  actions,
  className = "",
  emptyMessage = "No hay datos disponibles",
  onRowClick,
  loading = false,
}: AdminTableProps<T>) => {
  const getAlignClass = (align?: string) => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  if (loading) {
    return (
      <Card className={`surface rounded-xl shadow ${className}`}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <Spinner size="lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={`surface rounded-xl shadow ${className}`}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 muted">
            <p>{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`surface rounded-xl shadow ${className}`}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden p-4 space-y-4">
          {data.map((row, index) => (
            <div
              key={`mobile-row-${index}`}
              className={`p-4 rounded-lg border border-muted bg-card text-card-foreground shadow-sm ${
                onRowClick ? "cursor-pointer active:bg-muted/50" : ""
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {/* Primary Column (Title) */}
              <div className="font-semibold text-lg mb-3 pb-2 border-b border-muted">
                {columns[0].render
                  ? columns[0].render(row[columns[0].key], row)
                  : (row[columns[0].key] as React.ReactNode)}
              </div>

              {/* Data Columns */}
              <div className="space-y-2 text-sm">
                {columns.slice(1).map((column) => (
                  <div
                    key={column.key}
                    className="flex justify-between items-start gap-4"
                  >
                    <span className="text-muted-foreground font-medium min-w-[30%]">
                      {column.label}:
                    </span>
                    <span className="text-right flex-1 break-words">
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {actions && actions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-muted flex flex-wrap gap-2 justify-end">
                  {actions
                    .filter(
                      (action) => !action.condition || action.condition(row)
                    )
                    .map((action, actionIndex) => (
                      <Button
                        key={actionIndex}
                        variant={action.variant || "outline"}
                        size="sm"
                        className={`text-xs ${action.className || ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          action.onClick(row);
                        }}
                      >
                        {action.icon && (
                          <span className="mr-1">{action.icon}</span>
                        )}
                        {action.label}
                      </Button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-muted surface">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${getAlignClass(
                      column.align
                    )} p-2 sm:p-4 font-semibold muted tracking-wide text-xs sm:text-sm`}
                    style={{ width: column.width }}
                  >
                    {column.label}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="text-left p-2 sm:p-4 font-semibold muted text-xs sm:text-sm">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={`item-${index}`}
                  className={`border-b border-muted hover:surface transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${getAlignClass(
                        column.align
                      )} p-2 sm:p-4 align-middle text-xs sm:text-sm`}
                    >
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="p-2 sm:p-4 align-middle">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        {actions
                          .filter(
                            (action) =>
                              !action.condition || action.condition(row)
                          )
                          .map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || "outline"}
                              size="sm"
                              className={`text-xs flex items-center gap-1 justify-center ${
                                action.className || ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {action.icon && <span>{action.icon}</span>}
                              <span className="hidden sm:inline">
                                {action.label}
                              </span>
                            </Button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
