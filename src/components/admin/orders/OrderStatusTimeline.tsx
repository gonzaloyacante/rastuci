import { Banknote, Building2, Check, CreditCard, X } from "lucide-react";

import { ORDER_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Order } from "@/types";

interface Step {
  key: string;
  label: string;
}

const MP_FLOW: Step[] = [
  { key: ORDER_STATUS.PENDING_PAYMENT, label: "Aguardando pago" },
  { key: ORDER_STATUS.PROCESSED, label: "Pago confirmado" },
  { key: ORDER_STATUS.DELIVERED, label: "Entregado" },
];

const CASH_FLOW: Step[] = [
  { key: ORDER_STATUS.RESERVED, label: "Pedido reservado" },
  { key: ORDER_STATUS.PROCESSED, label: "Procesado" },
  { key: ORDER_STATUS.DELIVERED, label: "Entregado" },
];

const TRANSFER_FLOW: Step[] = [
  { key: ORDER_STATUS.WAITING_TRANSFER_PROOF, label: "Esperando comprobante" },
  { key: ORDER_STATUS.PAYMENT_REVIEW, label: "Revisando pago" },
  { key: ORDER_STATUS.PROCESSED, label: "Pago aprobado" },
  { key: ORDER_STATUS.DELIVERED, label: "Entregado" },
];

const PAYMENT_META: Record<
  string,
  { label: string; Icon: React.ElementType; color: string }
> = {
  mercadopago: {
    label: "MercadoPago",
    Icon: CreditCard,
    color: "text-sky-600",
  },
  transfer: {
    label: "Transferencia Bancaria",
    Icon: Building2,
    color: "text-violet-600",
  },
  cash: { label: "Efectivo", Icon: Banknote, color: "text-amber-600" },
  unknown: { label: "Sin registrar", Icon: CreditCard, color: "text-gray-400" },
};

function getFlow(paymentMethod?: string | null): Step[] {
  if (paymentMethod === "transfer") return TRANSFER_FLOW;
  if (paymentMethod === "cash") return CASH_FLOW;
  return MP_FLOW;
}

function getActiveIndex(steps: Step[], status: string): number {
  if (status === ORDER_STATUS.CANCELLED) return -1;
  const currOrder = steps.findIndex((x) => x.key === status);
  if (currOrder === -1) return -1;
  return currOrder;
}

interface OrderStatusTimelineProps {
  order: Pick<Order, "status" | "paymentMethod">;
}

export function OrderStatusTimeline({ order }: OrderStatusTimelineProps) {
  const isCancelled = order.status === ORDER_STATUS.CANCELLED;
  const steps = getFlow(order.paymentMethod);
  const activeIdx = getActiveIndex(steps, order.status);
  const pm =
    PAYMENT_META[order.paymentMethod ?? "unknown"] ?? PAYMENT_META.unknown;

  return (
    <div className="rounded-xl border border-border bg-surface-secondary px-4 py-3">
      {/* Payment method label */}
      <div className="flex items-center gap-1.5 mb-3">
        <pm.Icon size={13} className={pm.color} />
        <span className={cn("text-xs font-semibold", pm.color)}>
          {pm.label}
        </span>
        {isCancelled && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            <X size={10} />
            Cancelado
          </span>
        )}
      </div>

      {/* Timeline steps */}
      <div className="flex items-start gap-0">
        {steps.map((step, i) => {
          const isDone = !isCancelled && i <= activeIdx;
          const isCurrent = !isCancelled && i === activeIdx;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center">
              {/* Dot + connector row */}
              <div className="w-full flex items-center">
                {/* Left connector */}
                <div
                  className={cn(
                    "flex-1 h-px transition-colors",
                    i === 0
                      ? "bg-transparent"
                      : isDone
                        ? "bg-primary"
                        : "bg-border"
                  )}
                />
                {/* Dot */}
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 transition-all",
                    isCancelled
                      ? "bg-surface border-border"
                      : isDone
                        ? isCurrent
                          ? "bg-primary border-primary text-primary-foreground ring-2 ring-primary/20"
                          : "bg-primary border-primary text-primary-foreground"
                        : "bg-surface border-border"
                  )}
                >
                  {isDone && !isCurrent ? (
                    <Check size={11} strokeWidth={3} />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 rounded-full bg-primary-foreground" />
                  ) : null}
                </div>
                {/* Right connector */}
                <div
                  className={cn(
                    "flex-1 h-px transition-colors",
                    isLast
                      ? "bg-transparent"
                      : isDone && i < activeIdx
                        ? "bg-primary"
                        : "bg-border"
                  )}
                />
              </div>
              {/* Label */}
              <p
                className={cn(
                  "text-[10px] text-center mt-1.5 leading-tight px-0.5",
                  isCancelled
                    ? "text-muted-foreground/50"
                    : isCurrent
                      ? "font-semibold text-base-primary"
                      : isDone
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
                )}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
