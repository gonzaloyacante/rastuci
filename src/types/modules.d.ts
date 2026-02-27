// Declaraciones de módulos globales para ayudar a TypeScript
declare module "@/app/checkout/components" {
  export { default as BillingStep } from "@/app/checkout/components/BillingStep";
  export { default as CustomerInfoStep } from "@/app/checkout/components/CustomerInfoStep";
  export { default as OrderConfirmation } from "@/app/checkout/components/OrderConfirmation";
  export { default as PaymentStep } from "@/app/checkout/components/PaymentStep";
  export { default as ReviewStep } from "@/app/checkout/components/ReviewStep";
  export { default as ShippingStep } from "@/app/checkout/components/ShippingStep";
}
