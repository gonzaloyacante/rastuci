"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { CardForm } from "@/components/checkout/CardForm";
import { SavedCardsSelector } from "@/components/checkout/SavedCardsSelector";

interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  // Estados para el formulario de pago
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [useNewCard, setUseNewCard] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    securityCode: '',
    cardholderName: '',
    installments: 1,
  });
  
  const [error, setError] = useState<string | null>(null);

  // Manejar continuar al siguiente paso
  const handleContinue = () => {
    if (!selectedPaymentMethod) {
      setError("Por favor, selecciona un método de pago para continuar");
      return;
    }

    if ((selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && 
        (!cardData.cardNumber || !cardData.expiryMonth || !cardData.expiryYear || !cardData.securityCode)) {
      setError("Por favor, completa todos los datos de la tarjeta");
      return;
    }

    // Guardar datos de pago en el contexto si es necesario
    onNext();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="surface p-6 rounded-lg shadow-sm border border-muted">
        <h2 className="text-2xl font-bold mb-6 text-primary">Método de Pago</h2>

        {/* Mensaje de error */}
        {error && (
          <div className="surface border border-error text-error p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        {/* Selector de método de pago */}
        <PaymentMethodSelector
          selectedMethod={selectedPaymentMethod}
          onMethodChange={setSelectedPaymentMethod}
        />

        {/* Selector de tarjetas guardadas o nueva tarjeta */}
        {(selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && (
          <div className="mt-6">
            <SavedCardsSelector
              selectedCardId={selectedCardId}
              onCardSelect={(cardId) => {
                setSelectedCardId(cardId);
                setUseNewCard(false);
              }}
              onNewCardSelect={() => {
                setSelectedCardId(null);
                setUseNewCard(true);
              }}
            />
            
            {/* Formulario de tarjeta nueva */}
            {useNewCard && (
              <div className="mt-6">
                <CardForm
                  data={cardData}
                  onChange={setCardData}
                  paymentMethod={selectedPaymentMethod}
                />
              </div>
            )}
          </div>
        )}

        {/* Información de efectivo */}
        {selectedPaymentMethod === 'cash' && (
          <div className="mt-6 p-4 surface rounded-lg border border-muted">
            <h4 className="font-medium mb-2">Pago en efectivo</h4>
            <p className="text-sm muted mb-3">
              Podrás pagar en Rapipago, Pago Fácil y otros centros de pago.
            </p>
            <p className="text-sm muted">
              Te enviaremos las instrucciones por email después de confirmar la compra.
            </p>
          </div>
        )}

        {/* Información de transferencia */}
        {selectedPaymentMethod === 'bank_transfer' && (
          <div className="mt-6 p-4 surface rounded-lg border border-muted">
            <h4 className="font-medium mb-2">Transferencia bancaria</h4>
            <p className="text-sm muted">
              Recibirás los datos bancarios por email al finalizar la compra. 
              Tu pedido se procesará una vez confirmado el pago.
            </p>
          </div>
        )}

        {/* Información sobre tarjetas guardadas */}
        {(selectedPaymentMethod === 'credit_card' || selectedPaymentMethod === 'debit_card') && (
          <div className="mt-6 p-4 surface-secondary rounded-lg border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-primary mb-1">💳 Tarjetas guardadas</h4>
                <p className="text-sm muted mb-2">
                  Si ya tienes una cuenta de MercadoPago, podrás ver y usar tus tarjetas guardadas al procesar el pago.
                </p>
                <div className="text-xs muted">
                  <span className="font-medium">✓</span> Pago con 1 clic
                  <span className="mx-2">•</span>
                  <span className="font-medium">✓</span> Datos seguros
                  <span className="mx-2">•</span>
                  <span className="font-medium">✓</span> Sin salir de la web
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="surface text-primary hover:brightness-95">
            <ChevronLeft className="mr-2" size={16} />
            Volver
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedPaymentMethod}
            className="btn-hero">
            Continuar
            <ChevronRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
