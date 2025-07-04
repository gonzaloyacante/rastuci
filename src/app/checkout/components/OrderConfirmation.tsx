"use client";

import Link from "next/link";
import { CheckCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

interface OrderConfirmationProps {
  orderId?: string;
}

export default function OrderConfirmation({ orderId }: OrderConfirmationProps) {
  const { clearCart } = useCart();

  // Asegurarse de que el carrito esté limpio
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="mb-6">
          <CheckCircle size={80} className="mx-auto text-green-500" />
        </div>

        <h1 className="text-3xl font-bold mb-4">¡Gracias por tu compra!</h1>

        <p className="text-lg text-gray-600 mb-6">
          Tu pedido ha sido recibido y está siendo procesado.
        </p>

        {orderId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block">
            <p className="text-sm text-gray-500">Número de pedido</p>
            <p className="text-xl font-bold">{orderId}</p>
          </div>
        )}

        <p className="text-gray-600 mb-8">
          Hemos enviado un correo electrónico con los detalles de tu compra a la
          dirección proporcionada.
          <br />
          Si tienes alguna pregunta, no dudes en contactarnos.
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-gray-200 text-gray-800 hover:bg-gray-300 w-full md:w-auto">
              <ArrowLeft size={16} className="mr-2" />
              Volver al Inicio
            </Button>
          </Link>

          <Link href="/productos">
            <Button className="bg-[#E91E63] text-white hover:bg-[#C2185B] w-full md:w-auto">
              <ShoppingCart size={16} className="mr-2" />
              Seguir Comprando
            </Button>
          </Link>
        </div>
      </div>

      {/* Instrucciones adicionales según el método de pago */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm text-left">
        <h2 className="text-xl font-bold mb-4">¿Qué sigue?</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E91E63] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Confirmación por correo electrónico</p>
              <p className="text-gray-600 text-sm">
                Recibirás un correo electrónico con los detalles de tu pedido y
                el seguimiento cuando esté disponible.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E91E63] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Preparación del pedido</p>
              <p className="text-gray-600 text-sm">
                Comenzaremos a preparar tu pedido de inmediato. Esto puede tomar
                entre 1-2 días hábiles.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E91E63] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Envío</p>
              <p className="text-gray-600 text-sm">
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
