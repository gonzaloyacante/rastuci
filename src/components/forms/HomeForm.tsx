"use client";

import { useToast } from "@/components/ui/Toast";
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
import { FormSkeleton } from "@/components/admin/SettingsSkeletons";
import { useSettings } from "@/hooks/useSettings";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

type Props = {
  initial?: HomeSettings;
};

interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

// Reuseable Card Component for Consistency
const SettingsCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-border bg-muted/5">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
    <div className="p-6 space-y-6">{children}</div>
  </div>
);

// Resusable Input Row with Toggle
const InputRow = ({
  label,
  value,
  onChange,
  enabled,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  enabled?: boolean;
  onToggle?: (val: boolean) => void;
  placeholder?: string;
}) => (
  <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start p-4 hover:bg-muted/5 rounded-lg border border-transparent hover:border-border transition-colors">
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
        {onToggle && !enabled && (
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
            Oculto
          </span>
        )}
      </div>
      <input
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !enabled && onToggle && "opacity-60 bg-muted/20"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
    {onToggle && (
      <div className="flex flex-col items-end gap-1.5 pt-6 md:pt-7">
        <Switch checked={enabled ?? true} onCheckedChange={onToggle} />
      </div>
    )}
  </div>
);

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
      console.log("[HomeForm] Using DEFAULTS (No settings, no initial)");
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
      mutateSettings();
    } catch (err: unknown) {
      console.error("HomeForm Submit Error:", err);
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
      {/* Header Section */}
      <SettingsCard
        title="Header (Navegación)"
        description="Configura el logo que aparece en la barra de navegación superior."
      >
        <div className="grid md:grid-cols-2 gap-8">
          <ImageUploader
            label="Logo del Header"
            value={values.headerLogoUrl}
            onChange={(url) => update("headerLogoUrl", url ?? undefined)}
            helpText="Formato recomendado: SVG, PNG. Fondo transparente."
            aspectRatio="auto"
          />
        </div>
      </SettingsCard>

      {/* Hero Section */}
      <SettingsCard
        title="Sección Principal (Hero)"
        description="Personaliza la primera impresión de tu tienda."
      >
        <div className="grid md:grid-cols-2 gap-8">
          {/* Visuals Column */}
          <div className="space-y-6">
            <div className="border border-border rounded-xl p-4 bg-background/50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Logo del Hero (Sobrepuesto)
                </label>
                <Switch
                  checked={values.showHeroLogo ?? true}
                  onCheckedChange={(c) => update("showHeroLogo", c)}
                />
              </div>
              <div
                className={cn(
                  "transition-opacity",
                  !(values.showHeroLogo ?? true) && "opacity-50 grayscale"
                )}
              >
                <ImageUploader
                  label=""
                  value={values.heroLogoUrl}
                  onChange={(url) => update("heroLogoUrl", url ?? undefined)}
                  aspectRatio="auto"
                />
              </div>
            </div>

            <div className="border border-border rounded-xl p-4 bg-background/50">
              <ImageUploader
                label="Imagen de Fondo del Hero"
                value={values.heroImage}
                onChange={(url) => update("heroImage", url ?? undefined)}
                helpText="Recomendado: 1920x1080px (16:9). JPG, WEBP."
                aspectRatio="video"
              />
            </div>
          </div>

          {/* Texts Column */}
          <div className="space-y-2">
            <InputRow
              label="Título Principal"
              value={values.heroTitle}
              onChange={(v) => update("heroTitle", v)}
              enabled={values.showHeroTitle}
              onToggle={(c) => update("showHeroTitle", c)}
            />
            <InputRow
              label="Subtítulo"
              value={values.heroSubtitle}
              onChange={(v) => update("heroSubtitle", v)}
              enabled={values.showHeroSubtitle}
              onToggle={(c) => update("showHeroSubtitle", c)}
            />
            <div className="h-px bg-border my-2" />
            <InputRow
              label="CTA Principal (Botón)"
              value={values.ctaPrimaryLabel}
              onChange={(v) => update("ctaPrimaryLabel", v)}
              enabled={values.showCtaPrimary}
              onToggle={(c) => update("showCtaPrimary", c)}
            />
            <InputRow
              label="CTA Secundaria (Botón)"
              value={values.ctaSecondaryLabel}
              onChange={(v) => update("ctaSecondaryLabel", v)}
              enabled={values.showCtaSecondary}
              onToggle={(c) => update("showCtaSecondary", c)}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Categories & Featured */}
      <SettingsCard title="Secciones de Contenido">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-primary uppercase tracking-wider">
              Categorías
            </h4>
            <InputRow
              label="Título de Sección"
              value={values.categoriesTitle}
              onChange={(v) => update("categoriesTitle", v)}
              enabled={values.showCategoriesTitle}
              onToggle={(c) => update("showCategoriesTitle", c)}
            />
            <InputRow
              label="Subtítulo"
              value={values.categoriesSubtitle}
              onChange={(v) => update("categoriesSubtitle", v)}
              enabled={values.showCategoriesSubtitle}
              onToggle={(c) => update("showCategoriesSubtitle", c)}
            />
          </div>
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-primary uppercase tracking-wider">
              Destacados
            </h4>
            <InputRow
              label="Título de Sección"
              value={values.featuredTitle}
              onChange={(v) => update("featuredTitle", v)}
              enabled={values.showFeaturedTitle}
              onToggle={(c) => update("showFeaturedTitle", c)}
            />
            <InputRow
              label="Subtítulo"
              value={values.featuredSubtitle}
              onChange={(v) => update("featuredSubtitle", v)}
              enabled={values.showFeaturedSubtitle}
              onToggle={(c) => update("showFeaturedSubtitle", c)}
            />
          </div>
        </div>
      </SettingsCard>

      {/* Benefits */}
      <SettingsCard
        title="Beneficios"
        description="Iconos destacando las ventajas de tu tienda."
      >
        <div className="space-y-4">
          {benefitItems.map((benefitItem) => {
            const IconComponent = (
              Icons as unknown as Record<string, React.ElementType>
            )[benefitItem.icon];

            return (
              <div
                key={benefitItem.id}
                className="grid md:grid-cols-12 gap-3 items-end p-4 border border-border rounded-lg bg-background hover:border-primary/50 transition-colors"
                id="benefits-editor"
              >
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1.5 text-muted-foreground uppercase">
                    Ícono
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIconPickerOpen(benefitItem.id)}
                    className="w-full justify-center h-10"
                  >
                    {IconComponent && <IconComponent size={18} />}
                    <span className="text-sm truncate ml-2">
                      {benefitItem.icon}
                    </span>
                  </Button>
                </div>
                <div className="md:col-span-4">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground uppercase">
                    Título
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={benefitItem.title}
                    onChange={(e) =>
                      updateBenefitItem(benefitItem.id, "title", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground uppercase">
                    Descripción
                  </label>
                  <input
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
                <div className="md:col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeBenefitItem(benefitItem.id)}
                  >
                    <Icons.Trash2 size={18} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={addBenefitItem}
            className="w-full md:w-auto border-dashed"
          >
            <Icons.Plus className="w-4 h-4 mr-2" />
            Agregar beneficio
          </Button>
        </div>
      </SettingsCard>

      {/* Footer */}
      <SettingsCard
        title="Pie de Página (Footer)"
        description="Identidad de marca en el pie de página."
      >
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-border rounded-xl p-4 bg-background/50 h-fit">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Logo del Footer</label>
              <Switch
                checked={values.footer?.showLogo ?? true}
                onCheckedChange={(c) =>
                  setValues((v) => ({
                    ...v,
                    footer: { ...v.footer!, showLogo: c },
                  }))
                }
              />
            </div>
            <div
              className={cn(
                "transition-opacity",
                !(values.footer?.showLogo ?? true) && "opacity-50 grayscale"
              )}
            >
              <ImageUploader
                label=""
                value={values.footer?.logoUrl}
                onChange={(url) =>
                  setValues((v) => ({
                    ...v,
                    footer: { ...v.footer!, logoUrl: url ?? undefined },
                  }))
                }
                helpText="Logo monocromático o simple para el pie de página."
                aspectRatio="auto"
              />
            </div>
          </div>

          <div className="space-y-2">
            <InputRow
              label="Nombre de Marca"
              value={values.footer?.brand || ""}
              onChange={(val) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, brand: val },
                }))
              }
              enabled={values.footer?.showBrand}
              onToggle={(c) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, showBrand: c },
                }))
              }
            />
            <InputRow
              label="Slogan / Tagline"
              value={values.footer?.tagline || ""}
              onChange={(val) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, tagline: val },
                }))
              }
              enabled={values.footer?.showTagline}
              onToggle={(c) =>
                setValues((v) => ({
                  ...v,
                  footer: { ...v.footer!, showTagline: c },
                }))
              }
            />
          </div>
        </div>
      </SettingsCard>

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
