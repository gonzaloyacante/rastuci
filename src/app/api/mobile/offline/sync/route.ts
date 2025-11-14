import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface OfflineData {
  orders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
    trackingCode?: string;
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        price: number;
        image?: string;
      };
    }>;
  }>;
  trackingCodes: Array<{
    code: string;
    orderId: string;
    lastKnownStatus: string;
    lastUpdate: string;
  }>;
  cachedAt: string;
  expiresAt: string;
}

// Mock storage para datos offline
// En producción esto debería estar en una base de datos más eficiente
const offlineDataCache = new Map<string, OfflineData>();

// GET /api/mobile/offline/sync - Sincronizar datos para modo offline
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get('customerEmail');
    const lastSync = searchParams.get('lastSync');
    
    if (!customerEmail) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Email del cliente requerido",
        data: null
      }, { status: 400 });
    }

    // Verificar si hay datos cacheados válidos
    const cachedData = offlineDataCache.get(customerEmail);
    const now = new Date();
    
    if (cachedData && new Date(cachedData.expiresAt) > now) {
      // Si es sincronización incremental, verificar timestamp
      if (lastSync && new Date(lastSync) >= new Date(cachedData.cachedAt)) {
        return NextResponse.json<ApiResponse<{ hasUpdates: boolean }>>({
          success: true,
          message: "No hay actualizaciones disponibles",
          data: { hasUpdates: false }
        });
      }

      return NextResponse.json<ApiResponse<OfflineData>>({
        success: true,
        message: "Datos offline obtenidos desde caché",
        data: cachedData
      });
    }

    // Generar nuevos datos offline
    const offlineData = await generateOfflineData(customerEmail);
    
    // Guardar en caché por 1 hora
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
    const cachedOfflineData: OfflineData = {
      ...offlineData,
      cachedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    offlineDataCache.set(customerEmail, cachedOfflineData);

    return NextResponse.json<ApiResponse<OfflineData>>({
      success: true,
      message: "Datos offline generados exitosamente",
      data: cachedOfflineData
    });

  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

// POST /api/mobile/offline/sync - Enviar datos offline al servidor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerEmail, 
      pendingActions, 
      trackingUpdates 
    } = body;
    
    if (!customerEmail) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Email del cliente requerido",
        data: null
      }, { status: 400 });
    }

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Procesar acciones pendientes (favoritos, carrito, etc.)
    if (pendingActions && Array.isArray(pendingActions)) {
      for (const action of pendingActions) {
        try {
          await processPendingAction(action, customerEmail);
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error procesando acción ${action.type}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }

    // Procesar actualizaciones de tracking solicitadas
    if (trackingUpdates && Array.isArray(trackingUpdates)) {
      for (const trackingCode of trackingUpdates) {
        try {
          await requestTrackingUpdate(trackingCode);
          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Error actualizando tracking ${trackingCode}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }
    }

    // Invalidar caché para forzar refresh en próxima sync
    offlineDataCache.delete(customerEmail);

    return NextResponse.json<ApiResponse<{
      processed: number;
      failed: number;
      errors: string[];
    }>>({
      success: true,
      message: `Sincronización completada: ${results.processed} procesadas, ${results.failed} fallidas`,
      data: results
    });

  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

interface PendingAction {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// Generar datos para modo offline
async function generateOfflineData(_customerEmail: string): Promise<Omit<OfflineData, 'cachedAt' | 'expiresAt'>> {
  // Simular obtención de datos del usuario
  // En implementación real, esto consultaría la base de datos
  const mockOrders = [
    {
      id: 'order-1',
      status: 'PENDING',
      total: 150.00,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      trackingCode: 'TRK-123456',
      items: [
        {
          id: 'item-1',
          quantity: 2,
          product: {
            id: 'prod-1',
            name: 'Producto A',
            price: 75.00,
            image: '/images/product-a.jpg',
          },
        },
      ],
    },
    {
      id: 'order-2',
      status: 'DELIVERED',
      total: 89.99,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      trackingCode: 'TRK-789012',
      items: [
        {
          id: 'item-2',
          quantity: 1,
          product: {
            id: 'prod-2',
            name: 'Producto B',
            price: 89.99,
            image: '/images/product-b.jpg',
          },
        },
      ],
    },
  ];

  const mockTrackingCodes = [
    {
      code: 'TRK-123456',
      orderId: 'order-1',
      lastKnownStatus: 'in-transit',
      lastUpdate: new Date().toISOString(),
    },
    {
      code: 'TRK-789012',
      orderId: 'order-2',
      lastKnownStatus: 'delivered',
      lastUpdate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    orders: mockOrders,
    trackingCodes: mockTrackingCodes,
  };
}

// Procesar acción pendiente del modo offline
async function processPendingAction(action: PendingAction, _customerEmail: string): Promise<void> {
  // Simular procesamiento de acción
  // En implementación real, esto actualizaría la base de datos
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Validar tipo de acción
  const validActions = ['add_to_favorites', 'remove_from_favorites', 'update_cart', 'track_view'];
  if (!validActions.includes(action.type)) {
    throw new Error(`Tipo de acción no válido: ${action.type}`);
  }

  // Aquí iría la lógica específica para cada tipo de acción
  switch (action.type) {
    case 'add_to_favorites':
      // Agregar producto a favoritos
      break;
    case 'remove_from_favorites':
      // Remover producto de favoritos
      break;
    case 'update_cart':
      // Actualizar carrito de compras
      break;
    case 'track_view':
      // Registrar visualización de producto
      break;
  }
}

// Solicitar actualización de tracking
async function requestTrackingUpdate(_trackingCode: string): Promise<void> {
  // Simular solicitud de actualización de tracking
  // En implementación real, esto haría llamada a la API de OCA
  await new Promise(resolve => setTimeout(resolve, 200));
}