import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, RefreshCw, Search } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================================
// Tab Layout
// ============================================================================

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabLayoutProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

export function TabLayout({
  tabs,
  activeTab,
  onTabChange,
  children,
}: TabLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-muted pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? "surface-secondary text-primary font-medium"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}

// ============================================================================
// Tab Panel
// ============================================================================

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;
  return <>{children}</>;
}

// ============================================================================
// Search Filters Bar
// ============================================================================

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  statusFilter?: string;
  onStatusFilterChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  children?: ReactNode;
}

export function SearchFiltersBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  onRefresh,
  onAdd,
  addLabel = "Agregar",
  children,
}: SearchFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {statusOptions && onStatusFilterChange && (
        <select
          value={statusFilter || "all"}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="input"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {children}

      {onRefresh && (
        <Button variant="outline" onClick={onRefresh} className="gap-2">
          <RefreshCw size={16} />
          Actualizar
        </Button>
      )}

      {onAdd && (
        <Button variant="primary" onClick={onAdd} className="gap-2">
          <Plus size={16} />
          {addLabel}
        </Button>
      )}
    </div>
  );
}

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto mb-4 text-muted">{icon}</div>
      <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
      <p className="text-muted mb-4">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick} className="gap-2">
          <Plus size={16} />
          {action.label}
        </Button>
      )}
    </Card>
  );
}

// ============================================================================
// Page Header with Actions
// ============================================================================

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

// ============================================================================
// List Item Card
// ============================================================================

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

// ============================================================================
// Detail Panel
// ============================================================================

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

// ============================================================================
// Info Grid
// ============================================================================

interface InfoItem {
  label: string;
  value: ReactNode;
}

interface InfoGridProps {
  items: InfoItem[];
  columns?: 2 | 3 | 4;
}

export function InfoGrid({ items, columns = 2 }: InfoGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

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

// ============================================================================
// Message Thread
// ============================================================================

interface Message {
  id: string;
  content: string;
  sender: "customer" | "admin";
  senderName: string;
  timestamp: string;
  isInternal?: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  maxHeight?: string;
}

export function MessageThread({
  messages,
  maxHeight = "max-h-96",
}: MessageThreadProps) {
  return (
    <div className={`space-y-4 ${maxHeight} overflow-y-auto`}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`p-4 rounded-lg ${
            msg.sender === "admin" ? "surface-secondary ml-8" : "surface mr-8"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{msg.senderName}</span>
            <span className="text-xs text-muted">
              {new Date(msg.timestamp).toLocaleString("es-AR")}
            </span>
          </div>
          <p className="text-sm">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Rating Display
// ============================================================================

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  size = "md",
}: RatingDisplayProps) {
  const fullStars = Math.floor(rating);
  const emptyStars = maxRating - fullStars;

  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <span className={`text-warning ${sizeClass[size]}`}>
      {"★".repeat(fullStars)}
      {"☆".repeat(emptyStars)}
    </span>
  );
}

// ============================================================================
// Status Badge Helpers
// ============================================================================

interface StatusConfig {
  className: string;
  label: string;
  icon?: ReactNode;
}

export function createStatusBadge(
  status: string,
  config: Record<string, StatusConfig>
): StatusConfig {
  return (
    config[status] || {
      className: "badge-default",
      label: status,
      icon: null,
    }
  );
}

// ============================================================================
// Priority Badge
// ============================================================================

type Priority = "baja" | "media" | "alta" | "urgente";

const priorityConfig: Record<Priority, { className: string; label: string }> = {
  baja: { className: "badge-default", label: "Baja" },
  media: { className: "badge-info", label: "Media" },
  alta: { className: "badge-warning", label: "Alta" },
  urgente: { className: "badge-error", label: "Urgente" },
};

export function getPriorityConfig(priority: Priority) {
  return priorityConfig[priority] || priorityConfig.baja;
}
