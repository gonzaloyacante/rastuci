/**
 * Live Chat API
 *
 * API para chat en vivo. Las sesiones son temporales en memoria.
 * Para persistencia, se necesitaria crear tablas ChatSession y ChatMessage.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Esquemas de validacion
const LiveChatMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1).max(1000),
  sender: z.enum(["customer", "admin"]),
  senderName: z.string().min(1).max(100),
});

const LiveChatSessionSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerEmail: z.string().email(),
  initialMessage: z.string().min(1).max(500),
  department: z.string().optional(),
});

// Sesiones en memoria (temporal - se pierde al reiniciar)
const activeSessions = new Map<
  string,
  {
    id: string;
    customerName: string;
    customerEmail: string;
    status: "waiting" | "active" | "ended";
    department: string;
    startTime: string;
    lastActivity: string;
    assignedAgent: string | null;
    unreadCount: number;
  }
>();

const sessionMessages = new Map<
  string,
  Array<{
    id: string;
    content: string;
    sender: "customer" | "admin";
    senderName: string;
    timestamp: string;
    isRead: boolean;
  }>
>();

let sessionCounter = 1;
let messageCounter = 1;

// GET - Obtener mensajes de una sesion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const action = searchParams.get("action");

    if (action === "sessions") {
      return NextResponse.json({
        success: true,
        data: {
          sessions: Array.from(activeSessions.values()),
          totalActive: Array.from(activeSessions.values()).filter(
            (s) => s.status === "active"
          ).length,
        },
      });
    }

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID requerido" },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesion no encontrada" },
        { status: 404 }
      );
    }

    const messages = sessionMessages.get(sessionId) || [];

    return NextResponse.json({
      success: true,
      data: { session, messages, messageCount: messages.length },
    });
  } catch (error) {
    logger.error("Error in GET /api/live-chat:", { error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sesion o enviar mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "start-session": {
        const validated = LiveChatSessionSchema.parse(data);
        const newSession = {
          id: `CHAT-${String(sessionCounter++).padStart(3, "0")}`,
          customerName: validated.customerName,
          customerEmail: validated.customerEmail,
          status: "waiting" as const,
          department: validated.department || "general",
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          assignedAgent: null,
          unreadCount: 1,
        };

        const initialMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: validated.initialMessage,
          sender: "customer" as const,
          senderName: validated.customerName,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        activeSessions.set(newSession.id, newSession);
        sessionMessages.set(newSession.id, [initialMessage]);

        return NextResponse.json({
          success: true,
          data: newSession,
          message: "Sesion de chat iniciada",
        });
      }

      case "send-message": {
        const validated = LiveChatMessageSchema.parse(data);
        const session = activeSessions.get(validated.sessionId);

        if (!session) {
          return NextResponse.json(
            { success: false, error: "Sesion no encontrada" },
            { status: 404 }
          );
        }

        const newMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: validated.content,
          sender: validated.sender,
          senderName: validated.senderName,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        session.lastActivity = new Date().toISOString();
        if (validated.sender === "customer") {
          session.unreadCount = (session.unreadCount || 0) + 1;
        }

        const messages = sessionMessages.get(validated.sessionId) || [];
        messages.push(newMessage);
        sessionMessages.set(validated.sessionId, messages);
        activeSessions.set(validated.sessionId, session);

        return NextResponse.json({
          success: true,
          data: newMessage,
          message: "Mensaje enviado",
        });
      }

      case "assign-agent": {
        const { sessionId, agentName } = data;
        const session = activeSessions.get(sessionId);

        if (!session) {
          return NextResponse.json(
            { success: false, error: "Sesion no encontrada" },
            { status: 404 }
          );
        }

        session.assignedAgent = agentName;
        session.status = "active";
        session.lastActivity = new Date().toISOString();
        activeSessions.set(sessionId, session);

        return NextResponse.json({
          success: true,
          data: session,
          message: "Agente asignado exitosamente",
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Accion no valida" },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos invalidos", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("Error in POST /api/live-chat:", { error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de sesion
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, ...updates } = body;

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesion no encontrada" },
        { status: 404 }
      );
    }

    switch (action) {
      case "mark-read":
        session.unreadCount = 0;
        session.lastActivity = new Date().toISOString();
        activeSessions.set(sessionId, session);
        return NextResponse.json({
          success: true,
          message: "Mensajes marcados como leidos",
        });

      case "change-status":
        session.status = updates.status;
        session.lastActivity = new Date().toISOString();
        activeSessions.set(sessionId, session);
        return NextResponse.json({
          success: true,
          data: session,
          message: "Estado actualizado",
        });

      default:
        return NextResponse.json(
          { success: false, error: "Accion de actualizacion no valida" },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error("Error in PUT /api/live-chat:", { error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Finalizar sesion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID requerido" },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Sesion no encontrada" },
        { status: 404 }
      );
    }

    session.status = "ended";
    activeSessions.set(sessionId, session);

    // Limpiar despues de 1 hora
    setTimeout(() => {
      activeSessions.delete(sessionId);
      sessionMessages.delete(sessionId);
    }, 3600000);

    return NextResponse.json({ success: true, message: "Sesion finalizada" });
  } catch (error) {
    logger.error("Error in DELETE /api/live-chat:", { error });
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
