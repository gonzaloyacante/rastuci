"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
  truncateMiddle?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items = [],
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 muted" />,
  className = "",
  maxItems = 5,
  truncateMiddle = true,
}) => {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname if no items provided
  const generatedItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items.length > 0) {
      return items;
    }

    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems: BreadcrumbItem[] = [];

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;

      // Convert segment to readable label
      let label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      // Special cases for common segments
      const specialLabels: Record<string, string> = {
        admin: "Administración",
        productos: "Productos",
        categorias: "Categorías",
        usuarios: "Usuarios",
        pedidos: "Pedidos",
        perfil: "Perfil",
        configuracion: "Configuración",
        nuevo: "Nuevo",
        editar: "Editar",
        ver: "Ver",
      };

      if (specialLabels[segment.toLowerCase()]) {
        label = specialLabels[segment.toLowerCase()];
      }

      breadcrumbItems.push({
        label,
        href,
        isActive: isLast,
      });
    });

    return breadcrumbItems;
  }, [pathname, items]);

  // Handle truncation
  const displayItems = React.useMemo(() => {
    if (generatedItems.length <= maxItems) {
      return generatedItems;
    }

    if (!truncateMiddle) {
      return generatedItems.slice(-maxItems);
    }

    // Show first 2, last 2, and ellipsis in middle
    const firstItems = generatedItems.slice(0, 2);
    const lastItems = generatedItems.slice(-2);

    return [
      ...firstItems,
      { label: "...", href: undefined, isActive: false },
      ...lastItems,
    ];
  }, [generatedItems, maxItems, truncateMiddle]);

  // Don't render if no items
  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li>
            <Link
              href="/"
              className="flex items-center muted hover:text-primary transition-colors"
              aria-label="Inicio"
            >
              <Home className="w-4 h-4" />
            </Link>
          </li>
        )}

        {displayItems.map((item) => (
          <li
            key={`breadcrumb-${item.href}-${item.label}`}
            className="flex items-center"
          >
            <span className="mx-2" aria-hidden="true">
              {separator}
            </span>

            {item.href && !item.isActive ? (
              <Link
                href={item.href}
                className="muted hover:text-primary transition-colors text-sm font-medium"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ) : (
              <span
                className={`text-sm font-medium ${
                  item.isActive ? "text-primary" : "text-primary"
                }`}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Hook for generating breadcrumbs
export const useBreadcrumbs = (customItems?: BreadcrumbItem[]) => {
  const pathname = usePathname();

  return React.useMemo(() => {
    if (customItems) {
      return customItems;
    }

    const segments = pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [];

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;

      let label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

      const specialLabels: Record<string, string> = {
        admin: "Administración",
        productos: "Productos",
        categorias: "Categorías",
        usuarios: "Usuarios",
        pedidos: "Pedidos",
        perfil: "Perfil",
        configuracion: "Configuración",
        nuevo: "Nuevo",
        editar: "Editar",
        ver: "Ver",
      };

      if (specialLabels[segment.toLowerCase()]) {
        label = specialLabels[segment.toLowerCase()];
      }

      items.push({
        label,
        href,
        isActive: isLast,
      });
    });

    return items;
  }, [pathname, customItems]);
};

// Utility function to create breadcrumb items
export const createBreadcrumbItem = (
  label: string,
  href?: string,
  icon?: React.ReactNode
): BreadcrumbItem => ({
  label,
  href,
  icon,
});

// Common breadcrumb patterns
export const breadcrumbPatterns = {
  productDetail: (productName: string, categoryName?: string) => [
    createBreadcrumbItem("Inicio", "/"),
    createBreadcrumbItem("Productos", "/productos"),
    ...(categoryName
      ? [
          createBreadcrumbItem(
            categoryName,
            `/productos?categoria=${categoryName}`
          ),
        ]
      : []),
    createBreadcrumbItem(productName),
  ],

  adminProductList: () => [
    createBreadcrumbItem("Administración", "/admin"),
    createBreadcrumbItem("Productos", "/admin/productos"),
  ],

  adminProductEdit: (productName: string) => [
    createBreadcrumbItem("Administración", "/admin"),
    createBreadcrumbItem("Productos", "/admin/productos"),
    createBreadcrumbItem("Editar"),
    createBreadcrumbItem(productName),
  ],

  adminCategoryList: () => [
    createBreadcrumbItem("Administración", "/admin"),
    createBreadcrumbItem("Categorías", "/admin/categorias"),
  ],

  userProfile: () => [
    createBreadcrumbItem("Inicio", "/"),
    createBreadcrumbItem("Perfil", "/perfil"),
  ],

  checkout: () => [
    createBreadcrumbItem("Inicio", "/"),
    createBreadcrumbItem("Productos", "/productos"),
    createBreadcrumbItem("Carrito", "/carrito"),
    createBreadcrumbItem("Checkout"),
  ],
};

// Breadcrumb component with schema.org structured data
export const BreadcrumbsWithSchema: React.FC<BreadcrumbsProps> = (props) => {
  const items = useBreadcrumbs(props.items);

  // Generate structured data for breadcrumbs
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items
      .filter((item) => item.href)
      .map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        item: `${typeof window !== "undefined" ? window.location.origin : ""}${item.href}`,
      })),
  };

  return (
    <>
      <Breadcrumbs {...props} />
      <script
        type="application/ld+json"
         
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
    </>
  );
};
