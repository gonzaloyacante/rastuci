import { useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastAction {
  type: string;
  payload?: Toast | string;
}

const initialState: ToastState = {
  toasts: []
};

let state = initialState;
const listeners: Array<(state: ToastState) => void> = [];

function dispatch(action: ToastAction) {
  switch (action.type) {
    case "ADD_TOAST":
      state = {
        ...state,
        toasts: [...state.toasts, action.payload as Toast]
      };
      break;
    case "REMOVE_TOAST":
      state = {
        ...state,
        toasts: state.toasts.filter(toast => toast.id !== action.payload)
      };
      break;
    case "CLEAR_TOASTS":
      state = {
        ...state,
        toasts: []
      };
      break;
  }
  
  listeners.forEach(listener => listener(state));
}

export function useToast() {
  const toast = useCallback(({
    title,
    description,
    variant = "default",
    duration = 3000,
    ...props
  }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    
    dispatch({
      type: "ADD_TOAST",
      payload: {
        id,
        title,
        description,
        variant,
        duration,
        ...props
      } as Toast
    });

    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", payload: id });
      }, duration);
    }

    return {
      id,
      dismiss: () => dispatch({ type: "REMOVE_TOAST", payload: id })
    };
  }, []);

  const dismiss = useCallback((toastId: string) => {
    dispatch({ type: "REMOVE_TOAST", payload: toastId });
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss
  };
}