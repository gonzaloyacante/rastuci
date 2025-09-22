'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { 
  CreditCard, 
  Lock, 
  AlertCircle,
  Check,
  Calendar,
  User
} from 'lucide-react';
import { paymentManager, PaymentMethod, CardData } from '@/lib/payment';
import { EnhancedForm, FormField } from '@/components/forms/EnhancedForm';
import { z } from 'zod';
import toast from 'react-hot-toast';

const cardSchema = z.object({
  holderName: z.string().min(2, 'Nombre del titular requerido'),
  number: z.string().min(16, 'Número de tarjeta inválido'),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  cvc: z.string().min(3, 'CVC inválido'),
});

interface PaymentFormProps {
  amount: number;
  currency: string;
  orderId: string;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentForm({
  amount,
  currency,
  orderId,
  onPaymentSuccess,
  onPaymentError,
}: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('stripe');
  const [processing, setProcessing] = useState(false);
  const [cardData, setCardData] = useState<Partial<CardData>>({});
  const [paymentMethods] = useState<PaymentMethod[]>(paymentManager.getAvailablePaymentMethods());

  const handleCardPayment = async (data: z.infer<typeof cardSchema>) => {
    setProcessing(true);
    
    try {
      const cardInfo: CardData = {
        number: data.number.replace(/\s/g, ''),
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
        cvc: data.cvc,
        holderName: data.holderName,
      };

      const result = await paymentManager.processPayment(selectedMethod, {
        amount,
        currency,
        orderId,
        description: `Pedido #${orderId}`,
      }, { cardData: cardInfo });

      if (result.success && result.transactionId) {
        onPaymentSuccess(result.transactionId);
        toast.success('Pago procesado correctamente');
      } else {
        onPaymentError(result.error || 'Error en el pago');
        toast.error(result.error || 'Error en el pago');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      onPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setProcessing(true);
    
    try {
      const result = await paymentManager.processPayment('paypal', {
        amount,
        currency,
        orderId,
        description: `Pedido #${orderId}`,
      });

      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        onPaymentError(result.error || 'Error con PayPal');
        toast.error(result.error || 'Error con PayPal');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      onPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleBankTransfer = async () => {
    setProcessing(true);
    
    try {
      const result = await paymentManager.processPayment('bank_transfer', {
        amount,
        currency,
        orderId,
        description: `Pedido #${orderId}`,
      });

      if (result.success && result.transactionId) {
        onPaymentSuccess(result.transactionId);
        toast.success('Instrucciones de transferencia enviadas');
      } else {
        onPaymentError(result.error || 'Error en transferencia');
        toast.error(result.error || 'Error en transferencia');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      onPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    return paymentManager.formatCardNumber(value);
  };

  const formatExpiryDate = (value: string) => {
    return paymentManager.formatExpiryDate(value);
  };

  const getCardType = (number: string) => {
    return paymentManager.getCardType(number);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Método de Pago</h3>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            <label
              key={method.id}
              className={`
                flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedMethod === method.id 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
                }
              `}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="sr-only"
              />
              
              <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                {selectedMethod === method.id && (
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                )}
              </div>
              
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 flex items-center justify-center">
                  {method.type === 'card' && <CreditCard className="w-5 h-5" />}
                  {method.type === 'paypal' && <span className="text-info font-bold text-sm">PP</span>}
                  {method.type === 'bank_transfer' && <span className="text-success font-bold text-sm">🏦</span>}
                </div>
                <span className="font-medium">{method.name}</span>
              </div>
              
              {method.enabled && (
                <Badge variant="success" className="text-xs">Disponible</Badge>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Payment Forms */}
      {selectedMethod === 'stripe' && (
        <div className="surface border border-muted rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-success" />
            <span className="text-sm text-success">Pago seguro con encriptación SSL</span>
          </div>

          <EnhancedForm
            schema={cardSchema}
            onSubmit={handleCardPayment}
            submitText={processing ? 'Procesando...' : `Pagar ${currency.toUpperCase()} ${amount}`}
            isLoading={processing}
          >
            {({ register, errors, watch }) => {
              const watchedNumber = watch('number') || '';
              const cardType = getCardType(watchedNumber);
              
              return (
                <>
                  <FormField
                    name="holderName"
                    label="Nombre del Titular"
                    placeholder="Como aparece en la tarjeta"
                    required
                    register={register}
                    errors={errors}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Número de Tarjeta <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        {...register('number')}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          e.target.value = formatted;
                          register('number').onChange(e);
                        }}
                        className={errors.number ? 'border-error' : ''}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {cardType !== 'unknown' && (
                          <Badge variant="secondary" className="text-xs">
                            {cardType.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {errors.number && (
                      <p className="text-sm text-error">{errors.number.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Mes <span className="text-error">*</span>
                      </label>
                      <select
                        {...register('expiryMonth', { valueAsNumber: true })}
                        className={`w-full px-3 py-2 border rounded-md surface ${
                          errors.expiryMonth ? 'border-error' : 'border-muted'
                        }`}
                      >
                        <option value="">Mes</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <option key={month} value={month}>
                            {month.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      {errors.expiryMonth && (
                        <p className="text-sm text-error">{errors.expiryMonth.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Año <span className="text-error">*</span>
                      </label>
                      <select
                        {...register('expiryYear', { valueAsNumber: true })}
                        className={`w-full px-3 py-2 border rounded-md surface ${
                          errors.expiryYear ? 'border-error' : 'border-muted'
                        }`}
                      >
                        <option value="">Año</option>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                      {errors.expiryYear && (
                        <p className="text-sm text-error">{errors.expiryYear.message}</p>
                      )}
                    </div>

                    <FormField
                      name="cvc"
                      label="CVC"
                      placeholder="123"
                      inputProps={{ maxLength: 4 }}
                      required
                      register={register}
                      errors={errors}
                    />
                  </div>

                  <div className="flex items-start gap-3 p-3 surface border border-info rounded">
                    <AlertCircle className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-info">
                      <p className="font-medium">Información Segura</p>
                      <p>Tus datos de pago están protegidos con encriptación de nivel bancario.</p>
                    </div>
                  </div>
                </>
              );
            }}
          </EnhancedForm>
        </div>
      )}

      {selectedMethod === 'paypal' && (
        <div className="surface border border-muted rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-info rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">PP</span>
            </div>
            <h4 className="font-medium mb-2">Pagar con PayPal</h4>
            <p className="text-sm muted">
              Serás redirigido a PayPal para completar tu pago de forma segura.
            </p>
          </div>
          
          <Button
            onClick={handlePayPalPayment}
            disabled={processing}
            className="w-full bg-info hover:bg-info"
          >
            {processing ? 'Redirigiendo...' : `Continuar con PayPal - ${currency.toUpperCase()} ${amount}`}
          </Button>
        </div>
      )}

      {selectedMethod === 'bank_transfer' && (
        <div className="surface border border-muted rounded-lg p-6">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Transferencia Bancaria</h4>
            <p className="text-sm muted mb-4">
              Realiza una transferencia a nuestra cuenta bancaria. El pedido se procesará una vez confirmemos el pago.
            </p>
          </div>

          <div className="space-y-3 p-4 surface border border-muted rounded">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="muted">Banco:</span>
                <p className="font-medium">Banco Ejemplo</p>
              </div>
              <div>
                <span className="muted">Titular:</span>
                <p className="font-medium">Rastuci S.L.</p>
              </div>
              <div className="col-span-2">
                <span className="muted">IBAN:</span>
                <p className="font-mono font-medium">ES12 3456 7890 1234 5678 9012</p>
              </div>
              <div>
                <span className="muted">SWIFT/BIC:</span>
                <p className="font-mono font-medium">EXAMPLEXXX</p>
              </div>
              <div>
                <span className="muted">Concepto:</span>
                <p className="font-medium">Pedido #{orderId}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 surface border border-warning rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="text-sm text-warning">
                <p className="font-medium">Importante:</p>
                <p>Incluye el número de pedido en el concepto de la transferencia para identificar tu pago.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleBankTransfer}
            disabled={processing}
            className="w-full mt-4"
          >
            {processing ? 'Procesando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      )}

      {/* Order Summary */}
      <div className="surface border border-muted rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total a Pagar:</span>
          <span className="text-xl font-bold text-primary">
            {currency.toUpperCase()} {amount}
          </span>
        </div>
      </div>
    </div>
  );
}
