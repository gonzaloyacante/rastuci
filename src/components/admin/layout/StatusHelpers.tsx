import type { ReactNode } from "react";

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
    config[status] || { className: "badge-default", label: status, icon: null }
  );
}

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
