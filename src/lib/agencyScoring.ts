import type { Agency } from "@/lib/correo-argentino-service";

function getPostalScore(
  cp: string,
  cpNumeric: string,
  term: string,
  termNumeric: string
): number {
  if (cp === term) return 100;
  if (termNumeric.length >= 4 && cpNumeric === termNumeric) return 90;
  if (cp.startsWith(term)) return 50;
  if (termNumeric.length >= 3 && cpNumeric.includes(termNumeric)) return 40;
  if (cp.includes(term)) return 25;
  return 0;
}

function getCityScore(city: string, term: string): number {
  if (city === term) return 80;
  if (city.startsWith(term)) return 40;
  if (city.includes(term)) return 20;
  return 0;
}

export function scoreAgency(
  agency: Agency,
  term: string,
  termNumeric: string
): number {
  const cp = agency.location.address.postalCode?.toLowerCase() ?? "";
  const cpNumeric = cp.replace(/\D/g, "");
  const city = (
    agency.location.address.city ||
    agency.location.address.locality ||
    ""
  ).toLowerCase();
  const name = agency.name.toLowerCase();
  const street = agency.location.address.streetName?.toLowerCase() ?? "";
  return (
    getPostalScore(cp, cpNumeric, term, termNumeric) +
    getCityScore(city, term) +
    (name.includes(term) ? 15 : 0) +
    (street.includes(term) ? 10 : 0)
  );
}
