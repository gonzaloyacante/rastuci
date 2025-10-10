"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Clock, Package, Phone, MapPin, Loader2, AlertCircle, FileText } from "lucide-react";
import Link from "next/link";

function CheckoutPendingContent() {
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");

  useEffect(() => {
    // Obtener datos de la URL
    const method = searchParams.get("method") || "mercadopago";
    const orderRef = searchParams.get("order_id") || searchParams.get("external_reference") || "";
    const payment = searchParams.get("payment_id") || searchParams.get("collection_id") || "";
    
    setPaymentMethod(method);
    setOrderId(orderRef);
    setPaymentId(payment);
  }, [searchParams]);

  const isPendingPayment = paymentMethod === "bank_transfer" || paymentMethod === "ticket";

  const getPaymentInstructions = (method: string) => {
    const instructions: Record<string, {
      title: string;
      steps: string[];
      timeFrame: string;
    }> = {
      'bank_transfer': {
        title: 'Transferencia Bancaria',
        steps: [
          'Realiza la transferencia con los datos proporcionados por MercadoPago',
          'El pago puede tardar hasta 1-3 días hábiles en acreditarse',
          'Te notificaremos por email cuando se confirme el pago',
          'Una vez confirmado, comenzaremos a preparar tu pedido'
        ],
        timeFrame: '1-3 días hábiles'
      },
      'ticket': {
        title: 'Pago en Efectivo',
        steps: [
          'Imprime el comprobante o guarda el código de pago',
          'Dirígete al punto de pago más cercano',
          'Presenta el comprobante y realiza el pago',
          'El pago se acreditará automáticamente en 1-2 horas'
        ],
        timeFrame: '1-2 horas después del pago'
      },
      'default': {
        title: 'Pago Pendiente',
        steps: [
          'Tu pago está siendo procesado',
          'Verificaremos la información en las próximas horas',
          'Te notificaremos el estado por email',
          'Una vez confirmado, procesaremos tu pedido'
        ],
        timeFrame: '2-24 horas'
      }
    };

    return instructions[method] || instructions['default'];
  };

  const paymentInstructions = getPaymentInstructions(paymentMethod);

  return (
    <div className="min-h-screen surface">
      <Header />
      
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Ícono de pendiente */}
          <div className="text-center mb-8">
            <Clock className="w-20 h-20 text-warning mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">
              Pago Pendiente
            </h1>
            <p className="muted">
              {orderId && `Número de pedido: #${orderId}`}
            </p>
            {paymentId && (
              <p className="text-sm muted mt-1">
                ID de pago: {paymentId}
              </p>
            )}
          </div>

          {/* Estado del pago */}
          <div className="surface-secondary rounded-lg p-6 mb-6 border muted">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-warning mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-primary mb-2">
                  Tu pago está en proceso
                </h3>
                <p className="muted mb-4">
                  Hemos recibido tu pedido y estamos procesando el pago. 
                  Te notificaremos por email cuando se confirme.
                </p>
                <div className="badge-warning">
                  <Clock className="w-4 h-4 mr-1" />
                  Tiempo estimado: {paymentInstructions.timeFrame}
                </div>
              </div>
            </div>
          </div>

          {/* Instrucciones específicas del método de pago */}
          <div className="surface rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              {paymentInstructions.title}
            </h3>
            <div className="space-y-3">
              {paymentInstructions.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 text-sm font-semibold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm muted flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ¿Qué sigue? */}
          <div className="surface rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              ¿Qué sigue?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Package className="w-5 h-5 text-primary mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Preparación del pedido</p>
                  <p className="text-sm muted">
                    Una vez confirmado el pago, comenzaremos a preparar tu pedido.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-success mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">Te mantendremos informado</p>
                  <p className="text-sm muted">
                    Recibirás notificaciones por email sobre el estado de tu pedido.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del pedido */}
          {isPendingPayment && (
            <div className="surface rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-primary mb-4">
                Información Importante
              </h3>
              <div className="surface-secondary border muted rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-primary mb-1">
                      Conserva tu comprobante de pago
                    </p>
                    <p className="muted">
                      Guarda el comprobante hasta que se confirme el pago. 
                      Si necesitas ayuda, podrás enviárnoslo por WhatsApp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/productos"
              className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors text-center">
              Seguir Comprando
            </Link>
            
            <Link
              href="/contacto"
              className="flex-1 border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center">
              Contactar Soporte
            </Link>
          </div>

          {/* Información de contacto */}
          <div className="surface rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              ¿Necesitas Ayuda?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Phone className="w-4 h-4 muted mr-3" />
                <span className="muted">WhatsApp:</span>
                <a href="https://wa.me/5491234567890" className="text-pink-600 hover:underline ml-2">
                  +54 9 123 456-7890
                </a>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 muted mr-3" />
                <span className="muted">Email:</span>
                <a href="mailto:soporte@rastuci.com" className="text-pink-600 hover:underline ml-2">
                  soporte@rastuci.com
                </a>
              </div>
            </div>
            <div className="mt-4 p-3 surface-secondary rounded-lg">
              <p className="text-sm muted">
                <strong>Horarios de atención:</strong><br />
                Lunes a Viernes: 9:00 - 18:00<br />
                Sábados: 9:00 - 13:00
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center text-sm muted">
            <p>
              Los pagos son procesados de forma segura por MercadoPago.{" "}
              <Link href="/politicas" className="text-pink-600 hover:underline">
                Términos y condiciones
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Loading component para Suspense
function CheckoutPendingLoading() {
  return (
    <div className="min-h-screen surface">
      <Header />
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="muted">Cargando información del pago...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Componente principal con Suspense
export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={<CheckoutPendingLoading />}>
      <CheckoutPendingContent />
    </Suspense>
  );
}