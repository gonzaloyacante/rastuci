"use client";

import * as Icons from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/Button";
import { IconPicker } from "@/components/ui/IconPicker";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";
import { HomeSettings } from "@/lib/validation/home";

// ============================================================================
// Shared Types
// ============================================================================

export interface BenefitItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export type UpdateFn = <K extends keyof HomeSettings>(
  key: K,
  val: HomeSettings[K]
) => void;

export type SetValuesFn = React.Dispatch<React.SetStateAction<HomeSettings>>;

// ============================================================================
// Reusable Primitives
// ============================================================================

export const SettingsCard = ({
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

export const InputRow = ({
  label,
  value,
  onChange,
  enabled,
  onToggle,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  enabled?: boolean;
  onToggle?: (val: boolean) => void;
  placeholder?: string;
  error?: string;
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
          !enabled && onToggle && "opacity-60 bg-muted/20",
          error && "border-destructive focus-visible:ring-destructive"
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
    {onToggle && (
      <div className="flex flex-col items-end gap-1.5 pt-6 md:pt-7">
        <Switch checked={enabled ?? true} onCheckedChange={onToggle} />
      </div>
    )}
  </div>
);

// ============================================================================
// Header Section
// ============================================================================

export function HeaderSectionCard({
  values,
  update,
}: {
  values: HomeSettings;
  update: UpdateFn;
}) {
  return (
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
  );
}

// ============================================================================
// Hero Section
// ============================================================================

export function HeroSectionCard({
  values,
  update,
  errors,
}: {
  values: HomeSettings;
  update: UpdateFn;
  errors?: Record<string, string>;
}) {
  return (
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
            error={errors?.heroTitle}
          />
          <InputRow
            label="Subtítulo"
            value={values.heroSubtitle}
            onChange={(v) => update("heroSubtitle", v)}
            enabled={values.showHeroSubtitle}
            onToggle={(c) => update("showHeroSubtitle", c)}
            error={errors?.heroSubtitle}
          />

          <div className="pt-2 pb-2">
            <label className="text-sm font-medium mb-1.5 block">
              Opacidad del Overlay (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                value={values.heroOverlayOpacity ?? 20}
                onChange={(e) =>
                  update("heroOverlayOpacity", Number(e.target.value))
                }
              />
              <span className="text-sm font-mono w-12 text-right">
                {values.heroOverlayOpacity ?? 20}%
              </span>
            </div>
          </div>

          <div className="h-px bg-border my-2" />

          <div className="grid gap-2">
            <InputRow
              label="CTA Principal (Texto)"
              value={values.ctaPrimaryLabel}
              onChange={(v) => update("ctaPrimaryLabel", v)}
              enabled={values.showCtaPrimary}
              onToggle={(c) => update("showCtaPrimary", c)}
              error={errors?.ctaPrimaryLabel}
            />
            {values.showCtaPrimary && (
              <div className="pl-4 border-l-2 border-muted ml-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Link Botón Principal
                </label>
                <input
                  className={cn(
                    "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    errors?.ctaPrimaryLink && "border-destructive"
                  )}
                  value={values.ctaPrimaryLink ?? ""}
                  placeholder="/products"
                  onChange={(e) => update("ctaPrimaryLink", e.target.value)}
                />
                {errors?.ctaPrimaryLink && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.ctaPrimaryLink}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2 mt-2">
            <InputRow
              label="CTA Secundaria (Texto)"
              value={values.ctaSecondaryLabel}
              onChange={(v) => update("ctaSecondaryLabel", v)}
              enabled={values.showCtaSecondary}
              onToggle={(c) => update("showCtaSecondary", c)}
              error={errors?.ctaSecondaryLabel}
            />
            {values.showCtaSecondary && (
              <div className="pl-4 border-l-2 border-muted ml-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Link Botón Secundario
                </label>
                <input
                  className={cn(
                    "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    errors?.ctaSecondaryLink && "border-destructive"
                  )}
                  value={values.ctaSecondaryLink ?? ""}
                  placeholder="/about"
                  onChange={(e) => update("ctaSecondaryLink", e.target.value)}
                />
                {errors?.ctaSecondaryLink && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.ctaSecondaryLink}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================================================
// Content Section (Categories & Featured)
// ============================================================================

export function ContentSectionCard({
  values,
  update,
  errors,
}: {
  values: HomeSettings;
  update: UpdateFn;
  errors?: Record<string, string>;
}) {
  return (
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
            error={errors?.categoriesTitle}
          />
          <InputRow
            label="Subtítulo"
            value={values.categoriesSubtitle}
            onChange={(v) => update("categoriesSubtitle", v)}
            enabled={values.showCategoriesSubtitle}
            onToggle={(c) => update("showCategoriesSubtitle", c)}
            error={errors?.categoriesSubtitle}
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
            error={errors?.featuredTitle}
          />
          <InputRow
            label="Subtítulo"
            value={values.featuredSubtitle}
            onChange={(v) => update("featuredSubtitle", v)}
            enabled={values.showFeaturedSubtitle}
            onToggle={(c) => update("showFeaturedSubtitle", c)}
            error={errors?.featuredSubtitle}
          />
          <div className="px-4">
            <label className="text-sm font-medium mb-1.5 block">
              Cantidad de Productos
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="4"
                max="12"
                step="4"
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                value={values.featuredCount ?? 4}
                onChange={(e) =>
                  update("featuredCount", Number(e.target.value))
                }
              />
              <span className="text-sm font-mono w-12 text-right">
                {values.featuredCount ?? 4}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Recomendado: Múltiplos de 4
            </p>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

// ============================================================================
// Benefits Section
// ============================================================================

interface BenefitsSectionProps {
  values: HomeSettings;
  update: UpdateFn;
  benefitItems: BenefitItem[];
  iconPickerOpen: string | null;
  setIconPickerOpen: (id: string | null) => void;
  updateBenefitItem: (
    id: string,
    key: "icon" | "title" | "description",
    value: string
  ) => void;
  addBenefitItem: () => void;
  removeBenefitItem: (id: string) => void;
  titleError?: string;
  benefitErrors?: Array<{ title?: string; description?: string } | undefined>;
}

export function BenefitsSectionCard({
  values,
  update,
  benefitItems,
  iconPickerOpen,
  setIconPickerOpen,
  updateBenefitItem,
  addBenefitItem,
  removeBenefitItem,
  titleError,
  benefitErrors,
}: BenefitsSectionProps) {
  return (
    <>
      <SettingsCard
        title="Beneficios"
        description="Iconos destacando las ventajas de tu tienda."
      >
        <div className="mb-6">
          <InputRow
            label="Título de Sección Beneficios"
            value={values.benefitsTitle ?? "Por qué elegirnos"}
            onChange={(v) => update("benefitsTitle", v)}
            error={titleError}
          />
        </div>
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
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      benefitErrors?.[benefitItems.indexOf(benefitItem)]
                        ?.title && "border-destructive"
                    )}
                    value={benefitItem.title}
                    onChange={(e) =>
                      updateBenefitItem(benefitItem.id, "title", e.target.value)
                    }
                  />
                  {benefitErrors?.[benefitItems.indexOf(benefitItem)]
                    ?.title && (
                    <p className="text-xs text-destructive mt-1">
                      {benefitErrors[benefitItems.indexOf(benefitItem)]?.title}
                    </p>
                  )}
                </div>
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium mb-1 text-muted-foreground uppercase">
                    Descripción
                  </label>
                  <input
                    className={cn(
                      "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      benefitErrors?.[benefitItems.indexOf(benefitItem)]
                        ?.description && "border-destructive"
                    )}
                    value={benefitItem.description}
                    onChange={(e) =>
                      updateBenefitItem(
                        benefitItem.id,
                        "description",
                        e.target.value
                      )
                    }
                  />
                  {benefitErrors?.[benefitItems.indexOf(benefitItem)]
                    ?.description && (
                    <p className="text-xs text-destructive mt-1">
                      {
                        benefitErrors[benefitItems.indexOf(benefitItem)]
                          ?.description
                      }
                    </p>
                  )}
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
    </>
  );
}

// ============================================================================
// Footer Section
// ============================================================================

export function FooterSectionCard({
  values,
  setValues,
  errors,
}: {
  values: HomeSettings;
  setValues: SetValuesFn;
  errors?: Record<string, string>;
}) {
  return (
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
            error={errors?.brand}
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
            error={errors?.tagline}
          />
        </div>
      </div>
    </SettingsCard>
  );
}
