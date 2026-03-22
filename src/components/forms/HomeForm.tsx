"use client";

import { useEffect, useState } from "react";

import { FormSkeleton } from "@/components/admin/SettingsSkeletons";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useSettings } from "@/hooks/useSettings";
import { logger } from "@/lib/logger";
import {
  defaultHomeSettings,
  HomeSettings,
  HomeSettingsSchema,
} from "@/lib/validation/home";

import {
  BenefitItem,
  BenefitsSectionCard,
  ContentSectionCard,
  FooterSectionCard,
  HeaderSectionCard,
  HeroSectionCard,
} from "./HomeFormSections";

type Props = {
  initial?: HomeSettings;
};

export default function HomeForm({ initial }: Props) {
  const { show } = useToast();
  const [values, setValues] = useState<HomeSettings>(
    initial ?? defaultHomeSettings
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);
  const [benefitItems, setBenefitItems] = useState<BenefitItem[]>([]);
  const [loading, setLoading] = useState(!initial);

  const {
    settings,
    loading: loadingSettings,
    mutate: mutateSettings,
  } = useSettings<HomeSettings>("home");

  useEffect(() => {
    if (settings) {
      setValues(settings);
      initBenefits(settings.benefits);
      setLoading(false);
    } else if (initial) {
      setValues(initial);
      initBenefits(initial.benefits);
      setLoading(false);
    } else if (!loadingSettings) {
      logger.info("[HomeForm] Using DEFAULTS (No settings, no initial)");
      setValues(defaultHomeSettings);
      initBenefits(defaultHomeSettings.benefits);
      setLoading(false);
    }
  }, [initial, settings, loadingSettings]);

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
    show({ type: "success", message: "Beneficio eliminado" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading || loadingSettings) {
      show({
        type: "error",
        message: "Espera a que carguen los datos antes de guardar",
      });
      return;
    }

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

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (_e) {
        throw new Error(`Error de servidor (${res.status})`);
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al guardar");
      }

      setMessage("Guardado correctamente");
      show({ type: "success", message: "Configuración del Home guardada" });
      void mutateSettings();
    } catch (err: unknown) {
      logger.error("HomeForm Submit Error:", { error: err });
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setMessage(msg);
      show({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FormSkeleton rows={4} />;

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-4xl mx-auto pb-20">
      <HeaderSectionCard values={values} update={update} />
      <HeroSectionCard values={values} update={update} />
      <ContentSectionCard values={values} update={update} />
      <BenefitsSectionCard
        values={values}
        update={update}
        benefitItems={benefitItems}
        iconPickerOpen={iconPickerOpen}
        setIconPickerOpen={setIconPickerOpen}
        updateBenefitItem={updateBenefitItem}
        addBenefitItem={addBenefitItem}
        removeBenefitItem={removeBenefitItem}
      />
      <FooterSectionCard values={values} setValues={setValues} />

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {message && (
          <div className="bg-background/90 backdrop-blur border border-border p-3 rounded-lg shadow-lg text-sm mb-2">
            {message}
          </div>
        )}
        <Button
          type="submit"
          disabled={saving}
          size="lg"
          className="shadow-xl px-8"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
