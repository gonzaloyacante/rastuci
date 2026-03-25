// Utilidades de validación de tarjetas de crédito en tiempo real

export interface CardValidationResult {
  isValid: boolean;
  cardType: string;
  errors: string[];
}

export interface CardBrand {
  name: string;
  pattern: RegExp;
  gaps: number[];
  lengths: number[];
  code: {
    name: string;
    size: number;
  };
}

// Definición de marcas de tarjetas soportadas
export const cardBrands: Record<string, CardBrand> = {
  visa: {
    name: "Visa",
    pattern: /^4/,
    gaps: [4, 8, 12],
    lengths: [13, 16, 19],
    code: { name: "CVV", size: 3 },
  },
  mastercard: {
    name: "Mastercard",
    pattern: /^5[1-5]|^2[2-7]/,
    gaps: [4, 8, 12],
    lengths: [16],
    code: { name: "CVC", size: 3 },
  },
  amex: {
    name: "American Express",
    pattern: /^3[47]/,
    gaps: [4, 10],
    lengths: [15],
    code: { name: "CID", size: 4 },
  },
  diners: {
    name: "Diners Club",
    pattern: /^3[0689]/,
    gaps: [4, 10],
    lengths: [14],
    code: { name: "CVV", size: 3 },
  },
  discover: {
    name: "Discover",
    pattern: /^6(?:011|5)/,
    gaps: [4, 8, 12],
    lengths: [16],
    code: { name: "CID", size: 3 },
  },
  jcb: {
    name: "JCB",
    pattern: /^35/,
    gaps: [4, 8, 12],
    lengths: [16],
    code: { name: "CVV", size: 3 },
  },
};

// Algoritmo de Luhn para validar números de tarjeta
export function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// Detectar el tipo de tarjeta
export function detectCardType(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\D/g, "");

  for (const [type, brand] of Object.entries(cardBrands)) {
    if (brand.pattern.test(cleanNumber)) {
      return type;
    }
  }

  return "unknown";
}

// Formatear número de tarjeta con espacios
export function formatCardNumber(
  cardNumber: string,
  cardType?: string
): string {
  const cleanNumber = cardNumber.replace(/\D/g, "");
  const type = cardType || detectCardType(cleanNumber);
  const brand = cardBrands[type];

  if (!brand) {
    // Formato genérico: grupos de 4
    return cleanNumber.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  let formatted = "";

  for (let i = 0; i < cleanNumber.length; i++) {
    if (brand.gaps.includes(i) && i > 0) {
      formatted += " ";
    }
    formatted += cleanNumber[i];
  }

  return formatted;
}

// Validar número de tarjeta completo
export function validateCardNumber(cardNumber: string): CardValidationResult {
  const cleanNumber = cardNumber.replace(/\D/g, "");
  const cardType = detectCardType(cleanNumber);
  const errors: string[] = [];

  // Verificar longitud mínima
  if (cleanNumber.length < 13) {
    errors.push("Número de tarjeta muy corto");
  }

  // Verificar si es un tipo conocido
  if (cardType === "unknown") {
    errors.push("Tipo de tarjeta no reconocido");
  } else {
    const brand = cardBrands[cardType];

    // Verificar longitud específica del tipo
    if (!brand.lengths.includes(cleanNumber.length)) {
      errors.push(`Longitud inválida para ${brand.name}`);
    }
  }

  // Verificar algoritmo de Luhn
  if (cleanNumber.length >= 13 && !luhnCheck(cleanNumber)) {
    errors.push("Número de tarjeta inválido");
  }

  return {
    isValid: errors.length === 0,
    cardType,
    errors,
  };
}

// Validar fecha de expiración
export function validateExpiryDate(
  month: string,
  year: string
): CardValidationResult {
  const errors: string[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const expMonth = parseInt(month, 10);
  const expYear = parseInt(year, 10);

  // Validar mes
  if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
    errors.push("Mes inválido");
  }

  // Validar año
  if (isNaN(expYear)) {
    errors.push("Año inválido");
  } else {
    // Convertir año de 2 dígitos a 4 dígitos
    const fullYear = expYear < 100 ? 2000 + expYear : expYear;

    if (fullYear < currentYear) {
      errors.push("Tarjeta expirada");
    } else if (fullYear === currentYear && expMonth < currentMonth) {
      errors.push("Tarjeta expirada");
    } else if (fullYear > currentYear + 20) {
      errors.push("Año muy lejano");
    }
  }

  return {
    isValid: errors.length === 0,
    cardType: "expiry",
    errors,
  };
}

// Validar código de seguridad
export function validateSecurityCode(
  code: string,
  cardType: string
): CardValidationResult {
  const errors: string[] = [];
  const cleanCode = code.replace(/\D/g, "");
  const brand = cardBrands[cardType];

  if (!brand) {
    // Validación genérica
    if (cleanCode.length < 3 || cleanCode.length > 4) {
      errors.push("Código de seguridad inválido");
    }
  } else {
    if (cleanCode.length !== brand.code.size) {
      errors.push(`${brand.code.name} debe tener ${brand.code.size} dígitos`);
    }
  }

  return {
    isValid: errors.length === 0,
    cardType: "security",
    errors,
  };
}

// Validar nombre del titular
export function validateCardholderName(name: string): CardValidationResult {
  const errors: string[] = [];
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    errors.push("Nombre muy corto");
  }

  if (trimmedName.length > 50) {
    errors.push("Nombre muy largo");
  }

  // Verificar que contenga al menos un espacio (nombre y apellido)
  if (!trimmedName.includes(" ")) {
    errors.push("Ingresa nombre y apellido");
  }

  // Verificar caracteres válidos
  if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/.test(trimmedName)) {
    errors.push("Caracteres inválidos en el nombre");
  }

  return {
    isValid: errors.length === 0,
    cardType: "name",
    errors,
  };
}

// Obtener icono de la marca de tarjeta
export function getCardIcon(cardType: string): string {
  const icons: Record<string, string> = {
    visa: "💳",
    mastercard: "💳",
    amex: "💳",
    diners: "💳",
    discover: "💳",
    jcb: "💳",
    unknown: "💳",
  };

  return icons[cardType] || icons.unknown;
}

// Obtener color de la marca
export function getCardColor(cardType: string): string {
  const colors: Record<string, string> = {
    visa: "text-blue-600",
    mastercard: "text-red-600",
    amex: "text-green-600",
    diners: "text-purple-600",
    discover: "text-orange-600",
    jcb: "text-indigo-600",
    unknown: "muted",
  };

  return colors[cardType] || colors.unknown;
}
