// Lazy-loaded components for better performance
// Use these instead of direct imports for heavy components

export { LazyInventoryManagement } from "../admin/LazyInventoryManagement";
export { LazyReviewSystem } from "../reviews/LazyReviewSystem";
// export { LazyPaymentForm } from "../checkout/LazyPaymentForm";

// Re-export the LazyWrapper utilities
export {
  LazyWrapper,
  createLazyComponent,
  withLazyLoading,
} from "../ui/LazyWrapper";

// Additional lazy components can be added here as needed
