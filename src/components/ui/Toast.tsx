"use client";

import { cn } from "@/lib/utils";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms
};

type ToastContextValue = {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const show: ToastContextValue["show"] = ({
    type,
    title,
    message,
    duration = 3500,
  }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    if (duration > 0) {
      timers.current[id] = setTimeout(() => dismiss(id), duration);
    }
  };

  const dismiss: ToastContextValue["dismiss"] = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  };

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-[calc(100%-2rem)] sm:w-96">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  const { type, title, message } = toast;
  const color =
    type === "success"
      ? "bg-success"
      : type === "error"
        ? "bg-error"
        : type === "warning"
          ? "bg-warning"
          : "bg-info";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "surface border border-muted rounded-lg shadow-lg p-3 flex items-start gap-3",
        "animate-in fade-in slide-in-from-bottom-2"
      )}
    >
      <div className={cn("h-2 w-2 rounded-full mt-2", color)} />
      <div className="flex-1">
        {title && (
          <div className="font-semibold text-sm text-primary mb-0.5">
            {title}
          </div>
        )}
        <div className="text-sm muted">{message}</div>
      </div>
      <button
        aria-label="Cerrar notificación"
        onClick={onDismiss}
        className="text-xs muted hover:text-primary"
      >
        ✕
      </button>
    </div>
  );
}

export default ToastProvider;
