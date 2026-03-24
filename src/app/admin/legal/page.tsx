"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { LegalTabBar } from "./LegalTabBar";
import { PolicyEditor } from "./PolicyEditor";

export default function LegalAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "terminos-y-condiciones";

  const handleTabChange = (tabId: string) => {
    router.replace(`/admin/legales?tab=${tabId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold font-heading text-primary">
          Legales
        </h1>
      </div>
      <p className="text-muted-foreground">
        Gestiona los documentos legales de tu tienda.
      </p>
      <LegalTabBar activeTab={activeTab} onTabChange={handleTabChange} />
      <PolicyEditor slug={activeTab} key={activeTab} />
    </div>
  );
}
