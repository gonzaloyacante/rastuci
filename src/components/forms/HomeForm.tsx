"use client";

import { useEffect, useState } from "react";
import { HomeSettings, HomeSettingsSchema, defaultHomeSettings } from "@/lib/validation/home";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

type Props = {
  initial?: HomeSettings;
};

export default function HomeForm({ initial }: Props) {
  const [values, setValues] = useState<HomeSettings>(initial ?? defaultHomeSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initial) setValues(initial);
  }, [initial]);

  const update = <K extends keyof HomeSettings>(key: K, val: HomeSettings[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const updateBenefit = (i: number, key: "icon" | "title" | "description", val: any) => {
    setValues((v) => {
      const next = [...v.benefits];
      next[i] = { ...next[i], [key]: val } as any;
      return { ...v, benefits: next };
    });
  };

  const addBenefit = () => {
    setValues((v) => ({
      ...v,
      benefits: [...v.benefits, { icon: "truck", title: "Nuevo", description: "Descripción" }],
    }));
  };

  const removeBenefit = (i: number) => {
    setValues((v) => ({ ...v, benefits: v.benefits.filter((_, idx) => idx !== i) }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = HomeSettingsSchema.safeParse(values);
    if (!parsed.success) {
      setMessage(parsed.error.errors.map((er) => er.message).join("; "));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error?.message || "Error al guardar");
      setMessage("Guardado correctamente");
    } catch (err: any) {
      setMessage(err.message || "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Título del Hero</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.heroTitle}
            onChange={(e) => update("heroTitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtítulo del Hero</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.heroSubtitle}
            onChange={(e) => update("heroSubtitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CTA principal</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.ctaPrimaryLabel}
            onChange={(e) => update("ctaPrimaryLabel", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CTA secundaria</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.ctaSecondaryLabel}
            onChange={(e) => update("ctaSecondaryLabel", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Título de Categorías</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.categoriesTitle}
            onChange={(e) => update("categoriesTitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Título de Ofertas</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.featuredTitle}
            onChange={(e) => update("featuredTitle", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Subtítulo de Ofertas</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.featuredSubtitle}
            onChange={(e) => update("featuredSubtitle", e.target.value)}
          />
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Beneficios</h3>
        <div className="space-y-4">
          {values.benefits.map((b, i) => (
            <div key={i} className="grid md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Ícono</label>
                <select
                  className="w-full border rounded-md px-3 py-2"
                  value={b.icon}
                  onChange={(e) => updateBenefit(i, "icon", e.target.value as any)}
                >
                  <option value="truck">Camión</option>
                  <option value="credit">Tarjeta</option>
                  <option value="shield">Escudo</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  value={b.title}
                  onChange={(e) => updateBenefit(i, "title", e.target.value)}
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <input
                  className="w-full border rounded-md px-3 py-2"
                  value={b.description}
                  onChange={(e) => updateBenefit(i, "description", e.target.value)}
                />
              </div>
              <div className="md:col-span-1">
                <Button type="button" variant="destructive" onClick={() => removeBenefit(i)}>
                  Quitar
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <Button type="button" onClick={addBenefit}>Agregar beneficio</Button>
        </div>
      </section>

      {message && <p className="text-sm muted">{message}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
    </form>
  );
}
