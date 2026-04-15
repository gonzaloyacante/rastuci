"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FieldErrors, useFieldArray, useForm } from "react-hook-form";

import { SettingsFormSkeleton } from "@/components/admin/skeletons";
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
  SetValuesFn,
} from "./HomeFormSections";

type Props = {
  initial?: HomeSettings;
};

type BenefitFieldError = {
  title?: { message?: string };
  description?: { message?: string };
};

function countErrors(errs: FieldErrors<HomeSettings>): number {
  let count = 0;
  const walk = (obj: unknown): void => {
    if (!obj || typeof obj !== "object") return;
    for (const val of Object.values(obj as Record<string, unknown>)) {
      if (val && typeof val === "object" && "message" in val) {
        count++;
      } else {
        walk(val);
      }
    }
  };
  walk(errs);
  return count;
}

export default function HomeForm({ initial }: Props) {
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);

  const form = useForm<HomeSettings>({
    resolver: zodResolver(HomeSettingsSchema),
    defaultValues: initial ?? defaultHomeSettings,
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const {
    fields: benefitFields,
    append,
    remove,
    update: updateBenefitField,
  } = useFieldArray({ control, name: "benefits" });

  const values = watch();

  const {
    settings,
    loading: loadingSettings,
    mutate: mutateSettings,
  } = useSettings<HomeSettings>("home");

  useEffect(() => {
    if (settings) {
      reset(settings);
      setLoading(false);
    } else if (initial) {
      reset(initial);
      setLoading(false);
    } else if (!loadingSettings) {
      logger.info("[HomeForm] Using DEFAULTS (No settings, no initial)");
      reset(defaultHomeSettings);
      setLoading(false);
    }
  }, [initial, settings, loadingSettings, reset]);

  const update = <K extends keyof HomeSettings>(key: K, val: HomeSettings[K]) =>
    // setValue generics don't align with keyof + value type — cast is safe here
    setValue(key, val as never, { shouldValidate: true, shouldDirty: true });

  const setValues: SetValuesFn = (action) => {
    const current = form.getValues();
    const newVals = typeof action === "function" ? action(current) : action;
    setValue("footer", newVals.footer, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Adapt useFieldArray fields to BenefitItem shape (add stable id from RHF)
  const benefitItems: BenefitItem[] = benefitFields.map((f) => ({
    id: f.id,
    icon: f.icon,
    title: f.title,
    description: f.description,
  }));

  const updateBenefitItem = (
    id: string,
    key: "icon" | "title" | "description",
    value: string
  ) => {
    const idx = benefitFields.findIndex((f) => f.id === id);
    if (idx !== -1) {
      const current = form.getValues("benefits");
      updateBenefitField(idx, { ...current[idx], [key]: value });
    }
  };

  const addBenefitItem = () =>
    append({ icon: "Truck", title: "Nuevo", description: "Descripción" });

  const removeBenefitItem = (id: string) => {
    const idx = benefitFields.findIndex((f) => f.id === id);
    if (idx !== -1) {
      remove(idx);
      show({ type: "success", message: "Beneficio eliminado" });
    }
  };

  // ── Extract per-section errors ────────────────────────────────────────────
  const heroErrors: Record<string, string> = {
    ...(errors.heroTitle?.message && { heroTitle: errors.heroTitle.message }),
    ...(errors.heroSubtitle?.message && {
      heroSubtitle: errors.heroSubtitle.message,
    }),
    ...(errors.ctaPrimaryLabel?.message && {
      ctaPrimaryLabel: errors.ctaPrimaryLabel.message,
    }),
    ...(errors.ctaPrimaryLink?.message && {
      ctaPrimaryLink: errors.ctaPrimaryLink.message,
    }),
    ...(errors.ctaSecondaryLabel?.message && {
      ctaSecondaryLabel: errors.ctaSecondaryLabel.message,
    }),
    ...(errors.ctaSecondaryLink?.message && {
      ctaSecondaryLink: errors.ctaSecondaryLink.message,
    }),
  };

  const contentErrors: Record<string, string> = {
    ...(errors.categoriesTitle?.message && {
      categoriesTitle: errors.categoriesTitle.message,
    }),
    ...(errors.categoriesSubtitle?.message && {
      categoriesSubtitle: errors.categoriesSubtitle.message,
    }),
    ...(errors.featuredTitle?.message && {
      featuredTitle: errors.featuredTitle.message,
    }),
    ...(errors.featuredSubtitle?.message && {
      featuredSubtitle: errors.featuredSubtitle.message,
    }),
  };

  const footerErrors: Record<string, string> = {
    ...(errors.footer?.brand?.message && {
      brand: errors.footer.brand.message,
    }),
    ...(errors.footer?.tagline?.message && {
      tagline: errors.footer.tagline.message,
    }),
  };

  const benefitErrors = (
    errors.benefits as BenefitFieldError[] | undefined
  )?.map((e) => ({
    title: e?.title?.message,
    description: e?.description?.message,
  }));

  const titleError = errors.benefitsTitle?.message;

  // ── Submit handlers ───────────────────────────────────────────────────────
  const onSubmit = async (data: HomeSettings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/home", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      let resData: { success?: boolean; error?: string };
      try {
        resData = text ? (JSON.parse(text) as typeof resData) : {};
      } catch (_e) {
        throw new Error(`Error de servidor (${res.status})`);
      }

      if (!res.ok || !resData.success) {
        throw new Error(resData.error ?? "Error al guardar");
      }

      show({ type: "success", message: "Configuración del Home guardada" });
      void mutateSettings();
    } catch (err: unknown) {
      logger.error("HomeForm Submit Error:", { error: err });
      const msg = err instanceof Error ? err.message : "Error inesperado";
      show({ type: "error", message: msg });
    } finally {
      setSaving(false);
    }
  };

  const onInvalid = (formErrors: FieldErrors<HomeSettings>) => {
    const n = countErrors(formErrors);
    show({
      type: "error",
      message: `Hay ${n} campo${n !== 1 ? "s" : ""} con errores. Revisá los campos marcados en rojo.`,
    });
  };

  if (loading) return <SettingsFormSkeleton rows={4} />;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-8 max-w-4xl mx-auto pb-20"
    >
      <HeaderSectionCard values={values} update={update} />
      <HeroSectionCard values={values} update={update} errors={heroErrors} />
      <ContentSectionCard
        values={values}
        update={update}
        errors={contentErrors}
      />
      <BenefitsSectionCard
        values={values}
        update={update}
        benefitItems={benefitItems}
        iconPickerOpen={iconPickerOpen}
        setIconPickerOpen={setIconPickerOpen}
        updateBenefitItem={updateBenefitItem}
        addBenefitItem={addBenefitItem}
        removeBenefitItem={removeBenefitItem}
        titleError={titleError}
        benefitErrors={benefitErrors}
      />
      <FooterSectionCard
        values={values}
        setValues={setValues}
        errors={footerErrors}
      />

      <div className="fixed bottom-6 right-6 z-50">
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
