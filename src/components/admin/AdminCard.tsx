import React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AdminCardAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "destructive" | "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  icon?: React.ReactNode; // Added icon property
}

interface AdminCardBadge {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
}

interface AdminCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: AdminCardBadge;
  actions?: AdminCardAction[];
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  image?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  subtitle,
  description,
  badge,
  actions,
  children,
  className = "",
  onClick,
  image,
}) => {
  const getBadgeClass = (variant: AdminCardBadge["variant"]) => {
    switch (variant) {
      case "success":
        return "badge-success";
      case "warning":
        return "badge-warning";
      case "error":
        return "badge-error";
      case "info":
        return "badge-info";
      case "neutral":
        return "badge-neutral";
      default:
        return "badge-neutral";
    }
  };

  return (
    <Card
      className={`surface rounded-xl shadow ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}>
      <CardContent className="p-6 flex flex-col gap-3">
        {/* Header con imagen opcional */}
        {image && (
          <div className="mb-3">
            <Image
              src={image}
              alt={title}
              width={400}
              height={128}
              className="w-full h-32 object-cover rounded-xl shadow-sm border-2 border-muted"
            />
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate text-primary">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm muted truncate">
                {subtitle}
              </p>
            )}
            {description && (
              <p className="text-xs muted mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>

          {badge && (
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ml-2 ${getBadgeClass(
                badge.variant
              )}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* Contenido personalizado */}
        {children && <div className="mb-3">{children}</div>}

        {/* Acciones */}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mt-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size={action.size || "sm"}
                className={`text-xs flex items-center gap-1 ${
                  action.className || ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}>
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
