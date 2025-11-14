import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/adminAuth';

// Esquemas de validación para logística avanzada
const SupplierSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  address: z.string().min(10).max(200),
  category: z.string(),
  rating: z.number().min(1).max(5),
  isActive: z.boolean().default(true),
  paymentTerms: z.string(),
  leadTime: z.number().min(1).max(365) // días
});

const RouteOptimizationSchema = z.object({
  deliveryDate: z.string(),
  region: z.string(),
  orders: z.array(z.string()), // Array de order IDs
  vehicleType: z.enum(['moto', 'auto', 'camion']),
  priority: z.enum(['standard', 'express', 'urgent'])
});

const ReturnRequestSchema = z.object({
  orderId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    reason: z.enum(['defective', 'wrong_item', 'not_as_described', 'changed_mind', 'damaged'])
  })),
  customerReason: z.string().max(500),
  returnType: z.enum(['refund', 'exchange', 'store_credit']),
  customerEmail: z.string().email()
});

// Interfaces
interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  isActive: boolean;
  paymentTerms: string;
  leadTime: number;
  totalOrders: number;
  onTimeDelivery: number;
  createdAt: string;
  updatedAt: string;
}

interface RouteData {
  deliveryDate: string;
  region: string;
  vehicleType: string;
}

interface OptimizedRoute {
  id: string;
  date: string;
  region: string;
  vehicleType: string;
  driver: string;
  orders: Array<{
    orderId: string;
    customerName: string;
    address: string;
    priority: string;
    estimatedTime: string;
    status: string;
  }>;
  totalDistance: number;
  estimatedDuration: string;
  fuelCost: number;
  status: 'planned' | 'in_progress' | 'completed';
  createdAt: string;
}

interface ReturnRequest {
  id: string;
  orderId: string;
  customerEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed';
  returnType: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    reason: string;
    condition?: string;
  }>;
  customerReason: string;
  adminNotes?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

// Simulación de bases de datos
const suppliers = new Map<string, Supplier>();
const routes = new Map<string, OptimizedRoute>();
const returns = new Map<string, ReturnRequest>();

let supplierCounter = 1;
let routeCounter = 1;
let returnCounter = 1;

// GET - Obtener datos de logística
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    switch (type) {
      case 'suppliers':
        if (id) {
          const supplier = suppliers.get(id);
          if (!supplier) {
            return NextResponse.json({
              success: false,
              error: 'Proveedor no encontrado'
            }, { status: 404 });
          }
          return NextResponse.json({ success: true, data: supplier });
        }
        
        return NextResponse.json({
          success: true,
          data: {
            suppliers: Array.from(suppliers.values()),
            totalSuppliers: suppliers.size,
            activeSuppliers: Array.from(suppliers.values()).filter(s => s.isActive).length
          }
        });

      case 'routes':
        if (id) {
          const route = routes.get(id);
          if (!route) {
            return NextResponse.json({
              success: false,
              error: 'Ruta no encontrada'
            }, { status: 404 });
          }
          return NextResponse.json({ success: true, data: route });
        }

        const filterDate = searchParams.get('date');
        const filterRegion = searchParams.get('region');
        let filteredRoutes = Array.from(routes.values());

        if (filterDate) {
          filteredRoutes = filteredRoutes.filter(r => r.date === filterDate);
        }
        if (filterRegion) {
          filteredRoutes = filteredRoutes.filter(r => r.region === filterRegion);
        }

        return NextResponse.json({
          success: true,
          data: {
            routes: filteredRoutes,
            totalRoutes: routes.size,
            completedRoutes: Array.from(routes.values()).filter(r => r.status === 'completed').length
          }
        });

      case 'returns':
        if (id) {
          const returnReq = returns.get(id);
          if (!returnReq) {
            return NextResponse.json({
              success: false,
              error: 'Solicitud de devolución no encontrada'
            }, { status: 404 });
          }
          return NextResponse.json({ success: true, data: returnReq });
        }

        const statusFilter = searchParams.get('status');
        let filteredReturns = Array.from(returns.values());

        if (statusFilter) {
          filteredReturns = filteredReturns.filter(r => r.status === statusFilter);
        }

        return NextResponse.json({
          success: true,
          data: {
            returns: filteredReturns,
            totalReturns: returns.size,
            pendingReturns: Array.from(returns.values()).filter(r => r.status === 'pending').length
          }
        });

      case 'logistics-stats':
        const totalSuppliers = suppliers.size;
        const activeSuppliers = Array.from(suppliers.values()).filter(s => s.isActive).length;
        const averageRating = Array.from(suppliers.values())
          .reduce((sum, s) => sum + s.rating, 0) / totalSuppliers || 0;
        
        const totalRoutes = routes.size;
        const completedRoutes = Array.from(routes.values()).filter(r => r.status === 'completed').length;
        const avgDistance = Array.from(routes.values())
          .reduce((sum, r) => sum + r.totalDistance, 0) / totalRoutes || 0;
        
        const totalReturns = returns.size;
        const pendingReturns = Array.from(returns.values()).filter(r => r.status === 'pending').length;
        const returnRate = totalReturns > 0 ? (totalReturns / 1000) * 100 : 0; // Asumiendo 1000 órdenes

        return NextResponse.json({
          success: true,
          data: {
            suppliers: {
              total: totalSuppliers,
              active: activeSuppliers,
              averageRating: Math.round(averageRating * 100) / 100
            },
            routes: {
              total: totalRoutes,
              completed: completedRoutes,
              averageDistance: Math.round(avgDistance * 100) / 100,
              completionRate: totalRoutes > 0 ? (completedRoutes / totalRoutes) * 100 : 0
            },
            returns: {
              total: totalReturns,
              pending: pendingReturns,
              returnRate: Math.round(returnRate * 100) / 100
            }
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de consulta no válido'
        }, { status: 400 });
    }
  } catch (error) {
    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in GET /api/admin/logistics:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
});

// POST - Crear nuevos elementos de logística
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'supplier':
        const validatedSupplier = SupplierSchema.parse(data);
        const newSupplier: Supplier = {
          id: `SUPP-${String(supplierCounter++).padStart(3, '0')}`,
          ...validatedSupplier,
          totalOrders: 0,
          onTimeDelivery: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        suppliers.set(newSupplier.id, newSupplier);

        return NextResponse.json({
          success: true,
          data: newSupplier,
          message: 'Proveedor creado exitosamente'
        });

      case 'optimize-route':
        const validatedRoute = RouteOptimizationSchema.parse(data);
        
        // Simular optimización de ruta
        const optimizedRoute = await optimizeDeliveryRoute(validatedRoute);
        routes.set(optimizedRoute.id, optimizedRoute);

        return NextResponse.json({
          success: true,
          data: optimizedRoute,
          message: 'Ruta optimizada exitosamente'
        });

      case 'return-request':
        const validatedReturn = ReturnRequestSchema.parse(data);
        const newReturn: ReturnRequest = {
          id: `RET-${String(returnCounter++).padStart(3, '0')}`,
          orderId: validatedReturn.orderId,
          customerEmail: validatedReturn.customerEmail,
          status: 'pending',
          returnType: validatedReturn.returnType,
          items: validatedReturn.items.map(item => ({
            productId: item.productId,
            productName: `Producto ${item.productId}`, // En un sistema real, se obtendría de la DB
            quantity: item.quantity,
            reason: item.reason
          })),
          customerReason: validatedReturn.customerReason,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        returns.set(newReturn.id, newReturn);

        // Simular notificación automática
        setTimeout(() => {
          sendReturnNotification(newReturn.id);
        }, 2000);

        return NextResponse.json({
          success: true,
          data: newReturn,
          message: 'Solicitud de devolución creada exitosamente'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de creación no válido'
        }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Datos de entrada inválidos',
        details: error.errors
      }, { status: 400 });
    }

    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in POST /api/admin/logistics:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
});

// PUT - Actualizar elementos de logística
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;

    switch (type) {
      case 'supplier':
        const supplier = suppliers.get(id);
        if (!supplier) {
          return NextResponse.json({
            success: false,
            error: 'Proveedor no encontrado'
          }, { status: 404 });
        }

        const updatedSupplier = {
          ...supplier,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        suppliers.set(id, updatedSupplier);

        return NextResponse.json({
          success: true,
          data: updatedSupplier,
          message: 'Proveedor actualizado exitosamente'
        });

      case 'route-status':
        const route = routes.get(id);
        if (!route) {
          return NextResponse.json({
            success: false,
            error: 'Ruta no encontrada'
          }, { status: 404 });
        }

        route.status = updates.status;
        routes.set(id, route);

        return NextResponse.json({
          success: true,
          data: route,
          message: 'Estado de ruta actualizado'
        });

      case 'return-status':
        const returnReq = returns.get(id);
        if (!returnReq) {
          return NextResponse.json({
            success: false,
            error: 'Solicitud de devolución no encontrada'
          }, { status: 404 });
        }

        returnReq.status = updates.status;
        returnReq.updatedAt = new Date().toISOString();
        
        if (updates.adminNotes) {
          returnReq.adminNotes = updates.adminNotes;
        }
        
        if (updates.status === 'approved') {
          returnReq.approvedAt = new Date().toISOString();
          // Calcular monto de reembolso
          returnReq.refundAmount = calculateRefundAmount(returnReq);
        }
        
        if (updates.status === 'completed') {
          returnReq.completedAt = new Date().toISOString();
        }

        returns.set(id, returnReq);

        return NextResponse.json({
          success: true,
          data: returnReq,
          message: 'Estado de devolución actualizado'
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de actualización no válido'
        }, { status: 400 });
    }
  } catch (error) {
    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in PUT /api/admin/logistics:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
});

// DELETE - Eliminar elementos de logística
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID requerido'
      }, { status: 400 });
    }

    switch (type) {
      case 'supplier':
        if (suppliers.has(id)) {
          suppliers.delete(id);
          return NextResponse.json({
            success: true,
            message: 'Proveedor eliminado exitosamente'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Proveedor no encontrado'
          }, { status: 404 });
        }

      case 'route':
        if (routes.has(id)) {
          routes.delete(id);
          return NextResponse.json({
            success: true,
            message: 'Ruta eliminada exitosamente'
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Ruta no encontrada'
          }, { status: 404 });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Tipo de eliminación no válido'
        }, { status: 400 });
    }
  } catch (error) {
    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error in DELETE /api/admin/logistics:', error);
    }
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
});

// Funciones auxiliares
async function optimizeDeliveryRoute(routeData: RouteData): Promise<OptimizedRoute> {
  // Simulación de algoritmo de optimización de rutas
  const mockOrders = [
    {
      orderId: 'ORD-001',
      customerName: 'Juan Pérez',
      address: 'Av. Corrientes 1000, CABA',
      priority: 'standard',
      estimatedTime: '10:00 AM',
      status: 'pending'
    },
    {
      orderId: 'ORD-002',
      customerName: 'María García',
      address: 'Av. Santa Fe 2500, CABA',
      priority: 'express',
      estimatedTime: '11:30 AM',
      status: 'pending'
    },
    {
      orderId: 'ORD-003',
      customerName: 'Carlos López',
      address: 'Av. Cabildo 3000, CABA',
      priority: 'standard',
      estimatedTime: '2:00 PM',
      status: 'pending'
    }
  ];

  // Drivers disponibles simulados
  const drivers = ['Juan Carlos Ruta', 'María Fernández', 'Pedro González'];
  const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];

  return {
    id: `ROUTE-${String(routeCounter++).padStart(3, '0')}`,
    date: routeData.deliveryDate,
    region: routeData.region,
    vehicleType: routeData.vehicleType,
    driver: randomDriver,
    orders: mockOrders.sort((a, _b) => a.priority === 'express' ? -1 : 1),
    totalDistance: Math.round(Math.random() * 50 + 20), // 20-70 km
    estimatedDuration: '4h 30m',
    fuelCost: Math.round(Math.random() * 2000 + 1000), // $1000-$3000
    status: 'planned',
    createdAt: new Date().toISOString()
  };
}

function calculateRefundAmount(returnReq: ReturnRequest): number {
  // Simulación de cálculo de reembolso
  const baseAmount = returnReq.items.length * 5000; // $5000 por item base
  const serviceFee = returnReq.returnType === 'refund' ? 0.95 : 1.0; // 5% fee para reembolsos
  return Math.round(baseAmount * serviceFee);
}

async function sendReturnNotification(returnId: string): Promise<void> {
  const returnReq = returns.get(returnId);
  if (!returnReq) {
    return;
  }

  // Simulación de notificación automática - silently log for production
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`Notificación enviada: Solicitud de devolución ${returnId} recibida para ${returnReq.customerEmail}`);
  }
  
  // Auto-aprobar devoluciones simples (ejemplo de lógica automatizada)
  if (returnReq.items.length <= 2 && returnReq.returnType !== 'refund') {
    setTimeout(() => {
      returnReq.status = 'approved';
      returnReq.approvedAt = new Date().toISOString();
      returnReq.adminNotes = 'Auto-aprobada por cumplir criterios simples';
      returns.set(returnId, returnReq);
    }, 5000);
  }
}

// Inicializar datos de ejemplo
function initializeMockLogistics(): void {
  // Proveedores de ejemplo
  const exampleSuppliers: Supplier[] = [
    {
      id: `SUPP-${String(supplierCounter++).padStart(3, '0')}`,
      name: 'Distribuidora Central',
      email: 'ventas@distribuidoracentral.com',
      phone: '+54 11 4567-8900',
      address: 'Av. Rivadavia 5000, CABA',
      category: 'Electrónicos',
      rating: 4.8,
      isActive: true,
      paymentTerms: '30 días',
      leadTime: 7,
      totalOrders: 156,
      onTimeDelivery: 94,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: `SUPP-${String(supplierCounter++).padStart(3, '0')}`,
      name: 'Textiles Premium SA',
      email: 'contacto@textilespremium.com',
      phone: '+54 11 4567-8901',
      address: 'Av. Warnes 1500, CABA',
      category: 'Indumentaria',
      rating: 4.6,
      isActive: true,
      paymentTerms: '15 días',
      leadTime: 5,
      totalOrders: 89,
      onTimeDelivery: 96,
      createdAt: '2024-01-05T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    }
  ];

  exampleSuppliers.forEach(supplier => {
    suppliers.set(supplier.id, supplier);
  });

  // Devoluciones de ejemplo
  const exampleReturns: ReturnRequest[] = [
    {
      id: `RET-${String(returnCounter++).padStart(3, '0')}`,
      orderId: 'ORD-123',
      customerEmail: 'cliente@example.com',
      status: 'pending',
      returnType: 'refund',
      items: [
        {
          productId: 'PROD-001',
          productName: 'Smartphone XZ',
          quantity: 1,
          reason: 'defective'
        }
      ],
      customerReason: 'El producto llegó con la pantalla rota',
      createdAt: '2024-01-15T14:30:00Z',
      updatedAt: '2024-01-15T14:30:00Z'
    },
    {
      id: `RET-${String(returnCounter++).padStart(3, '0')}`,
      orderId: 'ORD-124',
      customerEmail: 'maria@example.com',
      status: 'approved',
      returnType: 'exchange',
      items: [
        {
          productId: 'PROD-002',
          productName: 'Remera Classic',
          quantity: 1,
          reason: 'wrong_item'
        }
      ],
      customerReason: 'Pedí talle M pero llegó talle S',
      adminNotes: 'Cambio aprobado, enviar talle correcto',
      refundAmount: 0,
      createdAt: '2024-01-14T16:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      approvedAt: '2024-01-15T09:15:00Z'
    }
  ];

  exampleReturns.forEach(returnReq => {
    returns.set(returnReq.id, returnReq);
  });
}

// Inicializar datos mock al cargar el módulo
initializeMockLogistics();