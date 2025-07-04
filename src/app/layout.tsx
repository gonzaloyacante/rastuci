import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Rastući - Ropa con amor para los más peques",
  description:
    "Descubre la mejor ropa infantil con estilo y calidad. Envíos a todo el país y 3 cuotas sin interés.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${montserrat.variable} antialiased`}
        style={{ fontFamily: "'Poppins', sans-serif" }}>
        <CartProvider>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
