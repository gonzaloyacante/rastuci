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
import { Category, Product } from "@prisma/client";

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

  const title = initialData ? "Editar Producto" : "Crear Nuevo Producto";
  const toastMessage = initialData
    ? "Producto actualizado exitosamente"
    : "Producto creado exitosamente";
  const action = initialData ? "Guardar Cambios" : "Crear Producto";

  const {
    register,
    handleSubmit,
    formState: { errors },
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
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          categoryId: "",
          images: [],
        },
  });

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

      const productData = { ...data, images: imageUrls };

      if (initialData) {
        await axios.patch(`/api/products/${initialData.id}`, productData);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E91E63] rounded-full mb-4">
            <Package className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">
            {initialData
              ? "Modifica los datos del producto"
              : "Completa la información para crear un nuevo producto"}
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-white rounded-t-lg">
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
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="h-4 w-4 inline mr-2" />
                  Nombre del Producto
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ej: iPhone 14 Pro, Laptop HP..."
                  className={`transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] ${
                    errors.name ? "border-red-300" : ""
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-2" />
                  Descripción (Opcional)
                </label>
                <textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe las características del producto..."
                  rows={4}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] ${
                    errors.description ? "border-red-300" : ""
                  }`}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 inline mr-2" />
                    Precio
                  </label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price")}
                    placeholder="0.00"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] ${
                      errors.price ? "border-red-300" : ""
                    }`}
                    disabled={loading}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="h-4 w-4 inline mr-2" />
                    Stock
                  </label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock")}
                    placeholder="0"
                    className={`transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] ${
                      errors.stock ? "border-red-300" : ""
                    }`}
                    disabled={loading}
                  />
                  {errors.stock && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                      {errors.stock.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Categoría
                </label>
                <select
                  id="categoryId"
                  {...register("categoryId")}
                  className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none transition-all duration-200 focus:ring-2 focus:ring-[#E91E63] focus:border-[#E91E63] ${
                    errors.categoryId ? "border-red-300" : ""
                  }`}
                  disabled={loading}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Imágenes */}
              <div>
                <label
                  htmlFor="images"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Imágenes del Producto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#E91E63] transition-colors duration-200">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="images"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#E91E63] hover:text-[#C2185B] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#E91E63]">
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
                  <p className="text-xs text-gray-500 mt-2">
                    PNG, JPG, GIF hasta 10MB cada una
                  </p>
                  {imageFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {imageFiles.map((file, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#E91E63] text-white">
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
                  className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#C2185B] hover:from-[#C2185B] hover:to-[#AD1457] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
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
                  className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
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
