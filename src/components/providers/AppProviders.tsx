import AnalyticsInit from "@/components/analytics/AnalyticsInit";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Suspense } from "react";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <AnalyticsInit />
            </Suspense>
            {children}
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
