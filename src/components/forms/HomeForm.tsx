"use client";

import { useEffect, useState } from "react";
import { HomeSettings, HomeSettingsSchema, defaultHomeSettings } from "@/lib/validation/home";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Button } from "@/components/ui/Button";
import { IconPicker } from "@/components/ui/IconPicker";
import * as Icons from "lucide-react";

type Props = {
  initial?: HomeSettings;
};

interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export default function HomeForm({ initial }: Props) {
  const [values, setValues] = useState<HomeSettings>(initial ?? defaultHomeSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Estado para el modal de selección de iconos
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);

  // Estado para manejar beneficios con IDs únicos
  const [benefitItems, setBenefitItems] = useState<BenefitItem[]>([]);

  useEffect(() => {
    if (initial) {
      setValues(initial);
      initBenefits(initial.benefits);
    } else {
      // Fetch from API
      fetch("/api/home")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setValues(data.data);
            initBenefits(data.data.benefits);
          } else {
            // If allow defaults on error
            initBenefits(defaultHomeSettings.benefits);
          }
        })
        .catch(() => initBenefits(defaultHomeSettings.benefits));
    }
  }, [initial]);

  const initBenefits = (benefits: HomeSettings["benefits"]) => {
    setBenefitItems(benefits.map((benefit, idx) => ({
      id: `benefit-${Date.now()}-${idx}-${Math.random()}`,
      icon: benefit.icon,
      title: benefit.title,
      description: benefit.description
    })));
  };

  // Sincronizar los beneficios con IDs con el estado principal
  useEffect(() => {
    setValues(v => ({
      ...v,
      benefits: benefitItems.map(item => ({
        icon: item.icon,
        title: item.title,
        description: item.description
      }))
    }));
  }, [benefitItems]);

  const update = <K extends keyof HomeSettings>(key: K, val: HomeSettings[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const updateBenefitItem = (id: string, key: "icon" | "title" | "description", value: string) => {
    setBenefitItems(items => items.map(item =>
      item.id === id ? { ...item, [key]: value } : item
    ));
  };

  const addBenefitItem = () => {
    setBenefitItems(items => [...items, {
      id: `benefit-new-${Date.now()}-${Math.random()}`,
      icon: "Truck",
      title: "Nuevo",
      description: "Descripción"
    }]);
  };

  const removeBenefitItem = (id: string) => {
    setBenefitItems(items => items.filter(item => item.id !== id));
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
      if (!json.success) { throw new Error(json.error?.message || "Error al guardar"); }
      setMessage("Guardado correctamente");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <ImageUploader
            label="Imagen de Fondo del Hero"
            value={values.heroImage}
            onChange={(url) => update("heroImage", url ?? undefined)}
          />
          <p className="text-xs text-muted mt-1">
            Recomendado: 1920x1080px o superior. Formatos: JPG, WEBP.
          </p>
        </div>
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
          {benefitItems.map((benefitItem) => {
            const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[benefitItem.icon];

            return (
              <div key={benefitItem.id} className="grid md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Ícono</label>
                  <button
                    type="button"
                    onClick={() => setIconPickerOpen(benefitItem.id)}
                    className="w-full border rounded-md px-3 py-2 flex items-center justify-center gap-2 hover:bg-accent transition-colors"
                  >
                    {IconComponent && <IconComponent size={20} />}
                    <span className="text-sm truncate">{benefitItem.icon}</span>
                  </button>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={benefitItem.title}
                    onChange={(e) => updateBenefitItem(benefitItem.id, "title", e.target.value)}
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={benefitItem.description}
                    onChange={(e) => updateBenefitItem(benefitItem.id, "description", e.target.value)}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button type="button" variant="destructive" onClick={() => removeBenefitItem(benefitItem.id)}>
                    Quitar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <Button type="button" onClick={addBenefitItem}>Agregar beneficio</Button>
        </div>
      </section>

      {/* Icon Picker Modal */}
      {iconPickerOpen && (
        <IconPicker
          value={benefitItems.find(b => b.id === iconPickerOpen)?.icon}
          onChange={(iconName) => {
            updateBenefitItem(iconPickerOpen, "icon", iconName);
            setIconPickerOpen(null);
          }}
          onClose={() => setIconPickerOpen(null)}
        />
      )}

      {message && <p className="text-sm muted">{message}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
    </form>
  );
}
