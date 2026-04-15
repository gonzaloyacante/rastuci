import type { ReactNode } from "react";

interface PageHeaderWithActionsProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeaderWithActions({
  title,
  subtitle,
  children,
}: PageHeaderWithActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {subtitle && <p className="text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
