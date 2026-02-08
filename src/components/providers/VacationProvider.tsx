"use client";

import { vacation_settings } from "@prisma/client";
import { createContext, useContext, ReactNode, useMemo } from "react";

interface VacationContextType {
  settings: vacation_settings | null;
  isVacationMode: boolean;
}

const VacationContext = createContext<VacationContextType | undefined>(
  undefined
);

interface VacationProviderProps {
  children: ReactNode;
  initialSettings: vacation_settings | null;
  initialIsActive: boolean; // Calculated on server to avoid hydration mismatch
}

export function VacationProvider({
  children,
  initialSettings,
  initialIsActive,
}: VacationProviderProps) {
  // We use the initial server calculation to ensure consistency
  // Real-time updates could be handled by SWR if needed, but for now strict server hydration is best for SEO

  const value = useMemo(
    () => ({
      settings: initialSettings,
      isVacationMode: initialIsActive,
    }),
    [initialSettings, initialIsActive]
  );

  return (
    <VacationContext.Provider value={value}>
      {children}
    </VacationContext.Provider>
  );
}

export function useVacation() {
  const context = useContext(VacationContext);
  if (context === undefined) {
    throw new Error("useVacation must be used within a VacationProvider");
  }
  return context;
}
