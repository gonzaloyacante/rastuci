/**
 * Helper para normalizar datos de sucursales de Correo Argentino
 * Convierte del formato API a formato usado en componentes
 */

import type { Agency } from "@/lib/correo-argentino-service";

export interface NormalizedAgency {
  code: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  schedule?: string;
  latitude?: string;
  longitude?: string;
  manager?: string;
  services?: {
    packageReception: boolean;
    pickupAvailability: boolean;
  };
}

/**
 * Convierte Agency de la API CA al formato normalizado
 */
export function normalizeAgency(agency: Agency): NormalizedAgency {
  const addr = agency.location.address;

  return {
    code: agency.code,
    name: agency.name,
    address: `${addr.streetName || ''} ${addr.streetNumber || ''}`.trim() || 'Dirección no disponible',
    city: addr.city || 'Ciudad no disponible',
    province: addr.province || 'Provincia no disponible',
    postalCode: addr.postalCode || undefined,
    phone: agency.phone,
    email: agency.email,
    schedule: formatAgencyHours(agency.hours),
    latitude: agency.location.latitude,
    longitude: agency.location.longitude,
    manager: agency.manager,
    services: agency.services,
  };
}

/**
 * Formatea el horario de una sucursal
 */
export function formatAgencyHours(hours?: Agency['hours']): string {
  if (!hours) {return 'Horario no disponible';}

  const days = [
    { key: 'monday', label: 'Lun' },
    { key: 'tuesday', label: 'Mar' },
    { key: 'wednesday', label: 'Mié' },
    { key: 'thursday', label: 'Jue' },
    { key: 'friday', label: 'Vie' },
    { key: 'saturday', label: 'Sáb' },
    { key: 'sunday', label: 'Dom' },
  ];

  const schedule: string[] = [];
  for (const day of days) {
    const dayHours = hours[day.key as keyof typeof hours];
    if (dayHours && 'start' in dayHours) {
      schedule.push(`${day.label}: ${dayHours.start}-${dayHours.end}`);
    }
  }

  return schedule.length > 0 ? schedule.join(', ') : 'Horario no disponible';
}
