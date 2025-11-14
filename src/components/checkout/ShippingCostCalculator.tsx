"use client";

import React, { useState, useEffect } from 'react';
import { Truck, MapPin, Calculator, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ocaService, type CotizarEnvioParams, calcularVolumenTotal, validarCodigoPostal } from '@/lib/oca-service';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

interface ShippingCostProps {
  codigoPostalOrigen?: number;
  onShippingChange: (shipping: ShippingOption | null) => void;
  className?: string;
}

export interface ShippingOption {
  cost: number;
  timeEstimate: string;
  operativa: number;
  description: string;
  provider: 'oca' | 'gratis';
}

const PESO_PROMEDIO_PRODUCTO = 0.5; // kg por producto
const DIMENSIONES_PROMEDIO = {
  alto: 15, // cm
  ancho: 20, // cm
  largo: 25  // cm
};

export function ShippingCostCalculator({ 
  codigoPostalOrigen = 1414, // CABA por defecto
  onShippingChange,
  className = '' 
}: ShippingCostProps) {
  const { cartItems, getCartTotal } = useCart();
  const { show } = useToast();

  const [codigoPostal, setCodigoPostal] = useState('');
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Resetear cuando cambia el carrito
  useEffect(() => {
    if (cartItems.length === 0) {
      setShippingOptions([]);
      setSelectedOption(null);
      onShippingChange(null);
    }
  }, [cartItems.length, onShippingChange]);

  // Notificar cambios de envío seleccionado
  useEffect(() => {
    onShippingChange(selectedOption);
  }, [selectedOption, onShippingChange]);

  const calcularCostoEnvio = async () => {
    if (!codigoPostal || codigoPostal.length !== 4) {
      setError('Ingresa un código postal válido de 4 dígitos');
      return;
    }

    const cpNumero = parseInt(codigoPostal, 10);
    if (!validarCodigoPostal(cpNumero)) {
      setError('Código postal inválido');
      return;
    }

    if (cartItems.length === 0) {
      setError('No hay productos en el carrito');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Calcular dimensiones y peso total de los productos
      const cantidadTotal = cartItems.reduce((total, item) => total + item.quantity, 0);
      const pesoTotal = cantidadTotal * PESO_PROMEDIO_PRODUCTO;
      const volumenTotal = calcularVolumenTotal(Array(cantidadTotal).fill({
        alto: DIMENSIONES_PROMEDIO.alto,
        ancho: DIMENSIONES_PROMEDIO.ancho,
        largo: DIMENSIONES_PROMEDIO.largo,
        peso: PESO_PROMEDIO_PRODUCTO,
        valor: 0,
        cantidad: 1
      }));

      const valorDeclarado = getCartTotal();

      // Preparar parámetros para diferentes operativas
      const baseParams: Omit<CotizarEnvioParams, 'operativa'> = {
        pesoTotal,
        volumenTotal,
        codigoPostalOrigen,
        codigoPostalDestino: cpNumero,
        cantidadPaquetes: cartItems.length,
        valorDeclarado
      };

      // Cotizar diferentes tipos de envío
      const cotizaciones = await Promise.allSettled([
        // Puerta a puerta
        ocaService.cotizarEnvio({ 
          ...baseParams, 
          operativa: 64665 // PUERTA_A_PUERTA from test data
        }),
        // Puerta a sucursal (más económico)
        ocaService.cotizarEnvio({ 
          ...baseParams, 
          operativa: 62342 // PUERTA_A_SUCURSAL from test data
        })
      ]);

      const opciones: ShippingOption[] = [];

      // Procesar resultados
      cotizaciones.forEach((resultado, index) => {
        if (resultado.status === 'fulfilled' && !resultado.value.error) {
          const cotizacion = resultado.value;
          opciones.push({
            cost: cotizacion.costo,
            timeEstimate: cotizacion.tiempoEntrega,
            operativa: cotizacion.operativa,
            description: index === 0 ? 'OCA Puerta a Puerta' : 'OCA Puerta a Sucursal',
            provider: 'oca'
          });
        }
      });

      // Agregar opción de envío gratis para montos altos
      if (valorDeclarado >= 50000) {
        opciones.unshift({
          cost: 0,
          timeEstimate: '3-5 días hábiles',
          operativa: 0,
          description: 'Envío Gratis (compras mayores a $50,000)',
          provider: 'gratis'
        });
      }

      if (opciones.length === 0) {
        throw new Error('No se encontraron opciones de envío disponibles para tu zona');
      }

      setShippingOptions(opciones);
      
      // Seleccionar la opción más económica por defecto
      const opcionMasEconomica = opciones.reduce((min, current) => 
        current.cost < min.cost ? current : min
      );
      setSelectedOption(opcionMasEconomica);

      show({
        type: 'success',
        title: 'Envío calculado',
        message: `Se encontraron ${opciones.length} opciones de envío`
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error calculando el envío';
      setError(errorMessage);
      
      show({
        type: 'error',
        title: 'Error de envío',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodigoPostalChange = (value: string) => {
    // Solo permitir números y máximo 4 dígitos
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    setCodigoPostal(numericValue);
    setError('');
    
    // Reset opciones si cambia el CP
    if (numericValue !== codigoPostal) {
      setShippingOptions([]);
      setSelectedOption(null);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Truck className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold text-primary">Calcular envío</h4>
          <p className="text-sm text-muted">Conocé el costo y tiempo de entrega</p>
        </div>
      </div>

      {/* Calculadora de CP */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Código postal (ej: 1414)"
              value={codigoPostal}
              onChange={(e) => handleCodigoPostalChange(e.target.value)}
              maxLength={4}
              className="text-center font-mono"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={calcularCostoEnvio}
            disabled={isLoading || !codigoPostal || cartItems.length === 0}
            variant="outline"
            className="whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculando
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4 mr-2" />
                Calcular
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-error/10 border border-error/20">
            <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
      </div>

      {/* Opciones de envío */}
      {shippingOptions.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-medium text-sm">Opciones de envío disponibles:</h5>
          
          <div className="space-y-2">
            {shippingOptions.map((option) => (
              <label
                key={`shipping-option-${option.operativa}-${option.provider}-${option.cost}`}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  selectedOption?.operativa === option.operativa
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping-option"
                    checked={selectedOption?.operativa === option.operativa}
                    onChange={() => setSelectedOption(option)}
                    className="text-primary"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{option.description}</span>
                      {option.provider === 'gratis' && (
                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                          GRATIS
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{option.timeEstimate}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold">
                    {option.cost === 0 ? 'Gratis' : `$${option.cost.toLocaleString('es-AR')}`}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Información adicional */}
      {cartItems.length === 0 && (
        <div className="p-3 rounded-lg bg-muted/50 border border-muted">
          <p className="text-sm text-muted text-center">
            Agrega productos al carrito para calcular el envío
          </p>
        </div>
      )}
    </div>
  );
}