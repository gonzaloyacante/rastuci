import prisma from "@/lib/prisma";
import { vacation_settings } from "@prisma/client";
import { unstable_cache } from "next/cache";

/**
 * Fetch vacation settings with caching
 * Cache tag: 'vacation-settings'
 */
export const getVacationSettings = unstable_cache(
  async (): Promise<vacation_settings | null> => {
    try {
      const settings = await prisma.vacation_settings.findUnique({
        where: { id: "default" },
      });
      return settings;
    } catch (error) {
      console.error("[Vacation] Error fetching settings:", error);
      return null;
    }
  },
  ["vacation-settings"],
  { tags: ["vacation-settings"], revalidate: 60 } // Revalidate every minute
);

/**
 * Check if vacation mode is currently active based on settings and time
 */
export function isVacationActive(settings: vacation_settings | null): boolean {
  if (!settings?.enabled) return false;

  const now = new Date();

  if (settings.startDate && new Date(settings.startDate) > now) return false;
  // Note: endDate does NOT auto-disable, but we might want to return 'false'
  // if we want to follow strict dates. However, plan says Admin must manually end.
  // But for "Active" status (BLOCKING CHECKOUT), we should probably follow dates?
  // User said: "no debe ser automatico". So even if date passes, it stays active?
  // "llegada la fecha ... se le pregunte al admin".
  // This implies it stays active until Admin turns it off.
  // So NO check for endDate here.

  return true;
}
