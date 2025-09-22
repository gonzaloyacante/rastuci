import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-muted surface">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`${getAlignClass(
                      column.align
                    )} p-4 font-semibold muted tracking-wide`}
                    style={{ width: column.width }}>
                    {column.label}
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="text-left p-4 font-semibold muted">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr
                  key={index}
                  className={`border-b border-muted hover:surface transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${getAlignClass(
                        column.align
                      )} p-4 align-middle`}>
                      {column.render
                        ? column.render(row[column.key], row)
                        : (row[column.key] as React.ReactNode)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
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
                              className={`text-xs flex items-center gap-1 ${
                                action.className || ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}>
                              {action.icon && <span>{action.icon}</span>}
                              {action.label}
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
