/**
 * Formatear precio en pesos colombianos
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatear precio en pesos argentinos
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
}

/**
 * Formatear número con separadores de miles
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("es-CO").format(num);
};

/**
 * Formatear fecha en español
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", {
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
  return new Intl.DateTimeFormat("es-CO", {
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
  if (text.length <= maxLength) return text;
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
export const formatPriceARS = (
  price: number,
  showDecimals: boolean = false
): string => {
  if (showDecimals) {
    return `$${price.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  } else {
    return `$${price.toLocaleString("es-AR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }
};
