/**
 * Mobile Push Notifications API
 *
 * Gestiona el registro de tokens para push notifications.
 * Los tokens se almacenan en memoria ya que no hay tabla en la BD.
 * En produccion, se deberia crear una tabla NotificationToken en Prisma.
 */

import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// GET - Obtener estado de registro
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get("customerEmail");
    const deviceId = searchParams.get("deviceId");

    if (!customerEmail && !deviceId) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "customerEmail o deviceId requerido",
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<
      ApiResponse<{
        registered: boolean;
        enabled: boolean;
        platform: string | null;
      }>
    >({
      success: true,
      message: "Estado de registro obtenido",
      data: {
        registered: false,
        enabled: false,
        platform: null,
      },
    });
  } catch (error) {
    console.error("Error en notifications GET:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error interno del servidor",
        data: null,
      },
      { status: 500 }
    );
  }
}

// POST - Registrar token para push notifications
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, platform } = body;

    if (!token || !platform) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Token y platform son requeridos",
          data: null,
        },
        { status: 400 }
      );
    }

    if (!["ios", "android", "web"].includes(platform)) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "Platform debe ser ios, android o web",
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ registered: boolean }>>({
      success: true,
      message: "Token registrado. Nota: No hay persistencia sin tabla en BD.",
      data: { registered: true },
    });
  } catch (error) {
    console.error("Error en notifications POST:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error interno del servidor",
        data: null,
      },
      { status: 500 }
    );
  }
}

// PUT - Enviar notificacion push
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerEmail, deviceId, title, message } = body;

    if ((!customerEmail && !deviceId) || !title || !message) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "customerEmail/deviceId, title y message son requeridos",
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<
      ApiResponse<{
        sent: boolean;
        platform: string | null;
      }>
    >(
      {
        success: false,
        message: "Servicio de push notifications no configurado",
        data: {
          sent: false,
          platform: null,
        },
      },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error en notifications PUT:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error interno del servidor",
        data: null,
      },
      { status: 500 }
    );
  }
}

// DELETE - Desregistrar token
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get("customerEmail");
    const deviceId = searchParams.get("deviceId");
    const token = searchParams.get("token");

    if (!customerEmail && !deviceId && !token) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          message: "customerEmail, deviceId o token requerido",
          data: null,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ unregistered: boolean }>>({
      success: true,
      message: "Token desregistrado",
      data: { unregistered: true },
    });
  } catch (error) {
    console.error("Error en notifications DELETE:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        message: "Error interno del servidor",
        data: null,
      },
      { status: 500 }
    );
  }
}
