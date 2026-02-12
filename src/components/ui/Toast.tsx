"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import React, {
  createContext,
  useCallback,
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

type ToastState = Toast & { isExiting?: boolean };

type ToastContextValue = {
  toasts: ToastState[];
  show: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// Module-level ref so non-component code can trigger toasts via showToast()
let showRef: ToastContextValue["show"] | null = null;

/**
 * Standalone function to show a toast from anywhere (components or plain modules).
 * Falls back to console.warn if called before the provider mounts.
 */
export function showToast(t: Omit<Toast, "id">) {
  if (showRef) {
    showRef(t);
  } else {
    // Provider not mounted yet — fallback so the message isn't silently lost
    console.warn("[Toast] Provider not mounted. Message:", t.message);
  }
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const dismiss = useCallback((id: string) => {
    // Primero marcar como exiting para la animación
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    // Después de la animación, remover del DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);

    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const show: ToastContextValue["show"] = useCallback(
    ({ type, title, message, duration = 3500 }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  useEffect(
    () => () => {
      Object.values(timers.current).forEach(clearTimeout);
    },
    []
  );

  // Wire the standalone showToast() function
  useEffect(() => {
    showRef = show;
    return () => {
      showRef = null;
    };
  }, [show]);

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-96 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  const { type, title, message, isExiting } = toast;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "surface border border-theme rounded-lg shadow-lg p-3 flex items-start gap-3 pointer-events-auto",
        "border-l-4",
        borderColors[type],
        // Animación de entrada
        "translate-x-0 opacity-100",
        !isExiting &&
          "animate-in slide-in-from-right-full fade-in duration-300",
        // Animación de salida
        isExiting && "animate-out slide-out-to-right-full fade-out duration-200"
      )}
    >
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm text-base-primary mb-0.5">
            {title}
          </div>
        )}
        <div className="text-sm muted">{message}</div>
      </div>
      <Button
        aria-label="Cerrar notificación"
        onClick={onDismiss}
        variant="ghost"
        className="shrink-0 p-1 rounded-full muted hover:text-base-primary hover:bg-surface-secondary transition-colors h-auto min-h-0 min-w-0 bg-transparent"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default ToastProvider;
