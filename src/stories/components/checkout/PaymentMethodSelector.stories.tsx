import type { Meta, StoryObj } from "@storybook/nextjs";
import { PaymentMethodSelector } from "../../../components/checkout/PaymentMethodSelector";
import React from "react";

const meta: Meta<typeof PaymentMethodSelector> = {
  title: "Checkout/PaymentMethodSelector",
  component: PaymentMethodSelector,
  tags: ["autodocs"],
  argTypes: {
    onMethodChange: { action: "changed" },
  },
};

export default meta;
type Story = StoryObj<typeof PaymentMethodSelector>;

// Mock data
const mockMethods = [
  {
    id: "credit-card",
    name: "Tarjeta de Crédito",
    description: "Pagá en cuotas",
    icon: "credit-card",
  },
  {
    id: "transfer",
    name: "Transferencia Bancaria",
    description: "10% de descuento",
    icon: "banknote",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Saldo en cuenta o tarjetas guardadas",
    icon: "wallet",
  },
];

// Decorator to mock fetch
// Note: In a real app, use MSW. Here we monkey-patch fetch for the story context.
const FetchDecorator = (Story: any) => {
  React.useEffect(() => {
    const originalFetch = global.fetch;
    global.fetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      if (url.toString().includes("/api/settings/payment-methods")) {
        return {
          json: async () => ({ success: true, data: mockMethods }),
        } as Response;
      }
      return originalFetch(url, init);
    };
    return () => {
      global.fetch = originalFetch;
    };
  }, []);
  return <Story />;
};

export const Default: Story = {
  args: {
    selectedMethod: "credit-card",
  },
  decorators: [FetchDecorator],
};

export const WithFilter: Story = {
  args: {
    selectedMethod: "mercadopago",
    allowedMethods: ["mercadopago", "transfer"],
  },
  decorators: [FetchDecorator],
};
