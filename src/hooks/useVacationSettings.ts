import { useVacation } from "@/components/providers/VacationProvider";

export function useVacationSettings() {
  const { settings, isVacationMode } = useVacation();

  return {
    settings,
    isVacationMode,
    isLoading: false, // Always ready since it's from context
  };
}
