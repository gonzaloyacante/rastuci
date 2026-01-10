"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  type StoreSettings,
  defaultStoreSettings,
} from "@/lib/validation/store";
import { toast } from "react-hot-toast";
import { Save } from "lucide-react";

interface StoreFormProps {
  initial?: StoreSettings;
  onSave?: (data: StoreSettings) => void;
}

export default function StoreForm({ initial, onSave }: StoreFormProps) {
  const [data, setData] = useState<StoreSettings>(
    initial || defaultStoreSettings
  );
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!initial);

  useEffect(() => {
    if (!initial) {
      fetch("/api/settings/store")
        .then(async (res) => {
          if (res.status === 401 || res.status === 403) {
            window.location.href = "/admin"; // Redirect on auth fail
            return { success: false, error: "Sesión expirada" };
          }
          return res.json();
        })
        .then((json) => {
          if (json.success) {
            setData(json.data);
          } else if (json.error) {
            toast.error(json.error);
          }
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    }
  }, [initial]);

  if (loading) return <div className="p-4">Cargando configuración...</div>;

  const handleChange = (field: keyof StoreSettings, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 401 || res.status === 403) {
        toast.error(
          "Sesión expirada. Por favor recarga o inicia sesión nuevamente."
        );
        return;
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Error al guardar");
      }

      toast.success("Configuración guardada");
      onSave?.(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar");
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

      {/* Configuración de Stock */}
      <div className="surface-secondary rounded-lg p-4 space-y-4">
        <h3 className="font-semibold text-lg">Alertas de Stock</h3>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="lowStockThreshold">Umbral de Stock Bajo</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min="0"
              value={data.stock?.lowStockThreshold ?? 5}
              onChange={(e) =>
                setData({
                  ...data,
                  stock: {
                    ...data.stock,
                    lowStockThreshold: Number(e.target.value),
                  },
                })
              }
            />
            <p className="text-xs muted mt-1">
              Se enviará una alerta cuando un producto baje de esta cantidad.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="enableStockAlerts"
              className="w-4 h-4"
              checked={data.stock?.enableStockAlerts ?? true}
              onChange={(e) =>
                setData({
                  ...data,
                  stock: { ...data.stock, enableStockAlerts: e.target.checked },
                })
              }
            />
            <Label htmlFor="enableStockAlerts">Activar Alertas por Email</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Identidad"}
        </Button>
      </div>
    </form>
  );
}
