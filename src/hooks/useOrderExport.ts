"use client";

import { useCallback } from "react";

import { useToast } from "@/components/ui/Toast";
import { type Order } from "@/hooks/useOrders";
import { logger } from "@/lib/logger";
import { escapeCsvCell, formatDate } from "@/utils/formatters";

const CSV_HEADERS = [
  "ID",
  "Cliente",
  "Email",
  "Teléfono",
  "Dirección",
  "Total",
  "Subtotal Productos",
  "Costo Envío",
  "Estado",
  "Estado Pago MP",
  "Método de Envío",
  "Agencia / Sucursal",
  "Tracking",
  "Fecha Creación",
  "Productos",
  "Tallas/Colores",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "incompleto",
  PENDING_PAYMENT: "aguardando pago",
  RESERVED: "reservado",
  PROCESSED: "listo para entregar",
  DELIVERED: "entregado",
  CANCELLED: "cancelado",
  WAITING_TRANSFER_PROOF: "esperando comprobante",
  PAYMENT_REVIEW: "revisando comprobante",
};

function buildItemVariantLabel(item: Order["items"][number]): string {
  const parts: string[] = [];
  if (item.size) parts.push(`Talla: ${item.size}`);
  if (item.color) parts.push(`Color: ${item.color}`);
  return parts.length > 0 ? parts.join(", ") : "-";
}

function orderToCsvRow(order: Order): string {
  const subtotalProducts = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const products = order.items
    .map((item) => `${item.quantity}x ${item.product.name}`)
    .join("; ");
  const variants = order.items.map(buildItemVariantLabel).join("; ");

  return [
    escapeCsvCell(order.id),
    escapeCsvCell(order.customerName),
    escapeCsvCell(order.customerEmail || "No especificado"),
    escapeCsvCell(order.customerPhone),
    escapeCsvCell(order.customerAddress || "No especificada"),
    escapeCsvCell(order.total),
    escapeCsvCell(subtotalProducts),
    escapeCsvCell(order.shippingCost || 0),
    escapeCsvCell(STATUS_LABELS[order.status] || order.status),
    escapeCsvCell(order.mpStatus || "N/A"),
    escapeCsvCell(order.shippingMethod || "No especificado"),
    escapeCsvCell(order.shippingAgency || "-"),
    escapeCsvCell(order.caTrackingNumber || "Sin tracking"),
    escapeCsvCell(formatDate(order.createdAt)),
    escapeCsvCell(products),
    escapeCsvCell(variants),
  ].join(",");
}

export function useOrderExport(orders: Order[]) {
  const { show } = useToast();

  const exportToCSV = useCallback(() => {
    try {
      if (orders.length === 0) {
        show({ type: "error", message: "No hay pedidos para exportar" });
        return;
      }

      const csvContent = [
        CSV_HEADERS.join(","),
        ...orders.map(orderToCsvRow),
      ].join("\n");

      // Agregar BOM para UTF-8 y que Excel lo lea bien
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `pedidos_rastuci_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      show({ type: "success", message: "Pedidos exportados correctamente" });
    } catch (err) {
      logger.error("Error al exportar pedidos", { error: err });
      show({ type: "error", message: "Error al exportar pedidos" });
    }
  }, [orders, show]);

  return { exportToCSV };
}
