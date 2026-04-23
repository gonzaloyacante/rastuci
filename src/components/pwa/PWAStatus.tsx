"use client";

import { Download, Monitor } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { usePWA } from "@/lib/pwa";

interface PWAStatusProps {
  className?: string;
}

export function PWAStatus({ className = "" }: PWAStatusProps) {
  const { isInstalled, canInstall } = usePWA();

  if (isInstalled) {
    return (
      <Badge variant="success" className={className}>
        <Monitor className="w-3 h-3 mr-1" />
        App instalada
      </Badge>
    );
  }

  if (canInstall) {
    return (
      <Badge variant="secondary" className={className}>
        <Download className="w-3 h-3 mr-1" />
        Disponible para instalar
      </Badge>
    );
  }

  return null;
}
