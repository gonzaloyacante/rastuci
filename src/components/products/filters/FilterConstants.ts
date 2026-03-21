export { SORT_OPTIONS } from "@/lib/constants";

export const COLOR_MAP: Record<string, string> = {
  rosa: "#ec4899",
  pink: "#ec4899",
  azul: "#3b82f6",
  blue: "#3b82f6",
  blanco: "#ffffff",
  white: "#ffffff",
  negro: "#000000",
  black: "#000000",
  amarillo: "#eab308",
  yellow: "#eab308",
  verde: "#22c55e",
  green: "#22c55e",
  rojo: "#ef4444",
  red: "#ef4444",
  morado: "#a855f7",
  purple: "#a855f7",
  naranja: "#f97316",
  orange: "#f97316",
  gris: "#6b7280",
  gray: "#6b7280",
};

export function getColorHex(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase()] || "#6b7280";
}
