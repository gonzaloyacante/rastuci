"use client";

import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import React, { ReactNode, useCallback, useState } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning" | "success";
  icon?: ReactNode;
  loading?: boolean;
}

const variantStyles = {
  default: {
    bgColor: "bg-background",
    textColor: "text-foreground",
    iconColor: "text-primary",
    confirmVariant: "primary" as const,
    defaultIcon: Info,
  },
  danger: {
    bgColor: "bg-background",
    textColor: "text-foreground",
    iconColor: "text-destructive",
    confirmVariant: "destructive" as const,
    defaultIcon: AlertTriangle,
  },
  warning: {
    bgColor: "bg-background",
    textColor: "text-foreground",
    iconColor: "text-warning",
    confirmVariant: "secondary" as const,
    defaultIcon: AlertTriangle,
  },
  success: {
    bgColor: "bg-background",
    textColor: "text-foreground",
    iconColor: "text-success",
    confirmVariant: "primary" as const,
    defaultIcon: CheckCircle,
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  icon,
  loading = false,
}: ConfirmDialogProps) {
  const variantConfig = variantStyles[variant];
  const IconComponent = icon || variantConfig.defaultIcon;

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div
        className={`
          ${variantConfig.bgColor} ${variantConfig.textColor}
          rounded-lg shadow-2xl max-w-md w-full mx-auto
          animate-in zoom-in-95 slide-in-from-bottom-2 duration-300
          border border-border
        `}
        role="dialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`shrink-0 ${variantConfig.iconColor}`}>
                {React.isValidElement(IconComponent)
                  ? IconComponent
                  : IconComponent &&
                    React.createElement(IconComponent as React.ElementType, {
                      size: 24,
                    })}
              </div>
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold leading-6"
              >
                {title}
              </h3>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-colors p-0 h-auto min-h-0 min-w-0 hover:bg-transparent"
              disabled={loading}
            >
              <X size={20} />
            </Button>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p
              id="confirm-dialog-message"
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="min-w-20"
            >
              {cancelText}
            </Button>
            <Button
              variant={variantConfig.confirmVariant}
              onClick={handleConfirm}
              loading={loading}
              className="min-w-20"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar el diálogo de confirmación
interface UseConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseConfirmDialogOptions>({
    title: "",
    message: "",
  });
  const [resolvePromise, setResolvePromise] = useState<
    ((value: boolean) => void) | null
  >(null);

  const confirm = useCallback(
    (options: UseConfirmDialogOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setConfig(options);
        setResolvePromise(() => resolve);
        setIsOpen(true);
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setResolvePromise(null);
  }, [resolvePromise]);

  const handleCancel = useCallback(() => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setResolvePromise(null);
  }, [resolvePromise]);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={config.title}
      message={config.message}
      confirmText={config.confirmText}
      cancelText={config.cancelText}
      variant={config.variant}
    />
  );

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}
