"use client";

import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useState } from "react";
import { logger } from "@/lib/logger";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PROCESSED", label: "Procesado" },
  { value: "DELIVERED", label: "Entregado" },
];

export const OrderStatusUpdater: React.FC<OrderStatusUpdaterProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado");
      }

      onStatusUpdate(selectedStatus);
    } catch (error) {
      logger.error("Error:", { error: error });
      // Revertir selección
      setSelectedStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        options={STATUS_OPTIONS}
        value={selectedStatus}
        onChange={setSelectedStatus}
        disabled={loading}
      />

      {selectedStatus !== currentStatus && (
        <Button onClick={handleStatusChange} disabled={loading} size="sm">
          {loading ? "Actualizando..." : "Actualizar"}
        </Button>
      )}
    </div>
  );
};
