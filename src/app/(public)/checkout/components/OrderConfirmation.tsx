"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, CheckCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface OrderConfirmationProps {
  orderId?: string;
}

export default function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const { clearCart } = useCart();
  const [hasClearedCart, setHasClearedCart] = useState(false);

  // Asegurarse de que el carrito esté limpio solo una vez
  useEffect(() => {
    if (!hasClearedCart) {
      clearCart();
      setHasClearedCart(true);
    }
  }, [clearCart, hasClearedCart]);

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="surface p-8 rounded-lg shadow-sm">
        <div className="mb-6">
          <CheckCircle size={80} className="mx-auto text-success" />
        </div>

        <h1 className="text-3xl font-bold mb-4 text-primary">¡Gracias por tu compra!</h1>

        <p className="text-lg muted mb-6">
          Tu pedido ha sido recibido y está siendo procesado.
        </p>

        {orderId && (
          <div className="surface-secondary p-4 rounded-lg mb-6 inline-block">
            <p className="text-sm muted">Número de pedido</p>
            <p className="text-xl font-bold text-primary">{orderId}</p>
          </div>
        )}

        <p className="muted mb-8">
          Hemos enviado un correo electrónico con los detalles de tu compra a la
          dirección proporcionada.
          <br />
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full md:w-auto">
              <ArrowLeft size={16} className="mr-2" />
              Volver al Inicio
            </Button>
          </Link>

          <Link href="/productos">
            <Button variant="hero" fullWidth className="md:w-auto">
              <ShoppingCart size={16} className="mr-2" />
              Seguir Comprando
            </Button>
          </Link>
        </div>
      </div>

      {/* Instrucciones adicionales según el método de pago */}
      <div className="mt-8 surface p-6 rounded-lg shadow-sm text-left">
        <h2 className="text-xl font-bold mb-4 text-primary">¿Qué sigue?</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium text-primary">Confirmación por correo electrónico</p>
              <p className="muted text-sm">
                Recibirás un correo electrónico con los detalles de tu pedido y
                el seguimiento cuando esté disponible.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium text-primary">Preparación del pedido</p>
              <p className="muted text-sm">
                Comenzaremos a preparar tu pedido de inmediato. Esto puede tomar
                entre 1-2 días hábiles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium text-primary">Envío</p>
              <p className="muted text-sm">
                Una vez que tu pedido esté listo, lo enviaremos a través del
                método de envío seleccionado. Recibirás actualizaciones sobre el
                estado de la entrega.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
