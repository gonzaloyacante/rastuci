import { ProvinceCode } from "@/lib/constants";

// Export ProvinceCode so it can be used by consumers of this module
export type { ProvinceCode };

// ============================================================================
// TIPOS Y INTERFACES - BASADOS EN API MICORREO
// ============================================================================

// Credenciales de autenticación
export interface CorreoArgentinoCredentials {
  username: string;
  password: string;
  customerId?: string; // ID de cliente MiCorreo
}

// Respuesta de autenticación (/token)
export interface TokenResponse {
  token: string;
  expires: string;
}

// Dirección según formato API
export interface Address {
  streetName: string;
  streetNumber: string;
  floor?: string;
  apartment?: string;
  locality?: string;
  city: string;
  provinceCode: ProvinceCode;
  postalCode: string;
}

// Registro de usuario (/register)
export interface RegisterUserParams {
  firstName: string;
  lastName?: string; // Obligatorio solo para DNI
  email: string;
  password: string;
  documentType: "DNI" | "CUIT";
  documentId: string;
  phone?: string;
  cellPhone?: string;
  address?: Address; // Obligatorio para DNI
}

export interface RegisterUserResponse {
  customerId: string;
  createdAt: string;
}

// Validación de usuario (/users/validate)
export interface ValidateUserParams {
  email: string;
  password: string;
}

export interface ValidateUserResponse {
  customerId: string;
  createdAt: string;
}

// Sucursal (/agencies)
export interface Agency {
  code: string;
  name: string;
  manager: string;
  email: string;
  phone: string;
  services: {
    packageReception: boolean;
    pickupAvailability: boolean;
  };
  location: {
    address: Address & {
      province: string;
    };
    latitude: string;
    longitude: string;
  };
  hours: {
    sunday: { start: string; end: string } | null;
    monday: { start: string; end: string } | null;
    tuesday: { start: string; end: string } | null;
    wednesday: { start: string; end: string } | null;
    thursday: { start: string; end: string } | null;
    friday: { start: string; end: string } | null;
    saturday: { start: string; end: string } | null;
    holidays: { start: string; end: string } | null;
  };
  status: "ACTIVE" | "INACTIVE";
}

export interface GetAgenciesParams {
  customerId: string;
  provinceCode: ProvinceCode;
  services?: "package_reception" | "pickup_availability";
}

// Dimensiones del paquete
export interface PackageDimensions {
  weight: number; // en gramos (min 1g, max 25000g)
  height: number; // en cm (max 150cm) - integer
  width: number; // en cm (max 150cm) - integer
  length: number; // en cm (max 150cm) - integer
}

// Cotización (/rates)
export interface CalculateRatesParams {
  customerId: string;
  postalCodeOrigin: string;
  postalCodeDestination: string;
  deliveredType?: "D" | "S"; // D = domicilio, S = sucursal
  dimensions: PackageDimensions;
}

export interface RateQuote {
  deliveredType: "D" | "S";
  productType: string; // ej: "CP" = Correo Argentino Clásico
  productName: string;
  price: number;
  deliveryTimeMin: string;
  deliveryTimeMax: string;
}

export interface CalculateRatesResponse {
  customerId: string;
  validTo: string; // ISO 8601 timestamp
  rates: RateQuote[];
}

// Importar envío (/shipping/import)
export interface ImportShipmentParams {
  customerId: string;
  extOrderId: string; // ID externo único de la orden
  orderNumber?: string; // Número de orden visible en MiCorreo
  sender?: {
    name?: string | null;
    phone?: string | null;
    cellPhone?: string | null;
    email?: string | null;
    originAddress?: {
      streetName?: string | null;
      streetNumber?: string | null;
      floor?: string | null;
      apartment?: string | null;
      city?: string | null;
      provinceCode?: ProvinceCode | null;
      postalCode?: string | null;
    };
  };
  recipient: {
    name: string;
    phone?: string;
    cellPhone?: string;
    email: string;
  };
  shipping: {
    deliveryType: "D" | "S"; // D = domicilio, S = sucursal
    productType: string; // Por defecto "CP"
    agency?: string | null; // Código de sucursal (obligatorio si deliveryType = "S")
    originAgency?: string | null; // Código de sucursal de origen (opcional)
    address?: {
      streetName?: string; // Obligatorio si deliveryType = "D"
      streetNumber?: string; // Obligatorio si deliveryType = "D"
      floor?: string; // máx 3 caracteres
      apartment?: string; // máx 3 caracteres
      city?: string; // Obligatorio si deliveryType = "D"
      provinceCode?: ProvinceCode; // Obligatorio si deliveryType = "D"
      postalCode?: string; // Obligatorio si deliveryType = "D"
    };
    weight: number; // gramos - integer
    declaredValue: number; // valor declarado
    height: number; // cm - integer
    length: number; // cm - integer
    width: number; // cm - integer
  };
}

export interface ImportShipmentResponse {
  customerId?: string; // A veces devuelven customerId
  createdAt: string; // Timestamp de creación
  trackingNumber?: string; // A veces devuelven tracking directo
  shipmentId?: string; // ID interno del envío
  id?: string; // Alias común para ID
}

// Tracking
export interface GetTrackingParams {
  shippingId: string;
}

export interface TrackingEvent {
  eventDate: string;
  eventDescription: string;
  branchName: string;
  branchCode: string;
  status: string; // Add status back (e.g. ZE, ZD)
}

export interface TrackingInfo {
  shippingId: string;
  status: string;
  events: TrackingEvent[];
}

export interface TrackingErrorResponse {
  code: string;
  message: string;
}

// Respuesta genérica de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
  };
}
