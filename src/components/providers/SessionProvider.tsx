"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider 
      // Configuración optimizada para persistencia
      refetchInterval={5 * 60} // Refrescar cada 5 minutos
      refetchOnWindowFocus={true} // Refrescar al enfocar ventana
      refetchWhenOffline={false} // No refrescar cuando esté offline
    >
      {children}
    </NextAuthSessionProvider>
  );
}
