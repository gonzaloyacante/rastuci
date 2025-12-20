"use client";

import { useCart } from "@/context/CartContext";
import {
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface OrderInfo {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  shippingCost?: number;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    // MercadoPago redirige con estos parámetros:
    // - external_reference: nuestro tempOrderId (tmp_xxxxx) o orderId
    // - payment_id: ID del pago en MP
    // - status: approved, pending, rejected
    // - payment_status: estado del pago
    // - merchant_order_id: ID de la orden en MP
    const method = searchParams.get("method") || "mercadopago";
    const externalRef = searchParams.get("external_reference") || "";
    const paymentId = searchParams.get("payment_id") || "";
    const mpStatus =
      searchParams.get("status") || searchParams.get("payment_status") || "";

    // Priorizar external_reference que tiene nuestro ID
    const id = searchParams.get("order_id") || externalRef || "";

    setPaymentMethod(method);
    setOrderId(id);

    // Log para debugging

    // Limpiar carrito después de compra exitosa
    clearCart();
  }, [searchParams, clearCart]);

  // Cargar información del pedido con retry (el webhook puede tardar unos segundos)
  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    const loadOrderInfo = async (retryCount = 0): Promise<boolean> => {
      // Intentar buscar por orderId o por payment_id
      const searchId = orderId || paymentId;

      if (!searchId) {
        return false;
      }

      try {
        // Primero intentar por orderId directo
        if (orderId) {
          const response = await fetch(`/api/orders/${orderId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setOrderInfo(result.data);
              if (result.data.trackingNumber) {
                setTrackingStatus("En preparación");
              }
              return true;
            }
          }
        }

        // Si no encontró, buscar por payment_id
        if (paymentId) {
          const response = await fetch(`/api/orders?mpPaymentId=${paymentId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.data?.[0]) {
              const order = result.data.data[0];
              setOrderInfo(order);
              setOrderId(order.id);
              if (order.trackingNumber) {
                setTrackingStatus("En preparación");
              }
              return true;
            }
          }
        }

        return false;
      } catch {
        return false;
      }
    };

    const attemptLoad = async () => {
      setLoadingOrder(true);

      // Intentar cargar inmediatamente
      let found = await loadOrderInfo();

      // Si no encuentra, el webhook puede estar procesando. Reintentar hasta 5 veces
      if (!found && (orderId || paymentId)) {
        for (let i = 1; i <= 5 && !found; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos
          found = await loadOrderInfo(i);
        }
      }

      setLoadingOrder(false);
    };

    attemptLoad();
  }, [orderId, searchParams]);

  const copyTrackingNumber = async (trackingNumber: string) => {
    try {
      await navigator.clipboard.writeText(trackingNumber);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Error silencioso
    }
  };

  const isCashPayment = paymentMethod === "cash";
  const hasTracking = orderInfo?.trackingNumber;

  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Ícono de éxito */}
        <div className="text-center mb-8">
          <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-primary mb-2">
            ¡Pedido Confirmado!
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
                      ${orderInfo.total.toFixed(2)}
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

        {/* Información de tracking Correo Argentino */}
        {hasTracking && (
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
              {/* Número de tracking */}
              <div className="surface-secondary rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">
                    Número de Seguimiento:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyTrackingNumber(hasTracking)}
                      className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copySuccess ? "Copiado!" : "Copiar"}
                    </button>
                    <a
                      href={`https://www.correoargentino.com.ar/seguimiento?codigo=${hasTracking}`}
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
                  {hasTracking}
                </p>
              </div>

              {/* Estado actual del envío */}
              {trackingStatus && (
                <div className="surface-secondary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-primary">
                      Estado Actual:
                    </span>
                  </div>
                  <p className="text-success font-medium">{trackingStatus}</p>
                </div>
              )}

              {/* Información adicional de envío */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {orderInfo?.shippingMethod && (
                  <div>
                    <span className="font-medium text-primary block">
                      Método de envío:
                    </span>
                    <span className="muted capitalize">
                      {orderInfo.shippingMethod}
                    </span>
                  </div>
                )}
                {orderInfo?.shippingCost && (
                  <div>
                    <span className="font-medium text-primary block">
                      Costo de envío:
                    </span>
                    <span className="muted">
                      ${orderInfo.shippingCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {orderInfo?.estimatedDelivery && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-primary block">
                      Entrega estimada:
                    </span>
                    <span className="muted">
                      {new Date(orderInfo.estimatedDelivery).toLocaleDateString(
                        "es-ES",
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

              {/* Enlace a seguimiento completo */}
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
        )}

        {/* Información específica según método de pago */}
        <div className="surface border border-muted rounded-lg p-6 mb-6">
          {isCashPayment ? (
            // Información para pago en efectivo
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Package className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-lg text-primary">
                    Retiro en Local - Pago en Efectivo
                  </h3>
                  <p className="muted mt-1">
                    Tu pedido está siendo preparado. Te contactaremos por
                    WhatsApp cuando esté listo para retirar.
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
                    Te contactaremos por WhatsApp una vez que tu pedido esté
                    listo para coordinar la entrega.
                  </p>
                </div>
              </div>

              <div className="border-t border-muted pt-4">
                <h4 className="font-medium text-primary mb-2">
                  Próximos pasos:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm muted">
                  <li>Prepararemos tu pedido (1-2 días hábiles)</li>
                  <li>Te enviaremos un WhatsApp cuando esté listo</li>
                  <li>Coordinamos la entrega</li>
                  <li>¡Recibes tu pedido!</li>
                </ol>
              </div>
            </div>
          ) : (
            // Información para MercadoPago
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
                    Te enviaremos actualizaciones sobre el estado de tu pedido
                    por email.
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

        {/* Información adicional del pedido */}
        {loadingOrder ? (
          <div className="surface border border-muted rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
              <span className="muted">Cargando información del pedido...</span>
            </div>
          </div>
        ) : (
          orderInfo && (
            <div className="surface border border-muted rounded-lg p-4 mb-6">
              <h4 className="font-medium text-primary mb-3">
                Resumen del Pedido
              </h4>
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
              </div>
            </div>
          )
        )}

        {/* Botones de acción */}
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

        {/* Información adicional */}
        <div className="mt-8 text-center text-sm muted">
          <p>
            ¿Problemas con tu pedido?{" "}
            <Link href="/contacto" className="text-primary hover:underline">
              Contáctanos aquí
            </Link>
          </p>
          {hasTracking && (
            <p className="mt-2">
              También puedes hacer seguimiento en{" "}
              <a
                href={`https://www.correoargentino.com.ar/seguimiento?codigo=${hasTracking}`}
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

// Loading component para Suspense
function CheckoutSuccessLoading() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="muted">Procesando información del pedido...</p>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
