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

type ZoneOverrides = Record<string, Partial<ShippingOption>>;

const ZONE_OVERRIDES: ZoneOverrides[] = [
  // CABA (1000-1499)
  {
    standard: { price: 800, estimatedDays: "2-3 días" },
    express: { price: 1500, estimatedDays: "24 horas" },
  },
  // GBA (1500-1999)
  {
    standard: { price: 1200, estimatedDays: "2-4 días" },
    express: { price: 2000, estimatedDays: "24-48 horas" },
  },
  // Provincias cercanas (Santa Fe, Córdoba, Entre Ríos)
  {
    standard: { price: 1800, estimatedDays: "3-5 días" },
    express: { price: 3000, estimatedDays: "48-72 horas" },
  },
  // Resto del país
  {
    standard: { price: 2500, estimatedDays: "5-7 días" },
    express: { price: 4000, estimatedDays: "72-96 horas" },
  },
];

const ZONE_RANGES: { min: number; max: number; zone: number }[] = [
  { min: 1000, max: 1499, zone: 0 }, // CABA
  { min: 1500, max: 1999, zone: 1 }, // GBA
  { min: 2000, max: 2999, zone: 2 }, // Provincias cercanas (Santa Fe)
  { min: 3000, max: 3599, zone: 2 }, // Provincias cercanas (Entre Ríos)
  { min: 5000, max: 5999, zone: 2 }, // Provincias cercanas (Córdoba)
];

function getZoneIndex(numericCode: number): number {
  const match = ZONE_RANGES.find(
    (r) => numericCode >= r.min && numericCode <= r.max
  );
  return match?.zone ?? 3; // 3 = Resto del país
}

export function calculateShippingOptions(postalCode: string): ShippingOption[] {
  const postalCodeRegex = /^[A-Z]?\d{4}$/i;
  if (!postalCodeRegex.test(postalCode)) {
    throw new Error(
      "Código postal inválido. Debe tener 4 dígitos, o una letra seguida de 4 dígitos."
    );
  }

  const numericCode = parseInt(postalCode.replace(/[A-Z]/i, ""), 10);
  const zoneOverrides = ZONE_OVERRIDES[getZoneIndex(numericCode)];

  return AVAILABLE_SHIPPING_OPTIONS.map((option) => {
    const override = zoneOverrides[option.id];
    return override ? { ...option, ...override } : option;
  });
}
