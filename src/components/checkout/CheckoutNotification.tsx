"use client";

import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info, Loader2 } from 'lucide-react';

interface CheckoutNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const notificationConfig = {
  success: {
    icon: Check,
    bgColor: 'surface-secondary',
    borderColor: 'border-success',
    iconColor: 'text-success',
    titleColor: 'text-success',
    messageColor: 'text-success'
  },
  error: {
    icon: X,
    bgColor: 'surface-secondary',
    borderColor: 'border-error',
    iconColor: 'text-error',
    titleColor: 'text-error',
    messageColor: 'text-error'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'surface-secondary',
    borderColor: 'border-muted',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
    messageColor: 'muted'
  },
  info: {
    icon: Info,
    bgColor: 'surface-secondary',
    borderColor: 'border-primary',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
    messageColor: 'muted'
  },
  loading: {
    icon: Loader2,
    bgColor: 'surface-secondary',
    borderColor: 'border-primary',
    iconColor: 'text-primary',
    titleColor: 'text-primary',
    messageColor: 'muted'
  }
};

export function CheckoutNotification({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}: CheckoutNotificationProps) {
  const [show, setShow] = useState(false);
  const config = notificationConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      if (autoClose && type !== 'loading') {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(() => onClose?.(), 300);
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, autoClose, duration, onClose, type]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
      show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`
        max-w-sm w-full shadow-lg rounded-lg border-l-4 p-4
        ${config.bgColor} ${config.borderColor}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon 
              className={`w-5 h-5 ${config.iconColor} ${type === 'loading' ? 'animate-spin' : ''}`} 
            />
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${config.titleColor}`}>
              {title}
            </h3>
            {message && (
              <p className={`mt-1 text-sm ${config.messageColor}`}>
                {message}
              </p>
            )}
          </div>
          
          {onClose && type !== 'loading' && (
            <button
              onClick={() => {
                setShow(false);
                setTimeout(() => onClose(), 300);
              }}
              className={`ml-4 inline-flex muted hover:text-primary focus:outline-none`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Barra de progreso para auto-close */}
        {autoClose && type !== 'loading' && show && (
          <div className="mt-2 w-full bg-white/50 rounded-full h-1">
            <div 
              className={`h-1 rounded-full ${config.iconColor.replace('text-', 'bg-')}`}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
