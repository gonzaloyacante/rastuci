"use client";

import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import SessionProvider from "@/components/providers/SessionProvider";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  Clock,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  Tag,
  Terminal,
  User,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
  { name: "Productos", href: "/admin/productos", icon: ShoppingBag },
  { name: "Categorías", href: "/admin/categorias", icon: Tag },
  { name: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
  {
    name: "Pedidos Pendientes",
    href: "/admin/pedidos/pendientes",
    icon: Clock,
  },
  { name: "Tracking", href: "/admin/tracking", icon: MapPin },
  { name: "Logística", href: "/admin/logistica", icon: Terminal },
  { name: "Métricas", href: "/admin/metricas", icon: BarChart3 },
  { name: "Usuarios", href: "/admin/usuarios", icon: User },
  { name: "Soporte", href: "/admin/soporte", icon: MessageCircle },
  { name: "Configuración", href: "/admin/configuracion", icon: Settings },
] as const;

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/admin/pedidos") {
    return (
      pathname === "/admin/pedidos" ||
      (pathname.startsWith("/admin/pedidos/") &&
        !pathname.startsWith("/admin/pedidos/pendientes"))
    );
  }
  if (href === "/admin/pedidos/pendientes") {
    return (
      pathname === "/admin/pedidos/pendientes" ||
      pathname.startsWith("/admin/pedidos/pendientes/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

import { SidebarLink } from "@/components/admin/SidebarLink";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (pathname === "/admin")
    return <SessionProvider>{children}</SessionProvider>;

  const toggle = () => setIsOpen((o) => !o);
  const close = () => isMobile && setIsOpen(false);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/admin" });
    } catch {
      window.location.href = "/admin";
    }
  };

  return (
    <SessionProvider>
      <AdminAuthWrapper>
        <div className="flex h-screen surface relative overflow-x-hidden">
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isMobile && isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={close}
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <AnimatePresence mode="wait">
            {(!isMobile || isOpen) && (
              <motion.div
                initial={isMobile ? { x: "100%" } : false}
                animate={{ x: 0 }}
                exit={isMobile ? { x: "100%" } : { x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                className={`${isOpen ? "w-64 items-stretch" : "w-18 items-center"}
                  ${isMobile ? "fixed right-0" : "relative"}
                  surface border-r border-muted flex flex-col z-50 h-full shadow-lg`}
              >
                {/* Header */}
                <div
                  className={`p-4 border-b border-muted flex ${isOpen ? "items-center justify-between" : "flex-col items-center justify-center gap-4"}`}
                >
                  <div
                    className={
                      isOpen
                        ? "flex items-center gap-2"
                        : "flex flex-col items-center"
                    }
                  >
                    <div className="h-10 w-10 surface rounded-full flex items-center justify-center text-primary text-xl font-bold">
                      R
                    </div>
                    {isOpen && (
                      <span className="font-bold text-xl ml-2">Rastuci</span>
                    )}
                  </div>
                  <button
                    onClick={toggle}
                    className={`p-2 rounded-full hover-surface focus:outline-none cursor-pointer ${isOpen ? "" : "mt-2"}`}
                  >
                    {isOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>

                {/* Navigation */}
                <nav
                  className={`flex-1 overflow-y-auto mt-4 ${isOpen ? "" : "flex flex-col items-center"}`}
                >
                  <ul
                    className={`${isOpen ? "px-2" : "px-0"} space-y-1 w-full`}
                  >
                    {NAV_LINKS.map((link) => (
                      <SidebarLink
                        key={link.href}
                        link={link}
                        isOpen={isOpen}
                        isActive={isNavActive(pathname, link.href)}
                        onClick={close}
                      />
                    ))}
                  </ul>
                </nav>

                {/* Logout */}
                <div
                  className={`p-4 border-t border-muted mt-2 ${isOpen ? "" : "flex flex-col items-center"}`}
                >
                  <button
                    onClick={handleLogout}
                    className={`flex items-center ${isOpen ? "w-full px-4 py-3" : "justify-center p-3"}
                      rounded-lg transition-colors text-error font-semibold gap-3 cursor-pointer hover-surface hover:text-primary`}
                  >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {isOpen && <span>Cerrar sesión</span>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
            {isMobile && (
              <div className="surface shadow-sm border-b border-muted p-3 flex items-center justify-between lg:hidden">
                <h1 className="text-lg font-semibold text-content-primary">
                  Panel de Administración
                </h1>
                <button onClick={toggle} className="btn-ghost">
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            )}
            <main className="p-2 sm:p-3 lg:p-4">{children}</main>
          </div>
        </div>
      </AdminAuthWrapper>
    </SessionProvider>
  );
}
