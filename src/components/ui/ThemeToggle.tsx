"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "./Button";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  /** Variante del componente: 'toggle' = botón simple, 'full' = 3 botones */
  variant?: "toggle" | "full";
  /** Orientación para la variante 'full': 'vertical' (default) o 'horizontal' */
  orientation?: "vertical" | "horizontal";
  /** Mostrar opción de sistema en variante 'full' */
  showSystem?: boolean;
}

export function ThemeToggle({
  variant = "toggle",
  orientation = "vertical",
  showSystem = true,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  // Versión completa con 3 botones verticales y texto
  if (variant === "full") {
    return (
      <div
        className={`theme-toggle-group ${orientation === "horizontal" ? "!flex-row !w-full" : ""}`}
      >
        <button
          onClick={() => setTheme("light")}
          aria-label="Modo claro"
          className={`theme-toggle-btn ${orientation === "horizontal" ? "flex-1 justify-center" : ""} ${theme === "light" ? "active active-light" : ""}`}
        >
          <Sun className="w-4 h-4" />
          <span>Claro</span>
        </button>
        {showSystem && (
          <button
            onClick={() => setTheme("system")}
            aria-label="Tema del sistema"
            className={`theme-toggle-btn ${orientation === "horizontal" ? "flex-1 justify-center" : ""} ${theme === "system" ? "active active-system" : ""}`}
          >
            <Monitor className="w-4 h-4" />
            <span>Sistema</span>
          </button>
        )}
        <button
          onClick={() => setTheme("dark")}
          aria-label="Modo oscuro"
          className={`theme-toggle-btn ${orientation === "horizontal" ? "flex-1 justify-center" : ""} ${theme === "dark" ? "active active-dark" : ""}`}
        >
          <Moon className="w-4 h-4" />
          <span>Oscuro</span>
        </button>
      </div>
    );
  }

  // Versión toggle simple (original)
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getIcon = () => {
    return theme === "light" ? (
      <Moon className="w-4 h-4" />
    ) : (
      <Sun className="w-4 h-4" />
    );
  };

  const getLabel = () => {
    return theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={getLabel()}
      title={getLabel()}
      className="w-9 h-9 p-0"
    >
      {getIcon()}
    </Button>
  );
}

export default ThemeToggle;
