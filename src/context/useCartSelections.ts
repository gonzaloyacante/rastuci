import { Dispatch, SetStateAction, useState } from "react";

import { Agency } from "@/lib/correo-argentino-service";
import {
  BillingOption,
  CustomerInfo,
  DEFAULT_PAYMENT_METHOD,
  PaymentMethod,
  ShippingOption,
} from "@/types/cart";

export interface CartSelections {
  selectedShippingOption: ShippingOption | null;
  setSelectedShippingOption: Dispatch<SetStateAction<ShippingOption | null>>;
  selectedAgency: Agency | null;
  setSelectedAgency: Dispatch<SetStateAction<Agency | null>>;
  selectedPaymentMethod: PaymentMethod | null;
  setSelectedPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
  selectedBillingOption: BillingOption | null;
  setSelectedBillingOption: Dispatch<SetStateAction<BillingOption | null>>;
  customerInfo: CustomerInfo | null;
  setCustomerInfo: Dispatch<SetStateAction<CustomerInfo | null>>;
}

export function useCartSelections(): CartSelections {
  const [selectedShippingOption, setSelectedShippingOption] =
    useState<ShippingOption | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(DEFAULT_PAYMENT_METHOD);
  const [selectedBillingOption, setSelectedBillingOption] =
    useState<BillingOption | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  return {
    selectedShippingOption,
    setSelectedShippingOption,
    selectedAgency,
    setSelectedAgency,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    selectedBillingOption,
    setSelectedBillingOption,
    customerInfo,
    setCustomerInfo,
  };
}
