"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/logger";
import React, { useCallback, useEffect, useState } from "react";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "abierto" | "en_progreso" | "resuelto" | "cerrado";
  priority: "baja" | "media" | "alta" | "urgente";
  customerEmail: string;
  customerName: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;
  content: string;
  sender: "customer" | "admin";
  senderName: string;
  timestamp: string;
  isInternal?: boolean;
}

interface ChatSession {
  id: string;
  customerName: string;
  customerEmail: string;
  status: "active" | "waiting" | "ended";
  startTime: string;
  lastMessage: string;
  unreadCount: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  viewCount: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  createdAt: string;
  updatedAt: string;
}

const SupportPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tickets" | "chat" | "faq">(
    "tickets"
  );
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newFaqCategory, setNewFaqCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const statusColors = {
    abierto: "bg-blue-100 text-blue-800",
    en_progreso: "bg-yellow-100 text-yellow-800",
    resuelto: "bg-green-100 text-green-800",
    cerrado: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    baja: "bg-gray-100 text-gray-800",
    media: "bg-blue-100 text-blue-800",
    alta: "bg-orange-100 text-orange-800",
    urgente: "bg-red-100 text-red-800",
  };

  const chatStatusColors = {
    active: "bg-green-100 text-green-800",
    waiting: "bg-yellow-100 text-yellow-800",
    ended: "bg-gray-100 text-gray-800",
  };

  const fetchSupportData = useCallback(async (): Promise<void> => {
    try {
      // Simular API calls
      await Promise.all([fetchTickets(), fetchChatSessions(), fetchFAQs()]);
    } catch (error) {
      // Error logging para debugging
      logger.error("Error fetching support data:", { error: error });
    }
  }, []);

  useEffect(() => {
    fetchSupportData();
  }, [fetchSupportData]);

  const fetchTickets = async () => {
    // Simular datos de tickets
    const mockTickets: SupportTicket[] = [
      {
        id: "TICK-001",
        title: "Problema con el pago",
        description: "No se pudo procesar mi pago con tarjeta de crédito",
        status: "abierto",
        priority: "alta",
        customerEmail: "cliente@email.com",
        customerName: "Juan Pérez",
        category: "Pagos",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        messages: [
          {
            id: "MSG-001",
            content:
              "No se pudo procesar mi pago con tarjeta de crédito. Aparece un error.",
            sender: "customer",
            senderName: "Juan Pérez",
            timestamp: "2024-01-15T10:30:00Z",
          },
        ],
      },
      {
        id: "TICK-002",
        title: "Producto defectuoso",
        description: "El producto llegó dañado",
        status: "en_progreso",
        priority: "media",
        customerEmail: "maria@email.com",
        customerName: "María González",
        category: "Productos",
        createdAt: "2024-01-14T15:20:00Z",
        updatedAt: "2024-01-15T09:15:00Z",
        assignedTo: "Admin",
        messages: [
          {
            id: "MSG-002",
            content:
              "El producto llegó con la caja dañada y el contenido roto.",
            sender: "customer",
            senderName: "María González",
            timestamp: "2024-01-14T15:20:00Z",
          },
          {
            id: "MSG-003",
            content:
              "Lamento escuchar eso. Vamos a procesar un reemplazo inmediato.",
            sender: "admin",
            senderName: "Soporte Rastuci",
            timestamp: "2024-01-15T09:15:00Z",
          },
        ],
      },
    ];
    setTickets(mockTickets);
  };

  const fetchChatSessions = async () => {
    // Simular datos de chat
    const mockChatSessions: ChatSession[] = [
      {
        id: "CHAT-001",
        customerName: "Ana Rodríguez",
        customerEmail: "ana@email.com",
        status: "active",
        startTime: "2024-01-15T11:45:00Z",
        lastMessage: "¿Tienen descuentos por cantidad?",
        unreadCount: 2,
      },
      {
        id: "CHAT-002",
        customerName: "Carlos López",
        customerEmail: "carlos@email.com",
        status: "waiting",
        startTime: "2024-01-15T11:30:00Z",
        lastMessage: "Necesito ayuda con mi pedido",
        unreadCount: 1,
      },
    ];
    setChatSessions(mockChatSessions);
  };

  const fetchFAQs = async () => {
    // Simular datos de FAQ
    const mockFAQs: FAQItem[] = [
      {
        id: "FAQ-001",
        question: "¿Cómo puedo rastrear mi pedido?",
        answer:
          "Puedes rastrear tu pedido ingresando el código de seguimiento en la página de tracking o desde tu cuenta.",
        category: "Envíos",
        isActive: true,
        viewCount: 150,
        helpfulVotes: 45,
        notHelpfulVotes: 3,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "FAQ-002",
        question: "¿Qué métodos de pago aceptan?",
        answer:
          "Aceptamos tarjetas de crédito, débito, MercadoPago y transferencias bancarias.",
        category: "Pagos",
        isActive: true,
        viewCount: 200,
        helpfulVotes: 60,
        notHelpfulVotes: 5,
        createdAt: "2024-01-10T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ];
    setFaqs(mockFAQs);
  };

  const updateTicketStatus = async (
    ticketId: string,
    newStatus: SupportTicket["status"]
  ): Promise<void> => {
    try {
      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : ticket
        )
      );
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: newStatus } : null
        );
      }
    } catch (error) {
      // Error logging para debugging
      logger.error("Error updating ticket status:", { error: error });
    }
  };

  const sendTicketMessage = async (ticketId: string): Promise<void> => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      const message: SupportMessage = {
        id: `MSG-${Date.now()}`,
        content: newMessage,
        sender: "admin",
        senderName: "Soporte Rastuci",
        timestamp: new Date().toISOString(),
      };

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === ticketId
            ? {
                ...ticket,
                messages: [...ticket.messages, message],
                updatedAt: new Date().toISOString(),
              }
            : ticket
        )
      );

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, messages: [...prev.messages, message] } : null
        );
      }

      setNewMessage("");
    } catch (error) {
      // Error logging para debugging
      logger.error("Error sending message:", { error: error });
    }
  };

  const addFAQ = async (): Promise<void> => {
    if (
      !newFaqQuestion.trim() ||
      !newFaqAnswer.trim() ||
      !newFaqCategory.trim()
    ) {
      return;
    }

    try {
      const newFaq: FAQItem = {
        id: `FAQ-${Date.now()}`,
        question: newFaqQuestion,
        answer: newFaqAnswer,
        category: newFaqCategory,
        isActive: true,
        viewCount: 0,
        helpfulVotes: 0,
        notHelpfulVotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setFaqs((prev) => [newFaq, ...prev]);
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setNewFaqCategory("");
    } catch (error) {
      // Error logging para debugging
      logger.error("Error adding FAQ:", { error: error });
    }
  };

  const toggleFAQStatus = async (faqId: string): Promise<void> => {
    try {
      setFaqs((prev) =>
        prev.map((faq) =>
          faq.id === faqId
            ? {
                ...faq,
                isActive: !faq.isActive,
                updatedAt: new Date().toISOString(),
              }
            : faq
        )
      );
    } catch (error) {
      // Error logging para debugging
      logger.error("Error toggling FAQ status:", { error: error });
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesSearch =
      !searchTerm ||
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const filteredFAQs = faqs.filter(
    (faq) =>
      !searchTerm ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Centro de Soporte</h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "tickets" ? "primary" : "outline"}
            onClick={() => setActiveTab("tickets")}
          >
            Tickets ({tickets.filter((t) => t.status !== "cerrado").length})
          </Button>
          <Button
            variant={activeTab === "chat" ? "primary" : "outline"}
            onClick={() => setActiveTab("chat")}
          >
            Chat en Vivo (
            {chatSessions.filter((c) => c.status === "active").length})
          </Button>
          <Button
            variant={activeTab === "faq" ? "primary" : "outline"}
            onClick={() => setActiveTab("faq")}
          >
            FAQ ({faqs.filter((f) => f.isActive).length})
          </Button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === "tickets" && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="abierto">Abierto</option>
                <option value="en_progreso">En Progreso</option>
                <option value="resuelto">Resuelto</option>
                <option value="cerrado">Cerrado</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgente">Urgente</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </>
          )}
        </div>
      </Card>

      {/* Contenido según pestaña activa */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Tickets */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Tickets de Soporte</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-3 border rounded-lg cursor-pointer surface-hover ${
                    selectedTicket?.id === ticket.id
                      ? "border-primary bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{ticket.title}</h3>
                      <p className="text-sm text-content-secondary">
                        {ticket.customerName} - {ticket.customerEmail}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status}
                        </Badge>
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-content-tertiary">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Detalle del Ticket */}
          <Card className="p-4">
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-sm text-content-secondary">
                      {selectedTicket.customerName} -{" "}
                      {selectedTicket.customerEmail}
                    </p>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) =>
                      updateTicketStatus(
                        selectedTicket.id,
                        e.target.value as SupportTicket["status"]
                      )
                    }
                    className="px-3 py-2 border rounded-lg bg-white text-sm"
                  >
                    <option value="abierto">Abierto</option>
                    <option value="en_progreso">En Progreso</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Conversación</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.sender === "customer"
                            ? "surface-secondary mr-8"
                            : "bg-blue-100 ml-8"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">
                            {message.senderName}
                          </span>
                          <span className="text-xs text-content-tertiary">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribir respuesta..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendTicketMessage(selectedTicket.id);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => sendTicketMessage(selectedTicket.id)}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-content-tertiary">
                Selecciona un ticket para ver los detalles
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Sesiones de Chat */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Sesiones de Chat Activas
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chatSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 border rounded-lg cursor-pointer surface-hover ${
                    selectedChat?.id === session.id
                      ? "border-primary bg-blue-50"
                      : ""
                  }`}
                  onClick={() => setSelectedChat(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{session.customerName}</h3>
                      <p className="text-sm text-content-secondary">
                        {session.customerEmail}
                      </p>
                      <p className="text-sm text-content-tertiary mt-1">
                        {session.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={chatStatusColors[session.status]}>
                          {session.status}
                        </Badge>
                        {session.unreadCount > 0 && (
                          <Badge className="badge-error">
                            {session.unreadCount} nuevos
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-content-tertiary">
                      {new Date(session.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Chat Interface */}
          <Card className="p-4">
            {selectedChat ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedChat.customerName}
                    </h2>
                    <p className="text-sm text-content-secondary">
                      {selectedChat.customerEmail}
                    </p>
                    <Badge className={chatStatusColors[selectedChat.status]}>
                      {selectedChat.status}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="surface-secondary p-4 rounded-lg text-center">
                    <p className="text-content-secondary">
                      Chat en tiempo real
                    </p>
                    <p className="text-sm text-content-tertiary">
                      Interfaz de chat se implementará con WebSocket
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Escribir mensaje..."
                      className="flex-1"
                    />
                    <Button>Enviar</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-content-tertiary">
                Selecciona una sesión de chat para comenzar
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === "faq" && (
        <div className="space-y-6">
          {/* Agregar nueva FAQ */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Agregar Nueva FAQ</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Pregunta"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                />
                <Input
                  placeholder="Categoría"
                  value={newFaqCategory}
                  onChange={(e) => setNewFaqCategory(e.target.value)}
                />
              </div>
              <textarea
                placeholder="Respuesta"
                value={newFaqAnswer}
                onChange={(e) => setNewFaqAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-muted rounded-lg resize-none h-24"
              />
              <Button onClick={addFAQ}>Agregar FAQ</Button>
            </div>
          </Card>

          {/* Lista de FAQs */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">FAQs Existentes</h2>
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{faq.question}</h3>
                      <p className="text-sm text-content-secondary mt-2">
                        {faq.answer}
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge>{faq.category}</Badge>
                        <span className="text-xs text-content-tertiary">
                          {faq.viewCount} vistas
                        </span>
                        <span className="text-xs text-success">
                          👍 {faq.helpfulVotes}
                        </span>
                        <span className="text-xs text-error">
                          👎 {faq.notHelpfulVotes}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          faq.isActive ? "badge-success" : "badge-default"
                        }
                      >
                        {faq.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFAQStatus(faq.id)}
                      >
                        {faq.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
