import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "Rastuci - Premium Fashion & Lifestyle",
        short_name: "Rastuci",
        description:
            "Discover premium fashion and lifestyle products at Rastuci. Shop the latest trends with fast shipping and excellent customer service.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#e91e63",
        orientation: "portrait-primary",
        scope: "/",
        lang: "es",
        categories: ["shopping", "lifestyle"],
        icons: [
            {
                src: "/icons/icon-72x72.png",
                sizes: "72x72",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-128x128.png",
                sizes: "128x128",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-144x144.png",
                sizes: "144x144",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-152x152.png",
                sizes: "152x152",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
                purpose: "maskable any" as any,
            },
            {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable any" as any,
            },
        ],
        shortcuts: [
            {
                name: "Productos",
                short_name: "Productos",
                description: "Ver todos los productos",
                url: "/productos",
                icons: [
                    {
                        src: "/icons/shortcut-products.png",
                        sizes: "96x96",
                    },
                ],
            },
            {
                name: "Carrito",
                short_name: "Carrito",
                description: "Ver carrito de compras",
                url: "/carrito",
                icons: [
                    {
                        src: "/icons/shortcut-cart.png",
                        sizes: "96x96",
                    },
                ],
            },
            {
                name: "Favoritos",
                short_name: "Favoritos",
                description: "Ver productos favoritos",
                url: "/favoritos",
                icons: [
                    {
                        src: "/icons/shortcut-wishlist.png",
                        sizes: "96x96",
                    },
                ],
            },
            {
                name: "Mi Cuenta",
                short_name: "Cuenta",
                description: "Gestionar mi cuenta",
                url: "/cuenta",
                icons: [
                    {
                        src: "/icons/shortcut-account.png",
                        sizes: "96x96",
                    },
                ],
            },
        ],
        screenshots: [
            {
                src: "/screenshots/desktop-home.png",
                sizes: "1280x720",
                type: "image/png",
                form_factor: "wide",
                label: "Página de inicio en escritorio",
            },
            {
                src: "/screenshots/mobile-home.png",
                sizes: "375x667",
                type: "image/png",
                form_factor: "narrow",
                label: "Página de inicio en móvil",
            },
            {
                src: "/screenshots/products.png",
                sizes: "375x667",
                type: "image/png",
                form_factor: "narrow",
                label: "Catálogo de productos",
            },
            {
                src: "/screenshots/product-detail.png",
                sizes: "375x667",
                type: "image/png",
                form_factor: "narrow",
                label: "Detalle de producto",
            },
        ],
        related_applications: [],
        prefer_related_applications: false,
        protocol_handlers: [
            {
                protocol: "web+rastuci",
                url: "/share?url=%s",
            },
        ],
    };
}
