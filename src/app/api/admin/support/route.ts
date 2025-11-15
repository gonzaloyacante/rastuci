import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAdminAuth } from "@/lib/adminAuth";
import { logger } from "@/lib/logger";

// Esquemas de validación
const SupportTicketSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  category: z.string().min(2).max(50),
  priority: z.enum(["baja", "media", "alta", "urgente"]),
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(100),
});

const TicketMessageSchema = z.object({
  ticketId: z.string(),
  content: z.string().min(1).max(2000),
  isInternal: z.boolean().optional(),
});

const ChatMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string().min(1).max(500),
});

const FAQSchema = z.object({
  question: z.string().min(10).max(200),
  answer: z.string().min(20).max(2000),
  category: z.string().min(2).max(50),
});

// Simulación de base de datos en memoria
const mockTickets = new Map();
const mockChatSessions = new Map();
const mockFAQs = new Map();

// Inicializar datos de prueba
let ticketCounter = 1;
let messageCounter = 1;
let faqCounter = 1;

// GET - Obtener datos de soporte
export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "tickets":
        return NextResponse.json({
          success: true,
          data: {
            tickets: Array.from(mockTickets.values()),
            total: mockTickets.size,
          },
        });

      case "chat":
        return NextResponse.json({
          success: true,
          data: {
            sessions: Array.from(mockChatSessions.values()),
            activeSessions: Array.from(mockChatSessions.values()).filter(
              (s) => s.status === "active"
            ).length,
          },
        });

      case "faq":
        return NextResponse.json({
          success: true,
          data: {
            faqs: Array.from(mockFAQs.values()),
            activeFaqs: Array.from(mockFAQs.values()).filter((f) => f.isActive)
              .length,
          },
        });

      case "stats":
        const totalTickets = mockTickets.size;
        const openTickets = Array.from(mockTickets.values()).filter(
          (t) => t.status === "abierto"
        ).length;
        const activeChatSessions = Array.from(mockChatSessions.values()).filter(
          (s) => s.status === "active"
        ).length;
        const totalFAQs = mockFAQs.size;

        return NextResponse.json({
          success: true,
          data: {
            tickets: {
              total: totalTickets,
              open: openTickets,
              resolved: Array.from(mockTickets.values()).filter(
                (t) => t.status === "resuelto"
              ).length,
              inProgress: Array.from(mockTickets.values()).filter(
                (t) => t.status === "en_progreso"
              ).length,
            },
            chat: {
              activeSessions: activeChatSessions,
              totalSessions: mockChatSessions.size,
              averageResponseTime: "2.5 min",
            },
            faq: {
              total: totalFAQs,
              active: Array.from(mockFAQs.values()).filter((f) => f.isActive)
                .length,
              totalViews: Array.from(mockFAQs.values()).reduce(
                (sum, faq) => sum + faq.viewCount,
                0
              ),
            },
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Tipo de consulta no válido",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      logger.error("Error in GET /api/admin/support:", { error: error });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
});

// POST - Crear nuevo ticket, mensaje o FAQ
export const POST = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case "ticket":
        const validatedTicket = SupportTicketSchema.parse(data);
        const newTicket = {
          id: `TICK-${String(ticketCounter++).padStart(3, "0")}`,
          ...validatedTicket,
          status: "abierto" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          assignedTo: null,
          messages: [
            {
              id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
              content: validatedTicket.description,
              sender: "customer" as const,
              senderName: validatedTicket.customerName,
              timestamp: new Date().toISOString(),
              isInternal: false,
            },
          ],
        };

        mockTickets.set(newTicket.id, newTicket);

        // Simular notificación automática
        setTimeout(async () => {
          await simulateAutoResponse(newTicket.id);
        }, 5000);

        return NextResponse.json({
          success: true,
          data: newTicket,
          message: "Ticket creado exitosamente",
        });

      case "message":
        const validatedMessage = TicketMessageSchema.parse(data);
        const ticket = mockTickets.get(validatedMessage.ticketId);

        if (!ticket) {
          return NextResponse.json(
            {
              success: false,
              error: "Ticket no encontrado",
            },
            { status: 404 }
          );
        }

        const newMessage = {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: validatedMessage.content,
          sender: "admin" as const,
          senderName: "Soporte Rastuci",
          timestamp: new Date().toISOString(),
          isInternal: validatedMessage.isInternal || false,
        };

        ticket.messages.push(newMessage);
        ticket.updatedAt = new Date().toISOString();
        mockTickets.set(ticket.id, ticket);

        return NextResponse.json({
          success: true,
          data: newMessage,
          message: "Mensaje enviado exitosamente",
        });

      case "faq":
        const validatedFAQ = FAQSchema.parse(data);
        const newFAQ = {
          id: `FAQ-${String(faqCounter++).padStart(3, "0")}`,
          ...validatedFAQ,
          isActive: true,
          viewCount: 0,
          helpfulVotes: 0,
          notHelpfulVotes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockFAQs.set(newFAQ.id, newFAQ);

        return NextResponse.json({
          success: true,
          data: newFAQ,
          message: "FAQ creada exitosamente",
        });

      case "chat-message":
        const validatedChatMessage = ChatMessageSchema.parse(data);
        const session = mockChatSessions.get(validatedChatMessage.sessionId);

        if (!session) {
          return NextResponse.json(
            {
              success: false,
              error: "Sesión de chat no encontrada",
            },
            { status: 404 }
          );
        }

        session.lastMessage = validatedChatMessage.content;
        session.updatedAt = new Date().toISOString();
        mockChatSessions.set(session.id, session);

        return NextResponse.json({
          success: true,
          message: "Mensaje de chat enviado exitosamente",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Tipo de operación no válido",
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

    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      logger.error("Error in POST /api/admin/support:", { error: error });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
});

// PUT - Actualizar ticket, sesión de chat o FAQ
export const PUT = withAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { type, id, ...updates } = body;

    switch (type) {
      case "ticket-status":
        const ticket = mockTickets.get(id);
        if (!ticket) {
          return NextResponse.json(
            {
              success: false,
              error: "Ticket no encontrado",
            },
            { status: 404 }
          );
        }

        ticket.status = updates.status;
        ticket.updatedAt = new Date().toISOString();

        if (updates.assignedTo) {
          ticket.assignedTo = updates.assignedTo;
        }

        mockTickets.set(id, ticket);

        return NextResponse.json({
          success: true,
          data: ticket,
          message: "Estado del ticket actualizado",
        });

      case "chat-status":
        const session = mockChatSessions.get(id);
        if (!session) {
          return NextResponse.json(
            {
              success: false,
              error: "Sesión de chat no encontrada",
            },
            { status: 404 }
          );
        }

        session.status = updates.status;
        session.updatedAt = new Date().toISOString();
        mockChatSessions.set(id, session);

        return NextResponse.json({
          success: true,
          data: session,
          message: "Estado del chat actualizado",
        });

      case "faq-status":
        const faq = mockFAQs.get(id);
        if (!faq) {
          return NextResponse.json(
            {
              success: false,
              error: "FAQ no encontrada",
            },
            { status: 404 }
          );
        }

        faq.isActive = updates.isActive;
        faq.updatedAt = new Date().toISOString();
        mockFAQs.set(id, faq);

        return NextResponse.json({
          success: true,
          data: faq,
          message: "Estado de FAQ actualizado",
        });

      case "faq-vote":
        const voteFaq = mockFAQs.get(id);
        if (!voteFaq) {
          return NextResponse.json(
            {
              success: false,
              error: "FAQ no encontrada",
            },
            { status: 404 }
          );
        }

        if (updates.helpful) {
          voteFaq.helpfulVotes++;
        } else {
          voteFaq.notHelpfulVotes++;
        }

        mockFAQs.set(id, voteFaq);

        return NextResponse.json({
          success: true,
          data: voteFaq,
          message: "Voto registrado",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Tipo de actualización no válido",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      logger.error("Error in POST /api/admin/support:", { error: error });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
});

// DELETE - Eliminar ticket, sesión o FAQ
export const DELETE = withAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID requerido",
        },
        { status: 400 }
      );
    }

    switch (type) {
      case "ticket":
        if (mockTickets.has(id)) {
          mockTickets.delete(id);
          return NextResponse.json({
            success: true,
            message: "Ticket eliminado exitosamente",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "Ticket no encontrado",
            },
            { status: 404 }
          );
        }

      case "faq":
        if (mockFAQs.has(id)) {
          mockFAQs.delete(id);
          return NextResponse.json({
            success: true,
            message: "FAQ eliminada exitosamente",
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: "FAQ no encontrada",
            },
            { status: 404 }
          );
        }

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Tipo de eliminación no válido",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    // Error logging para debugging - silently log for production
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      logger.error("Error in PUT /api/admin/support:", { error: error });
    }
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
});

// Función auxiliar para simular respuestas automáticas
async function simulateAutoResponse(ticketId: string): Promise<void> {
  const ticket = mockTickets.get(ticketId);
  if (!ticket || ticket.status !== "abierto") {
    return;
  }

  const autoResponses = [
    "Gracias por contactarnos. Hemos recibido tu consulta y la estamos revisando.",
    "Estimado cliente, estamos trabajando en resolver tu solicitud. Te contactaremos pronto.",
    "Tu ticket ha sido asignado a nuestro equipo de soporte especializado.",
    "Hemos iniciado la investigación de tu caso. Te mantendremos informado del progreso.",
  ];

  const randomResponse =
    autoResponses[Math.floor(Math.random() * autoResponses.length)];

  const autoMessage = {
    id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
    content: randomResponse,
    sender: "admin" as const,
    senderName: "Sistema Automático",
    timestamp: new Date().toISOString(),
    isInternal: false,
  };

  ticket.messages.push(autoMessage);
  ticket.status = "en_progreso";
  ticket.updatedAt = new Date().toISOString();
  mockTickets.set(ticketId, ticket);
}

// Inicializar datos de ejemplo
function initializeMockData() {
  // Tickets de ejemplo
  const exampleTickets = [
    {
      id: `TICK-${String(ticketCounter++).padStart(3, "0")}`,
      title: "Problema con el pago de mi pedido",
      description: "No se pudo procesar mi pago con tarjeta de crédito",
      status: "abierto" as const,
      priority: "alta" as const,
      customerEmail: "cliente1@email.com",
      customerName: "Juan Pérez",
      category: "Pagos",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      assignedTo: null,
      messages: [
        {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content:
            "No se pudo procesar mi pago con tarjeta de crédito. Aparece un error al finalizar.",
          sender: "customer" as const,
          senderName: "Juan Pérez",
          timestamp: "2024-01-15T10:30:00Z",
          isInternal: false,
        },
      ],
    },
    {
      id: `TICK-${String(ticketCounter++).padStart(3, "0")}`,
      title: "Producto llegó defectuoso",
      description: "El producto arribó dañado en el empaque",
      status: "en_progreso" as const,
      priority: "media" as const,
      customerEmail: "maria@email.com",
      customerName: "María González",
      category: "Productos",
      createdAt: "2024-01-14T15:20:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      assignedTo: "Soporte Técnico",
      messages: [
        {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content: "El producto llegó con la caja dañada y el contenido roto.",
          sender: "customer" as const,
          senderName: "María González",
          timestamp: "2024-01-14T15:20:00Z",
          isInternal: false,
        },
        {
          id: `MSG-${String(messageCounter++).padStart(3, "0")}`,
          content:
            "Lamento escuchar eso. Vamos a procesar un reemplazo inmediato. Por favor, envía fotos del daño.",
          sender: "admin" as const,
          senderName: "Soporte Rastuci",
          timestamp: "2024-01-15T09:15:00Z",
          isInternal: false,
        },
      ],
    },
  ];

  exampleTickets.forEach((ticket) => {
    mockTickets.set(ticket.id, ticket);
  });

  // Sesiones de chat de ejemplo
  const exampleChatSessions = [
    {
      id: "CHAT-001",
      customerName: "Ana Rodríguez",
      customerEmail: "ana@email.com",
      status: "active" as const,
      startTime: "2024-01-15T11:45:00Z",
      lastMessage: "¿Tienen descuentos por cantidad?",
      unreadCount: 2,
      updatedAt: "2024-01-15T11:45:00Z",
    },
    {
      id: "CHAT-002",
      customerName: "Carlos López",
      customerEmail: "carlos@email.com",
      status: "waiting" as const,
      startTime: "2024-01-15T11:30:00Z",
      lastMessage: "Necesito ayuda con mi pedido",
      unreadCount: 1,
      updatedAt: "2024-01-15T11:30:00Z",
    },
  ];

  exampleChatSessions.forEach((session) => {
    mockChatSessions.set(session.id, session);
  });

  // FAQs de ejemplo
  const exampleFAQs = [
    {
      id: `FAQ-${String(faqCounter++).padStart(3, "0")}`,
      question: "¿Cómo puedo rastrear mi pedido?",
      answer:
        "Puedes rastrear tu pedido ingresando el código de seguimiento en la página de tracking o desde tu cuenta de usuario.",
      category: "Envíos",
      isActive: true,
      viewCount: 150,
      helpfulVotes: 45,
      notHelpfulVotes: 3,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: `FAQ-${String(faqCounter++).padStart(3, "0")}`,
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos tarjetas de crédito, débito, MercadoPago, transferencias bancarias y efectivo contra entrega.",
      category: "Pagos",
      isActive: true,
      viewCount: 200,
      helpfulVotes: 60,
      notHelpfulVotes: 5,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
    {
      id: `FAQ-${String(faqCounter++).padStart(3, "0")}`,
      question: "¿Cuál es la política de devoluciones?",
      answer:
        "Ofrecemos devoluciones gratuitas dentro de los 30 días de la compra. El producto debe estar en condiciones originales.",
      category: "Devoluciones",
      isActive: true,
      viewCount: 120,
      helpfulVotes: 38,
      notHelpfulVotes: 2,
      createdAt: "2024-01-10T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
    },
  ];

  exampleFAQs.forEach((faq) => {
    mockFAQs.set(faq.id, faq);
  });
}

// Inicializar datos mock al cargar el módulo
initializeMockData();
