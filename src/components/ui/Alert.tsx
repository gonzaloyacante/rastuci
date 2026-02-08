"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { Button } from "./Button";

interface AlertProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  variant?: "info" | "success" | "warning" | "error";
  icon?: ReactNode;
  autoClose?: number; // milliseconds
  showCloseButton?: boolean;
  inline?: boolean;
  children?: ReactNode;
  className?: string; // Added className
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

export function Alert({
  isOpen = true,
  onClose,
  title,
  message,
  variant = "info",
  icon,
  autoClose,
  showCloseButton = true,
  inline = true,
  children,
  className = "",
}: AlertProps) {
  const variantConfig = variantStyles[variant];
  const IconComponent = icon || variantConfig.defaultIcon;

  // Manejo de auto-cierre si no es inline (modal style)
  useEffect(() => {
    if (!inline && isOpen && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, autoClose, onClose, inline]);

  if (!isOpen) return null;

  const Content = (
    <div
      className={`
          relative w-full rounded-lg border p-4
          ${variantConfig.bgColor} ${variantConfig.textColor}
          ${inline ? "" : "shadow-2xl max-w-md mx-auto border-2 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"}
          ${className}
        `}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* Icon Wrapper */}
        <div className={`shrink-0 ${variantConfig.iconColor} mt-0.5`}>
          {React.isValidElement(IconComponent)
            ? IconComponent
            : IconComponent &&
              React.createElement(IconComponent as React.ElementType, {
                size: 20,
              })}
        </div>

        {/* Content Wrapper */}
        <div className="flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">
              {title}
            </h5>
          )}
          {message && <div className="text-sm opacity-90">{message}</div>}
          {children && <div className="text-sm opacity-90">{children}</div>}
        </div>

        {/* Close Button (only for interactive/non-inline or explicitly requested) */}
        {!inline && showCloseButton && onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            className={`${variantConfig.iconColor} hover:opacity-80 transition-opacity absolute right-2 top-2 p-0 h-6 w-6 hover:bg-transparent`}
          >
            <X size={16} />
          </Button>
        )}
      </div>
    </div>
  );

  if (inline) {
    return Content;
  }

  // Modal overlay wrapper
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      {Content}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`mb-1 font-medium leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}

// Hook para usar el componente Alert Programáticamente
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
      inline={false} // Hook always triggers modal style
    />
  );

  return {
    showAlert,
    hideAlert,
    Alert: AlertComponent,
  };
}
