"use client";

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import React, { ReactNode, useCallback, useEffect, useState } from "react";

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  icon?: ReactNode;
  autoClose?: number; // milliseconds
  showCloseButton?: boolean;
}

const variantStyles = {
  info: {
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-900",
    iconColor: "text-blue-600",
    defaultIcon: Info,
  },
  success: {
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-900",
    iconColor: "text-green-600",
    defaultIcon: CheckCircle,
  },
  warning: {
    bgColor: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-900",
    iconColor: "text-yellow-600",
    defaultIcon: AlertTriangle,
  },
  error: {
    bgColor: "bg-red-50 border-red-200",
    textColor: "text-red-900",
    iconColor: "text-red-600",
    defaultIcon: AlertCircle,
  },
};

export default function Alert({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  icon,
  autoClose,
  showCloseButton = true,
}: AlertProps) {
  const variantConfig = variantStyles[variant];
  const IconComponent = icon || variantConfig.defaultIcon;

  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div
        className={`
          ${variantConfig.bgColor} ${variantConfig.textColor}
          rounded-lg shadow-2xl max-w-md w-full mx-auto border-2
          animate-in zoom-in-95 slide-in-from-bottom-2 duration-300
        `}
        role="alert"
        aria-labelledby="alert-title"
        aria-describedby="alert-message"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`shrink-0 ${variantConfig.iconColor}`}>
                {React.isValidElement(IconComponent)
                  ? IconComponent
                  : IconComponent &&
                    React.createElement(IconComponent as React.ElementType, {
                      size: 24,
                    })}
              </div>
              <div>
                <h3
                  id="alert-title"
                  className="text-lg font-semibold leading-6"
                >
                  {title}
                </h3>
                <p id="alert-message" className="text-sm mt-2 opacity-90">
                  {message}
                </p>
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`${variantConfig.iconColor} hover:opacity-80 transition-opacity ml-4`}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
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
