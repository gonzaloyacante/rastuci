"use client";

import { useEffect, useState } from "react";
import {
  HomeSettings,
  HomeSettingsSchema,
  defaultHomeSettings,
} from "@/lib/validation/home";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Button } from "@/components/ui/Button";
import { IconPicker } from "@/components/ui/IconPicker";
import * as Icons from "lucide-react";
import { toast } from "react-hot-toast";
import { FormSkeleton } from "@/components/admin/SettingsSkeletons";
import { useSettings } from "@/hooks/useSettings";

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
  const [values, setValues] = useState<HomeSettings>(
    initial ?? defaultHomeSettings
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Estado para el modal de selección de iconos
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);

  // Estado para manejar beneficios con IDs únicos
  const [benefitItems, setBenefitItems] = useState<BenefitItem[]>([]);
  const [loading, setLoading] = useState(!initial);

  // SWR Hook
  const { settings, loading: loadingSettings } =
    useSettings<HomeSettings>("home");

  useEffect(() => {
    if (initial) {
      setValues(initial);
      initBenefits(initial.benefits);
      setLoading(false);
    } else if (settings) {
      setValues(settings);
      initBenefits(settings.benefits);
      setLoading(false);
    }
  }, [initial, settings]);

  // Handle loading initial state
  useEffect(() => {
    // If we have data (either initial or from SWR), stop loading
    if (initial || settings) {
      setLoading(false);
    }
    // Only continue loading if we have no data and SWR is loading
    else if (loadingSettings) {
      setLoading(true);
    }
  }, [loadingSettings, initial, settings]);

  const initBenefits = (benefits: HomeSettings["benefits"]) => {
    setBenefitItems(
      benefits.map((benefit, idx) => ({
        id: `benefit-${Date.now()}-${idx}-${Math.random()}`,
        icon: benefit.icon,
        title: benefit.title,
        description: benefit.description,
      }))
    );
  };

  // Sincronizar los beneficios con IDs con el estado principal
  useEffect(() => {
    setValues((v) => ({
      ...v,
      benefits: benefitItems.map((item) => ({
        icon: item.icon,
        title: item.title,
        description: item.description,
      })),
    }));
  }, [benefitItems]);

  const update = <K extends keyof HomeSettings>(key: K, val: HomeSettings[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const updateBenefitItem = (
    id: string,
    key: "icon" | "title" | "description",
    value: string
  ) => {
    setBenefitItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const addBenefitItem = () => {
    setBenefitItems((items) => [
      ...items,
      {
        id: `benefit-new-${Date.now()}-${Math.random()}`,
        icon: "Truck",
        title: "Nuevo",
        description: "Descripción",
      },
    ]);
  };

  const removeBenefitItem = (id: string) => {
    setBenefitItems((items) => items.filter((item) => item.id !== id));
    toast.success("Beneficio eliminado");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = HomeSettingsSchema.safeParse(values);
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((er) => er.message).join("; "));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      console.log("HomeForm PUT Status:", res.status, res.statusText);
      const text = await res.text();
      console.log("HomeForm PUT Raw Response:", text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        throw new Error(
          `Error de servidor: No se pudo procesar la respuesta (${res.status})`
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Error al guardar (Server returned Error)"
        );
      }

      if (!data.success) {
        // Fallback if status is 200 but success is false
        throw new Error(data.error || "Error al guardar (Success false)");
      }

      setMessage("Guardado correctamente");
      toast.success("Configuración del Home guardada");
    } catch (err: unknown) {
      console.error("HomeForm Submit Error:", err);
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setMessage(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton rows={4} />;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ImageUploader
              label="Logo del Hero"
              value={values.heroLogoUrl}
              onChange={(url) => update("heroLogoUrl", url ?? undefined)}
              helpText="Logo principal que se muestra sobre el hero. Formato recomendado: SVG o PNG transparente."
            />
          </div>
          <div>
            <ImageUploader
              label="Imagen de Fondo del Hero"
              value={values.heroImage}
              onChange={(url) => update("heroImage", url ?? undefined)}
              helpText="Recomendado: 1920x1080px o superior. Formatos: JPG, WEBP."
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Título del Hero
          </label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.heroTitle}
            onChange={(e) => update("heroTitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Subtítulo del Hero
          </label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.heroSubtitle}
            onChange={(e) => update("heroSubtitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            CTA principal
          </label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.ctaPrimaryLabel}
            onChange={(e) => update("ctaPrimaryLabel", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            CTA secundaria
          </label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.ctaSecondaryLabel}
            onChange={(e) => update("ctaSecondaryLabel", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Título de Categorías
          </label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.categoriesTitle}
            onChange={(e) => update("categoriesTitle", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Título de Ofertas
          </label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={values.featuredTitle}
            onChange={(e) => update("featuredTitle", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            Subtítulo de Ofertas
          </label>
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
            const IconComponent = (
              Icons as unknown as Record<string, React.ElementType>
            )[benefitItem.icon];

            return (
              <div
                key={benefitItem.id}
                className="grid md:grid-cols-12 gap-3 items-end"
              >
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Ícono
                  </label>
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
                  <label className="block text-sm font-medium mb-1">
                    Título
                  </label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={benefitItem.title}
                    onChange={(e) =>
                      updateBenefitItem(benefitItem.id, "title", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium mb-1">
                    Descripción
                  </label>
                  <input
                    className="w-full border rounded-md px-3 py-2"
                    value={benefitItem.description}
                    onChange={(e) =>
                      updateBenefitItem(
                        benefitItem.id,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeBenefitItem(benefitItem.id)}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <Button type="button" onClick={addBenefitItem}>
            Agregar beneficio
          </Button>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Pie de Página (Footer)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Configura la identidad de marca en el pie de página.
          <span className="block text-xs mt-1 text-amber-500">
            Nota: La información de contacto y redes sociales se administra en
            la sección "Contacto".
          </span>
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <ImageUploader
              label="Logo del Footer"
              value={values.footer?.logoUrl}
              onChange={(url) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, logoUrl: url ?? undefined },
                }))
              }
              helpText="Logo monocromático o simple para el pie de página."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre de Marca
            </label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={values.footer?.brand}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, brand: e.target.value },
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Slogan / Tagline
            </label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={values.footer?.tagline}
              onChange={(e) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, tagline: e.target.value },
                }))
              }
            />
          </div>
        </div>
      </section>

      {/* Icon Picker Modal */}
      {iconPickerOpen && (
        <IconPicker
          value={benefitItems.find((b) => b.id === iconPickerOpen)?.icon}
          onChange={(iconName) => {
            updateBenefitItem(iconPickerOpen, "icon", iconName);
            setIconPickerOpen(null);
          }}
          onClose={() => setIconPickerOpen(null)}
        />
      )}

      {message && <p className="text-sm muted">{message}</p>}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
