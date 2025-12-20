import { JSX } from "react";
import toast, { ToastOptions } from "react-hot-toast";

/**
 * Wrapper seguro para react-hot-toast que evita problemas de HMR y ESM
 * al aisolar la importación directa en componentes de UI.
 */
export const useHotToast = () => {
  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, options);
  };

  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, options);
  };

  const loading = (message: string, options?: ToastOptions) => {
    return toast.loading(message, options);
  };

  const dismiss = (toastId?: string) => {
    return toast.dismiss(toastId);
  };

  const custom = (
    renderer: (t: any) => JSX.Element,
    options?: ToastOptions
  ) => {
    return toast.custom(renderer, options);
  };

  return {
    success,
    error,
    loading,
    dismiss,
    custom,
    toast, // Acceso directo por si acaso
  };
};
