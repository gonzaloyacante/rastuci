import { Suspense } from "react";

import AnalyticsInit from "@/components/analytics/AnalyticsInit";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/context/CartContext";
import { ComparisonProvider } from "@/context/ComparisonContext";
import { WishlistProvider } from "@/context/WishlistContext";

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
            <ComparisonProvider>
              <Suspense fallback={null}>
                <AnalyticsInit />
              </Suspense>
              {children}
            </ComparisonProvider>
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </ThemeProvider>
  );
}
