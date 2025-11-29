"use client";

import AdminAuthWrapper from "@/components/admin/AdminAuthWrapper";
import SessionProvider from "@/components/providers/SessionProvider";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  dashboard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  ),
  product: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  ),
  category: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  order: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  pending: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  tracking: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  logistics: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  metrics: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  user: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  support: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  ),
};

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

const SidebarLink = ({
  link,
  isSidebarOpen,
  isActive,
  onClick,
}: {
  link: { name: string; href: string; icon: string };
  isSidebarOpen: boolean;
  isActive: boolean;
  onClick: () => void;
}) => (
  <li className={isSidebarOpen ? "w-full" : "flex justify-center"}>
    <Link
      href={link.href}
      onClick={onClick}
      className={`flex items-center ${
        isSidebarOpen ? "gap-3 px-4 py-3" : "justify-center p-3"
      } rounded-lg transition-colors text-base font-medium cursor-pointer ${
        isActive
          ? "surface-secondary text-primary"
          : "hover:surface-secondary hover:text-primary"
      }`}
    >
      <span
        className={`shrink-0 flex items-center justify-center ${isActive ? "text-primary" : ""}`}
      >
        {iconMap[link.icon]}
      </span>
      {isSidebarOpen && <span>{link.name}</span>}
    </Link>
  </li>
);

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);
  const closeSidebar = () => isMobile && setIsSidebarOpen(false);

  const navLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
    { name: "Productos", href: "/admin/productos", icon: "product" },
    { name: "Categorías", href: "/admin/categorias", icon: "category" },
    { name: "Pedidos", href: "/admin/pedidos", icon: "order" },
    {
      name: "Pedidos Pendientes",
      href: "/admin/pedidos/pendientes",
      icon: "pending",
    },
    { name: "Tracking", href: "/admin/tracking", icon: "tracking" },
    { name: "Logística", href: "/admin/logistica", icon: "logistics" },
    { name: "Métricas", href: "/admin/metricas", icon: "metrics" },
    { name: "Usuarios", href: "/admin/usuarios", icon: "user" },
    { name: "Soporte", href: "/admin/soporte", icon: "support" },
  ];

  return (
    <SessionProvider>
      <AdminAuthWrapper>
        <div className="flex h-screen surface relative overflow-x-hidden">
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isMobile && isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={closeSidebar}
              />
            )}
          </AnimatePresence>

          {/* Sidebar */}
          <AnimatePresence mode="wait">
            {(!isMobile || isSidebarOpen) && (
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
                className={`
              ${isSidebarOpen ? "w-64" : "w-18"}
              ${isMobile ? "fixed right-0" : "relative"}
              surface border-r border-muted flex flex-col z-50 h-full shadow-lg
              ${isSidebarOpen ? "items-stretch" : "items-center"}
            `}
              >
                {/* Header */}
                <div
                  className={`p-4 border-b border-muted flex ${
                    isSidebarOpen
                      ? "items-center justify-between"
                      : "flex-col items-center justify-center gap-4"
                  }`}
                >
                  <div
                    className={
                      isSidebarOpen
                        ? "flex items-center gap-2"
                        : "flex flex-col items-center"
                    }
                  >
                    <div className="h-10 w-10 surface rounded-full flex items-center justify-center text-primary text-xl font-bold">
                      R
                    </div>
                    {isSidebarOpen && (
                      <span className="font-bold text-xl ml-2">Rastuci</span>
                    )}
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-full hover-surface focus:outline-none transition-colors ${
                      isSidebarOpen ? "" : "mt-2"
                    } cursor-pointer`}
                  >
                    {isSidebarOpen ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {/* Navigation */}
                <nav
                  className={`flex-1 overflow-y-auto mt-4 ${
                    isSidebarOpen ? "" : "flex flex-col items-center"
                  }`}
                >
                  <ul
                    className={`${isSidebarOpen ? "px-2" : "px-0"} space-y-1 w-full`}
                  >
                    {navLinks.map((link) => (
                      <SidebarLink
                        key={link.href}
                        link={link}
                        isSidebarOpen={isSidebarOpen}
                        isActive={isNavActive(pathname, link.href)}
                        onClick={closeSidebar}
                      />
                    ))}
                  </ul>
                </nav>
                {/* Logout */}
                <div
                  className={`p-4 border-t border-muted mt-2 ${
                    isSidebarOpen ? "" : "flex flex-col items-center"
                  }`}
                >
                  <button
                    onClick={async () => {
                      // Usar directamente NextAuth signOut para terminar la sesión.
                      try {
                        await signOut({ callbackUrl: "/admin" });
                      } catch {
                        // Fallback simple: redirigir al login

                        window.location.href = "/admin";
                      }
                    }}
                    className={`flex items-center ${
                      isSidebarOpen ? "w-full px-4 py-3" : "justify-center p-3"
                    } rounded-lg transition-colors text-error font-semibold gap-3 cursor-pointer hover-surface hover:text-primary`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {isSidebarOpen && <span>Cerrar sesión</span>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main content */}
          <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
            {/* Mobile Header */}
            {isMobile && (
              <div className="surface shadow-sm border-b border-muted p-3 flex items-center justify-between lg:hidden">
                <h1 className="text-lg font-semibold text-content-primary">
                  Panel de Administración
                </h1>
                <button onClick={toggleSidebar} className="btn-ghost">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
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
