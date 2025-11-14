import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface MobileAppConfig {
  version: string;
  minimumVersion: string;
  features: {
    pushNotifications: boolean;
    offlineMode: boolean;
    tracking: boolean;
    biometrics: boolean;
    cameraSearch: boolean;
  };
  endpoints: {
    orders: string;
    tracking: string;
    notifications: string;
    products: string;
    auth: string;
  };
  tracking: {
    refreshInterval: number; // en segundos
    retryAttempts: number;
    offlineStorage: boolean;
  };
  notifications: {
    enabled: boolean;
    types: string[];
    sounds: string[];
  };
}

// GET /api/mobile/config - Obtener configuración para app móvil
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const appVersion = searchParams.get('version');
    const platform = searchParams.get('platform'); // 'ios' | 'android'

    // Configuración base para la app móvil
    const config: MobileAppConfig = {
      version: '1.0.0',
      minimumVersion: '1.0.0',
      features: {
        pushNotifications: true,
        offlineMode: true,
        tracking: true,
        biometrics: false, // Deshabilitado por ahora
        cameraSearch: false, // Funcionalidad futura
      },
      endpoints: {
        orders: '/api/mobile/orders',
        tracking: '/api/mobile/tracking',
        notifications: '/api/mobile/notifications',
        products: '/api/products',
        auth: '/api/auth',
      },
      tracking: {
        refreshInterval: 300, // 5 minutos
        retryAttempts: 3,
        offlineStorage: true,
      },
      notifications: {
        enabled: true,
        types: [
          'order_created',
          'tracking_update',
          'delivery_update',
          'promotion',
          'system'
        ],
        sounds: ['default', 'notification', 'alert'],
      },
    };

    // Ajustes específicos por platform
    if (platform === 'ios') {
      config.features.biometrics = true; // Face ID / Touch ID
      config.notifications.sounds.push('ios_default');
    } else if (platform === 'android') {
      config.features.biometrics = true; // Fingerprint
      config.notifications.sounds.push('android_default');
    }

    // Verificar si hay actualizaciones disponibles
    const isUpdateRequired = appVersion && isVersionOutdated(appVersion, config.minimumVersion);
    const isUpdateAvailable = appVersion && isVersionOutdated(appVersion, config.version);

    // Obtener estadísticas adicionales para la app
    const stats = await getMobileAppStats();

    return NextResponse.json<ApiResponse<{
      config: MobileAppConfig;
      updateInfo: {
        required: boolean;
        available: boolean;
        currentVersion: string;
        latestVersion: string;
      };
      stats: typeof stats;
    }>>({
      success: true,
      message: "Configuración obtenida exitosamente",
      data: {
        config,
        updateInfo: {
          required: isUpdateRequired || false,
          available: isUpdateAvailable || false,
          currentVersion: appVersion || '1.0.0',
          latestVersion: config.version,
        },
        stats,
      }
    });

  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

// Función helper para verificar versiones
function isVersionOutdated(currentVersion: string, requiredVersion: string): boolean {
  const current = parseVersion(currentVersion);
  const required = parseVersion(requiredVersion);

  for (let i = 0; i < 3; i++) {
    if (current[i] < required[i]) {
      return true;
    }
    if (current[i] > required[i]) {
      return false;
    }
  }
  
  return false;
}

function parseVersion(version: string): number[] {
  return version.split('.').map(v => parseInt(v, 10) || 0);
}

// Obtener estadísticas para la app móvil
async function getMobileAppStats() {
  try {
    const [
      totalOrders,
      pendingOrders,
      deliveredOrders,
      activeTracking
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'PROCESSED']
          }
        }
      }),
      prisma.order.count({
        where: {
          status: 'DELIVERED'
        }
      }),
      prisma.order.count({
        where: {
          ocaTrackingNumber: {
            not: null
          },
          status: {
            not: 'DELIVERED'
          }
        }
      })
    ]);

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        activeTracking,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return {
      orders: {
        total: 0,
        pending: 0,
        delivered: 0,
        activeTracking: 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}