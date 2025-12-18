import { Agency } from '@/lib/correo-argentino-service';
import { Button } from '@/components/ui/Button';
import { formatPriceARS } from '@/utils/formatters';
import { CreditCard, Edit2, FileText, Mail, MapPin, Phone, Truck, Store, Clock } from 'lucide-react';
import Image from 'next/image';
import { WEEKDAY_NAMES_SHORT, type WeekdayKey } from "@/lib/constants";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
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
  agency?: Agency | null;
}

export function OrderSummaryCard({
  items,
  customerInfo,
  shippingOption,
  paymentMethod,
  subtotal: _subtotal,
  shippingCost,
  discount,
  total,
  onEditStep,
  agency,
}: OrderSummaryCardProps) {

  const grossSubtotal = items.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Detalles del Pedido */}
      <h3 className="text-xl font-bold mb-4">Detalles del Pedido</h3>

      <div className="space-y-4">
        {items.map((item) => {
          const hasDiscount = item.onSale && item.salePrice && item.salePrice < item.price;
          const itemTotal = (hasDiscount ? item.salePrice! : item.price) * item.quantity;

          return (
            <div
              key={`${item.id}-${item.size}-${item.color}`}
              className="flex items-center gap-4 p-3 surface-secondary rounded-lg"
            >
              {item.image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs muted">
                  {item.size} / {item.color} x {item.quantity}
                </p>
              </div>
              <div className="text-right">
                {hasDiscount ? (
                  <>
                    <p className="text-xs line-through muted">{formatPriceARS(item.price * item.quantity)}</p>
                    <p className="font-medium text-success">{formatPriceARS(itemTotal)}</p>
                  </>
                ) : (
                  <p className="font-medium">{formatPriceARS(itemTotal)}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cupón de Descuento */}
      <div className="surface rounded-xl border border-muted p-4 mt-4">
        <h4 className="text-sm font-semibold mb-3">Cupón de Descuento</h4>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Código de cupón"
            className="flex-1 bg-muted/50 border border-muted rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <Button size="sm" variant="outline">Aplicar</Button>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="surface rounded-xl border border-muted p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <MapPin className="w-5 h-5 text-primary mr-2" />
            Información de Contacto
          </h3>
          <Button
            onClick={() => onEditStep("customer")}
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
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold text-center leading-none">
              {customerInfo.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium">{customerInfo.name}</p>
              <div className="flex items-center gap-4 text-xs muted">
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
            <p className="text-xs muted">
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
            Envío
          </h3>
          <Button
            onClick={() => onEditStep("shipping")}
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
            <p className="text-xs muted mt-1">Estimado: {shippingOption.estimatedDays}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-success">
              {shippingCost === 0 ? "Sin cargo" : formatPriceARS(shippingCost)}
            </p>
          </div>
        </div>

        {/* Agencia con Borde Rosa */}
        {agency && (
          <div className="rounded-lg border border-pink-500 p-4 bg-white mt-4 text-sm shadow-sm relative overflow-hidden">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-pink-50 rounded-lg shrink-0">
                <Store className="h-5 w-5 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-pink-600 text-base leading-tight uppercase">
                  {agency.name}
                </p>
                <p className="text-gray-600 mt-1 font-medium">
                  {agency.location.address.streetName} {agency.location.address.streetNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {agency.location.address.city}, CP {agency.location.address.postalCode}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-pink-100 pt-4 mb-4">
              <div>
                <p className="text-[11px] font-bold text-pink-600 mb-2 uppercase tracking-tight">Horarios de atención:</p>
                <div className="space-y-1">
                  {Object.entries(agency.hours || {}).map(([day, hours]) => {
                    if (!hours || day === "holidays") return null;
                    const dayName = WEEKDAY_NAMES_SHORT[day as WeekdayKey];
                    if (!dayName) return null;
                    return (
                      <div key={day} className="flex justify-between text-[11px] text-gray-600">
                        <span className="font-medium">{dayName}:</span>
                        <span>{hours.start.slice(0, 2)}:{hours.start.slice(2)} - {hours.end.slice(0, 2)}:{hours.end.slice(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-lg h-32 bg-muted overflow-hidden border border-muted">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${agency.location.latitude},${agency.location.longitude}&hl=es&z=15&output=embed`}
                ></iframe>
              </div>
            </div>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${agency.location.latitude},${agency.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 border border-pink-500 rounded-lg text-pink-600 font-bold text-xs uppercase hover:bg-pink-50 transition-colors"
            >
              <MapPin size={12} />
              Ver en Google Maps
            </a>
          </div>
        )}
      </div>

      {/* Pago */}
      <div className="surface rounded-xl border border-muted p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CreditCard className="w-5 h-5 text-primary mr-2" />
            Pago
          </h3>
          <Button
            onClick={() => onEditStep("payment")}
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
            <p className="text-xs muted">{paymentMethod.description}</p>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="surface rounded-xl border border-muted p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 text-primary mr-2" />
          Resumen
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({items.length} {items.length === 1 ? "producto" : "productos"})</span>
            <span>{formatPriceARS(grossSubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Envío</span>
            <span className={shippingCost === 0 ? "text-success font-medium" : ""}>
              {shippingCost === 0 ? "Sin cargo" : formatPriceARS(shippingCost)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-success font-medium">
              <span>Descuento aplicado</span>
              <span>-{formatPriceARS(discount)}</span>
            </div>
          )}
          <div className="border-t border-muted pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">Total</span>
              <span className="text-2xl font-bold text-primary">{formatPriceARS(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
