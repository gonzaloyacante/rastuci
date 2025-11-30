"use client";

import { logger } from "@/lib/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ColorChip } from "@/components/ui/ColorChip";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Product } from "@/types";
import { formatPriceARS } from "@/utils/formatters";
import {
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Eye,
  FileText,
  Hash,
  Info,
  List,
  Package,
  Palette,
  Percent,
  Ruler,
  Save,
  Tag,
  Upload,
} from "lucide-react";

import ImageUploadZone from "./ImageUploadZone";
import {
  ColorPicker,
  FeatureManager,
  HelpTooltip,
  PlaceholderImage,
  ProductPreviewBadges,
  SizeManager,
  StockIndicator,
} from "./ProductFormComponents";

// ==============================================================================
// TYPES & SCHEMA
// ==============================================================================
interface Category {
  id: string;
  name: string;
  description?: string | null;
}

const productSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  description: z
    .string()
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .optional(),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  discountPercentage: z.coerce
    .number()
    .min(0, "El descuento no puede ser negativo")
    .max(100, "El descuento no puede ser mayor a 100%")
    .optional()
    .nullable(),
  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  categoryId: z.string().nonempty("Debes seleccionar una categoría"),
  onSale: z.coerce.boolean().optional(),
  weight: z.coerce.number().int().min(1).max(30000).optional().nullable(),
  height: z.coerce.number().int().min(1).max(150).optional().nullable(),
  width: z.coerce.number().int().min(1).max(150).optional().nullable(),
  length: z.coerce.number().int().min(1).max(150).optional().nullable(),
  sizesInput: z.string().optional(),
  colorsInput: z.string().optional(),
  featuresInput: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
}

// ==============================================================================
// NUMERIC INPUT HANDLERS (para reutilizar lógica de validación de inputs)
// ==============================================================================
const numericKeyHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

const numericPasteHandler = (e: React.ClipboardEvent<HTMLInputElement>) => {
  const paste = e.clipboardData?.getData("text") || "";
  if (!/^\d+$/.test(paste)) e.preventDefault();
};

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================
export default function ProductForm({
  initialData,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.categoryId || ""
  );
  const [productImages, setProductImages] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);

  const title = initialData ? "Editar Producto" : "Crear Nuevo Producto";
  const toastMessage = initialData
    ? "Producto actualizado exitosamente"
    : "Producto creado exitosamente";
  const action = initialData ? "Guardar Cambios" : "Crear Producto";

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  const watchPrice = watch("price");
  const watchStock = watch("stock");
  const watchOnSale = watch("onSale");
  const watchDiscountPercentage = watch("discountPercentage");

  // Price input state for locale formatting
  const [priceInput, setPriceInput] = useState<string>(
    watchPrice !== undefined && watchPrice !== null
      ? formatPriceARS(Number(watchPrice))
      : ""
  );

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      const parsedImages = Array.isArray(initialData.images)
        ? initialData.images
        : typeof initialData.images === "string"
          ? JSON.parse(initialData.images)
          : [];

      setProductImages(parsedImages);
      setColors(initialData.colors || []);
      setSizes(initialData.sizes || []);
      setFeatures(initialData.features || []);

      const discountPercentage =
        initialData.salePrice && initialData.price
          ? Math.round(
              ((initialData.price - initialData.salePrice) /
                initialData.price) *
                100
            )
          : null;

      reset({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        discountPercentage,
        stock: initialData.stock,
        categoryId: initialData.categoryId,
        onSale: initialData.onSale || false,
        weight: initialData.weight || null,
        height: initialData.height || null,
        width: initialData.width || null,
        length: initialData.length || null,
      });
    }
  }, [initialData, reset]);

  // Sync price input when watchPrice changes
  useEffect(() => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(formatPriceARS(Number(watchPrice)));
    }
  }, [watchPrice]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId);
  };

  const calculatedSalePrice =
    watchPrice && watchDiscountPercentage && watchDiscountPercentage > 0
      ? watchPrice * (1 - watchDiscountPercentage / 100)
      : null;

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true);

      const salePrice =
        data.discountPercentage && data.discountPercentage > 0
          ? data.price * (1 - data.discountPercentage / 100)
          : null;

      const productData = {
        name: data.name,
        description: data.description || null,
        price: data.price,
        salePrice,
        stock: data.stock,
        categoryId: data.categoryId,
        images: productImages,
        onSale: data.onSale || false,
        sizes,
        colors,
        features,
        weight: data.weight || null,
        height: data.height || null,
        width: data.width || null,
        length: data.length || null,
      };

      if (initialData) {
        await axios.put(`/api/products/${initialData.id}`, productData);
      } else {
        await axios.post("/api/products", productData);
      }

      router.push("/admin/productos");
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      logger.error("Error al guardar el producto:", { error });
      toast.error("Error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Price input handlers
  const handlePriceFocus = () => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(String(Number(watchPrice)));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const filtered = String(raw).replace(/[^0-9.,]/g, "");
    setPriceInput(filtered);

    const noThousands = filtered.replace(/\./g, "");
    const normalized = noThousands.replace(/,/, ".");
    const parsed = parseFloat(normalized);

    if (!isNaN(parsed)) {
      setValue("price", parsed, { shouldValidate: true, shouldDirty: true });
    } else if (filtered.trim() === "") {
      setValue("price", 0, { shouldValidate: false });
    }
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    if (!/^[0-9.,]$/.test(e.key)) e.preventDefault();
  };

  const handlePricePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData?.getData("text") || "";
    if (!/^[0-9.,\s]+$/.test(paste)) e.preventDefault();
  };

  const handlePriceBlur = () => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(formatPriceARS(Number(watchPrice)));
    } else {
      setPriceInput("");
    }
  };

  return (
    <div className="min-h-screen surface py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-linear-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {title}
          </h1>
          <p className="muted mt-2 text-lg">
            {initialData
              ? `Modifica los datos del producto: ${initialData.name}`
              : "Completa toda la información para crear un producto completo"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Información Básica */}
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-linear-to-r from-primary to-primary/90 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    <Package className="h-4 w-4 inline mr-2" />
                    Nombre del Producto *
                  </label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: Vestido Floral Primavera"
                    className={errors.name ? "border-error" : ""}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="categoryId"
                    className="block text-sm font-medium mb-2"
                  >
                    <Tag className="h-4 w-4 inline mr-2" />
                    Categoría *
                  </label>
                  <Select
                    id="categoryId"
                    name="categoryId"
                    options={categories.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                    placeholder="Selecciona una categoría"
                    disabled={loading}
                    error={!!errors.categoryId}
                  />
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2"
                >
                  <FileText className="h-4 w-4 inline mr-2" />
                  Descripción Detallada
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe detalladamente el producto..."
                  rows={4}
                  className={`form-input resize-none ${errors.description ? "border-error" : ""}`}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 1000 caracteres.
                </p>
                {errors.description && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Precios y Stock */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-linear-to-r from-green-600 to-green-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precios y Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium mb-2"
                  >
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Precio Base *
                  </label>
                  <Input
                    id="price"
                    type="text"
                    inputMode="decimal"
                    value={priceInput}
                    onFocus={handlePriceFocus}
                    onChange={handlePriceChange}
                    onKeyDown={handlePriceKeyDown}
                    onPaste={handlePricePaste}
                    onBlur={handlePriceBlur}
                    placeholder={formatPriceARS(0)}
                    className={errors.price ? "border-error" : ""}
                    disabled={loading}
                  />
                  {watchPrice > 0 && (
                    <p className="text-xs text-success mt-1 font-medium">
                      {formatPriceARS(Number(watchPrice))}
                    </p>
                  )}
                  {errors.price && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="discountPercentage"
                    className="block text-sm font-medium mb-2"
                  >
                    <Percent className="h-4 w-4 inline mr-2" />
                    Descuento (%)
                  </label>
                  <Input
                    id="discountPercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...register("discountPercentage")}
                    placeholder="0"
                    onKeyDown={numericKeyHandler}
                    onPaste={numericPasteHandler}
                    className={errors.discountPercentage ? "border-error" : ""}
                    disabled={loading}
                  />
                  {watchDiscountPercentage &&
                    watchDiscountPercentage > 0 &&
                    calculatedSalePrice && (
                      <>
                        <p className="text-xs text-orange-600 mt-1 font-medium">
                          Precio en oferta:{" "}
                          {formatPriceARS(Number(calculatedSalePrice))}
                          <span className="ml-1 text-error">
                            (-{watchDiscountPercentage}%)
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          El descuento será de{" "}
                          {formatPriceARS(
                            Number(watchPrice || 0) -
                              Number(calculatedSalePrice)
                          )}
                        </p>
                      </>
                    )}
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium mb-2"
                  >
                    <Hash className="h-4 w-4 inline mr-2" />
                    Stock Disponible *
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock")}
                    placeholder="0"
                    onKeyDown={numericKeyHandler}
                    onPaste={numericPasteHandler}
                    className={errors.stock ? "border-error" : ""}
                    disabled={loading}
                  />
                  {watchStock !== undefined && (
                    <StockIndicator stock={Number(watchStock)} />
                  )}
                  {errors.stock && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="onSale"
                    className="block text-sm font-medium mb-2"
                  >
                    Estado de Venta
                  </label>
                  <label
                    htmlFor="onSale"
                    className="inline-flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-surface transition-colors"
                  >
                    <input
                      id="onSale"
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-primary"
                      {...register("onSale")}
                      disabled={loading}
                    />
                    <span className="font-medium">En Oferta</span>
                  </label>
                  {watchOnSale && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      ✓ Producto marcado como oferta
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensiones para Envío */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-linear-to-r from-orange-600 to-orange-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Dimensiones para Envío
                <HelpTooltip text="Estas medidas son requeridas para calcular el costo de envío con Correo Argentino." />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    id: "weight",
                    label: "Peso (gramos)",
                    placeholder: "1000",
                    min: "1g",
                    max: "30kg",
                  },
                  {
                    id: "height",
                    label: "Alto (cm)",
                    placeholder: "10",
                    min: "1cm",
                    max: "150cm",
                  },
                  {
                    id: "width",
                    label: "Ancho (cm)",
                    placeholder: "20",
                    min: "1cm",
                    max: "150cm",
                  },
                  {
                    id: "length",
                    label: "Largo (cm)",
                    placeholder: "30",
                    min: "1cm",
                    max: "150cm",
                  },
                ].map(({ id, label, placeholder, min, max }) => (
                  <div key={id}>
                    <label
                      htmlFor={id}
                      className="block text-sm font-medium mb-2"
                    >
                      <Ruler className="h-4 w-4 inline mr-2" />
                      {label}
                    </label>
                    <Input
                      id={id}
                      type="number"
                      {...register(id as keyof ProductFormValues)}
                      placeholder={placeholder}
                      className={
                        errors[id as keyof typeof errors] ? "border-error" : ""
                      }
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mín: {min} • Máx: {max}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 flex items-start gap-2">
                  <Info className="h-4 w-4 text-orange-600 mt-0.5 shrink-0" />
                  <span>
                    <strong>Importante:</strong> Las dimensiones correctas son
                    esenciales para calcular el costo de envío. Si no se
                    especifican, se usarán valores por defecto (1000g,
                    10x20x30cm).
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Variantes del Producto */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-linear-to-r from-purple-600 to-purple-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Variantes del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Ruler className="h-4 w-4 inline mr-2" />
                  Talles Disponibles
                </label>
                <SizeManager sizes={sizes} onSizesChange={setSizes} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  <Palette className="h-4 w-4 inline mr-2" />
                  Colores Disponibles
                </label>
                <ColorPicker colors={colors} onColorsChange={setColors} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  <List className="h-4 w-4 inline mr-2" />
                  Características Especiales
                </label>
                <FeatureManager
                  features={features}
                  onFeaturesChange={setFeatures}
                />
              </div>
            </CardContent>
          </Card>

          {/* Imágenes del Producto */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-linear-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Galería de Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ImageUploadZone
                existingImages={productImages}
                onImagesChange={setProductImages}
                maxImages={10}
                maxSizeMB={5}
              />
            </CardContent>
          </Card>

          {/* Vista Previa */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-linear-to-r from-indigo-600 to-indigo-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ProductPreview
                images={productImages}
                name={watch("name")}
                category={
                  categories.find((c) => c.id === watch("categoryId"))?.name
                }
                description={watch("description")}
                price={Number(watch("price") || 0)}
                salePrice={calculatedSalePrice}
                discountPercentage={watchDiscountPercentage}
                onSale={watchOnSale}
                stock={Number(watch("stock"))}
                features={features}
                sizes={sizes}
                colors={colors}
              />
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={loading}
              variant="hero"
              className="flex-1 h-14 text-lg font-semibold shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Procesando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-3" />
                  {action}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/productos")}
              className="flex-1 h-14 text-lg font-semibold border-2"
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5 mr-3" />
              Volver sin Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==============================================================================
// ProductPreview - Componente de vista previa extraído
// ==============================================================================
interface ProductPreviewProps {
  images: string[];
  name?: string;
  category?: string;
  description?: string;
  price: number;
  salePrice: number | null;
  discountPercentage?: number | null;
  onSale?: boolean;
  stock: number;
  features: string[];
  sizes: string[];
  colors: string[];
}

function ProductPreview({
  images,
  name,
  category,
  description,
  price,
  salePrice,
  discountPercentage,
  onSale,
  stock,
  features,
  sizes,
  colors,
}: ProductPreviewProps) {
  return (
    <div className="bg-surface rounded-lg p-6 border">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          {images.length > 0 ? (
            <>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-muted">
                <Image
                  src={images[0]}
                  alt="Vista previa"
                  width={500}
                  height={500}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, idx) => (
                    <div
                      key={`thumb-${idx}`}
                      className="aspect-square bg-muted rounded overflow-hidden border border-muted hover:border-primary transition-colors"
                    >
                      <Image
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <PlaceholderImage className="aspect-square" />
          )}
        </div>

        {/* Información del Producto */}
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
              Categoría: {category || "No seleccionada"}
            </p>
            <h3 className="text-3xl font-bold text-primary">
              {name || "Nombre del producto"}
            </h3>
          </div>

          <ProductPreviewBadges onSale={onSale} stock={stock} />

          {/* Precio */}
          <div className="space-y-2 py-4 border-y border-muted">
            {discountPercentage && discountPercentage > 0 && salePrice ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-success">
                    {formatPriceARS(Number(salePrice))}
                  </span>
                  <span className="bg-error text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                    -{discountPercentage}% OFF
                  </span>
                </div>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPriceARS(price)}
                </span>
                <p className="text-sm text-success font-medium">
                  ¡Ahorrás {formatPriceARS(price - Number(salePrice))}!
                </p>
              </div>
            ) : (
              <span className="text-3xl font-bold text-primary">
                {formatPriceARS(price)}
              </span>
            )}
          </div>

          <p className="text-primary/90 leading-relaxed">
            {description || "Descripción del producto aparecerá aquí..."}
          </p>

          {features.length > 0 && (
            <div className="bg-surface-secondary p-4 rounded-lg">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <List className="h-4 w-4" />
                Características
              </p>
              <ul className="space-y-1.5">
                {features.map((feature, index) => (
                  <li
                    key={`feat-${index}`}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="text-success mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sizes.length > 0 && (
            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Talles Disponibles
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size, index) => (
                  <span
                    key={`size-${index}`}
                    className="px-4 py-2 border-2 border-muted rounded-lg text-sm font-medium hover:border-primary transition-colors"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div>
              <p className="font-semibold mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Colores Disponibles
              </p>
              <div className="flex flex-wrap gap-3">
                {colors.map((color, index) => (
                  <div
                    key={`color-${index}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-surface-secondary rounded-full border border-muted"
                  >
                    <ColorChip color={color} size="sm" />
                    <span className="text-sm font-medium">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span>
            Esta es una vista previa de cómo se verá el producto en la tienda.
            Verifica que toda la información sea correcta antes de guardar.
          </span>
        </p>
      </div>
    </div>
  );
}
