"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useHomeData } from "@/hooks/useHomeData";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const { home } = useHomeData();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isAdmin = pathname?.startsWith("/admin");

  // Determine current page for header
  const getCurrentPage = () => {
    if (pathname === "/") {
      return "inicio";
    }
    if (pathname?.startsWith("/productos")) {
      return "productos";
    }
    if (pathname?.startsWith("/contacto")) {
      return "contacto";
    }
    if (pathname?.startsWith("/favoritos")) {
      return "favoritos";
    }
    if (pathname?.startsWith("/carrito")) {
      return "carrito";
    }
    return "";
  };

  if (!isHydrated) {
    // Durante SSR, renderizar sin header/footer para evitar mismatch
    return <>{children}</>;
  }

  if (isAdmin) {
    // No header/footer on admin routes (login and admin area manage its own chrome)
    return <>{children}</>;
  }

  return (
    <>
      <Header currentPage={getCurrentPage()} />
      <div className="flex-grow">{children}</div>
      <Footer home={home} />
    </>
  );
}
