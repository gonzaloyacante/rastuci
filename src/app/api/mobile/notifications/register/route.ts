import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { logger } from "@/lib/logger";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

function errResponse<T = null>(
  message: string,
  status: number,
  data: T = null as T
): ReturnType<typeof NextResponse.json> {
  return NextResponse.json<ApiResponse<T>>(
    { success: false, message, data },
    { status }
  );
}

function okResponse<T>(
  message: string,
  data: T,
  status = 200
): ReturnType<typeof NextResponse.json> {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, message, data },
    { status }
  );
}

// GET - Obtener estado de registro
export async function GET(request: NextRequest) {
  try {
    // [C-02] Require authentication to check notification registration
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No autorizado", data: null },
        { status: 401 }
      );
    }

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
    logger.error("Error en notifications GET:", { error });
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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errResponse("No autorizado", 401);
    }

    const body = await request.json();
    const { token, platform } = body;

    if (!token || !platform) {
      return errResponse("Token y platform son requeridos", 400);
    }

    if (!["ios", "android", "web"].includes(platform)) {
      return errResponse("Platform debe ser ios, android o web", 400);
    }

    return errResponse<{ registered: boolean }>(
      "Servicio de push notifications no configurado actualmente",
      501,
      { registered: false }
    );
  } catch (error) {
    logger.error("Error en notifications POST:", { error });
    return errResponse("Error interno del servidor", 500);
  }
}

// PUT - Enviar notificacion push
export async function PUT(request: NextRequest) {
  try {
    // [H-06] SECURITY: Only admins can push notifications
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "No autorizado", data: null },
        { status: 401 }
      );
    }

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
    logger.error("Error en notifications PUT:", { error });
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

function isUnauthorizedEmailAccess(
  session: { user: { isAdmin?: boolean; email?: string | null } },
  customerEmail: string | null
): boolean {
  return (
    !session.user.isAdmin &&
    !!customerEmail &&
    customerEmail !== session.user.email
  );
}

// DELETE - Desregistrar token
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errResponse("No autorizado", 401);
    }

    const searchParams = request.nextUrl.searchParams;
    const customerEmail = searchParams.get("customerEmail");
    const deviceId = searchParams.get("deviceId");
    const token = searchParams.get("token");

    if (isUnauthorizedEmailAccess(session, customerEmail)) {
      return errResponse("No autorizado", 403);
    }

    const hasIdentifier = customerEmail || deviceId || token;
    if (!hasIdentifier) {
      return errResponse("customerEmail, deviceId o token requerido", 400);
    }

    return okResponse("Token desregistrado", { unregistered: true });
  } catch (error) {
    logger.error("Error en notifications DELETE:", { error });
    return errResponse("Error interno del servidor", 500);
  }
}
