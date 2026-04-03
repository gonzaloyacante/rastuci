"use client";

import {
  Archive,
  CheckCheck,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface ContactMessage {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  responsePreference: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PREFERENCE_ICON: Record<string, React.ReactNode> = {
  EMAIL: <Mail className="w-3.5 h-3.5" />,
  PHONE: <Phone className="w-3.5 h-3.5" />,
  WHATSAPP: <MessageCircle className="w-3.5 h-3.5" />,
};

const PREFERENCE_LABEL: Record<string, string> = {
  EMAIL: "Email",
  PHONE: "Teléfono",
  WHATSAPP: "WhatsApp",
};

export function ContactMessagesList() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [filterRead, setFilterRead] = useState<"all" | "unread" | "read">(
    "all"
  );

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        isArchived: String(showArchived),
      });
      if (filterRead === "unread") params.set("isRead", "false");
      if (filterRead === "read") params.set("isRead", "true");

      const res = await fetch(`/api/contact/messages?${params}`);
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error?.message || "Error al cargar");
      setMessages(json.data.messages);
      setPagination(json.data.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [page, showArchived, filterRead]);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/contact/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead } : m))
    );
  };

  const archive = async (id: string) => {
    await fetch(`/api/contact/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {(["all", "unread", "read"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filterRead === f ? "primary" : "outline"}
              onClick={() => {
                setFilterRead(f);
                setPage(1);
              }}
            >
              {f === "all" ? "Todos" : f === "unread" ? "No leídos" : "Leídos"}
            </Button>
          ))}
          <Button
            size="sm"
            variant={showArchived ? "primary" : "outline"}
            onClick={() => {
              setShowArchived((v) => !v);
              setPage(1);
            }}
          >
            <Archive className="w-4 h-4 mr-1" />
            Archivados
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={() => void fetchMessages()}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Actualizar
        </Button>
      </div>

      {/* States */}
      {error && (
        <p className="text-error text-sm p-3 bg-error/10 rounded-lg">{error}</p>
      )}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-xl surface-secondary animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Messages list */}
      {!loading && messages.length === 0 && (
        <p className="text-center muted py-10">
          No hay mensajes en esta vista.
        </p>
      )}
      {!loading && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((msg) => (
            <Card
              key={msg.id}
              className={`border border-theme rounded-xl transition-all ${
                !msg.isRead ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm">{msg.name}</span>
                      {!msg.isRead && (
                        <Badge variant="default" className="text-xs">
                          Nuevo
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs flex items-center gap-1"
                      >
                        {PREFERENCE_ICON[msg.responsePreference]}
                        {PREFERENCE_LABEL[msg.responsePreference] ??
                          msg.responsePreference}
                      </Badge>
                      <span className="text-xs muted ml-auto">
                        {new Date(msg.createdAt).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs muted mb-2 flex-wrap">
                      {msg.email && <span>✉️ {msg.email}</span>}
                      {msg.phone && <span>📞 {msg.phone}</span>}
                    </div>
                    <p className="text-sm text-secondary line-clamp-3">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      title={
                        msg.isRead
                          ? "Marcar como no leído"
                          : "Marcar como leído"
                      }
                      onClick={() => void markRead(msg.id, !msg.isRead)}
                    >
                      <CheckCheck
                        className={`w-4 h-4 ${msg.isRead ? "text-success" : "text-muted"}`}
                      />
                    </Button>
                    {!showArchived && (
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Archivar"
                        onClick={() => void archive(msg.id)}
                      >
                        <Archive className="w-4 h-4 text-muted" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm self-center muted">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
