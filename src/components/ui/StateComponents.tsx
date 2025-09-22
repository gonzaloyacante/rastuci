"use client";

import React from "react";
import { Button } from "./Button";
import { LoadingSpinner } from "./LoadingComponents";
import { AlertCircle, CheckCircle, Info, WifiOff, RefreshCw } from "lucide-react";

// Componente para estados de error mejorados
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: "error" | "network" | "notFound" | "unauthorized";
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel = "Reintentar",
  type = "error",
  className = "",
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case "network":
        return {
          icon: <WifiOff className="w-8 h-8" />,
          defaultTitle: "Sin conexión",
          defaultMessage:
            "Verifica tu conexión a internet e intenta nuevamente.",
          color: "text-warning",
        };
      case "notFound":
        return {
          icon: <AlertCircle className="w-8 h-8" />,
          defaultTitle: "No encontrado",
          defaultMessage: "El contenido que buscas no está disponible.",
          color: "text-info",
        };
      case "unauthorized":
        return {
          icon: <AlertCircle className="w-8 h-8" />,
          defaultTitle: "Acceso denegado",
          defaultMessage: "No tienes permisos para ver este contenido.",
          color: "text-warning",
        };
      default:
        return {
          icon: <AlertCircle className="w-8 h-8" />,
          defaultTitle: "Error",
          defaultMessage:
            "Ha ocurrido un error inesperado. Por favor, intenta nuevamente.",
          color: "text-error",
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className={`mb-4 ${config.color}`}>{config.icon}</div>
      <h3 className="text-lg font-semibold mb-2">
        {title || config.defaultTitle}
      </h3>
      <p className="muted mb-6 max-w-md">{message || config.defaultMessage}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

// Componente para estados de loading mejorados
interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Cargando...",
  size = "md",
  variant = "spinner",
  className = "",
}) => {
  const renderLoadingIndicator = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      case "pulse":
        return (
          <div className="w-8 h-8 bg-primary rounded-full animate-pulse" />
        );
      default:
        return <LoadingSpinner size={size} />;
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}
    >
      <div className="mb-4">{renderLoadingIndicator()}</div>
      <p className="muted text-sm">{message}</p>
    </div>
  );
};

// Componente para estados vacíos
interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No hay contenido",
  message = "No se encontraron elementos para mostrar.",
  action,
  icon,
  className = "",
}) => {
  const defaultIcon = (
    <svg
      className="w-12 h-12 muted"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className}`}
    >
      <div className="mb-4">{icon || defaultIcon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="muted mb-6 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Hook para manejo de estados de UI
interface UseUIStateOptions {
  initialLoading?: boolean;
}

interface UIState {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

interface UIStateActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEmpty: (empty: boolean) => void;
  reset: () => void;
}

export function useUIState(
  options: UseUIStateOptions = {},
): [UIState, UIStateActions] {
  const [state, setState] = React.useState<UIState>({
    isLoading: options.initialLoading ?? false,
    error: null,
    isEmpty: false,
  });

  const actions: UIStateActions = React.useMemo(
    () => ({
      setLoading: (loading: boolean) =>
        setState((prev) => ({ ...prev, isLoading: loading, error: null })),
      setError: (error: string | null) =>
        setState((prev) => ({ ...prev, error, isLoading: false })),
      setEmpty: (empty: boolean) =>
        setState((prev) => ({ ...prev, isEmpty: empty })),
      reset: () => setState({ isLoading: false, error: null, isEmpty: false }),
    }),
    [],
  );

  return [state, actions];
}

// Componente wrapper que maneja todos los estados
interface StateWrapperProps {
  isLoading: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: { label: string; onClick: () => void };
  children: React.ReactNode;
  className?: string;
}

export const StateWrapper: React.FC<StateWrapperProps> = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  loadingMessage,
  emptyTitle,
  emptyMessage,
  emptyAction,
  children,
  className = "",
}) => {
  if (isLoading) {
    return <LoadingState message={loadingMessage} className={className} />;
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={onRetry} className={className} />
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
};

export default StateWrapper;
