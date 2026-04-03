"use client";

import { useEffect, useState } from "react";

import { ContactMessagesList } from "@/components/admin/contact/ContactMessagesList";
import { FormSkeleton } from "@/components/admin/skeletons";
import ContactForm from "@/components/forms/ContactForm";
import { ContactSettings } from "@/lib/validation/contact";

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"messages" | "settings">(
    "messages"
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/contact");
        if (!res.ok) throw new Error("Error HTTP al cargar");
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error?.message || "Error");
        }
        setSettings(json.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="h-8 w-32 rounded surface-secondary animate-pulse mb-6" />
        <FormSkeleton fields={6} />
      </div>
    );
  }
  if (error) {
    return <div className="p-6 text-error">{error}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contacto</h1>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg surface-secondary mb-6 w-fit">
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "messages" ? "surface shadow-sm" : "hover:surface/50"
          }`}
        >
          Mensajes
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "settings" ? "surface shadow-sm" : "hover:surface/50"
          }`}
        >
          Configuración
        </button>
      </div>

      {activeTab === "messages" && <ContactMessagesList />}
      {activeTab === "settings" && settings && (
        <ContactForm initial={settings} />
      )}
    </div>
  );
}
