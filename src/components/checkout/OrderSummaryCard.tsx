"use client";

import React from 'react';
import Image from 'next/image';
import { Truck, CreditCard, FileText, MapPin, Phone, Mail, Edit2 } from 'lucide-react';
import { formatPriceARS } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image?: string;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
}

interface OrderSummaryCardProps {
  items: OrderItem[];
  customerInfo: CustomerInfo;
  shippingOption: ShippingOption;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  onEditStep: (step: 'customer' | 'shipping' | 'payment') => void;
}

export function OrderSummaryCard({
  items,
  customerInfo,
  shippingOption,
  paymentMethod,
  subtotal,
  shippingCost,
  discount,
  total,
  onEditStep
}: OrderSummaryCardProps) {
  return (
    <div className="space-y-6">
      {/* Productos */}
      <div className="surface rounded-xl border border-muted p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
            <span className="text-primary font-bold text-sm">{items.length}</span>
          </div>
          Productos en tu pedido
        </h3>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center gap-4 p-3 surface-secondary rounded-lg">
              {item.image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                <div className="flex items-center gap-2 text-xs muted mt-1">
                  <span className="px-2 py-1 surface rounded-full">{item.size}</span>
                  <span className="px-2 py-1 surface rounded-full">{item.color}</span>
                  <span>× {item.quantity}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPriceARS(item.price * item.quantity)}</p>
                {item.quantity > 1 && (
                  <p className="text-xs muted">{formatPriceARS(item.price)} c/u</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Información del cliente */}
      <div className="surface rounded-xl border border-muted p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 text-primary mr-2" />
            Información de entrega
          </h3>
          <Button
            onClick={() => onEditStep('customer')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
              {customerInfo.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{customerInfo.name}</p>
              <div className="flex items-center gap-4 text-sm muted">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {customerInfo.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {customerInfo.phone}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pl-11">
            <p className="text-sm">{customerInfo.address}</p>
            <p className="text-sm muted">
              {customerInfo.city}, {customerInfo.province} - CP: {customerInfo.postalCode}
            </p>
          </div>
        </div>
      </div>

      {/* Envío */}
      <div className="surface rounded-xl border border-muted p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Truck className="w-5 h-5 text-primary mr-2" />
            Método de envío
          </h3>
          <Button
            onClick={() => onEditStep('shipping')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Cambiar
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{shippingOption.name}</p>
            <p className="text-sm muted">{shippingOption.description}</p>
            <p className="text-xs muted mt-1">Tiempo estimado: {shippingOption.estimatedDays}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-success">
              {shippingOption.price === 0 ? 'Gratis' : formatPriceARS(shippingOption.price)}
            </p>
          </div>
        </div>
      </div>

      {/* Método de pago */}
      <div className="surface rounded-xl border border-muted p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CreditCard className="w-5 h-5 text-primary mr-2" />
            Método de pago
          </h3>
          <Button
            onClick={() => onEditStep('payment')}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Cambiar
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{paymentMethod.name}</p>
            <p className="text-sm muted">{paymentMethod.description}</p>
          </div>
        </div>
      </div>

      {/* Resumen de costos */}
      <div className="surface rounded-xl border border-muted p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 text-primary mr-2" />
          Resumen del pedido
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} {items.length === 1 ? 'producto' : 'productos'})</span>
            <span>{formatPriceARS(subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>Envío</span>
            <span className={shippingCost === 0 ? 'text-success font-medium' : ''}>
              {shippingCost === 0 ? 'Gratis' : formatPriceARS(shippingCost)}
            </span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Descuento aplicado</span>
              <span>-{formatPriceARS(discount)}</span>
            </div>
          )}
          
          <div className="border-t border-muted pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatPriceARS(total)}</span>
            </div>
            <p className="text-xs muted mt-1 text-right">
              Incluye impuestos y tasas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
