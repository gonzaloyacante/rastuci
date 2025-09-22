"use client";

import { useEffect, useState } from "react";
import ContactForm from "@/components/forms/ContactForm";
import { ContactSettings } from "@/lib/validation/contact";

export default function AdminContactPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/contact");
        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || "Error");
        setSettings(json.data);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Cargando…</div>;
  if (error) return <div className="p-6 text-error">{error}</div>;
  if (!settings) return <div className="p-6">Sin datos</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Contacto</h1>
      <ContactForm initial={settings} />
    </div>
  );
}
