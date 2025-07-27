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
import { Tag, FileText, Save, ArrowLeft, Upload } from "lucide-react";
import { uploadImage } from "@/lib/cloudinary";

// Interface local para tipado
interface Category {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
}

const categorySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  description: z.string().optional(),
  image: z.string().min(1, "La imagen es obligatoria"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(
    initialData?.image || ""
  );
  const [uploading, setUploading] = useState(false);

  const title = initialData ? "Editar Categoría" : "Crear Nueva Categoría";
  const toastMessage = initialData
    ? "Categoría actualizada exitosamente"
    : "Categoría creada exitosamente";
  const action = initialData ? "Guardar Cambios" : "Crear Categoría";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData
      ? {
          ...initialData,
          description: initialData.description ?? "",
          image: initialData.image || "",
        }
      : {
          name: "",
          description: "",
          image: "",
        },
  });

  const imageValue = watch("image");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file);
      const url = (result as any).secure_url;
      setValue("image", url, { shouldValidate: true });
      setImagePreview(url);
    } catch (err) {
      toast.error("Error al subir la imagen. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    try {
      setLoading(true);

      if (initialData) {
        await axios.patch(`/api/categories/${initialData.id}`, data);
      } else {
        await axios.post("/api/categories", data);
      }

      router.push("/admin/categorias");
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      console.error("Error al guardar la categoría:", error);
      toast.error("Error al procesar la solicitud. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E91E63] rounded-full mb-4">
            <Tag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">
            {initialData
              ? "Modifica los datos de la categoría"
              : "Completa la información para crear una nueva categoría"}
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-[#E91E63] text-white rounded-t-lg">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Información de la Categoría
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Nombre de la Categoría
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Ej: Electrónicos, Ropa, Hogar..."
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
                  placeholder="Describe brevemente esta categoría..."
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

              {/* Imagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Imagen de la Categoría <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 disabled:opacity-50"
                  disabled={loading || uploading}
                />
                {uploading && (
                  <div className="mt-2 text-xs text-gray-500">
                    Subiendo imagen...
                  </div>
                )}
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow"
                    />
                  </div>
                )}
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#E91E63] hover:bg-[#C2185B] text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
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
                  onClick={() => router.push("/admin/categorias")}
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
