"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import React from "react";

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
      stroke="currentColor">
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
      stroke="currentColor">
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
      stroke="currentColor">
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
      stroke="currentColor">
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
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  user: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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
      } rounded-lg transition-colors text-base font-medium font-bold cursor-pointer`}
      style={isActive ? { background: "#fce7f3", color: "#e91e63" } : undefined}
      onMouseOver={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "#fdf2f8";
          (e.currentTarget as HTMLElement).style.color = "#e91e63";
        }
      }}
      onMouseOut={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "";
          (e.currentTarget as HTMLElement).style.color = "";
        }
      }}>
      <span
        className={`flex-shrink-0 flex items-center justify-center`}
        style={isActive ? { color: "#e91e63" } : {}}>
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

  if (pathname === "/admin") return <>{children}</>;

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
    { name: "Usuarios", href: "/admin/usuarios", icon: "user" },
  ];

  return (
    <>
      {/* Forzar a Tailwind a incluir todas las variantes de rosa */}
      <div className="hidden">
        bg-primary-50 bg-primary-100 bg-primary-200 bg-primary-300
        bg-primary-400 bg-primary-500 bg-primary-600 bg-primary-700
        bg-primary-800 bg-primary-900 text-primary-50 text-primary-100
        text-primary-200 text-primary-300 text-primary-400 text-primary-500
        text-primary-600 text-primary-700 text-primary-800 text-primary-900
        hover:bg-primary-50 hover:text-primary-500
      </div>
      <div className="flex h-screen bg-[#F7F7FA] relative overflow-x-hidden">
        {/* Sidebar */}
        <div
          className={`
            ${isSidebarOpen ? "w-64" : "w-18"}
            ${
              isMobile
                ? isSidebarOpen
                  ? "fixed right-0"
                  : "hidden"
                : "relative"
            }
            bg-white border-r border-[#ECECEC] transition-all duration-300 ease-in-out flex flex-col z-50 h-full shadow-sm
            ${isSidebarOpen ? "items-stretch" : "items-center"}
          `}>
          {/* Header */}
          <div
            className={`p-4 border-b border-[#ECECEC] flex ${
              isSidebarOpen
                ? "items-center justify-between"
                : "flex-col items-center justify-center gap-4"
            }`}>
            <div
              className={
                isSidebarOpen
                  ? "flex items-center gap-2"
                  : "flex flex-col items-center"
              }>
              <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 text-xl font-bold">
                R
              </div>
              {isSidebarOpen && (
                <span className="font-bold text-xl text-[#222] ml-2">
                  Rastuci
                </span>
              )}
            </div>
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full hover:bg-primary-50 focus:outline-none transition-colors ${isSidebarOpen ? "" : "mt-2"} cursor-pointer`}>
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
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
                  stroke="currentColor">
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
            }`}>
            <ul
              className={`${isSidebarOpen ? "px-2" : "px-0"} space-y-1 w-full`}>
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
            className={`p-4 border-t border-[#ECECEC] mt-2 ${
              isSidebarOpen ? "" : "flex flex-col items-center"
            }`}>
            <button
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className={`flex items-center ${isSidebarOpen ? "w-full px-4 py-3" : "justify-center p-3"} rounded-lg transition-colors text-[#E53935] font-medium gap-3 cursor-pointer`}
              style={{ fontWeight: 600 }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fdf2f8";
                (e.currentTarget as HTMLElement).style.color = "#e91e63";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.background = "";
                (e.currentTarget as HTMLElement).style.color = "#E53935";
              }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
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
        </div>
        {/* Main content */}
        <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto">
          {/* Mobile Header */}
          {isMobile && (
            <div className="bg-white shadow-sm border-b border-gray-200 p-3 flex items-center justify-between lg:hidden">
              <h1 className="text-lg font-semibold text-content-primary">
                Panel de Administración
              </h1>
              <button onClick={toggleSidebar} className="btn-ghost">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
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
    </>
  );
}
