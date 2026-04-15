import type { ReactNode } from "react";

import { Card } from "@/components/ui/Card";

interface ListItemCardProps {
  children: ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ListItemCard({
  children,
  isSelected,
  onClick,
  className = "",
}: ListItemCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`p-4 transition-all hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      } ${isSelected ? "ring-2 ring-primary" : ""} ${className}`}
    >
      {children}
    </Card>
  );
}

interface DetailPanelProps {
  show: boolean;
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  children?: ReactNode;
}

export function DetailPanel({
  show,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  children,
}: DetailPanelProps) {
  if (!show) {
    return (
      <Card className="p-8 text-center h-full flex items-center justify-center">
        <div>
          <div className="mx-auto mb-4 text-muted">{emptyIcon}</div>
          <h3 className="text-lg font-medium text-primary mb-2">
            {emptyTitle}
          </h3>
          <p className="text-muted">{emptyDescription}</p>
        </div>
      </Card>
    );
  }
  return <>{children}</>;
}

interface InfoItem {
  label: string;
  value: ReactNode;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: 2 | 3 | 4;
}

export function InfoGrid({ items, columns = 2 }: InfoGridProps) {
  const gridCols = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };
  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item, index) => (
        <div key={index}>
          <p className="text-sm text-muted">{item.label}</p>
          <p className="font-medium">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
