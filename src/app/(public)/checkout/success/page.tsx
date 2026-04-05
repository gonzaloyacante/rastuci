"use client";

import {
  CheckCircle,
  Copy,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/formatters";

// ---------------------------------------------------------------------------
// Fetch helpers — reducen la complejidad de loadOrderInfo (complexity 16 → 4)
// ---------------------------------------------------------------------------

async function fetchOrderById(orderId: string): Promise<OrderInfo | null> {
  const response = await fetch(`/api/orders/${orderId}`);
  if (!response.ok) return null;
  const result = (await response.json()) as {
    success: boolean;
    data?: OrderInfo;
  };
  return result.success && result.data ? result.data : null;
}

async function fetchOrderByPaymentId(
  paymentId: string
): Promise<OrderInfo | null> {
  const response = await fetch(`/api/orders?mpPaymentId=${paymentId}`);
  if (!response.ok) return null;
  const result = (await response.json()) as {
    success: boolean;
    data?: { data: OrderInfo[] };
  };
  return result.success && result.data?.data?.[0] ? result.data.data[0] : null;
}

async function resolveOrder(
  orderId: string,
  paymentId: string | null
): Promise<OrderInfo | null> {
  try {
    if (orderId) {
      const order = await fetchOrderById(orderId);
      if (order) return order;
    }
    if (paymentId) return await fetchOrderByPaymentId(paymentId);
    return null;
  } catch {
    return null;
  }
}

interface OrderInfo {
  id: string;
  orderNumber: string;
  total: number;
  subtotal?: number;
  discount?: number;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  shippingCost?: number;
}

// ---------------------------------------------------------------------------
// Sub-components — reducen el tamaño del componente principal
// ---------------------------------------------------------------------------

function PaymentStatusBanner({
  isRejected,
  isPending,
}: {
  isRejected: boolean;
  isPending: boolean;
}) {
  if (isRejected) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        <p className="font-semibold">Pago rechazado o cancelado</p>
        <p className="text-sm mt-1">
          Tu pago no fue procesado. Por favor intentá de nuevo o elegí otro
          método de pago.
        </p>
      </div>
    );
  }
  if (isPending) {
    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        <p className="font-semibold">Pago en proceso</p>
        <p className="text-sm mt-1">
          Tu pago está siendo procesado. Te avisaremos por email cuando se
          confirme.
        </p>
      </div>
    );
  }
  return null;
}

function TrackingSection({
  orderId,
  orderInfo,
  trackingStatus,
}: {
  orderId: string;
  orderInfo: OrderInfo;
  trackingStatus: string | null;
}) {
  const [copySuccess, setCopySuccess] = useState(false);
  const trackingNumber = orderInfo.trackingNumber!;

  const copyTrackingNumber = async () => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Error silencioso
    }
  };

  return (
    <div className="surface border border-muted rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-3 mb-4">
        <Truck className="w-6 h-6 text-primary mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-primary">
            Información de Seguimiento
          </h3>
          <p className="muted mt-1">
            Tu pedido será enviado por Correo Argentino. Podrás hacer
            seguimiento del envío con el número de tracking.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="surface-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-primary">
              Número de Seguimiento:
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={copyTrackingNumber}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 p-0 h-auto hover:bg-transparent"
              >
                <Copy className="w-3 h-3" />
                {copySuccess ? "Copiado!" : "Copiar"}
              </Button>
              <a
                href={`https://www.correoargentino.com.ar/seguimiento?codigo=${trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ver en Correo Argentino
              </a>
            </div>
          </div>
          <p className="font-mono text-lg font-bold text-primary">
            {trackingNumber}
          </p>
        </div>

        {trackingStatus && (
          <div className="surface-secondary rounded-lg p-4">
            <span className="text-sm font-medium text-primary">
              Estado Actual:
            </span>
            <p className="text-success font-medium mt-1">{trackingStatus}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {orderInfo.shippingMethod && (
            <div>
              <span className="font-medium text-primary block">
                Método de envío:
              </span>
              <span className="muted capitalize">
                {orderInfo.shippingMethod}
              </span>
            </div>
          )}
          {orderInfo.shippingCost && (
            <div>
              <span className="font-medium text-primary block">
                Costo de envío:
              </span>
              <span className="muted">
                {formatCurrency(orderInfo.shippingCost)}
              </span>
            </div>
          )}
          {orderInfo.estimatedDelivery && (
            <div className="md:col-span-2">
              <span className="font-medium text-primary block">
                Entrega estimada:
              </span>
              <span className="muted">
                {new Date(orderInfo.estimatedDelivery).toLocaleDateString(
                  "es-AR",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </span>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-muted">
          <Link
            href={`/orders/${orderId}`}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
          >
            <Package className="w-4 h-4" />
            Ver seguimiento completo del pedido
          </Link>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodInfo({ isCashPayment }: { isCashPayment: boolean }) {
  return (
    <div className="surface border border-muted rounded-lg p-6 mb-6">
      {isCashPayment ? (
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            <Package className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg text-primary">
                Retiro en Local - Pago en Efectivo
              </h3>
              <p className="muted mt-1">
                Tu pedido está siendo preparado. Te contactaremos por WhatsApp
                cuando esté listo para retirar.
              </p>
            </div>
          </div>
          <div className="border-t border-muted pt-4">
            <h4 className="font-medium text-primary mb-3">
              Información del Local:
            </h4>
            <div className="space-y-2 text-sm muted">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Contactanos para coordinar el retiro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Nos comunicaremos contigo pronto</span>
              </div>
            </div>
            <div className="mt-3 p-3 surface-secondary rounded-md">
              <p className="text-sm text-primary">
                <strong>Proceso de retiro:</strong>
                <br />
                Te contactaremos por WhatsApp una vez que tu pedido esté listo
                para coordinar la entrega.
              </p>
            </div>
          </div>
          <div className="border-t border-muted pt-4">
            <h4 className="font-medium text-primary mb-2">Próximos pasos:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm muted">
              <li>Prepararemos tu pedido (1-2 días hábiles)</li>
              <li>Te enviaremos un WhatsApp cuando esté listo</li>
              <li>Coordinamos la entrega</li>
              <li>¡Recibes tu pedido!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-success mt-0.5" />
            <div>
              <h3 className="font-semibold text-lg text-primary">
                Pago Procesado con MercadoPago
              </h3>
              <p className="muted mt-1">
                Tu pago ha sido procesado exitosamente.
              </p>
              <p className="muted mt-1">
                Te enviaremos actualizaciones sobre el estado de tu pedido por
                email.
              </p>
            </div>
          </div>
          <div className="border-t border-muted pt-4">
            <h4 className="font-medium text-primary mb-2">¿Qué sigue?</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm muted">
              <li>Recibirás un email de confirmación</li>
              <li>Prepararemos tu pedido (1-2 días hábiles)</li>
              <li>Enviaremos tu pedido según el método seleccionado</li>
              <li>Te notificaremos cuando esté en camino</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderSummary({
  orderInfo,
  loadingOrder,
}: {
  orderInfo: OrderInfo | null;
  loadingOrder: boolean;
}) {
  if (loadingOrder) {
    return (
      <div className="surface border border-muted rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center">
          <Spinner size="md" className="mr-3" />
          <span className="muted">Cargando información del pedido...</span>
        </div>
      </div>
    );
  }

  if (!orderInfo) return null;

  return (
    <>
      {orderInfo.discount != null && orderInfo.discount > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-green-700 font-bold text-lg">
            🎉 ¡Ahorraste {formatCurrency(orderInfo.discount)} en este pedido!
          </p>
        </div>
      )}
      <div className="surface border border-muted rounded-lg p-4 mb-6">
        <h4 className="font-medium text-primary mb-3">Resumen del Pedido</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="muted">Cliente:</span>
            <p className="font-medium">{orderInfo.customerName}</p>
          </div>
          <div>
            <span className="muted">Teléfono:</span>
            <p className="font-medium">{orderInfo.customerPhone}</p>
          </div>
          {orderInfo.customerEmail && (
            <div className="col-span-2">
              <span className="muted">Email:</span>
              <p className="font-medium">{orderInfo.customerEmail}</p>
            </div>
          )}
          {orderInfo.subtotal != null && (
            <div>
              <span className="muted">Subtotal:</span>
              <p className="font-medium">
                {formatCurrency(orderInfo.subtotal)}
              </p>
            </div>
          )}
          {orderInfo.discount != null && orderInfo.discount > 0 && (
            <div>
              <span className="muted">Descuento:</span>
              <p className="font-medium text-green-600">
                -{formatCurrency(orderInfo.discount)}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ActionButtons({
  orderId,
  hasTracking,
}: {
  orderId: string;
  hasTracking: string | undefined;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        href="/productos"
        className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/80 transition-colors text-center"
      >
        Seguir Comprando
      </Link>
      <Link
        href="/contacto"
        className="border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center"
      >
        Contactar Soporte
      </Link>
      {hasTracking && (
        <Link
          href={`/orders/${orderId}`}
          className="border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary hover:text-white transition-colors text-center"
        >
          Ver Seguimiento
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main content component
// ---------------------------------------------------------------------------

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [mpStatus, setMpStatus] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const cartCleared = useRef(false);

  useEffect(() => {
    const method = searchParams.get("method") || "mercadopago";
    const externalRef = searchParams.get("external_reference") || "";
    const status =
      searchParams.get("status") || searchParams.get("payment_status") || "";
    const id = searchParams.get("order_id") || externalRef || "";

    setPaymentMethod(method);
    setMpStatus(status);
    setOrderId(id);

    if (!cartCleared.current) {
      cartCleared.current = true;
      clearCart();
    }
  }, [searchParams, clearCart]);

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    const attemptLoad = async () => {
      setLoadingOrder(true);
      if (!orderId && !paymentId) {
        setLoadingOrder(false);
        return;
      }

      let order = await resolveOrder(orderId, paymentId);

      // El webhook puede tardar — reintentar hasta 5 veces con espera de 2 s
      for (let i = 1; i <= 5 && !order; i++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        order = await resolveOrder(orderId, paymentId);
      }

      if (order) {
        setOrderInfo(order);
        if (!orderId && order.id) setOrderId(order.id);
        if (order.trackingNumber) setTrackingStatus("En preparación");
      }

      setLoadingOrder(false);
    };

    void attemptLoad();
  }, [orderId, searchParams]);

  const isCashPayment = paymentMethod === "cash";
  const isRejected = mpStatus === "rejected" || mpStatus === "cancelled";
  const isPending = mpStatus === "pending" || mpStatus === "in_process";

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <PaymentStatusBanner isRejected={isRejected} isPending={isPending} />

        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isRejected ? "Pedido recibido" : "¡Pedido Confirmado!"}
          </h1>
          <p className="muted">
            {orderInfo ? (
              <>
                Número de pedido:{" "}
                <span className="font-semibold">
                  #{orderInfo.orderNumber || orderId}
                </span>
                {orderInfo.total && (
                  <span className="block mt-1">
                    Total:{" "}
                    <span className="font-semibold">
                      {formatCurrency(orderInfo.total)}
                    </span>
                  </span>
                )}
              </>
            ) : orderId ? (
              `Número de pedido: #${orderId}`
            ) : (
              "Tu pedido ha sido procesado exitosamente"
            )}
          </p>
        </div>

        {orderInfo?.trackingNumber && (
          <TrackingSection
            orderId={orderId}
            orderInfo={orderInfo}
            trackingStatus={trackingStatus}
          />
        )}

        <PaymentMethodInfo isCashPayment={isCashPayment} />

        <OrderSummary orderInfo={orderInfo} loadingOrder={loadingOrder} />

        <ActionButtons
          orderId={orderId}
          hasTracking={orderInfo?.trackingNumber}
        />

        <div className="mt-8 text-center text-sm muted">
          <p>
            ¿Problemas con tu pedido?{" "}
            <Link href="/contacto" className="text-primary hover:underline">
              Contáctanos aquí
            </Link>
          </p>
          {orderInfo?.trackingNumber && (
            <p className="mt-2">
              También puedes hacer seguimiento en{" "}
              <a
                href={`https://www.correoargentino.com.ar/seguimiento?codigo=${orderInfo.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                el sitio oficial de Correo Argentino
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutSuccessLoading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="muted">Procesando información del pedido...</p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
