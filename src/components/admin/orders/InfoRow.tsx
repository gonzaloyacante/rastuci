"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// Info Row Component (for detail pages)
// ============================================================================

interface InfoRowProps {
  icon?: LucideIcon;
  emoji?: string;
  label: string;
  value: ReactNode;
  className?: string;
}

export function InfoRow({
  icon: Icon,
  emoji,
  label,
  value,
  className = "",
}: InfoRowProps) {
  return (
    <div className={`flex items-start gap-2 ${className}`}>
      {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />}
      {emoji && <span>{emoji}</span>}
      <div className="flex-1">
        <span className="text-sm text-muted-foreground">{label}: </span>
        <span className="text-sm">{value}</span>
      </div>
    </div>
  );
}

// ============================================================================
// Section Card (for grouping content)
// ============================================================================

interface SectionCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div className={`card ${className}`}>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}
