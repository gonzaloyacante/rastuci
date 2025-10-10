"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Product } from "@/types";
import { ColorChip } from "@/components/ui/ColorChip";
import { formatCurrency } from "@/utils/formatters";
import {
  Package,
  FileText,
  DollarSign,
  Hash,
  Tag,
  Upload,
  Save,
  ArrowLeft,
  Palette,
  Ruler,
  List,
  Info,
  Trash2,
  Eye,
  ImageIcon,
  AlertCircle,
  Check,
  X,
  Percent,
} from "lucide-react";

// Interfaces locales para tipado
interface Category {
  id: string;
  name: string;
  description?: string | null;
}

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(1000, "La descripción no puede exceder 1000 caracteres").optional(),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  salePrice: z.coerce.number().min(0, "El precio de oferta no puede ser negativo").optional().nullable(),
  stock: z.coerce.number().int("El stock debe ser un número entero").min(0, "El stock no puede ser negativo"),
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
  <div className={`bg-muted rounded-lg flex items-center justify-center ${className || 'w-full h-48'}`}>
    <div className="text-center">
      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Sin imagen</p>
    </div>
  </div>
);

const ImagePreview = ({ src, alt, onRemove }: { src: string; alt: string; onRemove: () => void }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="relative group">
      {imageError ? (
        <PlaceholderImage className="w-full h-32" />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={128}
          height={128}
          className="w-full h-32 object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

const ColorPicker = ({ colors, onColorsChange }: { colors: string[]; onColorsChange: (colors: string[]) => void }) => {
  const [newColor, setNewColor] = useState("");

  const addColor = () => {
    if (newColor.trim() && !colors.includes(newColor.trim())) {
      onColorsChange([...colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove: string) => {
    onColorsChange(colors.filter(color => color !== colorToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          placeholder="Agregar color (ej: Rojo, #FF0000)"
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
        />
        <Button type="button" onClick={addColor} variant="outline" size="sm">
          <Check className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-1 bg-surface px-2 py-1 rounded-full text-sm">
            <ColorChip color={color} size="sm" />
            <span>{color}</span>
            <button
              type="button"
              onClick={() => removeColor(color)}
              className="text-error hover:bg-error hover:text-white rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SizeManager = ({ sizes, onSizesChange }: { sizes: string[]; onSizesChange: (sizes: string[]) => void }) => {
  const [newSize, setNewSize] = useState("");

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      onSizesChange([...sizes, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    onSizesChange(sizes.filter(size => size !== sizeToRemove));
  };

  const commonSizes = ["XS", "S", "M", "L", "XL", "XXL", "0", "1", "2", "3", "4", "5", "6"];

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newSize}
          onChange={(e) => setNewSize(e.target.value)}
          placeholder="Talle personalizado"
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
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
              onClick={() => !sizes.includes(size) && onSizesChange([...sizes, size])}
              className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                sizes.includes(size) 
                  ? 'bg-primary text-white border-primary' 
                  : 'border-muted hover:border-primary hover:bg-primary/10'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size, index) => (
          <div key={index} className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-full text-sm">
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

const FeatureManager = ({ features, onFeaturesChange }: { features: string[]; onFeaturesChange: (features: string[]) => void }) => {
  const [newFeature, setNewFeature] = useState("");

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      onFeaturesChange([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (featureToRemove: string) => {
    onFeaturesChange(features.filter(feature => feature !== featureToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          placeholder="Nueva característica"
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
        />
        <Button type="button" onClick={addFeature} variant="outline" size="sm">
          <Check className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-lg border">
            <span className="flex-1">{feature}</span>
            <button
              type="button"
              onClick={() => removeFeature(feature)}
              className="text-error hover:bg-error hover:text-white rounded-full p-1 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ProductForm({
  initialData,
  categories,
}: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.categoryId || ""
  );
  const [currentImages, setCurrentImages] = useState<string[]>([]);
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
  const watchSalePrice = watch("salePrice");
  const watchStock = watch("stock");
  const watchOnSale = watch("onSale");

  useEffect(() => {
    if (initialData) {
      const parsedImages = Array.isArray(initialData.images) 
        ? initialData.images 
        : typeof initialData.images === "string" 
          ? JSON.parse(initialData.images) 
          : [];
      
      setCurrentImages(parsedImages);
      setColors(initialData.colors || []);
      setSizes(initialData.sizes || []);
      setFeatures(initialData.features || []);
      
      reset({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        salePrice: initialData.salePrice,
        stock: initialData.stock,
        categoryId: initialData.categoryId,
        onSale: initialData.onSale || false,
      });
    }
  }, [initialData, reset]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId);
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true);
      
      let imageUrls = [...currentImages];

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await axios.post("/api/upload", formData);
          return res.data.url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const productData = {
        name: data.name,
        description: data.description || null,
        price: data.price,
        salePrice: data.salePrice || null,
        stock: data.stock,
        categoryId: data.categoryId,
        images: imageUrls,
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
      console.error("Error al guardar el producto:", error);
      toast.error("Error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const discountPercentage = watchPrice && watchSalePrice 
    ? Math.round(((watchPrice - watchSalePrice) / watchPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen surface py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header mejorado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-lg">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
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
            <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Nombre */}
                <div className="lg:col-span-1">
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
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
                  <label htmlFor="categoryId" className="block text-sm font-medium mb-2">
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
                <label htmlFor="description" className="block text-sm font-medium mb-2">
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
                  Máximo 1000 caracteres. Describe materiales, cuidados, características especiales.
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
            <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precios y Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Precio Base */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Precio Base *
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                    placeholder="0.00"
                    className={`transition-all duration-200 ${errors.price ? "border-error" : ""}`}
                    disabled={loading}
                  />
                  {watchPrice > 0 && (
                    <p className="text-xs text-success mt-1 font-medium">
                      {formatCurrency(Number(watchPrice))}
                    </p>
                  )}
                  {errors.price && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Precio de Oferta */}
                <div>
                  <label htmlFor="salePrice" className="block text-sm font-medium mb-2">
                    <Percent className="h-4 w-4 inline mr-2" />
                    Precio en Oferta
                  </label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    {...register("salePrice")}
                    placeholder="0.00"
                    className={`transition-all duration-200 ${errors.salePrice ? "border-error" : ""}`}
                    disabled={loading}
                  />
                  {watchSalePrice && watchSalePrice > 0 && (
                    <p className="text-xs text-orange-600 mt-1 font-medium">
                      {formatCurrency(Number(watchSalePrice))} 
                      {discountPercentage > 0 && (
                        <span className="ml-1 text-error">(-{discountPercentage}%)</span>
                      )}
                    </p>
                  )}
                  {errors.salePrice && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.salePrice.message}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium mb-2">
                    <Hash className="h-4 w-4 inline mr-2" />
                    Stock Disponible *
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock")}
                    placeholder="0"
                    className={`transition-all duration-200 ${errors.stock ? "border-error" : ""}`}
                    disabled={loading}
                  />
                  {watchStock !== undefined && (
                    <p className={`text-xs mt-1 font-medium ${
                      Number(watchStock) > 10 ? 'text-green-600' : 
                      Number(watchStock) > 5 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Number(watchStock) === 0 ? 'Sin stock' : 
                       Number(watchStock) <= 5 ? 'Stock bajo' : 
                       Number(watchStock) <= 10 ? 'Stock medio' : 'Stock bueno'}
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
                    <label htmlFor="onSale" className="block text-sm font-medium mb-2">
                      Estado de Venta
                    </label>
                    <label htmlFor="onSale" className="inline-flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-surface transition-colors">
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
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
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
                <FeatureManager features={features} onFeaturesChange={setFeatures} />
              </div>
            </CardContent>
          </Card>

          {/* Imágenes del Producto */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Galería de Imágenes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Imágenes Existentes */}
              {currentImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Imágenes Actuales</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {currentImages.map((image, index) => (
                      <ImagePreview
                        key={index}
                        src={image}
                        alt={`Imagen ${index + 1}`}
                        onRemove={() => removeCurrentImage(index)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Nuevas Imágenes */}
              {imageFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Nuevas Imágenes (por subir)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground truncate px-2">{file.name}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Área de Upload */}
              <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors duration-200 bg-gradient-to-br from-surface to-muted/20">
                <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <div className="text-lg font-medium mb-2">
                  Subir Imágenes del Producto
                </div>
                <div className="flex text-sm text-muted-foreground justify-center">
                  <label
                    htmlFor="images"
                    className="relative cursor-pointer bg-primary text-white rounded-md px-4 py-2 font-medium hover:bg-primary/90 transition-colors"
                  >
                    <span>Seleccionar archivos</span>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                      disabled={loading}
                    />
                  </label>
                  <p className="pl-2 self-center">o arrastra y suelta aquí</p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG, WEBP hasta 10MB cada una. Recomendado: 800x800px o superior
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Vista Previa */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-surface rounded-lg p-6 border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {currentImages.length > 0 || imageFiles.length > 0 ? (
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        {currentImages.length > 0 ? (
                          <Image
                            src={currentImages[0]}
                            alt="Vista previa"
                            width={300}
                            height={300}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <PlaceholderImage className="w-full h-full" />
                        )}
                      </div>
                    ) : (
                      <PlaceholderImage className="aspect-square" />
                    )}
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold">
                      {watch("name") || "Nombre del producto"}
                    </h3>
                    <div className="flex items-center gap-2">
                      {watch("onSale") && (
                        <span className="bg-error/10 text-error px-2 py-1 rounded-full text-sm font-medium">
                          En Oferta
                        </span>
                      )}
                      {watch("stock") !== undefined && Number(watch("stock")) <= 5 && (
                        <span className="bg-warning/10 text-warning px-2 py-1 rounded-full text-sm font-medium">
                          Pocas unidades
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {watch("salePrice") && Number(watch("salePrice")) > 0 ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-success">
                              {formatCurrency(Number(watch("salePrice")))}
                            </span>
                            {discountPercentage > 0 && (
                              <span className="bg-error text-white px-2 py-1 rounded text-sm font-bold">
                                -{discountPercentage}%
                              </span>
                            )}
                          </div>
                          <span className="text-lg text-muted-foreground line-through">
                            {formatCurrency(Number(watch("price") || 0))}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold">
                          {formatCurrency(Number(watch("price") || 0))}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground">
                      {watch("description") || "Descripción del producto aparecerá aquí..."}
                    </p>
                    {sizes.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Talles:</p>
                        <div className="flex flex-wrap gap-2">
                          {sizes.map((size, index) => (
                            <span key={index} className="px-3 py-1 border rounded-md text-sm">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {colors.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Colores:</p>
                        <div className="flex flex-wrap gap-2">
                          {colors.map((color, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <ColorChip color={color} />
                              <span className="text-sm">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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