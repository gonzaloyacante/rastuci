"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "./Button";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  icon?: ReactNode;
  autoClose?: number; // milliseconds
  showCloseButton?: boolean;
  inline?: boolean;
  children?: ReactNode;
}

const variantStyles = {
  info: {
    bgColor: "bg-[var(--alert-info-bg)] border-[var(--alert-info-border)]",
    textColor: "text-[var(--alert-info-text)]",
    iconColor: "text-[var(--alert-info-icon)]",
    defaultIcon: Info,
  },
  success: {
    bgColor:
      "bg-[var(--alert-success-bg)] border-[var(--alert-success-border)]",
    textColor: "text-[var(--alert-success-text)]",
    iconColor: "text-[var(--alert-success-icon)]",
    defaultIcon: CheckCircle,
  },
  warning: {
    bgColor:
      "bg-[var(--alert-warning-bg)] border-[var(--alert-warning-border-exact)]",
    textColor: "text-[var(--alert-warning-text)]",
    iconColor: "text-[var(--alert-warning-icon)]",
    defaultIcon: AlertTriangle,
  },
  error: {
    bgColor: "bg-[var(--alert-error-bg)] border-[var(--alert-error-border)]",
    textColor: "text-[var(--alert-error-text)]",
    iconColor: "text-[var(--alert-error-icon)]",
    defaultIcon: AlertCircle,
  },
};

// Refactored Alert to support inline mode and children
export default function Alert({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  icon,
  autoClose,
  showCloseButton = true,
  inline = false,
  children,
}: AlertProps & { inline?: boolean; children?: React.ReactNode }) {
  const variantConfig = variantStyles[variant];
  const IconComponent = icon || variantConfig.defaultIcon;

  useEffect(() => {
    if (!inline && isOpen && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, autoClose, onClose, inline]);

  if (!inline && !isOpen) {
    return null;
  }

  const Content = (
    <div
      className={`
          ${variantConfig.bgColor} ${variantConfig.textColor}
          rounded-lg shadow-sm w-full border
          ${inline ? "" : "shadow-2xl max-w-md mx-auto border-2 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"}
        `}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 w-full">
            <div className={`shrink-0 ${variantConfig.iconColor} mt-0.5`}>
              {React.isValidElement(IconComponent)
                ? IconComponent
                : IconComponent &&
                  React.createElement(IconComponent as React.ElementType, {
                    size: 20,
                  })}
            </div>
            <div className="flex-1">
              {title && (
                <h3 className="text-sm font-medium leading-5 mb-1">{title}</h3>
              )}
              {message && <p className="text-sm opacity-90">{message}</p>}
              {children && <div className="text-sm opacity-90">{children}</div>}
            </div>
          </div>
          {!inline && showCloseButton && onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              className={`${variantConfig.iconColor} hover:opacity-80 transition-opacity ml-4 p-0 h-auto min-h-0 min-w-0 hover:bg-transparent`}
            >
              <X size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (inline) {
    return Content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      {Content}
    </div>
  );
}

// Hook para usar el componente Alert
interface UseAlertOptions {
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  autoClose?: number;
  showCloseButton?: boolean;
}

export function useAlert() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseAlertOptions>({
    title: "",
    message: "",
  });

  const showAlert = useCallback((options: UseAlertOptions) => {
    setConfig(options);
    setIsOpen(true);
  }, []);

  const hideAlert = useCallback(() => {
    setIsOpen(false);
  }, []);

  const AlertComponent = (
    <Alert
      isOpen={isOpen}
      onClose={hideAlert}
      title={config.title}
      message={config.message}
      variant={config.variant}
      autoClose={config.autoClose}
      showCloseButton={config.showCloseButton}
    />
  );

  return {
    showAlert,
    hideAlert,
    Alert: AlertComponent,
  };
}
