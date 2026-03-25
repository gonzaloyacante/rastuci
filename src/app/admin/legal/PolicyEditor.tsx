"use client";

import { Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import useSWR from "swr";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { logger } from "@/lib/logger";

import type { Policy, PolicyForm, SectionItemProps } from "./types";

function SectionItem({ index, register, control, remove }: SectionItemProps) {
  const {
    fields: itemFields,
    append,
    remove: removeItem,
  } = useFieldArray({ control, name: `sections.${index}.items` });

  return (
    <Card className="relative group overflow-hidden border-l-4 border-l-primary/20 hover:border-l-primary transition-colors">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          className="text-muted-foreground hover:text-error h-8 w-8 p-0"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <CardContent className="p-6 space-y-4">
        <input
          {...register(`sections.${index}.title`)}
          className="w-full text-xl font-semibold bg-transparent border-0 placeholder:text-muted-foreground/50 focus:ring-0 p-0"
          placeholder="Título de la sección (ej: 1. Introducción)"
        />
        <textarea
          {...register(`sections.${index}.content`)}
          className="w-full min-h-25 resize-y bg-muted/30 rounded-md border-0 p-3 text-sm focus:ring-2 focus:ring-primary/20"
          placeholder="Escribe el contenido del párrafo aquí..."
        />
        <div className="space-y-2 pl-4">
          {itemFields.map((item, k) => (
            <div key={item.id} className="flex items-start gap-2 group/item">
              <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <input
                {...register(`sections.${index}.items.${k}.value`)}
                className="flex-1 bg-transparent border-b border-transparent hover:border-muted focus:border-primary focus:outline-none text-sm py-1"
                placeholder={`Punto ${k + 1}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(k)}
                className="opacity-0 group-hover/item:opacity-100 text-muted-foreground hover:text-error h-6 w-6 p-0"
              >
                <X size={14} />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ value: "Nuevo punto" })}
            className="text-xs text-muted-foreground hover:text-primary pl-0"
          >
            <Plus size={12} className="mr-1" /> Agregar Viñeta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function PolicyEditor({ slug }: { slug: string }) {
  const { show } = useToast();
  const {
    data: policyData,
    isLoading,
    mutate,
  } = useSWR(`/api/admin/legal/${slug}`, () =>
    fetch("/api/admin/legal").then((r) => r.json())
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policyId, setPolicyId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<PolicyForm>({
    defaultValues: {
      title: "",
      slug,
      description: "",
      sections: [],
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  useEffect(() => {
    if (policyData?.data) {
      const found = policyData.data.find((p: Policy) => p.slug === slug);
      if (found) {
        setPolicyId(found.id);
        reset({
          title: found.title,
          slug: found.slug,
          description: found.description || "",
          sections: found.content?.sections || [],
          isActive: found.isActive,
        });
      } else {
        setPolicyId(null);
      }
    }
  }, [policyData, slug, reset]);

  const onSubmit = async (data: PolicyForm) => {
    setIsSubmitting(true);
    try {
      const url = policyId
        ? `/api/admin/legal/${policyId}`
        : `/api/admin/legal`;
      const method = policyId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      show({ type: "success", message: "Cambios guardados" });
      void mutate();
    } catch (error) {
      show({ type: "error", message: "Error al guardar" });
      logger.error("Error saving legal policy", { error });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="py-12 text-center text-muted-foreground">Cargando...</div>
    );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 animate-in fade-in duration-500"
    >
      <Card>
        <CardContent className="p-6 grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Título Público
              </label>
              <input
                {...register("title", { required: true })}
                className="w-full text-lg font-bold bg-transparent border-b border-transparent hover:border-muted focus:border-primary focus:outline-none transition-colors py-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Descripción Interna
              </label>
              <input
                {...register("description")}
                className="w-full text-sm text-muted-foreground bg-transparent border-b border-transparent hover:border-muted focus:border-primary focus:outline-none transition-colors py-1"
                placeholder="Descripción breve..."
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Contenido</h2>
          <Button
            type="button"
            onClick={() => append({ title: "", content: "", items: [] })}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus size={16} /> Agregar Sección
          </Button>
        </div>
        <div className="grid gap-6">
          {fields.map((field, index) => (
            <SectionItem
              key={field.id}
              index={index}
              register={register}
              control={control}
              remove={remove}
            />
          ))}
        </div>
      </div>
      <div className="fixed bottom-6 right-6 z-50 flex gap-4">
        {isDirty && (
          <div className="bg-foreground text-background px-4 py-2 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <span className="text-sm font-medium">Hay cambios sin guardar</span>
            <Button
              type="submit"
              size="sm"
              loading={isSubmitting}
              className="rounded-full"
            >
              <Save size={16} className="mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
