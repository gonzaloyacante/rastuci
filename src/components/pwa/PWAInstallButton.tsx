"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { usePWA } from "@/lib/pwa";

interface PWAInstallButtonProps {
  className?: string;
}

export function PWAInstallButton({ className = "" }: PWAInstallButtonProps) {
  const { canInstall, promptInstall } = usePWA();

  if (!canInstall) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={promptInstall}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Instalar app</span>
    </Button>
  );
}
