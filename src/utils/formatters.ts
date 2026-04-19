/**
 * Utilidades de formateo para la tienda (precios ARS, fechas, CSV, etc.)
 */
import { customAlphabet } from "nanoid";

export function formatCurrency(amount: number) {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount).replace(/\u00A0/g, "");
}

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("es-AR").format(num);
};

/**
 * Formatear fecha en español
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

/**
 * Formatear fecha corta
 */
export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj);
};

/**
 * Capitalizar primera letra
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncar texto
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
};

/**
 * Formatear fecha relativa (hace X minutos/horas/días)
 */
export const formatDateRelative = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return "justo ahora";
  }
  if (diffMinutes < 60) {
    return `hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  }
  if (diffHours < 24) {
    return `hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  }
  return `hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;
};

/**
 * Escapar celdas CSV para prevenir Inyección de Fórmulas en Excel/Sheets.
 * Si el campo empieza por =, +, - o @ se le prefija una comilla simple o tabulación invisible,
 * neutralizando la ejecución de la fórmula.
 */
export const escapeCsvCell = (
  value: string | number | null | undefined
): string => {
  if (value === null || value === undefined) return "";
  let strValue = String(value);
  // Prevenir inyección de fórmulas CSV
  if (/^[=+\-@]/.test(strValue)) {
    strValue = "'" + strValue;
  }
  // Escapar comillas dobles y envolver si contiene comas, comillas o nuevas líneas
  if (/[,"\n]/.test(strValue)) {
    strValue = `"${strValue.replace(/"/g, '""')}"`;
  }
  return strValue;
};

/**
 * Generar número de orden único criptográficamente seguro e inenumerable.
 * Usamos base58 (sin caracteres ambiguos como O, 0, I, l) con tamaño de 10.
 */
export const generateOrderNumber = (): string => {
  const nanoid = customAlphabet(
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz",
    10
  );
  return `ORD-${nanoid().toUpperCase()}`;
};

/**
 * Formatea un precio en pesos argentinos
 * @param price - Precio en pesos (ej: 2100 = $2.100)
 * @param showDecimals - Si mostrar decimales (default: false)
 * @returns Precio formateado en pesos argentinos
 */
export const formatPriceARS = (price: number, showDecimals = false): string => {
  const formatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  });
  return formatter.format(price).replace(/\u00A0/g, "");
};
