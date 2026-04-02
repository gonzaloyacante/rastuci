import * as z from "zod";

import { Product, ProductVariant } from "@/types";

// ==============================================================================
// CATEGORY TYPE
// ==============================================================================
export interface ProductFormCategory {
  id: string;
  name: string;
  description?: string | null;
}

// ==============================================================================
// ZOD SCHEMA
// ==============================================================================
export const productSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .max(2000, "La descripción no puede exceder 2000 caracteres")
    .optional(),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa un precio válido" })
      .min(0.01, "El precio debe ser mayor a 0")
  ),
  discountPercentage: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa un porcentaje válido" })
      .min(0, "El descuento no puede ser negativo")
      .max(100, "El descuento no puede ser mayor a 100%")
      .optional()
      .nullable()
  ),
  stock: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa un stock válido" })
      .int("El stock debe ser un número entero")
      .min(0, "El stock no puede ser negativo")
  ),
  categoryId: z.string().nonempty("Debes seleccionar una categoría"),
  onSale: z.coerce.boolean().optional(),
  weight: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa un peso válido" })
      .int()
      .min(1)
      .max(30000)
      .optional()
      .nullable()
  ),
  height: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa una altura válida" })
      .int()
      .min(1)
      .max(150)
      .optional()
      .nullable()
  ),
  width: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa un ancho válido" })
      .int()
      .min(1)
      .max(150)
      .optional()
      .nullable()
  ),
  length: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z
      .number({ invalid_type_error: "Ingresa un largo válido" })
      .int()
      .min(1)
      .max(150)
      .optional()
      .nullable()
  ),
  sizesInput: z.string().optional(),
  colorsInput: z.string().optional(),
  featuresInput: z.string().optional(),
  // isActive: gestiona el estado de publicación del producto (activo/inactivo)
  isActive: z.boolean().optional(),
  // sizeGuide: usa z.unknown() porque el editor produce { columns, rows } y la API devuelve
  // SizeGuideEntry[] — ambos formatos son válidos en diferentes etapas del flujo
  sizeGuide: z.unknown().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormProps {
  initialData?: Product | null;
  categories: ProductFormCategory[];
}

// ==============================================================================
// PURE HELPERS
// ==============================================================================

export function parseProductImages(images: Product["images"]): string[] {
  if (Array.isArray(images)) return images as string[];
  if (typeof images === "string") return JSON.parse(images) as string[];
  return [];
}

export function calcDiscountPercentage(
  price: number,
  salePrice: number | null | undefined
): number | null {
  return salePrice && price
    ? Math.round(((price - salePrice) / price) * 100)
    : null;
}

function numOrNull(v: number | null | undefined): number | null {
  return v ?? null;
}

export function buildInitialResetValues(
  d: Product,
  discountPercentage: number | null
): Partial<ProductFormValues> {
  return {
    name: d.name,
    description: d.description || "",
    price: d.price,
    discountPercentage,
    stock: d.stock,
    categoryId: d.categoryId,
    onSale: d.onSale || false,
    isActive: d.isActive ?? true,
    weight: numOrNull(d.weight),
    height: numOrNull(d.height),
    width: numOrNull(d.width),
    length: numOrNull(d.length),
    // No incluimos sizeGuide aquí porque la API devuelve SizeGuideEntry[]
    // que es incompatible con el formato del editor { columns, rows }.
    // El editor arranca vacío al editar; los datos se preservan en el servidor.
  };
}

export function buildImageOptions(
  productImages: string[],
  colorImages: Record<string, string[]>
) {
  return {
    images:
      productImages.length > 0
        ? productImages
        : Object.values(colorImages).flat(),
    colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
  };
}

export function buildOptionalPayloadFields(
  sizes: string[],
  colors: string[],
  features: string[],
  variants: ProductVariant[]
) {
  const entries: [string, string[] | ProductVariant[]][] = [
    ["sizes", sizes],
    ["colors", colors],
    ["features", features],
    ["variants", variants],
  ];
  return Object.fromEntries(entries.filter(([, v]) => v.length > 0));
}

export function buildProductData(
  data: ProductFormValues,
  productImages: string[],
  colorImages: Record<string, string[]>,
  totalVariantStock: number,
  sizes: string[],
  colors: string[],
  features: string[],
  variants: ProductVariant[]
) {
  const discountPct = data.discountPercentage;
  const salePrice =
    discountPct && discountPct > 0
      ? data.price * (1 - discountPct / 100)
      : null;
  const dimensions = {
    weight: data.weight ?? null,
    height: data.height ?? null,
    width: data.width ?? null,
    length: data.length ?? null,
  };
  // Solo enviar sizeGuide si el editor produjo un objeto (SizeGuideData { columns, rows }).
  // Si es un array (SizeGuideEntry[] que llega del API en el reset), no enviarlo.
  const sizeGuide = Array.isArray(data.sizeGuide) ? undefined : data.sizeGuide;
  return {
    name: data.name.trim(),
    description: data.description?.trim() ?? null,
    price: Number(data.price),
    salePrice: salePrice ? Number(salePrice) : null,
    stock: totalVariantStock,
    categoryId: data.categoryId.trim(),
    ...buildImageOptions(productImages, colorImages),
    isActive: data.isActive ?? true,
    onSale: (discountPct ?? 0) > 0,
    ...buildOptionalPayloadFields(sizes, colors, features, variants),
    ...dimensions,
    sizeGuide,
  };
}

export const numericKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const allowed = [
    "Backspace",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Delete",
    "Home",
    "End",
  ];
  if (allowed.includes(e.key)) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
};

export const numericPasteHandler = (
  e: React.ClipboardEvent<HTMLInputElement>
) => {
  const paste = e.clipboardData?.getData("text") || "";
  if (!/^\d+$/.test(paste)) e.preventDefault();
};

export interface NormalizedProductData {
  images: string[];
  colorImages: Record<string, string[]>;
  colors: string[];
  sizes: string[];
  features: string[];
  variants: ProductVariant[];
  categoryId: string;
  resetValues: Partial<ProductFormValues>;
}

export function normalizeProductData(d: Product): NormalizedProductData {
  const discount = calcDiscountPercentage(d.price, d.salePrice);
  return {
    images: parseProductImages(d.images),
    colorImages: (d.colorImages as Record<string, string[]>) ?? {},
    colors: d.colors ?? [],
    sizes: d.sizes ?? [],
    features: d.features ?? [],
    variants: d.variants ?? [],
    categoryId: d.categoryId ?? "",
    resetValues: buildInitialResetValues(d, discount),
  };
}
