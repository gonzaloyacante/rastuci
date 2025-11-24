export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

export const AVAILABLE_SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "pickup",
    name: "Retiro en tienda",
    description: "Retira tu pedido en nuestra tienda física",
    price: 0,
    estimatedDays: "Inmediato",
  },
  {
    id: "standard",
    name: "Envío estándar",
    description: "Envío a domicilio en 3-5 días hábiles",
    price: 1500,
    estimatedDays: "3-5 días",
  },
  {
    id: "express",
    name: "Envío express",
    description: "Envío prioritario en 24-48 horas",
    price: 2500,
    estimatedDays: "24-48 horas",
  },
];

export function calculateShippingOptions(postalCode: string): ShippingOption[] {
  // Validar el código postal de Argentina (formato general 4 dígitos o 1 letra + 4 dígitos)
  const postalCodeRegex = /^[A-Z]?\d{4}$/i;
  if (!postalCodeRegex.test(postalCode)) {
    throw new Error(
      "Código postal inválido. Debe tener 4 dígitos, o una letra seguida de 4 dígitos."
    );
  }

  const numericCode = parseInt(postalCode.replace(/[A-Z]/i, ""));
  let options = [...AVAILABLE_SHIPPING_OPTIONS];

  // CABA
  if (numericCode >= 1000 && numericCode <= 1499) {
    options = options.map((option) => {
      if (option.id === "standard") {
        return { ...option, price: 800, estimatedDays: "2-3 días" };
      }
      if (option.id === "express") {
        return { ...option, price: 1500, estimatedDays: "24 horas" };
      }
      return option;
    });
  }
  // GBA
  else if (numericCode >= 1500 && numericCode <= 1999) {
    options = options.map((option) => {
      if (option.id === "standard") {
        return { ...option, price: 1200, estimatedDays: "2-4 días" };
      }
      if (option.id === "express") {
        return { ...option, price: 2000, estimatedDays: "24-48 horas" };
      }
      return option;
    });
  }
  // Provincias cercanas (Santa Fe, Córdoba, Entre Ríos)
  else if (
    (numericCode >= 2000 && numericCode <= 2999) ||
    (numericCode >= 3000 && numericCode <= 3599) ||
    (numericCode >= 5000 && numericCode <= 5999)
  ) {
    options = options.map((option) => {
      if (option.id === "standard") {
        return { ...option, price: 1800, estimatedDays: "3-5 días" };
      }
      if (option.id === "express") {
        return { ...option, price: 3000, estimatedDays: "48-72 horas" };
      }
      return option;
    });
  }
  // Resto del país
  else {
    options = options.map((option) => {
      if (option.id === "standard") {
        return { ...option, price: 2500, estimatedDays: "5-7 días" };
      }
      if (option.id === "express") {
        return { ...option, price: 4000, estimatedDays: "72-96 horas" };
      }
      return option;
    });
  }

  return options;
}
