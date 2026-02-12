"use client";

import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";

const sectionSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().optional(),
  bullets: z.array(z.object({ text: z.string() })).optional(),
});

const _policySchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  slug: z
    .string()
    .min(3, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  sections: z.array(sectionSchema).min(1, "Debes agregar al menos una sección"),
  isActive: z.boolean().default(true),
});

type PolicyForm = z.infer<typeof _policySchema>;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function EditPolicyPage({ params }: { params: { id: string } }) {
  const isNew = params.id === "new";
  const router = useRouter();
  const { show } = useToast();
  const { data: policyData, isLoading } = useSWR(
    !isNew ? `/api/admin/policies/${params.id}` : null,
    fetcher
  );

  const [initialData, setInitialData] = useState<PolicyForm | undefined>(
    undefined
  );

  useEffect(() => {
    if (policyData?.data) {
      setInitialData({
        ...policyData.data,
        sections: policyData.data.content?.sections || [],
      });
    }
  }, [policyData]);

  const handleSubmit = async (data: PolicyForm) => {
    try {
      const url = isNew
        ? "/api/admin/policies"
        : `/api/admin/policies/${params.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar");

      show({ type: "success", message: "Política guardada correctamente" });
      router.push("/admin/policies");
      router.refresh();
    } catch (error) {
      console.error(error);
      show({ type: "error", message: "Error al guardar la política" });
    }
  };

  if (!isNew && isLoading) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/politicas">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {isNew ? "Nueva Política" : "Editar Política"}
        </h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <PolicyEditor
              initialData={initialData}
              onSubmit={handleSubmit}
              isNew={isNew}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PolicyEditor({
  initialData,
  onSubmit,
  isNew,
}: {
  initialData?: PolicyForm;
  onSubmit: (data: PolicyForm) => Promise<void>;
  isNew: boolean;
}) {
  const { show } = useToast();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PolicyForm>({
    defaultValues: initialData || {
      title: "",
      slug: "",
      description: "",
      isActive: true,
      sections: [{ title: "", content: "", bullets: [] }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections",
  });

  const insertVariable = (variable: string) => {
    show({
      type: "success",
      message: `Variable ${variable} copiada al portapapeles`,
    });
    navigator.clipboard.writeText(variable);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              {...register("title")}
              className="w-full p-2 border rounded bg-surface"
              placeholder="Ej: Términos y Condiciones"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL)</label>
            <input
              {...register("slug")}
              className="w-full p-2 border rounded bg-surface font-mono text-sm"
              placeholder="terminos-y-condiciones"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm">{errors.slug.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Variables Disponibles
          </label>
          <div className="p-4 bg-muted/50 rounded-lg text-sm border border-muted">
            <p className="mb-2 text-muted-foreground">
              Haz clic para copiar y pegar en el texto:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable("{{phone}}")}
                className="px-2 py-1 h-auto text-xs font-mono"
              >
                {`{{phone}}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable("{{email}}")}
                className="px-2 py-1 h-auto text-xs font-mono"
              >
                {`{{email}}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable("{{address}}")}
                className="px-2 py-1 h-auto text-xs font-mono"
              >
                {`{{address}}`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Secciones</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ title: "", content: "", bullets: [] })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Sección
          </Button>
        </div>

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-muted rounded-lg p-4 bg-muted/20 relative group"
            >
              <div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => move(index, index - 1)}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    ↑
                  </Button>
                )}
                {index < fields.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => move(index, index + 1)}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    ↓
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-8 w-8 p-0 hover:bg-red-100 text-red-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <div className="space-y-3">
                <input
                  {...register(`sections.${index}.title` as const)}
                  placeholder="Título de la sección"
                  className="w-full p-2 font-semibold bg-transparent border-b border-muted focus:border-primary outline-none"
                />
                <textarea
                  {...register(`sections.${index}.content` as const)}
                  placeholder="Contenido de la sección..."
                  rows={3}
                  className="w-full p-2 rounded border border-muted bg-surface text-sm"
                />

                {/* Simple bullet points handler could be added here if needed, 
                    for now user can use markdown lists in textarea */}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-muted">
        <Link href="/admin/policies">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" loading={isSubmitting}>
          {isNew ? "Crear Política" : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
