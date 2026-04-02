/**
 * Formatear precio en pesos argentinos
 */
import { customAlphabet } from "nanoid";

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatear precio en pesos argentinos
 */
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
 * Generar slug desde un texto
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9 -]/g, "") // Remover caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Remover guiones duplicados
    .trim();
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
 * Formatear teléfono argentino
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+54 ${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Convertir texto a slug
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .replace(/^-+|-+$/g, "");
};

/**
 * Capitalizar primera letra
 */
export const capitalizeFirst = (str: string): string => {
  if (!str || str.length === 0) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
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
 * Validar email
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validar teléfono colombiano
 */
export const isValidPhone = (phone: string): boolean => {
  // Formato: +57XXXXXXXXXX o 3XXXXXXXXX
  const phoneRegex = /^(\+57)?[3][0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

/**
 * Formatear teléfono
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && cleaned.startsWith("3")) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6
    )}`;
  }
  return phone;
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
