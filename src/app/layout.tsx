import AppProviders from "@/components/providers/AppProviders";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
// @ts-expect-error: import de CSS global como efecto secundario (declaración de módulo no encontrada)
import "./globals.css";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="var(--color-primary)" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
