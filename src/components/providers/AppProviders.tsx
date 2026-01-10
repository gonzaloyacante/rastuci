import SessionProvider from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

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
              {children}
              <Toaster position="top-right" reverseOrder={false} />
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
