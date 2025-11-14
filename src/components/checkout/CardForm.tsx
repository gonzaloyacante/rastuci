"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CreditCard, Lock, Check, AlertCircle } from 'lucide-react';
import {
  validateCardNumber,
  validateExpiryDate,
  validateSecurityCode,
  validateCardholderName,
  formatCardNumber,
  detectCardType,
  cardBrands
} from '@/lib/card-validation';

interface CardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  securityCode: string;
  cardholderName: string;
  installments: number;
}

interface CardFormProps {
  data: CardData;
  onChange: (data: CardData) => void;
  paymentMethod: string;
}

export function CardForm({ data, onChange, paymentMethod }: CardFormProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [cardType, setCardType] = useState<string>('unknown');
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({});

  // Detectar tipo de tarjeta en tiempo real
  useEffect(() => {
    const type = detectCardType(data.cardNumber);
    setCardType(type);
  }, [data.cardNumber]);

  const handleChange = (field: string, value: string | number) => {
    onChange({ ...data, [field]: value });
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
  };

  const validateField = (field: string, value: string) => {
    setIsValidating(prev => ({ ...prev, [field]: true }));
    
    setTimeout(() => {
      let validation;
      
      switch (field) {
        case 'cardNumber':
          validation = validateCardNumber(value);
          break;
        case 'expiryDate':
          validation = validateExpiryDate(data.expiryMonth, data.expiryYear);
          break;
        case 'securityCode':
          validation = validateSecurityCode(value, cardType);
          break;
        case 'cardholderName':
          validation = validateCardholderName(value);
          break;
        default:
          validation = { isValid: true, cardType: '', errors: [] };
      }
      
      setValidationErrors(prev => ({
        ...prev,
        [field]: validation.errors
      }));
      
      setIsValidating(prev => ({ ...prev, [field]: false }));
    }, 500); // Debounce de 500ms
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value, cardType);
    handleChange('cardNumber', formatted);
    validateField('cardNumber', formatted);
  };

  const installmentOptions = [
    { value: '1', label: '1 cuota sin interés' },
    { value: '3', label: '3 cuotas sin interés' },
    { value: '6', label: '6 cuotas sin interés' },
    { value: '12', label: '12 cuotas con interés' },
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0'),
  }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear + i).slice(-2),
    label: String(currentYear + i),
  }));

  const getFieldStatus = (field: string) => {
    if (isValidating[field]) return 'validating';
    if (validationErrors[field]?.length > 0) return 'error';
    if (data[field as keyof CardData] && validationErrors[field]?.length === 0) return 'valid';
    return 'default';
  };

  const renderFieldIcon = (field: string) => {
    const status = getFieldStatus(field);
    
    if (status === 'validating') {
      return <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
    }
    if (status === 'valid') {
      return <Check className="w-4 h-4 text-success" />;
    }
    if (status === 'error') {
      return <AlertCircle className="w-4 h-4 text-error" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-primary">
            {paymentMethod === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
          </h4>
          <p className="text-sm muted">Ingresa los datos de tu tarjeta</p>
        </div>
      </div>

      {/* Número de tarjeta con detección de tipo */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Número de tarjeta
          {cardType !== 'unknown' && cardBrands[cardType] && (
            <span className="ml-2 text-xs text-primary">
              {cardBrands[cardType].name} detectada
            </span>
          )}
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={data.cardNumber}
            onChange={handleCardNumberChange}
            maxLength={cardType === 'amex' ? 17 : 19}
            className={`font-mono pr-10 ${
              getFieldStatus('cardNumber') === 'error' ? 'border-error' :
              getFieldStatus('cardNumber') === 'valid' ? 'border-success' : ''
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {renderFieldIcon('cardNumber')}
          </div>
        </div>
        {validationErrors.cardNumber?.map((error) => (
          <p key={`card-error-${error}`} className="text-xs text-error mt-1">{error}</p>
        ))}
      </div>

      {/* Vencimiento y CVV mejorados */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Mes de vencimiento
          </label>
          <Select
            options={monthOptions}
            value={data.expiryMonth}
            onChange={(value) => {
              handleChange('expiryMonth', value);
              if (data.expiryYear) {
                validateField('expiryDate', `${value}/${data.expiryYear}`);
              }
            }}
            placeholder="MM"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Año de vencimiento
          </label>
          <Select
            options={yearOptions}
            value={data.expiryYear}
            onChange={(value) => {
              handleChange('expiryYear', value);
              if (data.expiryMonth) {
                validateField('expiryDate', `${data.expiryMonth}/${value}`);
              }
            }}
            placeholder="AA"
          />
          {validationErrors.expiryDate?.map((error) => (
            <p key={`expiry-error-${error}`} className="text-xs text-error mt-1">{error}</p>
          ))}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            {cardType === 'amex' ? 'CID' : 'CVV'}
            <span className="ml-1 text-xs muted">
              ({cardType === 'amex' ? '4 dígitos' : '3 dígitos'})
            </span>
          </label>
          <div className="relative">
            <Input
              type="text"
              placeholder={cardType === 'amex' ? '1234' : '123'}
              value={data.securityCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, cardType === 'amex' ? 4 : 3);
                handleChange('securityCode', value);
                validateField('securityCode', value);
              }}
              maxLength={cardType === 'amex' ? 4 : 3}
              className={`font-mono pr-10 ${
                getFieldStatus('securityCode') === 'error' ? 'border-error' :
                getFieldStatus('securityCode') === 'valid' ? 'border-success' : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {renderFieldIcon('securityCode')}
            </div>
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <Lock className="w-3 h-3 muted" />
            </div>
          </div>
          {validationErrors.securityCode?.map((error) => (
            <p key={`security-error-${error}`} className="text-xs text-error mt-1">{error}</p>
          ))}
        </div>
      </div>

      {/* Nombre del titular con validación */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Nombre del titular de la tarjeta
        </label>
        <div className="relative">
          <Input
            type="text"
            placeholder="JUAN PÉREZ"
            value={data.cardholderName}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              handleChange('cardholderName', value);
              validateField('cardholderName', value);
            }}
            className={`pr-10 ${
              getFieldStatus('cardholderName') === 'error' ? 'border-error' :
              getFieldStatus('cardholderName') === 'valid' ? 'border-success' : ''
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {renderFieldIcon('cardholderName')}
          </div>
        </div>
        {validationErrors.cardholderName?.map((error) => (
          <p key={`cardholder-error-${error}`} className="text-xs text-error mt-1">{error}</p>
        ))}
      </div>

      {/* Cuotas (solo para tarjetas de crédito) */}
      {paymentMethod === 'credit_card' && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Cuotas
            <span className="ml-2 text-xs muted">Elige cómo pagar</span>
          </label>
          <Select
            options={installmentOptions}
            value={String(data.installments)}
            onChange={(value) => handleChange('installments', parseInt(value))}
            placeholder="Seleccionar cuotas"
          />
        </div>
      )}

      {/* Información de seguridad */}
      <div className="p-4 surface-secondary rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h5 className="font-medium text-primary mb-1">Pago 100% seguro</h5>
            <p className="text-xs muted leading-relaxed">
              Tus datos están protegidos con encriptación SSL de 256 bits. 
              No almacenamos información de tu tarjeta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
