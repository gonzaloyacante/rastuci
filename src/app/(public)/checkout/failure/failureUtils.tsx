import { AlertTriangle, CreditCard, Phone, RefreshCw } from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Error message helpers
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: "Fondos insuficientes en la tarjeta",
  cc_rejected_bad_filled_card_number: "Número de tarjeta incorrecto",
  cc_rejected_bad_filled_date: "Fecha de vencimiento incorrecta",
  cc_rejected_bad_filled_security_code: "Código de seguridad incorrecto",
  cc_rejected_card_disabled: "Tarjeta deshabilitada",
  cc_rejected_blacklist: "No pudimos procesar tu pago",
  cc_rejected_call_for_authorize: "Debes autorizar ante tu banco el pago",
  cc_rejected_card_error: "Error en la tarjeta",
  cc_rejected_duplicated_payment: "Ya hiciste un pago por ese valor",
  cc_rejected_high_risk: "Tu pago fue rechazado",
  cc_rejected_max_attempts: "Llegaste al límite de intentos permitidos",
  cc_rejected_other_reason: "Tu pago fue rechazado",
  rejected: "Pago rechazado",
  cancelled: "Pago cancelado",
  timeout: "Tiempo de espera agotado",
  network_error: "Error de conexión",
};

const RECOMMENDATIONS: Record<string, string[]> = {
  cc_rejected_insufficient_amount: [
    "Verifica que tu tarjeta tenga fondos suficientes",
    "Intenta con otra tarjeta",
    "Contacta a tu banco para verificar el límite",
  ],
  cc_rejected_bad_filled_card_number: [
    "Verifica que el número de tarjeta esté correcto",
    "Revisa que no haya espacios o caracteres extra",
    "Intenta escribir el número nuevamente",
  ],
  cc_rejected_bad_filled_date: [
    "Verifica la fecha de vencimiento de tu tarjeta",
    "Asegúrate de usar el formato MM/AA",
    "Revisa que la tarjeta no esté vencida",
  ],
  cc_rejected_bad_filled_security_code: [
    "Verifica el código de seguridad (CVV)",
    "Son los 3 o 4 dígitos del dorso de tu tarjeta",
    "Asegúrate de no confundir 0 con O",
  ],
  cc_rejected_card_disabled: [
    "Tu tarjeta está deshabilitada",
    "Contacta a tu banco para habilitarla",
    "Intenta con otra tarjeta",
  ],
  cc_rejected_call_for_authorize: [
    "Contacta a tu banco para autorizar el pago",
    "Informa que quieres realizar una compra online",
    "Intenta nuevamente después de la autorización",
  ],
  default: [
    "Verifica los datos de tu tarjeta",
    "Intenta con otro método de pago",
    "Contacta a nuestro soporte si el problema persiste",
  ],
};

export function getErrorMessage(reason: string): string {
  return ERROR_MESSAGES[reason] ?? "Hubo un problema con tu pago";
}

export function getRecommendations(reason: string): string[] {
  return RECOMMENDATIONS[reason] ?? RECOMMENDATIONS["default"];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function PaymentMethodsCard() {
  return (
    <div className="surface rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-lg font-semibold text-primary mb-4">
        Métodos de Pago Disponibles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center p-3 border muted rounded-lg">
          <CreditCard className="w-6 h-6 text-primary mr-3" />
          <div>
            <p className="font-medium">Tarjetas de Crédito/Débito</p>
            <p className="text-sm muted">Visa, Mastercard, American Express</p>
          </div>
        </div>
        <div className="flex items-center p-3 border muted rounded-lg">
          <div className="w-6 h-6 bg-primary rounded mr-3 flex items-center justify-center">
            <span className="text-white text-xs font-bold">MP</span>
          </div>
          <div>
            <p className="font-medium">MercadoPago</p>
            <p className="text-sm muted">Wallet, transferencias</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendationsList({ reason }: { reason: string }) {
  return (
    <ul className="list-disc list-inside space-y-1">
      {getRecommendations(reason).map((rec, index) => (
        <li key={`rec-${index}`} className="text-sm">
          {rec}
        </li>
      ))}
    </ul>
  );
}

export function ErrorDetailCard({ errorReason }: { errorReason: string }) {
  return (
    <div className="surface-secondary rounded-lg border muted p-6 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-error mr-3 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-primary mb-2">
            {getErrorMessage(errorReason)}
          </h3>
          <div className="muted">
            <p className="mb-3">¿Qué puedes hacer?</p>
            <RecommendationsList reason={errorReason} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FailureActions() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <Link
        href="/carrito"
        className="flex-1 bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors text-center flex items-center justify-center"
      >
        <RefreshCw className="w-5 h-5 mr-2" />
        Intentar Nuevamente
      </Link>
      <Link
        href="/productos"
        className="flex-1 border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center"
      >
        Seguir Comprando
      </Link>
    </div>
  );
}

export function ContactSupportCard() {
  return (
    <>
      <div className="surface rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-primary mb-4">
          ¿Necesitas Ayuda?
        </h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Phone className="w-4 h-4 muted mr-3" />
            <span className="muted">Contacto:</span>
            <Link
              href="/contacto"
              className="text-primary hover:underline ml-2"
            >
              Ir a la página de contacto
            </Link>
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Link
          href="/contacto"
          className="border surface muted px-6 py-3 rounded-md font-medium hover:surface-secondary transition-colors text-center"
        >
          Contactar Soporte
        </Link>
      </div>
    </>
  );
}
