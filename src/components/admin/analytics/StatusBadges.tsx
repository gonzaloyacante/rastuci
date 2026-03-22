"use client";

// ============================================================================
// Tracking Status Badge
// ============================================================================

type TrackingStatus =
  | "pending"
  | "in-transit"
  | "delivered"
  | "delayed"
  | "error";

interface TrackingStatusBadgeProps {
  status: TrackingStatus;
}

const trackingStatusConfig: Record<
  TrackingStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  "in-transit": {
    label: "En tránsito",
    className: "bg-blue-100 text-blue-800",
  },
  delivered: { label: "Entregado", className: "bg-green-100 text-green-800" },
  delayed: { label: "Retrasado", className: "bg-red-100 text-red-800" },
  error: { label: "Error", className: "bg-red-100 text-red-800" },
};

export function TrackingStatusBadge({ status }: TrackingStatusBadgeProps) {
  const config = trackingStatusConfig[status] || trackingStatusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ============================================================================
// Alert Badge
// ============================================================================

type AlertLevel = "none" | "warning" | "error";

interface AlertBadgeProps {
  level: AlertLevel;
  message?: string;
}

export function AlertBadge({ level, message }: AlertBadgeProps) {
  if (level === "none") return null;

  const className =
    level === "error"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}
      title={message}
    >
      {level === "error" ? "Error" : "Alerta"}
    </span>
  );
}
