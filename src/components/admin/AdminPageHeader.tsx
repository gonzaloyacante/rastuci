import React from "react";
import { Button } from "@/components/ui/Button";

interface AdminPageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "destructive" | "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  className?: string;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: AdminPageHeaderAction[];
  children?: React.ReactNode;
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6 ${className}`}
    >
      <div className="flex-1">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-content-primary">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-content-secondary mt-1">{subtitle}</p>
        )}
        {children && <div className="mt-2">{children}</div>}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {actions.map((action, index) => (
            <Button
              key={`item-${index}`}
              variant={action.variant || "primary"}
              className={`btn-primary w-full sm:w-auto ${action.className || ""}`}
              onClick={action.onClick}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
