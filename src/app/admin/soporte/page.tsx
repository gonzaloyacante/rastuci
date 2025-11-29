"use client";

import { SupportSkeleton } from "@/components/admin/skeletons";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useDocumentTitle } from "@/hooks";
import {
  CheckCircle,
  Clock,
  HelpCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  TicketIcon,
  User,
} from "lucide-react";
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

type TabType = "tickets" | "chat" | "faq";

const SupportPage: React.FC = () => {
  useDocumentTitle({ title: "Soporte" });
  const [activeTab, setActiveTab] = useState<TabType>("tickets");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/support?type=${activeTab}&status=${statusFilter}&search=${searchTerm}`
      );

      if (!response.ok) {
        throw new Error("Error al cargar datos");
      }

      const result = await response.json();

      if (result.success) {
        switch (activeTab) {
          case "tickets":
            setTickets(result.data.tickets || []);
            break;
          case "chat":
            setChatSessions(result.data.sessions || []);
            break;
          case "faq":
            setFaqs(result.data.faqs || []);
            break;
        }
      }
    } catch {
      // Set empty arrays on error
      switch (activeTab) {
        case "tickets":
          setTickets([]);
          break;
        case "chat":
          setChatSessions([]);
          break;
        case "faq":
          setFaqs([]);
          break;
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "tickets", label: "Tickets", icon: <TicketIcon size={16} /> },
    { id: "chat", label: "Chat en Vivo", icon: <MessageSquare size={16} /> },
    { id: "faq", label: "FAQ", icon: <HelpCircle size={16} /> },
  ];

  const getStatusBadge = (
    status: string,
    type: "ticket" | "chat" = "ticket"
  ) => {
    const statusConfig: Record<
      string,
      { className: string; label: string; icon: React.ReactNode }
    > = {
      abierto: {
        className: "badge-info",
        label: "Abierto",
        icon: <Clock size={12} />,
      },
      en_progreso: {
        className: "badge-warning",
        label: "En Progreso",
        icon: <RefreshCw size={12} />,
      },
      resuelto: {
        className: "badge-success",
        label: "Resuelto",
        icon: <CheckCircle size={12} />,
      },
      cerrado: {
        className: "badge-default",
        label: "Cerrado",
        icon: <CheckCircle size={12} />,
      },
      active: {
        className: "badge-success",
        label: "Activo",
        icon: <MessageSquare size={12} />,
      },
      waiting: {
        className: "badge-warning",
        label: "Esperando",
        icon: <Clock size={12} />,
      },
      ended: {
        className: "badge-default",
        label: "Finalizado",
        icon: <CheckCircle size={12} />,
      },
    };

    const config = statusConfig[status] || {
      className: "badge-default",
      label: status,
      icon: null,
    };

    return (
      <Badge className={config.className}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.label}
        </span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, { className: string; label: string }> =
      {
        baja: { className: "badge-default", label: "Baja" },
        media: { className: "badge-info", label: "Media" },
        alta: { className: "badge-warning", label: "Alta" },
        urgente: { className: "badge-error", label: "Urgente" },
      };

    const config = priorityConfig[priority] || {
      className: "badge-default",
      label: priority,
    };

    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      await fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addMessage",
          ticketId: selectedTicket.id,
          content: newMessage,
          isInternal: false,
        }),
      });

      setNewMessage("");
      fetchData();
    } catch {
      // Handle error silently
    }
  };

  if (loading) {
    return <SupportSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Soporte</h1>
          <p className="text-muted">
            Gestiona tickets, chat en vivo y preguntas frecuentes
          </p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus size={16} />
          {activeTab === "tickets" && "Nuevo Ticket"}
          {activeTab === "faq" && "Nueva FAQ"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-muted pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedTicket(null);
            }}
            className={`px-4 py-2 rounded-t-lg flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? "surface-secondary text-primary font-medium"
                : "text-muted hover:text-primary"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input"
        >
          <option value="all">Todos los estados</option>
          {activeTab === "tickets" && (
            <>
              <option value="abierto">Abiertos</option>
              <option value="en_progreso">En Progreso</option>
              <option value="resuelto">Resueltos</option>
              <option value="cerrado">Cerrados</option>
            </>
          )}
          {activeTab === "chat" && (
            <>
              <option value="active">Activos</option>
              <option value="waiting">Esperando</option>
              <option value="ended">Finalizados</option>
            </>
          )}
        </select>
        <Button variant="outline" onClick={fetchData} className="gap-2">
          <RefreshCw size={16} />
          Actualizar
        </Button>
      </div>

      {/* Content */}
      {activeTab === "tickets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-4">
            {tickets.length === 0 ? (
              <Card className="p-8 text-center">
                <TicketIcon size={48} className="mx-auto mb-4 text-muted" />
                <h3 className="text-lg font-medium text-primary mb-2">
                  No hay tickets
                </h3>
                <p className="text-muted">
                  Los tickets de soporte aparecerán aquí
                </p>
              </Card>
            ) : (
              tickets.map((ticket) => (
                <Card
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-primary line-clamp-1">
                      {ticket.title}
                    </h3>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-sm text-muted line-clamp-2 mb-3">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <User size={14} />
                      {ticket.customerName}
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <div className="text-xs text-muted mt-2">
                    {new Date(ticket.createdAt).toLocaleDateString("es-AR")}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Ticket Detail */}
          <div className="lg:col-span-2">
            {selectedTicket ? (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-primary">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-sm text-muted">
                      Ticket #{selectedTicket.id}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-muted">
                  <div>
                    <p className="text-sm text-muted">Cliente</p>
                    <p className="font-medium">{selectedTicket.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-medium">
                      {selectedTicket.customerEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Categoría</p>
                    <p className="font-medium">{selectedTicket.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted">Creado</p>
                    <p className="font-medium">
                      {new Date(selectedTicket.createdAt).toLocaleString(
                        "es-AR"
                      )}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.sender === "admin"
                          ? "surface-secondary ml-8"
                          : "surface mr-8"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-muted">
                          {new Date(msg.timestamp).toLocaleString("es-AR")}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Escribe una respuesta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    variant="primary"
                    onClick={handleSendMessage}
                    className="gap-2"
                  >
                    <Send size={16} />
                    Enviar
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center h-full flex items-center justify-center">
                <div>
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 text-muted"
                  />
                  <h3 className="text-lg font-medium text-primary mb-2">
                    Selecciona un ticket
                  </h3>
                  <p className="text-muted">
                    Elige un ticket de la lista para ver los detalles
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chatSessions.length === 0 ? (
            <Card className="col-span-full p-8 text-center">
              <MessageSquare size={48} className="mx-auto mb-4 text-muted" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No hay chats activos
              </h3>
              <p className="text-muted">
                Las conversaciones en vivo aparecerán aquí
              </p>
            </Card>
          ) : (
            chatSessions.map((session) => (
              <Card
                key={session.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-primary">
                      {session.customerName}
                    </h3>
                    <p className="text-sm text-muted">
                      {session.customerEmail}
                    </p>
                  </div>
                  {getStatusBadge(session.status, "chat")}
                </div>

                <p className="text-sm text-muted line-clamp-2 mb-3">
                  {session.lastMessage}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-muted">
                  <span className="text-xs text-muted">
                    {new Date(session.startTime).toLocaleString("es-AR")}
                  </span>
                  {session.unreadCount > 0 && (
                    <Badge className="badge-error">
                      {session.unreadCount} nuevos
                    </Badge>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === "faq" && (
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <Card className="p-8 text-center">
              <HelpCircle size={48} className="mx-auto mb-4 text-muted" />
              <h3 className="text-lg font-medium text-primary mb-2">
                No hay preguntas frecuentes
              </h3>
              <p className="text-muted mb-4">
                Agrega FAQs para ayudar a tus clientes
              </p>
              <Button variant="primary" className="gap-2">
                <Plus size={16} />
                Agregar FAQ
              </Button>
            </Card>
          ) : (
            faqs.map((faq) => (
              <Card key={faq.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-primary">{faq.question}</h3>
                  <div className="flex gap-2">
                    <Badge className="badge-default">{faq.category}</Badge>
                    <Badge
                      className={
                        faq.isActive ? "badge-success" : "badge-default"
                      }
                    >
                      {faq.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted mb-3">{faq.answer}</p>
                <div className="flex items-center justify-between text-sm text-muted">
                  <div className="flex gap-4">
                    <span>👁️ {faq.viewCount} vistas</span>
                    <span>👍 {faq.helpfulVotes}</span>
                    <span>👎 {faq.notHelpfulVotes}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SupportPage;
