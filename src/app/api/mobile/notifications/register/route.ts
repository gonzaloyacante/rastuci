import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface NotificationRegistration {
  token: string;
  platform: 'ios' | 'android' | 'web';
  customerEmail?: string;
  deviceId?: string;
  enabled: boolean;
}

interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
  priority?: 'high' | 'normal';
  sound?: string;
  badge?: number;
}

// Mock storage para push notification tokens
// En producción esto debería estar en base de datos
const notificationTokens = new Map<string, NotificationRegistration>();

// POST /api/mobile/notifications/register - Registrar token para push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, platform, customerEmail, deviceId } = body;
    
    if (!token || !platform) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Token y platform son requeridos",
        data: null
      }, { status: 400 });
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Platform debe ser ios, android o web",
        data: null
      }, { status: 400 });
    }

    // Registrar o actualizar token
    const registration: NotificationRegistration = {
      token,
      platform: platform as 'ios' | 'android' | 'web',
      customerEmail: customerEmail || undefined,
      deviceId: deviceId || undefined,
      enabled: true,
    };

    // Usar email o deviceId como key, fallback a token
    const key = customerEmail || deviceId || token;
    notificationTokens.set(key, registration);

    return NextResponse.json<ApiResponse<{ registered: boolean }>>({
      success: true,
      message: "Token registrado exitosamente",
      data: { registered: true }
    });

  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

// DELETE /api/mobile/notifications/register - Desregistrar token
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get('customerEmail');
    const deviceId = searchParams.get('deviceId');
    const token = searchParams.get('token');
    
    if (!customerEmail && !deviceId && !token) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "customerEmail, deviceId o token requerido",
        data: null
      }, { status: 400 });
    }

    // Buscar y eliminar token
    const key = customerEmail || deviceId || token;
    const deleted = notificationTokens.delete(key!);

    return NextResponse.json<ApiResponse<{ unregistered: boolean }>>({
      success: true,
      message: deleted ? "Token desregistrado exitosamente" : "Token no encontrado",
      data: { unregistered: deleted }
    });

  } catch {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: "Error interno del servidor",
      data: null
    }, { status: 500 });
  }
}

// POST /api/mobile/notifications/send - Enviar notificación push (uso interno)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerEmail, 
      deviceId, 
      title, 
      message, 
      data, 
      priority = 'high' 
    } = body;
    
    if ((!customerEmail && !deviceId) || !title || !message) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "customerEmail/deviceId, title y message son requeridos",
        data: null
      }, { status: 400 });
    }

    // Buscar tokens para el usuario
    const key = customerEmail || deviceId;
    const registration = notificationTokens.get(key);

    if (!registration || !registration.enabled) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "Token no registrado o deshabilitado",
        data: null
      }, { status: 404 });
    }

    // Simular envío de push notification
    const notificationPayload: PushNotificationData = {
      title,
      body: message,
      data: data || {},
      priority,
      sound: 'default',
      badge: 1,
    };

    // Aquí iría la integración real con el servicio de push notifications
    // Por ejemplo: Firebase Cloud Messaging, OneSignal, etc.
    const mockSendResult = await simulatePushNotificationSend(
      registration.token,
      registration.platform,
      notificationPayload
    );

    return NextResponse.json<ApiResponse<{
      sent: boolean;
      platform: string;
      messageId?: string;
    }>>({
      success: true,
      message: mockSendResult.success ? "Notificación enviada exitosamente" : "Error enviando notificación",
      data: {
        sent: mockSendResult.success,
        platform: registration.platform,
        messageId: mockSendResult.messageId,
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

// GET /api/mobile/notifications/register - Obtener estado de registro
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get('customerEmail');
    const deviceId = searchParams.get('deviceId');
    
    if (!customerEmail && !deviceId) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: "customerEmail o deviceId requerido",
        data: null
      }, { status: 400 });
    }

    const key = customerEmail || deviceId;
    const registration = notificationTokens.get(key!);

    return NextResponse.json<ApiResponse<{
      registered: boolean;
      platform?: string;
      enabled?: boolean;
    }>>({
      success: true,
      message: "Estado de registro obtenido",
      data: {
        registered: !!registration,
        platform: registration?.platform,
        enabled: registration?.enabled,
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

// Simulación de envío de push notification
async function simulatePushNotificationSend(
  _token: string,
  platform: string,
  _payload: PushNotificationData
): Promise<{ success: boolean; messageId?: string }> {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simular éxito/fallo basado en platform
  const success = Math.random() > 0.1; // 90% success rate
  
  return {
    success,
    messageId: success ? `msg_${Date.now()}_${platform}` : undefined,
  };
}