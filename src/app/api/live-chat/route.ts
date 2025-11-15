import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Interfaces
interface LiveChatMessage {
  id: string;
  content: string;
  sender: "customer" | "admin";
  senderName: string;
  timestamp: string;
  isRead: boolean;
}

// interface LiveChatSession {
//   id: string;
//   customerName: string;
//   customerEmail: string;
//   status: 'waiting' | 'active' | 'ended';
//   department?: string;
//   startTime: string;
//   lastActivity: string;
//   assignedAgent: string | null;
//   unreadCount: number;
//   lastMessage?: string;
//   endTime?: string;
// }

// Esquemas de validación para WebSocket/LiveChat
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

// Simulación de sesiones activas en memoria
const activeSessions = new Map();
const sessionMessages = new Map();

let sessionCounter = 1;
let messageCounter = 1;

// GET - Obtener mensajes de una sesión
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const action = searchParams.get("action");

    if (action === "sessions") {
      // Obtener todas las sesiones activas para admin
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
        {
          success: false,
          error: "Session ID requerido",
        },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión no encontrada",
        },
        { status: 404 }
      );
    }

    const messages = sessionMessages.get(sessionId) || [];

    return NextResponse.json({
      success: true,
      data: {
        session,
        messages,
        messageCount: messages.length,
      },
    });
  } catch (error) {
    // Error logging para debugging
    logger.error("Error in GET /api/live-chat:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sesión o enviar mensaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "start-session":
        const validatedSession = LiveChatSessionSchema.parse(data);
        const newSession = {
          id: `CHAT-${String(sessionCounter++).padStart(3, "0")}`,
          customerName: validatedSession.customerName,
          customerEmail: validatedSession.customerEmail,
          status: "waiting" as const,
          department: validatedSession.department || "general",
          startTime: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          assignedAgent: null,
          unreadCount: 1,
        };

        // Mensaje inicial del cliente
        const initialMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: validatedSession.initialMessage,
          sender: "customer" as const,
          senderName: validatedSession.customerName,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        activeSessions.set(newSession.id, newSession);
        sessionMessages.set(newSession.id, [initialMessage]);

        // Simular asignación automática de agente
        setTimeout(() => {
          assignAgentToSession(newSession.id);
        }, 3000);

        return NextResponse.json({
          success: true,
          data: newSession,
          message: "Sesión de chat iniciada",
        });

      case "send-message":
        const validatedMessage = LiveChatMessageSchema.parse(data);
        const session = activeSessions.get(validatedMessage.sessionId);

        if (!session) {
          return NextResponse.json(
            {
              success: false,
              error: "Sesión no encontrada",
            },
            { status: 404 }
          );
        }

        const newMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: validatedMessage.content,
          sender: validatedMessage.sender,
          senderName: validatedMessage.senderName,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        // Actualizar sesión
        session.lastActivity = new Date().toISOString();
        session.lastMessage = validatedMessage.content;

        if (validatedMessage.sender === "customer") {
          session.unreadCount = (session.unreadCount || 0) + 1;
        }

        // Agregar mensaje
        const messages = sessionMessages.get(validatedMessage.sessionId) || [];
        messages.push(newMessage);
        sessionMessages.set(validatedMessage.sessionId, messages);

        activeSessions.set(validatedMessage.sessionId, session);

        // Simular respuesta automática del bot si es necesario
        if (
          validatedMessage.sender === "customer" &&
          shouldTriggerBotResponse(validatedMessage.content)
        ) {
          setTimeout(() => {
            sendBotResponse(
              validatedMessage.sessionId,
              validatedMessage.content
            );
          }, 2000);
        }

        return NextResponse.json({
          success: true,
          data: newMessage,
          message: "Mensaje enviado",
        });

      case "assign-agent":
        const { sessionId, agentName } = data;
        const targetSession = activeSessions.get(sessionId);

        if (!targetSession) {
          return NextResponse.json(
            {
              success: false,
              error: "Sesión no encontrada",
            },
            { status: 404 }
          );
        }

        targetSession.assignedAgent = agentName;
        targetSession.status = "active";
        targetSession.lastActivity = new Date().toISOString();
        activeSessions.set(sessionId, targetSession);

        // Mensaje de bienvenida del agente
        const welcomeMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: `Hola ${targetSession.customerName}, soy ${agentName} y estaré ayudándote hoy. ¿En qué puedo asistirte?`,
          sender: "admin" as const,
          senderName: agentName,
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        const sessionMsgs = sessionMessages.get(sessionId) || [];
        sessionMsgs.push(welcomeMessage);
        sessionMessages.set(sessionId, sessionMsgs);

        return NextResponse.json({
          success: true,
          data: targetSession,
          message: "Agente asignado exitosamente",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Acción no válida",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de entrada inválidos",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    // Error logging para debugging
    logger.error("Error in POST /api/live-chat:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar estado de sesión
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, action, ...updates } = body;

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión no encontrada",
        },
        { status: 404 }
      );
    }

    switch (action) {
      case "mark-read":
        session.unreadCount = 0;
        session.lastActivity = new Date().toISOString();
        activeSessions.set(sessionId, session);

        // Marcar mensajes como leídos
        const messages = sessionMessages.get(sessionId) || [];
        const updatedMessages = messages.map((msg: LiveChatMessage) => ({
          ...msg,
          isRead: true,
        }));
        sessionMessages.set(sessionId, updatedMessages);

        return NextResponse.json({
          success: true,
          message: "Mensajes marcados como leídos",
        });

      case "change-status":
        session.status = updates.status;
        session.lastActivity = new Date().toISOString();

        if (updates.status === "ended") {
          session.endTime = new Date().toISOString();
        }

        activeSessions.set(sessionId, session);

        return NextResponse.json({
          success: true,
          data: session,
          message: "Estado de sesión actualizado",
        });

      case "transfer":
        session.assignedAgent = updates.newAgent;
        session.lastActivity = new Date().toISOString();
        activeSessions.set(sessionId, session);

        // Mensaje de transferencia
        const transferMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: `El chat ha sido transferido a ${updates.newAgent}`,
          sender: "admin" as const,
          senderName: "Sistema",
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        const msgs = sessionMessages.get(sessionId) || [];
        msgs.push(transferMessage);
        sessionMessages.set(sessionId, msgs);

        return NextResponse.json({
          success: true,
          data: session,
          message: "Chat transferido exitosamente",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Acción de actualización no válida",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Error logging para debugging
    logger.error("Error in PUT /api/live-chat:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// DELETE - Finalizar sesión
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID requerido",
        },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesión no encontrada",
        },
        { status: 404 }
      );
    }

    // Finalizar sesión
    session.status = "ended";
    session.endTime = new Date().toISOString();
    activeSessions.set(sessionId, session);

    // Limpiar después de 1 hora
    setTimeout(() => {
      activeSessions.delete(sessionId);
      sessionMessages.delete(sessionId);
    }, 3600000); // 1 hora

    return NextResponse.json({
      success: true,
      message: "Sesión finalizada",
    });
  } catch (error) {
    // Error logging para debugging
    logger.error("Error in DELETE /api/live-chat:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// Funciones auxiliares
function shouldTriggerBotResponse(message: string): boolean {
  const botTriggers = [
    "hola",
    "ayuda",
    "precio",
    "envío",
    "horario",
    "contacto",
    "producto",
    "stock",
    "disponible",
    "comprar",
    "pago",
  ];

  const lowerMessage = message.toLowerCase();
  return botTriggers.some((trigger) => lowerMessage.includes(trigger));
}

async function sendBotResponse(
  sessionId: string,
  customerMessage: string
): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return;
  }

  const botResponses = {
    hola: "¡Hola! Soy el asistente automático de Rastuci. En un momento te conectamos con un agente humano.",
    precio:
      "Puedes consultar precios en nuestro catálogo online. Un agente te ayudará con información específica.",
    envío:
      "Realizamos envíos a todo el país. Los costos varían según la ubicación. Te conectamos con soporte.",
    horario:
      "Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 hs.",
    stock:
      "Para consultar stock de productos específicos, un agente te brindará información actualizada.",
    pago: "Aceptamos múltiples métodos de pago: tarjetas, transferencias y MercadoPago.",
  };

  const lowerMessage = customerMessage.toLowerCase();
  let response =
    "Gracias por tu consulta. Un agente te atenderá en breve para brindarte la mejor asistencia.";

  for (const [keyword, botResponse] of Object.entries(botResponses)) {
    if (lowerMessage.includes(keyword)) {
      response = botResponse;
      break;
    }
  }

  const botMessage = {
    id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
    content: response,
    sender: "admin" as const,
    senderName: "Asistente Virtual",
    timestamp: new Date().toISOString(),
    isRead: false,
  };

  const messages = sessionMessages.get(sessionId) || [];
  messages.push(botMessage);
  sessionMessages.set(sessionId, messages);
}

async function assignAgentToSession(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return;
  }

  const availableAgents = [
    "Soporte Técnico",
    "Atención al Cliente",
    "Ventas Online",
    "Especialista Productos",
  ];

  const assignedAgent =
    availableAgents[Math.floor(Math.random() * availableAgents.length)];

  session.assignedAgent = assignedAgent;
  session.status = "active";
  session.lastActivity = new Date().toISOString();
  activeSessions.set(sessionId, session);
}
