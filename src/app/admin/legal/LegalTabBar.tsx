"use client";

import { Button } from "@/components/ui/Button";

import type { LegalTabBarProps } from "./types";

const TABS = [
  { id: "terminos-y-condiciones", label: "Términos y Condiciones" },
  { id: "politica-de-privacidad", label: "Política de Privacidad" },
  { id: "defensa-al-consumidor", label: "Defensa al Consumidor" },
];

export function LegalTabBar({ activeTab, onTabChange }: LegalTabBarProps) {
  return (
    <div className="border-b border-muted flex gap-6">
      {TABS.map((tab) => (
        <Button
          key={tab.id}
          variant="ghost"
          onClick={() => onTabChange(tab.id)}
          className={`pb-3 rounded-none hover:bg-transparent text-sm font-medium border-b-2 transition-colors px-0 py-0 h-auto ${
            activeTab === tab.id
              ? "border-primary text-primary hover:text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
          }`}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
