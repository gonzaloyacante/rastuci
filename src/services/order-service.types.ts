import { OrderStatus } from "@prisma/client";

import { OrderItemInput } from "@/types";

export interface OrderMetadata {
  tempOrderId?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerProvince?: string;
  customerPostalCode?: string;
  shippingAgencyCode?: string;
  shippingMethodId?: string;
  shippingMethodName?: string;
  shippingCost?: string | number;
  items: string | OrderItemInput[];
  discountPercent?: string | number;
  shipping?: string;
}

export type OrderUpdateData = {
  mpPaymentId: string;
  mpStatus: string;
  mappedStatus: OrderStatus;
  paymentMethod?: string;
};

export type ShippingFields = {
  shippingStreet: string | undefined;
  shippingCity: string | undefined;
  shippingProvince: string | undefined;
  shippingPostalCode: string | undefined;
  shippingAgencyCode: string | undefined;
  shippingMethodId: string | undefined;
};

export type ValidatedOrderItem = {
  productId: string;
  quantity: number;
  price: number;
  originalPrice: number;
  size?: string;
  color?: string;
};

export type CouponInput = {
  id: string;
  discount: number;
  discountType: string;
  minOrderTotal: number | null;
};
