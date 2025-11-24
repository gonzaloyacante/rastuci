"use client";

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

import SessionProvider from "@/components/providers/SessionProvider";

import { Session } from "next-auth";

export default function AppProviders({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <WishlistProvider>
          <CartProvider>
            <ToastProvider>{children}</ToastProvider>
          </CartProvider>
        </WishlistProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
