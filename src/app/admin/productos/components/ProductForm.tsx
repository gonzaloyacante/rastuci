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
  Check,
  DollarSign,
  Eye,
  FileText,
  Hash,
  HelpCircle,
  ImageIcon,
  Info,
  List,
  Package,
  Palette,
  Percent,
  Ruler,
  Save,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";

// Componente de ayuda reutilizable con tooltip
const HelpTooltip = ({ text }: { text: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-muted hover:text-primary transition-colors"
        aria-label="Ayuda"
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-primary text-white text-xs rounded-lg shadow-lg max-w-xs whitespace-normal">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-primary" />
        </div>
      )}
    </div>
  );
};// Interfaces locales para tipado
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
  // Campos mejorados
  sizesInput: z.string().optional(),
  colorsInput: z.string().optional(),
  featuresInput: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
}

const PlaceholderImage = ({ className }: { className?: string }) => (
  <div
    className={`bg-muted rounded-lg flex items-center justify-center ${className || "w-full h-48"}`}
  >
    <div className="text-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Sin imagen</p>
    </div>
  </div>
);

/* ImagePreview was removed because preview and remove functionality
   are handled by ImageUploadZone and the inline gallery below.
   If later needed, restore a shared Preview component in a ui/ folder. */

const ColorPicker = ({
  colors,
  onColorsChange,
}: {
  colors: string[];
  onColorsChange: (colors: string[]) => void;
}) => {
  const [newColor, setNewColor] = useState("");
  const [colorInput, setColorInput] = useState("#000000");

  // Palette predefinida de colores comunes
  const commonColors = [
    { name: "Rojo", hex: "#FF0000" },
    { name: "Azul", hex: "#0000FF" },
    { name: "Verde", hex: "#00FF00" },
    { name: "Amarillo", hex: "#FFFF00" },
    { name: "Negro", hex: "#000000" },
    { name: "Blanco", hex: "#FFFFFF" },
    { name: "Rosa", hex: "#FFC0CB" },
    { name: "Naranja", hex: "#FFA500" },
    { name: "Morado", hex: "#800080" },
    { name: "Gris", hex: "#808080" },
    { name: "Celeste", hex: "#87CEEB" },
    { name: "Beige", hex: "#F5F5DC" },
  ];

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      onColorsChange([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const addColorFromPicker = () => {
    const colorName = `Color ${colorInput}`;
    if (!colors.includes(colorName)) {
      onColorsChange([...colors, colorName]);
    }
  };

  const addPredefinedColor = (name: string) => {
    if (!colors.includes(name)) {
      onColorsChange([...colors, name]);
    }
  };

  const removeColor = (colorToRemove: string) => {
    onColorsChange(colors.filter((color) => color !== colorToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Palette de colores predefinidos */}
      <div>
        <p className="text-sm font-medium mb-2">Colores Predefinidos</p>
        <div className="flex flex-wrap gap-2">
          {commonColors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => addPredefinedColor(c.name)}
              disabled={colors.includes(c.name)}
              className="group relative"
              title={`Agregar ${c.name}`}
            >
              <div
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  colors.includes(c.name)
                    ? "border-success opacity-50"
                    : "border-muted hover:border-primary hover:scale-110"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                {colors.includes(c.name) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white drop-shadow" />
                  </div>
                )}
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Color picker HTML5 */}
      <div>
        <p className="text-sm font-medium mb-2">Color Personalizado (Picker)</p>
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={colorInput}
            onChange={(e) => setColorInput(e.target.value)}
            className="w-16 h-10 rounded border-2 border-muted cursor-pointer"
          />
          <span className="text-sm muted font-mono">{colorInput}</span>
          <Button
            type="button"
            onClick={addColorFromPicker}
            variant="outline"
            size="sm"
          >
            Agregar
          </Button>
        </div>
      </div>

      {/* Input manual para nombres o hex */}
      <div>
        <p className="text-sm font-medium mb-2">
          Color Manual (nombre o código hex)
        </p>
        <div className="flex gap-2">
          <Input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="Ej: Rojo, #FF0000, rgba(255,0,0,1)"
            className="flex-1"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addColor())
            }
          />
          <Button type="button" onClick={addColor} variant="outline" size="sm">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Colores seleccionados */}
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Colores Seleccionados ({colors.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <div
                key={color}
                className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-full text-sm border border-muted"
              >
                <ColorChip color={color} size="sm" />
                <span className="font-medium">{color}</span>
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-error hover:bg-error hover:text-white rounded-full p-1 transition-colors ml-1"
                  title={`Eliminar ${color}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SizeManager = ({
  sizes,
  onSizesChange,
}: {
  sizes: string[];
  onSizesChange: (sizes: string[]) => void;
}) => {
  const [newSize, setNewSize] = useState("");

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      onSizesChange([...sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    onSizesChange(sizes.filter((size) => size !== sizeToRemove));
  };

  const commonSizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Talle personalizado"
          className="flex-1"
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), addSize())
          }
        />
        <Button type="button" onClick={addSize} variant="outline" size="sm">
          <Check className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Talles comunes:</p>
        <div className="flex flex-wrap gap-2">
          {commonSizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() =>
                !sizes.includes(size) && onSizesChange([...sizes, size])
              }
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                sizes.includes(size)
                  ? "bg-primary text-white border-primary"
                  : "border-muted hover:border-primary hover:bg-primary/10"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-full text-sm"
          >
            <span>{size}</span>
            <button
              type="button"
              onClick={() => removeSize(size)}
              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FeatureManager = ({
  features,
  onFeaturesChange,
}: {
  features: string[];
  onFeaturesChange: (features: string[]) => void;
}) => {
  const [newFeature, setNewFeature] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");

  // Características predefinidas categorizadas
  const featureCategories = {
    material: {
      label: "Material",
      help: "Composición y tipo de tela del producto",
      items: [
        "100% Algodón",
        "100% Algodón orgánico",
        "Mezcla de algodón",
        "Poliéster",
        "Lana",
        "Seda",
        "Denim",
        "Jersey",
      ],
    },
    cuidado: {
      label: "Cuidado",
      help: "Instrucciones de lavado y mantenimiento",
      items: [
        "Lavable en máquina",
        "Lavar a mano",
        "No usar blanqueador",
        "Secar al aire",
        "Planchar a baja temperatura",
        "Lavar con colores similares",
      ],
    },
    diseño: {
      label: "Diseño",
      help: "Características del diseño y estilo",
      items: [
        "Diseño cómodo y fresco",
        "Diseño moderno",
        "Estampado de calidad",
        "Estampado que no se destiñe",
        "Botones de seguridad",
        "Cierre invisible",
        "Bolsillos funcionales",
      ],
    },
    caracteristicas: {
      label: "Características",
      help: "Propiedades adicionales del producto",
      items: [
        "Transpirable",
        "Resistente al agua",
        "Protección UV",
        "Antibacterial",
        "Hipoalergénico",
        "Elástico",
        "Forrado",
      ],
    },
  };

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onFeaturesChange([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const addPredefinedFeature = (feature: string) => {
    if (!features.includes(feature)) {
      onFeaturesChange([...features, feature]);
    }
  };

  const removeFeature = (featureToRemove: string) => {
    onFeaturesChange(features.filter((feature) => feature !== featureToRemove));
  };

  const allFeatures = Object.values(featureCategories).flatMap((cat) => cat.items);
  const displayFeatures =
    selectedCategory === "todos"
      ? allFeatures
      : featureCategories[selectedCategory as keyof typeof featureCategories]?.items || [];

  return (
    <div className="space-y-4">
      {/* Categorías de características */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium">Categorías de Características</p>
          <HelpTooltip text="Selecciona una categoría para ver sugerencias predefinidas o agrega características personalizadas" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("todos")}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              selectedCategory === "todos"
                ? "bg-primary text-white border-primary"
                : "border-muted hover:border-primary"
            }`}
          >
            Todos
          </button>
          {Object.entries(featureCategories).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                selectedCategory === key
                  ? "bg-primary text-white border-primary"
                  : "border-muted hover:border-primary"
              }`}
              title={cat.help}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Características sugeridas */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium">Características Sugeridas</p>
          {selectedCategory !== "todos" && (
            <HelpTooltip
              text={
                featureCategories[selectedCategory as keyof typeof featureCategories]?.help || ""
              }
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-surface/50 rounded-lg">
          {displayFeatures.map((feature) => (
            <button
              key={feature}
              type="button"
              onClick={() => addPredefinedFeature(feature)}
              disabled={features.includes(feature)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${
                features.includes(feature)
                  ? "bg-success/10 border-success text-success cursor-not-allowed"
                  : "border-muted hover:border-primary hover:bg-primary/5"
              }`}
              title={features.includes(feature) ? "Ya agregada" : `Agregar ${feature}`}
            >
              {feature}
              {features.includes(feature) && (
                <Check className="inline h-3 w-3 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Input personalizado */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm font-medium">Característica Personalizada</p>
          <HelpTooltip text="Agrega cualquier característica específica que no esté en las sugerencias" />
        </div>
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Ej: Resistente a manchas"
            className="flex-1"
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addFeature())
            }
          />
          <Button type="button" onClick={addFeature} variant="outline" size="sm">
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Características seleccionadas */}
      {features.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">
            Características Agregadas ({features.length})
          </p>
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div
                key={`feature-${index}-${feature.slice(0, 10)}`}
                className="flex items-center justify-between p-3 bg-surface rounded-lg border border-muted hover:border-primary transition-colors group"
              >
                <span className="flex-1 text-sm">{feature}</span>
                <button
                  type="button"
                  onClick={() => removeFeature(feature)}
                  className="text-error hover:bg-error hover:text-white rounded-full p-1.5 transition-colors opacity-70 group-hover:opacity-100"
                  title={`Eliminar ${feature}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Import ImageUploadZone
import ImageUploadZone from "./ImageUploadZone";

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

      // Calcular discountPercentage desde salePrice
      const discountPercentage =
        initialData.salePrice && initialData.price
          ? Math.round(
              ((initialData.price - initialData.salePrice) / initialData.price) *
                100
            )
          : null;

      reset({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        discountPercentage: discountPercentage,
        stock: initialData.stock,
        categoryId: initialData.categoryId,
        onSale: initialData.onSale || false,
      });
    }
  }, [initialData, reset]);

  // Local controlled input for price to allow free typing (thousands, decimals)
  const [priceInput, setPriceInput] = useState<string>(
    watchPrice !== undefined && watchPrice !== null ? formatPriceARS(Number(watchPrice)) : ""
  );

  // Sync local input when watchPrice changes externally (e.g., reset with initialData)
  useEffect(() => {
    if (watchPrice !== undefined && watchPrice !== null) {
      setPriceInput(formatPriceARS(Number(watchPrice)));
    }
  }, [watchPrice]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId);
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true);

      // Las imágenes ya están subidas en productImages (ImageUploadZone las sube automáticamente)
      // No necesitamos re-subirlas aquí (PUNTO 12 completado)

      // Calcular salePrice desde discountPercentage
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
        images: productImages, // Usar imágenes ya subidas
        onSale: data.onSale || false,
        sizes,
        colors,
        features,
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
      logger.error("Error al guardar el producto:", { error: error });
      toast.error("Error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Calcular precio de oferta desde porcentaje de descuento
  const watchDiscountPercentage = watch("discountPercentage");
  const calculatedSalePrice =
    watchPrice && watchDiscountPercentage && watchDiscountPercentage > 0
      ? watchPrice * (1 - watchDiscountPercentage / 100)
      : null;

  return (
    <div className="min-h-screen surface py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
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
                {/* Nombre */}
                <div className="lg:col-span-1">
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
                    className={`transition-all duration-200 ${errors.name ? "border-error" : ""}`}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Categoría */}
                <div className="lg:col-span-1">
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
                    options={categories.map((category) => ({
                      value: category.id,
                      label: category.name,
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

              {/* Descripción */}
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
                  placeholder="Describe detalladamente el producto, sus materiales, cuidados, etc..."
                  rows={4}
                  className={`form-input transition-all duration-200 resize-none ${
                    errors.description ? "border-error" : ""
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Máximo 1000 caracteres. Describe materiales, cuidados,
                  características especiales.
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
                {/* Precio Base */}
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
                    onFocus={() => {
                      // Show plain numeric value for easier editing
                      if (watchPrice !== undefined && watchPrice !== null) {
                        setPriceInput(String(Number(watchPrice)));
                      }
                    }}
                    onChange={(e) => {
                      const raw = e.target.value;
                      // Allow only digits, dot and comma while typing
                      const filtered = String(raw).replace(/[^0-9.,]/g, "");
                      setPriceInput(filtered);

                      // Parse localized number (es-AR): thousands '.' and decimal ','
                      // Remove thousands separators (dots), replace comma with dot
                      const noThousands = filtered.replace(/\./g, "");
                      const normalized = noThousands.replace(/,/, ".");
                      const parsed = parseFloat(normalized);

                      if (!isNaN(parsed)) {
                        setValue("price", parsed, { shouldValidate: true, shouldDirty: true });
                      } else if (filtered.trim() === "") {
                        // keep form value at 0 when empty
                        setValue("price", 0, { shouldValidate: false });
                      }
                    }}
                    onKeyDown={(e) => {
                      const allowed = [
                        "Backspace",
                        "Tab",
                        "ArrowLeft",
                        "ArrowRight",
                        "Delete",
                        "Home",
                        "End",
                      ];
                      if (allowed.includes(e.key)) {
                        return;
                      }
                      // Allow digits and comma/dot
                      if (!/^[0-9.,]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData?.getData("text") || "";
                      if (!/^[0-9.,\s]+$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                    onBlur={() => {
                      // Format displayed value on blur based on current form value
                      if (watchPrice !== undefined && watchPrice !== null) {
                        setPriceInput(formatPriceARS(Number(watchPrice)));
                      } else {
                        setPriceInput("");
                      }
                    }}
                    placeholder={formatPriceARS(0)}
                    className={`transition-all duration-200 ${errors.price ? "border-error" : ""}`}
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

                {/* Porcentaje de Descuento */}
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
                    onKeyDown={(e) => {
                      const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
                      if (allowed.includes(e.key)) {
                        return;
                      }
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData?.getData("text") || "";
                      if (!/^\d+$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                    className={`transition-all duration-200 ${errors.discountPercentage ? "border-error" : ""}`}
                    disabled={loading}
                  />
                  {watchDiscountPercentage && watchDiscountPercentage > 0 && calculatedSalePrice && (
                    <>
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        Precio en oferta: {formatPriceARS(Number(calculatedSalePrice))}
                        <span className="ml-1 text-error">(-{watchDiscountPercentage}%)</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        El descuento será de {formatPriceARS(Number(watchPrice || 0) - Number(calculatedSalePrice))}
                      </p>
                    </>
                  )}
                  {errors.discountPercentage && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.discountPercentage.message}
                    </p>
                  )}
                </div>

                {/* Stock */}
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
                    onKeyDown={(e) => {
                      const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
                      if (allowed.includes(e.key)) {
                        return;
                      }
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData?.getData("text") || "";
                      if (!/^\d+$/.test(paste)) {
                        e.preventDefault();
                      }
                    }}
                    className={`transition-all duration-200 ${errors.stock ? "border-error" : ""}`}
                    disabled={loading}
                  />
                  {watchStock !== undefined && (
                    <p
                      className={`text-xs mt-1 font-medium ${
                        Number(watchStock) > 10
                          ? "text-green-600"
                          : Number(watchStock) > 5
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {Number(watchStock) === 0
                        ? "Sin stock"
                        : Number(watchStock) <= 5
                          ? "Stock bajo"
                          : Number(watchStock) <= 10
                            ? "Stock medio"
                            : "Stock bueno"}
                    </p>
                  )}
                  {errors.stock && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                {/* Estado de Oferta */}
                <div className="flex items-center space-x-2">
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
              {/* Talles */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Ruler className="h-4 w-4 inline mr-2" />
                  Talles Disponibles
                </label>
                <SizeManager sizes={sizes} onSizesChange={setSizes} />
              </div>

              {/* Colores */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  <Palette className="h-4 w-4 inline mr-2" />
                  Colores Disponibles
                </label>
                <ColorPicker colors={colors} onColorsChange={setColors} />
              </div>

              {/* Características */}
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
              <div className="bg-surface rounded-lg p-6 border">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Galería de Imágenes */}
                  <div className="space-y-4">
                    {productImages.length > 0 ? (
                      <>
                        {/* Imagen Principal */}
                        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden border-2 border-muted">
                          <Image
                            src={productImages[0]}
                            alt="Vista previa"
                            width={500}
                            height={500}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>

                        {/* Miniaturas */}
                        {productImages.length > 1 && (
                          <div className="grid grid-cols-4 gap-2">
                            {productImages.slice(0, 4).map((img, idx) => (
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
                        Categoría: {categories.find((c) => c.id === watch("categoryId"))?.name || "No seleccionada"}
                      </p>
                      <h3 className="text-3xl font-bold text-primary">
                        {watch("name") || "Nombre del producto"}
                      </h3>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {watch("onSale") && (
                        <span className="bg-error/10 text-error px-3 py-1 rounded-full text-sm font-medium">
                          ⚡ En Oferta
                        </span>
                      )}
                      {watch("stock") !== undefined && Number(watch("stock")) > 0 && (
                        <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">
                          ✓ {Number(watch("stock"))} en stock
                        </span>
                      )}
                      {watch("stock") !== undefined && Number(watch("stock")) <= 5 && Number(watch("stock")) > 0 && (
                        <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium">
                          ⚠️ Stock limitado
                        </span>
                      )}
                      {watch("stock") === 0 && (
                        <span className="bg-error/10 text-error px-3 py-1 rounded-full text-sm font-medium">
                          ✗ Sin stock
                        </span>
                      )}
                    </div>

                    {/* Precio */}
                    <div className="space-y-2 py-4 border-y border-muted">
                      {watchDiscountPercentage && watchDiscountPercentage > 0 && calculatedSalePrice ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-success">
                              {formatPriceARS(Number(calculatedSalePrice))}
                            </span>
                            <span className="bg-error text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                              -{watchDiscountPercentage}% OFF
                            </span>
                          </div>
                          <span className="text-lg text-muted-foreground line-through">
                            {formatPriceARS(Number(watch("price") || 0))}
                          </span>
                          <p className="text-sm text-success font-medium">
                            ¡Ahorrás {formatPriceARS(Number(watch("price") || 0) - Number(calculatedSalePrice))}!
                          </p>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-primary">
                          {formatPriceARS(Number(watch("price") || 0))}
                        </span>
                      )}
                    </div>

                    {/* Descripción */}
                    <div>
                      <p className="text-primary/90 leading-relaxed">
                        {watch("description") || "Descripción del producto aparecerá aquí..."}
                      </p>
                    </div>

                    {/* Características */}
                    {features.length > 0 && (
                      <div className="bg-surface-secondary p-4 rounded-lg">
                        <p className="font-semibold mb-2 flex items-center gap-2">
                          <List className="h-4 w-4" />
                          Características
                        </p>
                        <ul className="space-y-1.5">
                          {features.map((feature, index) => (
                            <li key={`feat-${index}`} className="flex items-start gap-2 text-sm">
                              <span className="text-success mt-1">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Talles */}
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

                    {/* Colores */}
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

                {/* Nota Informativa */}
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
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
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
