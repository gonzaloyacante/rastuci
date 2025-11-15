import { toast, ToastOptions } from "react-hot-toast";

// Enhanced toast configuration
interface CustomToastConfig extends ToastOptions {
  success?: ToastOptions;
  error?: ToastOptions;
  loading?: ToastOptions;
}

export const toastConfig: CustomToastConfig = {
  duration: 4000,
  position: "top-right",
  style: {
    background: "#363636",
    color: "#fff",
    fontSize: "14px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  success: {
    style: {
      background: "#10B981",
      color: "#fff",
    },
    icon: "✅",
  },
  error: {
    style: {
      background: "#EF4444",
      color: "#fff",
    },
    icon: "❌",
  },
  loading: {
    style: {
      background: "#3B82F6",
      color: "#fff",
    },
  },
};

// Enhanced notification functions
export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...toastConfig.success,
    ...options,
  });
};

export const showError = (message: string, options?: ToastOptions) => {
  return toast.error(message, {
    ...toastConfig.error,
    ...options,
  });
};

export const showInfo = (message: string, options?: ToastOptions) => {
  return toast(message, {
    ...toastConfig,
    ...options,
  });
};

export const showLoading = (
  message = "Cargando...",
  options?: ToastOptions
) => {
  return toast.loading(message, {
    ...toastConfig.loading,
    ...options,
  });
};

export const dismissToast = (toastId?: string) => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

// Promise-based notifications
export const showPromise = async <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  },
  options?: ToastOptions
) => {
  const toastId = showLoading(messages.loading, options);
  try {
    const result = await promise;
    dismissToast(toastId);
    showSuccess(messages.success, options);
    return result;
  } catch (error) {
    dismissToast(toastId);
    showError(messages.error, options);
    throw error;
  }
};

// Specialized notifications for common actions
export const notifications = {
  // Cart actions
  cart: {
    addItem: (productName: string) =>
      showSuccess(`"${productName}" agregado al carrito`),

    removeItem: (productName: string) =>
      showInfo(`"${productName}" eliminado del carrito`),

    updateQuantity: (productName: string, quantity: number) =>
      showInfo(`Cantidad de "${productName}" actualizada a ${quantity}`),

    clearCart: () => showInfo("Carrito vaciado"),
  },

  // Wishlist actions
  wishlist: {
    addItem: (productName: string) =>
      showSuccess(`"${productName}" agregado a favoritos`),

    removeItem: (productName: string) =>
      showInfo(`"${productName}" eliminado de favoritos`),
  },

  // Product actions
  product: {
    addToCart: (productName: string) =>
      showSuccess(`"${productName}" agregado al carrito`),

    purchaseSuccess: (productName: string) =>
      showSuccess(`¡Compra exitosa! "${productName}" será enviado pronto`),

    outOfStock: (productName: string) =>
      showError(`"${productName}" está agotado`),

    lowStock: (productName: string, available: number) =>
      showInfo(`Solo quedan ${available} unidades de "${productName}"`),
  },

  // Form actions
  form: {
    saveSuccess: (itemType: string) =>
      showSuccess(`${itemType} guardado exitosamente`),

    saveError: (itemType: string) => showError(`Error al guardar ${itemType}`),

    updateSuccess: (itemType: string) =>
      showSuccess(`${itemType} actualizado exitosamente`),

    updateError: (itemType: string) =>
      showError(`Error al actualizar ${itemType}`),

    deleteSuccess: (itemType: string) =>
      showSuccess(`${itemType} eliminado exitosamente`),

    deleteError: (itemType: string) =>
      showError(`Error al eliminar ${itemType}`),

    validationError: (field: string) =>
      showError(`Por favor completa el campo: ${field}`),
  },

  // API actions
  api: {
    loading: (action: string) => showLoading(`Procesando ${action}...`),

    success: (action: string) =>
      showSuccess(`${action} completado exitosamente`),

    error: (action: string, details?: string) =>
      showError(`Error al ${action}${details ? `: ${details}` : ""}`),
  },

  // Network actions
  network: {
    offline: () => showError("Sin conexión a internet. Verifica tu conexión."),

    timeout: (action: string) =>
      showError(`Tiempo agotado al ${action}. Intenta nuevamente.`),

    serverError: () =>
      showError("Error del servidor. Intenta nuevamente en unos minutos."),
  },
};

// Auto-dismiss notifications for specific actions
export const withAutoNotification = <T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  successMessage: string,
  errorMessage = "Error al procesar la solicitud"
) => {
  return async (...args: T): Promise<R> => {
    const toastId = showLoading("Procesando...");
    try {
      const result = await fn(...args);
      dismissToast(toastId);
      showSuccess(successMessage);
      return result;
    } catch (error) {
      dismissToast(toastId);
      showError(errorMessage);
      throw error;
    }
  };
};

// Progress notifications for multi-step operations
export const progressNotifications = {
  start: (message: string) => showLoading(message),
  update: (toastId: string, message: string) => {
    // Update existing loading toast
    toast.loading(message, { id: toastId });
  },
  success: (toastId: string, message: string) => {
    dismissToast(toastId);
    showSuccess(message);
  },
  error: (toastId: string, message: string) => {
    dismissToast(toastId);
    showError(message);
  },
};
