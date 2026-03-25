"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Inicio", exact: true },
  { href: "/productos", label: "Productos" },
  { href: "/contacto", label: "Contacto" },
];

function isActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_ITEMS.map(({ href, label, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors ${
              active
                ? "text-primary border-b-2 border-pink-500 pb-1"
                : "muted hover:text-primary"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  const mobileItems: NavItem[] = [
    ...NAV_ITEMS,
    { href: "/favoritos", label: "Favoritos" },
    { href: "/carrito", label: "Carrito" },
  ];

  return (
    <>
      {mobileItems.map(({ href, label, exact }) => {
        const active = isActive(pathname, href, exact);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`block py-2 text-sm font-medium transition-colors ${
              active
                ? "text-pink-600 font-semibold"
                : "muted hover:text-primary"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
