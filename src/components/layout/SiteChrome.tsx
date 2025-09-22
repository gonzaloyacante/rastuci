"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Determine current page for header
  const getCurrentPage = () => {
    if (pathname === "/") return "inicio";
    if (pathname?.startsWith("/productos")) return "productos";
    if (pathname?.startsWith("/contacto")) return "contacto";
    if (pathname?.startsWith("/favoritos")) return "favoritos";
    if (pathname?.startsWith("/carrito")) return "carrito";
    return "";
  };

  if (isAdmin) {
    // No header/footer on admin routes (login and admin area manage its own chrome)
    return <>{children}</>;
  }

  return (
    <>
      <Header currentPage={getCurrentPage()} />
      <div className="flex-grow">
        {children}
      </div>
      <Footer />
    </>
  );
}
