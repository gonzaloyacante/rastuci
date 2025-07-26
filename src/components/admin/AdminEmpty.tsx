import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AdminEmptyAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "destructive" | "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
}

interface AdminEmptyProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: AdminEmptyAction;
  className?: string;
}

const defaultIcons = {
  users: (
    <svg
      className="w-12 h-12 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  products: (
    <svg
      className="w-12 h-12 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  ),
  orders: (
    <svg
      className="w-12 h-12 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  categories: (
    <svg
      className="w-12 h-12 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  ),
  generic: (
    <svg
      className="w-12 h-12 mx-auto mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  ),
};

export const AdminEmpty: React.FC<AdminEmptyProps> = ({
  title,
  description,
  icon,
  action,
  className = "",
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6 text-center">
        <div className="text-content-secondary">
          {icon || defaultIcons.generic}
          <h3 className="text-lg font-medium mb-2 text-content-primary">
            {title}
          </h3>
          {description && <p className="text-sm mb-4">{description}</p>}
          {action && (
            <Button
              variant={action.variant || "primary"}
              className="btn-primary"
              onClick={action.onClick}>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Exportar iconos predefinidos para uso directo
export { defaultIcons as AdminEmptyIcons };
