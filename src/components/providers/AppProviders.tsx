import AnalyticsInit from "@/components/analytics/AnalyticsInit";
import SessionProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Suspense } from "react";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <AnalyticsInit />
              </Suspense>
              {children}
              <Toaster position="top-right" reverseOrder={false} />
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
