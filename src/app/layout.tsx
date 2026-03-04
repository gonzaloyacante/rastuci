import "./globals.css";

import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { headers } from "next/headers";

import AppProviders from "@/components/providers/AppProviders";
import KeyboardShortcutsProvider from "@/components/providers/KeyboardShortcutsProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
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
        url: "/web-app-manifest-512x512.png", // Larger image for better preview
        width: 512,
        height: 512,
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
    images: ["/web-app-manifest-512x512.png"],
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
    // [M-17] Configure via NEXT_PUBLIC_GOOGLE_VERIFICATION env var when available
    ...(process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
      ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
      : {}),
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading x-nonce here is required so Next.js App Router propagates the nonce generated
  // by proxy.ts to ALL inline scripts it injects (RSC payload, hydration bootstrap, etc.).
  // Without this, those inline scripts don’t carry the nonce and get blocked by the CSP.
  const nonce = (await headers()).get("x-nonce") ?? "";

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
        {/* Preconnect to Cloudinary for faster LCP */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Expose nonce to meta so client-side scripts can read it if needed */}
        {nonce && <meta name="csp-nonce" content={nonce} />}
      </head>
      <body
        className={`${inter.className} ${poppins.variable}`}
        suppressHydrationWarning={true}
      >
        <ErrorBoundary>
          <AppProviders>
            <KeyboardShortcutsProvider>{children}</KeyboardShortcutsProvider>
          </AppProviders>
        </ErrorBoundary>
      </body>
    </html>
  );
}
