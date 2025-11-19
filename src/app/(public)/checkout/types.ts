// Tipos para los pasos del checkout
export interface CustomerInfoStepProps {
  onNext: () => void;
}

export interface ShippingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export interface PaymentStepProps {
  onNext: () => void;
  onBack: () => void;
}

export interface BillingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export interface ReviewStepProps {
  onPlaceOrder: () => Promise<void>;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export interface OrderConfirmationProps {
  orderId?: string;
}
