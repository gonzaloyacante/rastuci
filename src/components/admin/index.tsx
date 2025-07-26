// Componentes reutilizables para el panel de administración
export { AdminCard } from "./AdminCard";
export { AdminPageHeader } from "./AdminPageHeader";
export { AdminEmpty, AdminEmptyIcons } from "./AdminEmpty";
export { AdminLoading } from "./AdminLoading";
export { AdminError } from "./AdminError";
export { AdminTable } from "./AdminTable";

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
