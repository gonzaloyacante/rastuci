import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AdminErrorAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "destructive" | "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
}

interface AdminErrorProps {
  title?: string;
  message: string;
  actions?: AdminErrorAction[];
  className?: string;
  showIcon?: boolean;
}

export const AdminError: React.FC<AdminErrorProps> = ({
  title = "Error",
  message,
  actions,
  className = "",
  showIcon = true,
}) => {
  return (
    <Card className={`border-error ${className}`}>
      <CardContent className="p-6 text-center">
        {showIcon && (
          <div className="text-error mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        )}

        <h3 className="text-lg font-medium mb-2 text-content-primary">
          {title}
        </h3>

        <p className="text-error text-sm mb-4">{message}</p>

        {actions && actions.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {actions.map((action, index) => (
              <Button
                key={`item-${index}`}
                variant={action.variant || "outline"}
                onClick={action.onClick}
                className="min-w-24"
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
