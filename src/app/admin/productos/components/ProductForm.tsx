"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
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
} from "lucide-react";
// Interfaces locales para tipado
interface Category {
  id: string;
  name: string;
  description?: string | null;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  images: string;
  categoryId: string;
  onSale?: boolean;
  sizes?: string[];
  colors?: string[];
  features?: string[];
}

const productSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero")
    .min(0, "El stock no puede ser negativo"),
  categoryId: z.string().nonempty("Debes seleccionar una categoría"),
  images: z.array(z.string()).optional(),
  onSale: z.coerce.boolean().optional(),
  // Campos de entrada de texto que luego transformaremos a arrays en onSubmit
  sizesInput: z.string().optional(),
  colorsInput: z.string().optional(),
  featuresInput: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product | null;
  categories: Category[];
}

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
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          description: initialData.description ?? "",
          images:
            typeof initialData.images === "string"
              ? JSON.parse(initialData.images)
              : initialData.images || [],
          onSale: initialData.onSale ?? false,
          sizesInput: Array.isArray(initialData.sizes)
            ? initialData.sizes.join(", ")
            : "",
          colorsInput: Array.isArray(initialData.colors)
            ? initialData.colors.join(", ")
            : "",
          featuresInput: Array.isArray(initialData.features)
            ? initialData.features.join("\n")
            : "",
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          categoryId: "",
          images: [],
          onSale: false,
          sizesInput: "",
          colorsInput: "",
          featuresInput: "",
        },
  });

  // Actualizar el valor del formulario cuando cambie la categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setValue("categoryId", categoryId);
  };

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    try {
      setLoading(true);
      let imageUrls: string[] = initialData?.images
        ? typeof initialData.images === "string"
          ? JSON.parse(initialData.images)
          : initialData.images
        : [];

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

      // Transformar campos de texto a arrays limpios
      const sizes = (data.sizesInput || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const colors = (data.colorsInput || "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const features = (data.featuresInput || "")
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        categoryId: data.categoryId,
        images: imageUrls,
        onSale: data.onSale ?? false,
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

  return (
    <div className="min-h-screen surface py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="muted mt-2">
            {initialData
              ? "Modifica los datos del producto"
              : "Completa la información para crear un nuevo producto"}
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-primary text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información del Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-2">
                  <Package className="h-4 w-4 inline mr-2" />
                  Nombre del Producto
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ej: iPhone 14 Pro, Laptop HP..."
                  className={`transition-all duration-200 ${
                    errors.name ? "border-error" : ""
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <span className="w-1 h-1 bg-error rounded-full"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Oferta */}
              <div>
                <label htmlFor="onSale" className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    id="onSale"
                    type="checkbox"
                    className="form-checkbox h-4 w-4"
                    {...register("onSale")}
                    disabled={loading}
                  />
                  <span>Marcar como oferta</span>
                </label>
              </div>

              {/* Talles / Colores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sizesInput" className="block text-sm font-medium mb-2">
                    Talles (separados por coma)
                  </label>
                  <Input
                    id="sizesInput"
                    placeholder="XS, S, M, L, XL"
                    {...register("sizesInput")}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="colorsInput" className="block text-sm font-medium mb-2">
                    Colores (separados por coma)
                  </label>
                  <Input
                    id="colorsInput"
                    placeholder="Rojo, Azul, Negro"
                    {...register("colorsInput")}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Características */}
              <div>
                <label htmlFor="featuresInput" className="block text-sm font-medium mb-2">
                  Características (una por línea)
                </label>
                <textarea
                  id="featuresInput"
                  rows={4}
                  placeholder={"• Batería de larga duración\n• Pantalla OLED 120Hz\n• Resistente al agua"}
                  className={`form-input transition-all duration-200 ${
                    errors.featuresInput ? "border-error" : ""
                  }`}
                  {...register("featuresInput")}
                  disabled={loading}
                />
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe las características del producto..."
                  rows={4}
                  className={`form-input transition-all duration-200 ${
                    errors.description ? "border-error" : ""
                  }`}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <span className="w-1 h-1 bg-error rounded-full"></span>
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Precio
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                    placeholder="0.00"
                    className={`transition-all duration-200 ${
                      errors.price ? "border-error" : ""
                    }`}
                    disabled={loading}
                  />
                  <p className="text-xs muted mt-1">
                    Vista previa: {formatCurrency(Number(watch("price") || 0))}
                  </p>
                  {errors.price && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <span className="w-1 h-1 bg-error rounded-full"></span>
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium mb-2">
                    <Hash className="h-4 w-4 inline mr-2" />
                    Stock
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock")}
                    placeholder="0"
                    className={`transition-all duration-200 ${
                      errors.stock ? "border-error" : ""
                    }`}
                    disabled={loading}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <span className="w-1 h-1 bg-error rounded-full"></span>
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium mb-2">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Categoría
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
                    <span className="w-1 h-1 bg-error rounded-full"></span>
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Imágenes */}
              <div>
                <label
                  htmlFor="images"
                  className="block text-sm font-medium mb-2">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Imágenes del Producto
                </label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover-surface transition-colors duration-200">
                  <Upload className="mx-auto h-12 w-12 muted mb-4" />
                  <div className="flex text-sm muted">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer surface rounded-md font-medium text-primary hover-surface focus-within:outline-none">
                      <span>Seleccionar archivos</span>
                      <input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) =>
                          setImageFiles(Array.from(e.target.files || []))
                        }
                        disabled={loading}
                      />
                    </label>
                    <p className="pl-1">o arrastra y suelta</p>
                  </div>
                  <p className="text-xs muted mt-2">
                    PNG, JPG, GIF hasta 10MB cada una
                  </p>
                  {imageFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {imageFiles.map((file, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                          {file.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  variant="hero"
                  className="flex-1">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {action}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/productos")}
                  className="flex-1 font-semibold flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
