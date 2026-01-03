import type { Meta, StoryObj } from "@storybook/nextjs";
import { OrderSummaryCard } from "../../../components/checkout/OrderSummaryCard";
import type { ProvinceCode } from "@/lib/constants";

const meta: Meta<typeof OrderSummaryCard> = {
  title: "Checkout/OrderSummaryCard",
  component: OrderSummaryCard,
  tags: ["autodocs"],
  argTypes: {
    onEditStep: { action: "editStep" },
  },
};

export default meta;
type Story = StoryObj<typeof OrderSummaryCard>;

const mockItems = [
  {
    id: "p1",
    name: "Premium T-Shirt",
    price: 25000,
    quantity: 2,
    size: "L",
    color: "Black",
    image: "https://placehold.co/100x100?text=T-Shirt", // Mock image
  },
  {
    id: "p2",
    name: "Running Shoes",
    price: 120000,
    salePrice: 95000,
    onSale: true,
    quantity: 1,
    size: "42",
    color: "White/Blue",
    image: "https://placehold.co/100x100?text=Shoes",
  },
];

const mockCustomer = {
  name: "Gonzalo Yacante",
  email: "gonzalo@example.com",
  phone: "+54 9 11 1234 5678",
  address: "Av. Corrientes 1234",
  city: "CABA",
  province: "Buenos Aires",
  postalCode: "1043",
};

const mockShipping = {
  id: "agency",
  name: "Retiro en Correo",
  description: "Sucursal Correo Argentino",
  price: 4500,
  estimatedDays: "3-5 días hábiles",
};

const mockAgency = {
  id: "ag1",
  name: "Sucursal Centro",
  code: "CEN01",
  location: {
    address: {
      streetName: "Av. Corrientes",
      streetNumber: "1234",
      city: "CABA",
      postalCode: "1043",
      province: "Buenos Aires",
      provinceCode: "B" as ProvinceCode,
      country: "Argentina",
    },
    latitude: "-34.6037",
    longitude: "-58.3816",
  },
  hours: {
    weekdays: { start: "0900", end: "1800" },
  },
  services: { packageReception: true, pickupAvailability: true },
  type: "agency" as const,
  manager: "Juan Pérez",
  email: "centro@correoargentino.com.ar",
  phone: "+54 11 4000-0000",
  status: "active" as const,
};

export const Default: Story = {
  args: {
    items: mockItems,
    customerInfo: mockCustomer,
    shippingOption: mockShipping,
    paymentMethod: {
      id: "card",
      name: "Tarjeta de Crédito",
      description: "Visa, Mastercard",
    },
    subtotal: 145000,
    shippingCost: 4500,
    discount: 25000,
    total: 124500,
    agency: mockAgency as unknown as Parameters<typeof OrderSummaryCard>[0]["agency"],
  },
};

export const Simple: Story = {
  args: {
    items: [mockItems[0]],
    customerInfo: mockCustomer,
    shippingOption: {
      ...mockShipping,
      id: "home",
      name: "Envío a Domicilio",
      price: 8000,
    },
    paymentMethod: {
      id: "cash",
      name: "Efectivo",
      description: "Contra a entrega",
    },
    subtotal: 50000,
    shippingCost: 8000,
    discount: 0,
    total: 58000,
    agency: null,
  },
};
