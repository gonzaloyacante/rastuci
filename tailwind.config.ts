import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de colores principal de Rastuci
        primary: {
          50: "#fdf2f8", // Rosa muy claro
          100: "#fce7f3", // Rosa claro
          200: "#fbcfe8", // Rosa medio claro
          300: "#f9a8d4", // Rosa medio
          400: "#f472b6", // Rosa medio oscuro
          500: "#E91E63", // Color principal - Rastuci Pink
          600: "#C2185B", // Rosa oscuro principal
          700: "#AD1457", // Rosa muy oscuro
          800: "#9C1C4D", // Rosa ultra oscuro
          900: "#7B1242", // Rosa súper oscuro
          950: "#4A0F29", // Rosa casi negro
        },
        // Colores semánticos
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Grises personalizados
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
      // Espaciado personalizado
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      // Tipografía
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Poppins", "Inter", "system-ui", "sans-serif"],
        montserrat: ["Montserrat", "Inter", "system-ui", "sans-serif"],
        poppins: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      // Sombras personalizadas
      boxShadow: {
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "card-hover":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        primary: "0 4px 14px 0 rgba(233, 30, 99, 0.39)",
        "primary-lg": "0 8px 30px 0 rgba(233, 30, 99, 0.3)",
      },
      // Animaciones personalizadas
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-primary":
          "pulsePrimary 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        pulsePrimary: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".8", transform: "scale(1.05)" },
        },
      },
      // Bordes redondeados
      borderRadius: {
        card: "12px",
        button: "8px",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      const newUtilities = {
        '.surface': {
          '@apply bg-white': {},
        },
        '.surface-secondary': {
          '@apply bg-gray-50': {},
        },
        '.muted': {
          '@apply text-gray-500': {},
        },
        '.text-primary': {
          '@apply text-gray-900': {},
        },
        '.text-success': {
          '@apply text-success-600': {},
        },
        '.text-error': {
          '@apply text-error-600': {},
        },
        '.text-warning': {
          '@apply text-warning-600': {},
        },
        '.border-success': {
          '@apply border-success-600': {},
        },
        '.border-error': {
          '@apply border-error-600': {},
        },
        '.border-warning': {
          '@apply border-warning-600': {},
        },
      }
      addUtilities(newUtilities)
    })
  ],
};

export default config;
