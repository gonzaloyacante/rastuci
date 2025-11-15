"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useCart } from "@/context/CartContext";
import { logger } from "@/lib/logger";
import { CreditCard, Loader2, Shield } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface MercadoPagoCheckoutProps {
  customerInfo: CustomerInfo;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

export function MercadoPagoCheckout({
  customerInfo,
  onSuccess: _onSuccess,
  onError,
}: MercadoPagoCheckoutProps) {
  const { cartItems, getCartTotal, getOrderSummary } = useCart();
  const { show } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getCartTotal();

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      show({ type: "error", title: "Error", message: "El carrito está vacío" });
      return;
    }

    if (!customerInfo.email || !customerInfo.name) {
      show({
        type: "error",
        title: "Error",
        message: "Completa los datos del cliente",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Obtener resumen de la orden
      const summary = getOrderSummary();

      // Preparar items para MercadoPago
      const items = summary.items.map((item) => ({
        title: `${item.product.name} (${item.size} - ${item.color})`,
        quantity: item.quantity,
        unit_price: item.product.price,
        currency_id: "ARS",
        picture_url: Array.isArray(item.product.images)
          ? item.product.images[0]
          : undefined,
        description: item.product.description || undefined,
      }));

      // Agregar envío si corresponde
      if (summary.shippingCost && summary.shippingCost > 0) {
        items.push({
          title: `Envío - ${summary.shippingOption?.name || "Envío"}`,
          quantity: 1,
          unit_price: summary.shippingCost,
          currency_id: "ARS",
          picture_url: undefined,
          description: summary.shippingOption?.description || undefined,
        });
      }

      // Preparar datos del cliente
      const customer = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        postalCode: customerInfo.postalCode,
      };

      // Metadata para el webhook
      const metadata = {
        shipping: summary.shippingOption?.id,
        billing: summary.billing?.id,
        discountPercent:
          summary.subtotal > 0 ? summary.discount / summary.subtotal : 0,
        items: summary.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      };

      // Crear preferencia en MercadoPago
      const response = await fetch("/api/payments/mercadopago/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items,
          customer,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Error creando la preferencia de pago"
        );
      }

      const data = await response.json();

      if (!data.data?.init_point) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Redirigir a MercadoPago
      window.location.href = data.data.init_point;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error procesando el pago";
      logger.error("Error en MercadoPago checkout", { error });

      show({
        type: "error",
        title: "Error de pago",
        message: errorMessage,
      });

      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumen del pedido */}
      <div className="surface rounded-lg border border-muted p-6">
        <h3 className="text-lg font-semibold mb-4">Resumen del pedido</h3>

        <div className="space-y-3 mb-4">
          {cartItems.map((item) => (
            <div
              key={`${item.product.id}-${item.size}-${item.color}`}
              className="flex justify-between"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product.name}</p>
                <p className="text-xs muted">
                  Talle: {item.size} • Color: {item.color} • Cant:{" "}
                  {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ${(item.product.price * item.quantity).toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-muted pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${total.toLocaleString("es-AR")}</span>
          </div>
          <div className="flex justify-between">
            <span>Envío</span>
            <span className="text-success">Gratis</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-muted pt-2">
            <span>Total</span>
            <span>${total.toLocaleString("es-AR")}</span>
          </div>
        </div>
      </div>

      {/* Información del cliente */}
      <div className="surface rounded-lg border border-muted p-6">
        <h4 className="font-semibold mb-3">Datos del comprador</h4>
        <div className="space-y-2 text-sm">
          <p>
            <span className="muted">Nombre:</span> {customerInfo.name}
          </p>
          <p>
            <span className="muted">Email:</span> {customerInfo.email}
          </p>
          {customerInfo.phone && (
            <p>
              <span className="muted">Teléfono:</span> {customerInfo.phone}
            </p>
          )}
          {customerInfo.address && (
            <p>
              <span className="muted">Dirección:</span> {customerInfo.address}
            </p>
          )}
        </div>
      </div>

      {/* Botón de pago */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || cartItems.length === 0}
        className="w-full h-12 text-lg font-medium bg-primary text-white hover:brightness-90"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Pagar con MercadoPago
          </>
        )}
      </Button>

      {/* Información de seguridad */}
      <div className="flex items-center justify-center gap-2 text-sm muted">
        <Shield className="w-4 h-4" />
        <span>Pago seguro procesado por MercadoPago</span>
      </div>

      {/* Métodos de pago aceptados */}
      <div className="surface rounded-lg border border-muted p-4">
        <p className="text-sm font-medium mb-3 text-center">
          Métodos de pago aceptados
        </p>
        <div className="flex items-center justify-center gap-4 opacity-60">
          <Image
            src="https://http2.mlstatic.com/storage/logos-api-admin/a5f047d0-9be0-11ec-aad4-c3381f368aaf-m.svg"
            alt="Visa"
            width={40}
            height={24}
            className="h-6 w-auto"
          />
          <Image
            src="https://http2.mlstatic.com/storage/logos-api-admin/aa2b8f70-5c85-11ec-ae75-df2bef173be2-m.svg"
            alt="Mastercard"
            width={40}
            height={24}
            className="h-6 w-auto"
          />
          <Image
            src="https://http2.mlstatic.com/storage/logos-api-admin/ce454480-445f-11eb-bf78-3b1ee7bf744c-m.svg"
            alt="American Express"
            width={40}
            height={24}
            className="h-6 w-auto"
          />
          <span className="text-xs muted">Efectivo • Transferencia</span>
        </div>
      </div>
    </div>
  );
}
