export { AdminCard } from "./AdminCard";
export { AdminEmpty, AdminEmptyIcons } from "./AdminEmpty";
export { AdminError } from "./AdminError";
export { AdminLoading } from "./AdminLoading";
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminTable } from "./AdminTable";

// AdminCards - Componentes reutilizables para stats y secciones
export * from "./AdminCards";

// Analytics Components - Componentes para métricas y análisis
export * from "./AnalyticsComponents";

// Layout Components - Tabs, búsqueda, estados vacíos
export * from "./LayoutComponents";

// Order Components - Componentes para pedidos
export * from "./OrderComponents";

// Dashboard components
export * from "./dashboard";

// Tipos comunes para reutilizar en las páginas
export interface AdminAction {
  label: string;
  onClick: () => void;
  variant?: "outline" | "destructive" | "primary" | "secondary" | "ghost";
  icon?: React.ReactNode;
  className?: string;
}

export interface AdminBadge {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
}
