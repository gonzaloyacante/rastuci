"use client";

import {
  DetailPanel,
  EmptyState,
  InfoGrid,
  ListItemCard,
  MessageThread,
  PageHeaderWithActions,
  SearchFiltersBar,
  TabLayout,
  TabPanel,
} from "@/components/admin";
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
  Send,
  TicketIcon,
  User,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

interface SupportMessage {
  id: string;
  content: string;
  sender: "customer" | "admin";
  senderName: string;
  timestamp: string;
  isInternal?: boolean;
}

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
}

type TabType = "tickets" | "chat" | "faq";

// ============================================================================
// Status Badges
// ============================================================================

const ticketStatusConfig: Record<
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
};

const chatStatusConfig: Record<
  string,
  { className: string; label: string; icon: React.ReactNode }
> = {
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

const priorityConfig: Record<string, { className: string; label: string }> = {
  baja: { className: "badge-default", label: "Baja" },
  media: { className: "badge-info", label: "Media" },
  alta: { className: "badge-warning", label: "Alta" },
  urgente: { className: "badge-error", label: "Urgente" },
};

function StatusBadge({
  status,
  type = "ticket",
}: {
  status: string;
  type?: "ticket" | "chat";
}) {
  const config =
    type === "ticket" ? ticketStatusConfig[status] : chatStatusConfig[status];
  if (!config) return <Badge className="badge-default">{status}</Badge>;

  return (
    <Badge className={config.className}>
      <span className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig.baja;
  return <Badge className={config.className}>{config.label}</Badge>;
}

// ============================================================================
// Ticket List Component
// ============================================================================

interface TicketListProps {
  tickets: SupportTicket[];
  selectedId: string | null;
  onSelect: (ticket: SupportTicket) => void;
}

function TicketList({ tickets, selectedId, onSelect }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <EmptyState
        icon={<TicketIcon size={48} />}
        title="No hay tickets"
        description="Los tickets de soporte aparecerán aquí"
      />
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {tickets.map((ticket) => (
        <ListItemCard
          key={ticket.id}
          isSelected={selectedId === ticket.id}
          onClick={() => onSelect(ticket)}
        >
          <div className="flex items-start justify-between mb-2 gap-2">
            <h3 className="font-medium text-sm sm:text-base text-primary line-clamp-1 flex-1 min-w-0">
              {ticket.title}
            </h3>
            <PriorityBadge priority={ticket.priority} />
          </div>
          <p className="text-xs sm:text-sm text-muted line-clamp-2 mb-3">
            {ticket.description}
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
              <User size={14} className="shrink-0" />
              <span className="truncate">{ticket.customerName}</span>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="text-xs text-muted mt-2">
            {new Date(ticket.createdAt).toLocaleDateString("es-AR")}
          </div>
        </ListItemCard>
      ))}
    </div>
  );
}

// ============================================================================
// Ticket Detail Component
// ============================================================================

interface TicketDetailProps {
  ticket: SupportTicket | null;
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
}

function TicketDetail({
  ticket,
  newMessage,
  onMessageChange,
  onSendMessage,
}: TicketDetailProps) {
  return (
    <DetailPanel
      show={!!ticket}
      emptyIcon={<MessageSquare size={48} />}
      emptyTitle="Selecciona un ticket"
      emptyDescription="Elige un ticket de la lista para ver los detalles"
    >
      {ticket && (
        <Card className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-primary truncate">
                {ticket.title}
              </h2>
              <p className="text-sm text-muted">Ticket #{ticket.id}</p>
            </div>
            <div className="flex gap-2">
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          <div className="mb-6 pb-6 border-b border-muted">
            <InfoGrid
              items={[
                { label: "Cliente", value: ticket.customerName },
                { label: "Email", value: ticket.customerEmail },
                { label: "Categoría", value: ticket.category },
                {
                  label: "Creado",
                  value: new Date(ticket.createdAt).toLocaleString("es-AR"),
                },
              ]}
            />
          </div>

          <div className="mb-6">
            <MessageThread messages={ticket.messages} />
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Escribe una respuesta..."
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
            />
            <Button variant="primary" onClick={onSendMessage} className="gap-2">
              <Send size={16} />
              Enviar
            </Button>
          </div>
        </Card>
      )}
    </DetailPanel>
  );
}

// ============================================================================
// Chat Sessions Component
// ============================================================================

interface ChatSessionsProps {
  sessions: ChatSession[];
}

function ChatSessions({ sessions }: ChatSessionsProps) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="No hay chats activos"
        description="Las conversaciones en vivo aparecerán aquí"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => (
        <Card
          key={session.id}
          className="p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-primary">
                {session.customerName}
              </h3>
              <p className="text-sm text-muted">{session.customerEmail}</p>
            </div>
            <StatusBadge status={session.status} type="chat" />
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
      ))}
    </div>
  );
}

// ============================================================================
// FAQ List Component
// ============================================================================

interface FAQListProps {
  faqs: FAQItem[];
}

function FAQList({ faqs }: FAQListProps) {
  if (faqs.length === 0) {
    return (
      <EmptyState
        icon={<HelpCircle size={48} />}
        title="No hay preguntas frecuentes"
        description="Agrega FAQs para ayudar a tus clientes"
        action={{ label: "Agregar FAQ", onClick: () => {} }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <Card key={faq.id} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-primary">{faq.question}</h3>
            <div className="flex gap-2">
              <Badge className="badge-default">{faq.category}</Badge>
              <Badge
                className={faq.isActive ? "badge-success" : "badge-default"}
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
      ))}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const tabs = [
  { id: "tickets", label: "Tickets", icon: <TicketIcon size={16} /> },
  { id: "chat", label: "Chat en Vivo", icon: <MessageSquare size={16} /> },
  { id: "faq", label: "FAQ", icon: <HelpCircle size={16} /> },
];

const ticketStatusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "abierto", label: "Abiertos" },
  { value: "en_progreso", label: "En Progreso" },
  { value: "resuelto", label: "Resueltos" },
  { value: "cerrado", label: "Cerrados" },
];

const chatStatusOptions = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "waiting", label: "Esperando" },
  { value: "ended", label: "Finalizados" },
];

export default function SupportPage() {
  useDocumentTitle({ title: "Soporte" });
  const [activeTab, setActiveTab] = useState<TabType>("tickets");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      if (!response.ok) throw new Error("Error");

      const result = await response.json();
      if (result.success) {
        if (activeTab === "tickets") setTickets(result.data.tickets || []);
        else if (activeTab === "chat")
          setChatSessions(result.data.sessions || []);
        else if (activeTab === "faq") setFaqs(result.data.faqs || []);
      }
    } catch {
      if (activeTab === "tickets") setTickets([]);
      else if (activeTab === "chat") setChatSessions([]);
      else if (activeTab === "faq") setFaqs([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as TabType);
    setSelectedTicket(null);
    setStatusFilter("all");
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
      /* ignore */
    }
  };

  const getAddLabel = () => {
    if (activeTab === "tickets") return "Nuevo Ticket";
    if (activeTab === "faq") return "Nueva FAQ";
    return undefined;
  };

  const getStatusOptions = () => {
    if (activeTab === "tickets") return ticketStatusOptions;
    if (activeTab === "chat") return chatStatusOptions;
    return undefined;
  };

  if (loading) return <SupportSkeleton />;

  return (
    <div className="space-y-6">
      <PageHeaderWithActions
        title="Soporte"
        subtitle="Gestiona tickets, chat en vivo y preguntas frecuentes"
      >
        {getAddLabel() && (
          <Button variant="primary" className="gap-2">
            <Plus size={16} />
            {getAddLabel()}
          </Button>
        )}
      </PageHeaderWithActions>

      <TabLayout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        <SearchFiltersBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          statusOptions={getStatusOptions()}
          onRefresh={fetchData}
        />

        <TabPanel id="tickets" activeTab={activeTab}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TicketList
                tickets={tickets}
                selectedId={selectedTicket?.id || null}
                onSelect={setSelectedTicket}
              />
            </div>
            <div className="lg:col-span-2">
              <TicketDetail
                ticket={selectedTicket}
                newMessage={newMessage}
                onMessageChange={setNewMessage}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </TabPanel>

        <TabPanel id="chat" activeTab={activeTab}>
          <ChatSessions sessions={chatSessions} />
        </TabPanel>

        <TabPanel id="faq" activeTab={activeTab}>
          <FAQList faqs={faqs} />
        </TabPanel>
      </TabLayout>
    </div>
  );
}
