"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle, Package, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    // Obtener datos de la URL
    const method = searchParams.get("method") || "mercadopago";
    const id = searchParams.get("order_id") || searchParams.get("external_reference") || "";
    
    setPaymentMethod(method);
    setOrderId(id);
    
    // Limpiar carrito después de compra exitosa
    clearCart();
  }, [searchParams, clearCart]);

  const isCashPayment = paymentMethod === "cash";

  return (
    <div className="min-h-screen surface">
      <Header />
      
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Ícono de éxito */}
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 text-success mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">
              ¡Pedido Confirmado!
            </h1>
            <p className="muted">
              {orderId && `Número de pedido: #${orderId}`}
            </p>
          </div>

          {/* Información específica según método de pago */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                      Tu pedido está siendo preparado. Te contactaremos por WhatsApp 
                      cuando esté listo para retirar.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-primary mb-3">
                    Información del Local:
                  </h4>
                  <div className="space-y-2 text-sm muted">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>[DIRECCIÓN REAL DEL LOCAL], Buenos Aires</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>+54 9 11 [NÚMERO REAL]</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 surface-secondary rounded-md">
                    <p className="text-sm text-primary">
                      <strong>Horarios de atención:</strong><br />
                      Lunes a Viernes: 9:00 - 18:00<br />
                      Sábados: 9:00 - 13:00
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-primary mb-2">
                    Próximos pasos:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm muted">
                    <li>Prepararemos tu pedido (1-2 días hábiles)</li>
                    <li>Te enviaremos un WhatsApp cuando esté listo</li>
                    <li>Vienes al local y pagas en efectivo</li>
                    <li>¡Retiras tu pedido!</li>
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
                      Tu pago ha sido procesado exitosamente. Te enviaremos 
                      actualizaciones sobre el estado de tu pedido por email.
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-primary mb-2">
                    ¿Qué sigue?
                  </h4>
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

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/productos"
              className="bg-pink-600 text-white px-6 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors text-center">
              Seguir Comprando
            </Link>
            <Link
              href="/contacto"
              className="border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center">
              Contactar Soporte
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center text-sm muted">
            <p>
              ¿Problemas con tu pedido?{" "}
              <Link href="/contacto" className="text-pink-600 hover:underline">
                Contáctanos aquí
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}