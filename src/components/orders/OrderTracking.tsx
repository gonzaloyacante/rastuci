'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Phone,
  Mail,
  Calendar,
  Download
} from 'lucide-react';

interface OrderStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  timestamp: Date;
  description: string;
  location?: string;
}

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus['status'];
  items: OrderItem[];
  total: number;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: Date;
  statusHistory: OrderStatus[];
  createdAt: Date;
}

interface OrderTrackingProps {
  orderId: string;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderTracking({ orderId, onOrderUpdate }: OrderTrackingProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackingDetails, setTrackingDetails] = useState<Array<Record<string, unknown>>>([]);

  const loadOrderData = useCallback(async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockOrder: Order = {
        id: orderId,
        orderNumber: `ORD-${orderId.slice(-6).toUpperCase()}`,
        status: 'shipped',
        items: [
          {
            id: '1',
            productId: 'prod-1',
            name: 'Camiseta Premium',
            image: '/placeholder.jpg',
            quantity: 2,
            price: 35,
            size: 'M',
            color: 'Azul'
          },
          {
            id: '2',
            productId: 'prod-2',
            name: 'Pantalón Deportivo',
            image: '/placeholder.jpg',
            quantity: 1,
            price: 55,
            size: 'L',
            color: 'Negro'
          }
        ],
        total: 125,
        shippingAddress: {
          name: 'Juan Pérez',
          street: 'Calle Principal 123',
          city: 'Madrid',
          state: 'Madrid',
          zipCode: '28001',
          country: 'España',
          phone: '+34 600 123 456'
        },
        trackingNumber: 'TRK123456789',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        statusHistory: [
          {
            id: '1',
            status: 'pending',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            description: 'Pedido recibido',
            location: 'Centro de Procesamiento'
          },
          {
            id: '2',
            status: 'confirmed',
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            description: 'Pedido confirmado y en preparación',
            location: 'Almacén Central'
          },
          {
            id: '3',
            status: 'processing',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            description: 'Productos empaquetados',
            location: 'Almacén Central'
          },
          {
            id: '4',
            status: 'shipped',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            description: 'Paquete en tránsito',
            location: 'Centro de Distribución Madrid'
          }
        ],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      };

      setOrder(mockOrder);
      onOrderUpdate?.(mockOrder);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId, onOrderUpdate]);

  useEffect(() => {
    loadOrderData();
  }, [loadOrderData]);

  const getStatusIcon = (status: OrderStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-info" />;
      case 'processing':
        return <Package className="w-5 h-5 text-primary" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-primary" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'cancelled':
        return <CheckCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 muted" />;
    }
  };

  const getStatusBadge = (status: OrderStatus['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmado</Badge>;
      case 'processing':
        return <Badge variant="primary">Procesando</Badge>;
      case 'shipped':
        return <Badge variant="primary">Enviado</Badge>;
      case 'delivered':
        return <Badge variant="success">Entregado</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: OrderStatus['status']) => {
    switch (status) {
      case 'pending':
        return 'Pedido Recibido';
      case 'confirmed':
        return 'Confirmado';
      case 'processing':
        return 'Preparando';
      case 'shipped':
        return 'Enviado';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center p-8">
        <p className="muted">No se pudo cargar la información del pedido</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="surface border border-muted rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Pedido {order.orderNumber}</h1>
            <p className="muted">Realizado el {order.createdAt.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descargar Factura
            </Button>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="mt-4 p-4 surface border border-muted rounded">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-primary" />
              <span className="font-medium">Número de Seguimiento</span>
            </div>
            <p className="font-mono text-lg">{order.trackingNumber}</p>
            {order.estimatedDelivery && (
              <p className="text-sm muted mt-1">
                Entrega estimada: {order.estimatedDelivery.toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Order Progress */}
      <div className="surface border border-muted rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-6">Estado del Pedido</h2>
        
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 surface-secondary"></div>
          
          <div className="space-y-6">
            {order.statusHistory.map((status, index) => {
              const isCompleted = index < order.statusHistory.length;
              const isCurrent = index === order.statusHistory.length - 1;
              
              return (
                <div key={status.id} className="relative flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                    ${isCompleted 
                      ? 'bg-primary border-primary text-white' 
                      : 'surface border-muted'
                    }
                  `}>
                    {getStatusIcon(status.status)}
                  </div>
                  
                  {/* Status Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium">{getStatusLabel(status.status)}</h3>
                      {isCurrent && (
                        <Badge variant="primary" className="text-xs">Actual</Badge>
                      )}
                    </div>
                    <p className="text-sm muted mb-1">{status.description}</p>
                    <div className="flex items-center gap-4 text-xs muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {status.timestamp.toLocaleString()}
                      </span>
                      {status.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {status.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="surface border border-muted rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Productos</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 surface border border-muted rounded">
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <div className="text-sm muted">
                    {item.size && <span>Talla: {item.size}</span>}
                    {item.color && <span className="ml-2">Color: {item.color}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm">Cantidad: {item.quantity}</span>
                    <span className="font-medium">${item.price}</span>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="border-t border-muted pt-4">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="surface border border-muted rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Dirección de Envío</h2>
          <div className="space-y-3">
            <div>
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="muted">{order.shippingAddress.street}</p>
              <p className="muted">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p className="muted">{order.shippingAddress.country}</p>
            </div>
            
            <div className="pt-3 border-t border-muted">
              <div className="flex items-center gap-2 text-sm muted">
                <Phone className="w-4 h-4" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-6 pt-4 border-t border-muted">
            <h3 className="font-medium mb-2">¿Necesitas ayuda?</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Contactar Soporte
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="w-4 h-4 mr-2" />
                Llamar al +34 900 123 456
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order tracking list component
export function OrderTrackingList({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="surface border border-muted rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-medium">Pedido {order.orderNumber}</h3>
              <p className="text-sm muted">{order.createdAt.toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              {getStatusBadge(order.status)}
              <p className="text-sm font-medium mt-1">${order.total}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {order.items.slice(0, 3).map((item, index) => (
                <OptimizedImage
                  key={item.id}
                  src={item.image}
                  alt={item.name}
                  width={32}
                  height={32}
                  className="rounded border-2 border-white"
                />
              ))}
              {order.items.length > 3 && (
                <div className="w-8 h-8 rounded border-2 border-white surface flex items-center justify-center text-xs">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm">
                {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
              </p>
              {order.trackingNumber && (
                <p className="text-xs muted">Tracking: {order.trackingNumber}</p>
              )}
            </div>
            
            <Button variant="outline" size="sm">
              Ver Detalles
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  function getStatusBadge(status: OrderStatus['status']) {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pendiente</Badge>;
      case 'confirmed':
        return <Badge variant="info">Confirmado</Badge>;
      case 'processing':
        return <Badge variant="primary">Procesando</Badge>;
      case 'shipped':
        return <Badge variant="primary">Enviado</Badge>;
      case 'delivered':
        return <Badge variant="success">Entregado</Badge>;
      case 'cancelled':
        return <Badge variant="error">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }
}
