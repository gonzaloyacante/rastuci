"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

// Implementación simple de debounce específica para CheckoutData
function createDebounce(
  func: (data: CheckoutData) => void,
  wait: number
): ((data: CheckoutData) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;

  const debounced = ((data: CheckoutData) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(data), wait);
  }) as ((data: CheckoutData) => void) & { cancel: () => void };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

interface CheckoutData {
  customerInfo?: Record<string, unknown>;
  selectedShippingOption?: Record<string, unknown>;
  selectedPaymentMethod?: string;
  cardData?: Record<string, unknown>;
  currentStep?: number;
}

interface AutoSaveOptions {
  key?: string;
  debounceMs?: number;
  enabled?: boolean;
  onSave?: (data: CheckoutData) => void;
  onRestore?: (data: CheckoutData) => void;
}

export function useCheckoutAutoSave(
  data: CheckoutData,
  options: AutoSaveOptions = {}
) {
  const {
    key = "checkout-autosave",
    debounceMs = 1000,
    enabled = true,
    onSave,
    onRestore,
  } = options;

  const isInitialized = useRef(false);
  const lastSavedData = useRef<string>("");

  // Función para guardar datos en localStorage
  const saveToStorage = useCallback(
    (dataToSave: CheckoutData) => {
      if (!enabled) {
        return;
      }

      try {
        // Filtrar datos sensibles antes de guardar
        const sanitizedData = {
          ...dataToSave,
          cardData: dataToSave.cardData
            ? {
                ...dataToSave.cardData,
                cardNumber: "", // No guardar número de tarjeta
                securityCode: "", // No guardar CVV
                cardholderName: dataToSave.cardData.cardholderName || "",
              }
            : undefined,
        };

        const serializedData = JSON.stringify(sanitizedData);

        // Solo guardar si los datos han cambiado
        if (serializedData !== lastSavedData.current) {
          localStorage.setItem(key, serializedData);
          lastSavedData.current = serializedData;
          onSave?.(sanitizedData);

          // Agregar timestamp
          localStorage.setItem(`${key}-timestamp`, Date.now().toString());
        }
      } catch (error) {
        logger.warn("Error saving checkout data:", { data: error });
      }
    },
    [enabled, key, onSave]
  );

  // Función debounced para guardar
  const debouncedSave = useCallback(() => {
    return createDebounce(saveToStorage, debounceMs);
  }, [saveToStorage, debounceMs])();

  // Función para limpiar datos guardados
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}-timestamp`);
      lastSavedData.current = "";
    } catch (error) {
      logger.warn("Error clearing checkout data:", { data: error });
    }
  }, [key]);

  // Función para restaurar datos
  const restoreFromStorage = useCallback(() => {
    if (!enabled) {
      return null;
    }

    try {
      const savedData = localStorage.getItem(key);
      const timestamp = localStorage.getItem(`${key}-timestamp`);

      if (savedData && timestamp) {
        const savedTime = parseInt(timestamp);
        const now = Date.now();
        const hourInMs = 60 * 60 * 1000;

        // Solo restaurar si los datos son de menos de 1 hora
        if (now - savedTime < hourInMs) {
          const parsedData = JSON.parse(savedData);
          onRestore?.(parsedData);
          return parsedData;
        } else {
          // Limpiar datos antiguos
          clearSavedData();
        }
      }
    } catch (error) {
      logger.warn("Error restoring checkout data:", { data: error });
    }

    return null;
  }, [enabled, key, onRestore, clearSavedData]);

  // Verificar si hay datos guardados
  const hasSavedData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(key);
      const timestamp = localStorage.getItem(`${key}-timestamp`);

      if (savedData && timestamp) {
        const savedTime = parseInt(timestamp);
        const now = Date.now();
        const hourInMs = 60 * 60 * 1000;

        return now - savedTime < hourInMs;
      }
    } catch (error) {
      logger.warn("Error checking saved data:", { data: error });
    }

    return false;
  }, [key]);

  // Efecto para auto-guardar cuando los datos cambien
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }

    if (enabled && data) {
      debouncedSave(data);
    }

    // Cleanup function para cancelar debounce pendiente
    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

  // Efecto para limpiar al completar el checkout
  useEffect(() => {
    // Si llegamos al paso de confirmación, limpiar datos guardados
    if (data.currentStep === 4) {
      // CONFIRMATION step
      clearSavedData();
    }
  }, [data.currentStep, clearSavedData]);

  // Efecto para limpiar al cerrar/recargar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Guardar inmediatamente antes de cerrar
      if (enabled && data) {
        saveToStorage(data);
      }
    };

    const handleVisibilityChange = () => {
      // Guardar cuando la página se oculta
      if (document.visibilityState === "hidden" && enabled && data) {
        saveToStorage(data);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, data, saveToStorage]);

  return {
    restoreFromStorage,
    clearSavedData,
    hasSavedData,
    saveNow: () => saveToStorage(data),
  };
}

// Hook para mostrar notificación de auto-guardado
export function useAutoSaveNotification() {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const showSaveNotification = useCallback(
    (message = "Progreso guardado automáticamente") => {
      setNotificationMessage(message);
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    },
    []
  );

  return {
    showNotification,
    notificationMessage,
    showSaveNotification,
  };
}
