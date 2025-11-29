"use client";

import { AdminError, AdminPageHeader } from "@/components/admin";
import { FormSkeleton } from "@/components/admin/skeletons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useCMS } from "@/hooks/useCMS";
import { Edit2, Save, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CMSPage() {
  const { data: cmsData, loading, error, updateCMS } = useCMS();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (key: string, value: unknown) => {
    setEditing(key);
    setEditValue(JSON.stringify(value, null, 2));
  };

  const handleSave = async () => {
    if (!editing) {
      return;
    }

    setSaving(true);
    try {
      const parsedValue = JSON.parse(editValue as string);
      const success = await updateCMS(editing, parsedValue);

      if (success) {
        toast.success("Configuración actualizada correctamente");
        setEditing(null);
        setEditValue(null);
      } else {
        toast.error("Error al actualizar configuración");
      }
    } catch {
      toast.error("Error: JSON inválido");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValue(null);
  };

  if (loading) {
    return <FormSkeleton fields={8} />;
  }

  if (error) {
    return <AdminError message={error} />;
  }

  const commonSettings = [
    { key: "home.hero.title", label: "Home - Título Hero", type: "text" },
    { key: "home.hero.subtitle", label: "Home - Subtítulo Hero", type: "text" },
    { key: "home.hero.image", label: "Home - Imagen Hero", type: "text" },
    {
      key: "home.featured",
      label: "Home - Productos Destacados",
      type: "json",
    },
    { key: "home.banners", label: "Home - Banners", type: "json" },
    { key: "footer.about", label: "Footer - Acerca de", type: "text" },
    { key: "footer.contact", label: "Footer - Contacto", type: "json" },
    { key: "footer.social", label: "Footer - Redes Sociales", type: "json" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Gestor de Contenidos (CMS)"
        subtitle="Administra el contenido dinámico del sitio web"
      />

      {/* Configuraciones existentes */}
      {cmsData && Object.keys(cmsData).length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Configuraciones Actuales</h2>
          <div className="space-y-4">
            {Object.entries(cmsData).map(([key, value]) => (
              <div key={key} className="p-4 surface-secondary rounded-lg">
                {editing === key ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{key}</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          <Save size={14} className="mr-1" />
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          <X size={14} className="mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={editValue as string}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="input w-full font-mono text-sm"
                      rows={10}
                      disabled={saving}
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{key}</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(key, value)}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Editar
                      </Button>
                    </div>
                    <pre className="text-xs text-content-secondary overflow-x-auto p-3 bg-black/5 dark:bg-white/5 rounded">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Crear nuevas configuraciones */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Configuraciones Sugeridas</h2>
        <p className="text-sm text-content-secondary mb-4">
          Estas son configuraciones comunes que puedes crear para personalizar
          tu sitio:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commonSettings.map((setting) => {
            const exists = cmsData && cmsData[setting.key] !== undefined;
            return (
              <div
                key={setting.key}
                className={`p-3 rounded-lg border ${
                  exists
                    ? "border-success bg-success/5"
                    : "border-muted surface-secondary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{setting.label}</p>
                    <p className="text-xs text-content-secondary">
                      {setting.key}
                    </p>
                  </div>
                  {exists ? (
                    <span className="text-xs text-success">✓ Existe</span>
                  ) : (
                    <span className="text-xs text-content-secondary">
                      No configurado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ejemplo de estructura JSON */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Ejemplos de Configuración</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Home - Productos Destacados</h3>
            <pre className="text-xs p-3 bg-black/5 dark:bg-white/5 rounded overflow-x-auto">
              {`{
  "productIds": ["prod1", "prod2", "prod3"],
  "title": "Productos Destacados",
  "subtitle": "Los más vendidos de la semana"
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Home - Banners</h3>
            <pre className="text-xs p-3 bg-black/5 dark:bg-white/5 rounded overflow-x-auto">
              {`{
  "banners": [
    {
      "image": "/banners/promo1.jpg",
      "title": "Envío Gratis",
      "subtitle": "En compras mayores a $15,000",
      "link": "/productos",
      "ctaText": "Ver Productos"
    }
  ]
}`}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Footer - Contacto</h3>
            <pre className="text-xs p-3 bg-black/5 dark:bg-white/5 rounded overflow-x-auto">
              {`{
  "email": "contacto@rastuci.com",
  "phone": "+54 11 1234-5678",
  "whatsapp": "+54 9 11 1234-5678",
  "address": "Av. Corrientes 1234, CABA"
}`}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}
