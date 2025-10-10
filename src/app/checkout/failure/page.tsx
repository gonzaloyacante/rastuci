"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { XCircle, RefreshCw, Phone, MapPin, Loader2, AlertTriangle, CreditCard } from "lucide-react";
import Link from "next/link";

function CheckoutFailureContent() {
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [errorReason, setErrorReason] = useState<string>("");

  useEffect(() => {
    // Obtener datos de la URL
    const method = searchParams.get("method") || "mercadopago";
    const id = searchParams.get("order_id") || searchParams.get("external_reference") || "";
    const reason = searchParams.get("reason") || searchParams.get("status_detail") || "";
    
    setPaymentMethod(method);
    setOrderId(id);
    setErrorReason(reason);
  }, [searchParams]);

  const getErrorMessage = (reason: string) => {
    const errorMap: Record<string, string> = {
      'cc_rejected_insufficient_amount': 'Fondos insuficientes en la tarjeta',
      'cc_rejected_bad_filled_card_number': 'Número de tarjeta incorrecto',
      'cc_rejected_bad_filled_date': 'Fecha de vencimiento incorrecta',
      'cc_rejected_bad_filled_security_code': 'Código de seguridad incorrecto',
      'cc_rejected_card_disabled': 'Tarjeta deshabilitada',
      'cc_rejected_blacklist': 'No pudimos procesar tu pago',
      'cc_rejected_call_for_authorize': 'Debes autorizar ante tu banco el pago',
      'cc_rejected_card_error': 'Error en la tarjeta',
      'cc_rejected_duplicated_payment': 'Ya hiciste un pago por ese valor',
      'cc_rejected_high_risk': 'Tu pago fue rechazado',
      'cc_rejected_max_attempts': 'Llegaste al límite de intentos permitidos',
      'cc_rejected_other_reason': 'Tu pago fue rechazado',
      'rejected': 'Pago rechazado',
      'cancelled': 'Pago cancelado',
      'timeout': 'Tiempo de espera agotado',
      'network_error': 'Error de conexión'
    };

    return errorMap[reason] || 'Hubo un problema con tu pago';
  };

  const getRecommendations = (reason: string) => {
    const recommendations: Record<string, string[]> = {
      'cc_rejected_insufficient_amount': [
        'Verifica que tu tarjeta tenga fondos suficientes',
        'Intenta con otra tarjeta',
        'Contacta a tu banco para verificar el límite'
      ],
      'cc_rejected_bad_filled_card_number': [
        'Verifica que el número de tarjeta esté correcto',
        'Revisa que no haya espacios o caracteres extra',
        'Intenta escribir el número nuevamente'
      ],
      'cc_rejected_bad_filled_date': [
        'Verifica la fecha de vencimiento de tu tarjeta',
        'Asegúrate de usar el formato MM/AA',
        'Revisa que la tarjeta no esté vencida'
      ],
      'cc_rejected_bad_filled_security_code': [
        'Verifica el código de seguridad (CVV)',
        'Son los 3 o 4 dígitos del dorso de tu tarjeta',
        'Asegúrate de no confundir 0 con O'
      ],
      'cc_rejected_card_disabled': [
        'Tu tarjeta está deshabilitada',
        'Contacta a tu banco para habilitarla',
        'Intenta con otra tarjeta'
      ],
      'cc_rejected_call_for_authorize': [
        'Contacta a tu banco para autorizar el pago',
        'Informa que quieres realizar una compra online',
        'Intenta nuevamente después de la autorización'
      ],
      'default': [
        'Verifica los datos de tu tarjeta',
        'Intenta con otro método de pago',
        'Contacta a nuestro soporte si el problema persiste'
      ]
    };

    return recommendations[reason] || recommendations['default'];
  };

  return (
    <div className="min-h-screen surface">
      <Header />
      
      <div className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Ícono de error */}
          <div className="text-center mb-8">
            <XCircle className="w-20 h-20 text-error mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-primary mb-2">
              Pago Rechazado
            </h1>
            <p className="muted">
              {orderId && `Referencia: #${orderId}`}
            </p>
          </div>

          {/* Mensaje de error específico */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {getErrorMessage(errorReason)}
                </h3>
                <div className="text-red-700">
                  <p className="mb-3">¿Qué puedes hacer?</p>
                  <ul className="list-disc list-inside space-y-1">
                    {getRecommendations(errorReason).map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Métodos de pago alternativos */}
          <div className="surface rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Métodos de Pago Disponibles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Tarjetas de Crédito/Débito</p>
                  <p className="text-sm muted">Visa, Mastercard, American Express</p>
                </div>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MP</span>
                </div>
                <div>
                  <p className="font-medium">MercadoPago</p>
                  <p className="text-sm muted">Wallet, transferencias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link
              href="/carrito"
              className="flex-1 bg-pink-600 text-white px-6 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors text-center flex items-center justify-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Intentar Nuevamente
            </Link>
            
            <Link
              href="/productos"
              className="flex-1 border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center">
              Seguir Comprando
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
          </div>

          {/* Botón de soporte */}
          <div className="flex justify-center">
            <Link
              href="/contacto"
              className="border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center">
              Contactar Soporte
            </Link>
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center text-sm muted">
            <p>
              Los pagos son procesados de forma segura por MercadoPago.{" "}
              <Link href="/contacto" className="text-pink-600 hover:underline">
                Política de privacidad
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
function CheckoutFailureLoading() {
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
export default function CheckoutFailurePage() {
  return (
    <Suspense fallback={<CheckoutFailureLoading />}>
      <CheckoutFailureContent />
    </Suspense>
  );
}