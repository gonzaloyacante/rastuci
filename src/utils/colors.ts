/**
 * Mapeo de nombres de colores en español a códigos hexadecimales
 */
export const colorNameToHex: Record<string, string> = {
  // Colores básicos
  rojo: "#EF4444",
  azul: "#3B82F6",
  verde: "#10B981",
  amarillo: "#F59E0B",
  naranja: "#F97316",
  rosa: "#EC4899",
  morado: "#A855F7",
  violeta: "#8B5CF6",
  negro: "#1F2937",
  blanco: "#F9FAFB",
  gris: "#6B7280",
  beige: "#D4B89C",
  marron: "#92400E",
  marrón: "#92400E",
  celeste: "#7DD3FC",
  turquesa: "#14B8A6",
  fucsia: "#D946EF",
  lila: "#C084FC",

  // Tonalidades
  "rojo oscuro": "#991B1B",
  "azul oscuro": "#1E40AF",
  "verde oscuro": "#047857",
  "gris oscuro": "#374151",
  "rojo claro": "#FCA5A5",
  "azul claro": "#93C5FD",
  "verde claro": "#6EE7B7",
  "gris claro": "#D1D5DB",
  "rosa claro": "#F9A8D4",
  "rosa fuerte": "#BE185D",

  // Variantes específicas de ropa
  "blanco hueso": "#FAF5EF",
  crema: "#FEF3C7",
  ivory: "#FFFEF0",
  perla: "#F5F5F5",
  champagne: "#F7E7CE",
  coral: "#FF7F50",
  salmon: "#FA8072",
  aqua: "#00FFFF",
  menta: "#98FF98",
  lavanda: "#E6E6FA",
  durazno: "#FFDAB9",
  chocolate: "#7B3F00",
  camel: "#C19A6B",

  // Colores neutros
  arena: "#C2B280",
  tierra: "#8B4513",
  caqui: "#C3B091",
  oliva: "#6B8E23",
  militar: "#4B5320",

  // Tonos modernos
  "azul navy": "#001F3F",
  navy: "#001F3F",
  bordo: "#800020",
  burgundy: "#800020",
  "verde militar": "#4B5320",
  mostaza: "#E1AD01",
  terracota: "#E2725B",
  denim: "#1560BD",

  // Metálicos
  dorado: "#FFD700",
  plateado: "#C0C0C0",
  oro: "#FFD700",
  plata: "#C0C0C0",
  bronce: "#CD7F32",
  cobre: "#B87333",
};

/**
 * Convierte un nombre de color en español a su código hexadecimal
 * Si no encuentra el color, retorna el color original (podría ser un hex ya)
 */
export function getColorHex(colorName: string): string {
  const normalized = colorName.toLowerCase().trim();
  return colorNameToHex[normalized] || colorName;
}

/**
 * Determina si un color es claro u oscuro (para elegir texto negro o blanco)
 */
export function isLightColor(hex: string): boolean {
  // Remover # si existe
  const color = hex.replace("#", "");

  // Convertir a RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calcular luminosidad
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
}
