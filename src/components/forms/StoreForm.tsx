"use client";

import { useToast } from "@/components/ui/Toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  type StoreSettings,
  defaultStoreSettings,
} from "@/lib/validation/store";
import { Save } from "lucide-react";
import { FormSkeleton } from "@/components/admin/SettingsSkeletons";
import { useSettings } from "@/hooks/useSettings";

interface StoreFormProps {
  initial?: StoreSettings;
  onSave?: (data: StoreSettings) => void;
}

export default function StoreForm({ initial, onSave }: StoreFormProps) {
  const { show } = useToast();
  const [data, setData] = useState<StoreSettings>(
    initial || defaultStoreSettings
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!initial);

  // Replace manual fetch with SWR hook
  const {
    settings,
    loading: loadingSettings,
    mutate: mutateSettings,
  } = useSettings<StoreSettings>("store");

  // Initialize data when settings loads, but only if not already initialized
  useEffect(() => {
    if (settings && !initial) {
      setData(settings);
      setLoading(false);
    }
  }, [settings, initial]);

  // Handle loading state from SWR
  useEffect(() => {
    if (loadingSettings && !initial) setLoading(true);
  }, [loadingSettings, initial]);

  if (loading) return <FormSkeleton rows={3} />;

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Don't save if data hasn't loaded yet
    if (loading || loadingSettings) {
      show({
        type: "error",
        message: "Espera a que carguen los datos antes de guardar",
      });
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 401 || res.status === 403) {
        show({
          type: "error",
          message:
            "Sesión expirada. Por favor recarga o inicia sesión nuevamente.",
        });
        return;
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Error al guardar");
      }

      show({ type: "success", message: "Configuración guardada" });
      mutateSettings(); // Sync SWR cache
      onSave?.(data);
    } catch (error) {
      show({
        type: "error",
        message: error instanceof Error ? error.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidad del negocio */}
      <div className="surface-secondary rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-lg">Identidad del Negocio</h3>

        <div className="bg-muted/50 p-4 rounded-lg text-sm border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/10">
          <p className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">ℹ️ Nota:</span>
            El nombre de la tienda y el email administrativo se usan para
            notificaciones internas y branding.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nombre de la Tienda</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Rastuci"
            />
          </div>
          <div>
            <Label htmlFor="adminEmail">Email Principal (Cuenta Admin)</Label>
            <Input
              id="adminEmail"
              type="email"
              value={data.adminEmail}
              onChange={(e) => handleChange("adminEmail", e.target.value)}
              placeholder="admin@rastuci.com"
            />
            <p className="text-xs muted mt-1">
              Este email es el dueño de la cuenta.
            </p>
          </div>
        </div>
      </div>

      {/* Configuración de Correos - NO HARDCODING */}
      <div className="surface-secondary rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-lg">
          Configuración de Correos (Salientes)
        </h3>
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded text-sm text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800">
          IMPORTANTE: Para usar estos correos, debes haber verificado tu dominio
          en Resend/DNS.
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="salesEmail">Email de Ventas (pedidos@)</Label>
            <Input
              id="salesEmail"
              type="email"
              value={data.emails?.salesEmail}
              onChange={(e) =>
                setData({
                  ...data,
                  emails: { ...data.emails, salesEmail: e.target.value },
                })
              }
              placeholder="pedidos@rastuci.com"
            />
            <p className="text-xs muted mt-1">
              Remitente para confirmaciones de compra.
            </p>
          </div>
          <div>
            <Label htmlFor="supportEmail">Email de Soporte (soporte@)</Label>
            <Input
              id="supportEmail"
              type="email"
              value={data.emails?.supportEmail}
              onChange={(e) =>
                setData({
                  ...data,
                  emails: { ...data.emails, supportEmail: e.target.value },
                })
              }
              placeholder="soporte@rastuci.com"
            />
            <p className="text-xs muted mt-1">
              Remitente para respuestas y ayuda.
            </p>
          </div>
          <div>
            <Label htmlFor="senderName">Nombre del Remitente</Label>
            <Input
              id="senderName"
              value={data.emails?.senderName}
              onChange={(e) =>
                setData({
                  ...data,
                  emails: { ...data.emails, senderName: e.target.value },
                })
              }
              placeholder="Rastuci Tienda"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Identidad"}
        </Button>
      </div>
    </form>
  );
}
