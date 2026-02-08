"use client";

import { useVacationSettings } from "@/hooks/useVacationSettings";
import { AlertCircle } from "lucide-react";

export default function VacationBanner() {
  const { isVacationMode, settings } = useVacationSettings();

  if (!isVacationMode || !settings) return null;

  return (
    <div className="w-full bg-warning-500 text-white px-4 py-2 text-center relative z-50 shadow-sm border-b border-warning-600">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-2 text-sm font-medium">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{settings.message}</span>
        </div>

        {settings.endDate && (
          <span className="hidden md:inline opacity-90">
            • Regresamos el{" "}
            {new Date(settings.endDate).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
