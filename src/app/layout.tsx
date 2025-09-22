import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WishlistProvider } from "@/context/WishlistContext";
import SiteChrome from "@/components/layout/SiteChrome";
import { SkipLink } from "@/components/ui/SkipLink";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Rastuci - Ropa Infantil de Calidad",
    template: "%s | Rastuci",
  },
  description:
    "Descubre la mejor ropa infantil de calidad, comodidad y estilo para los más pequeños. Envíos a todo el país, 3 cuotas sin interés.",
  keywords: [
    "ropa infantil",
    "moda niños",
    "ropa bebé",
    "accesorios infantiles",
    "ropa de calidad",
  ],
  authors: [{ name: "Rastuci" }],
  creator: "Rastuci",
  publisher: "Rastuci",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://rastuci.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rastuci - Ropa Infantil de Calidad",
    description:
      "Descubre la mejor ropa infantil de calidad, comodidad y estilo para los más pequeños.",
    url: "https://rastuci.com",
    siteName: "Rastuci",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rastuci - Ropa Infantil",
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rastuci - Ropa Infantil de Calidad",
    description:
      "Descubre la mejor ropa infantil de calidad, comodidad y estilo para los más pequeños.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="var(--color-primary)" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <ThemeProvider>
          <WishlistProvider>
            <CartProvider>
              <ToastProvider>
                <div className="min-h-screen flex flex-col">
                  <SkipLink href="#main-content">
                    Saltar al contenido principal
                  </SkipLink>
                  <SkipLink href="#navigation">
                    Saltar a la navegación
                  </SkipLink>
                  <SiteChrome>
                    <main id="main-content" role="main" tabIndex={-1}>
                      {children}
                    </main>
                  </SiteChrome>
                </div>
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
