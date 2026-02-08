"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { Alert } from "@/components/ui/Alert";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { defaultStoreSettings, StoreSettings } from "@/lib/validation/store";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FormSkeleton } from "@/components/admin/SettingsSkeletons";

const STATUS_COLORS = [
  {
    value: "success",
    label: "Verde (Éxito)",
    class: "text-green-600 bg-green-50",
  },
  {
    value: "warning",
    label: "Naranja (Alerta)",
    class: "text-orange-600 bg-orange-50",
  },
  { value: "error", label: "Rojo (Critico)", class: "text-red-600 bg-red-50" },
  { value: "info", label: "Azul (Info)", class: "text-blue-600 bg-blue-50" },
  { value: "muted", label: "Gris (Neutro)", class: "text-gray-500 bg-gray-50" },
  { value: "primary", label: "Primario", class: "text-primary bg-primary/10" },
];

export default function StockSettings() {
  const { settings, loading, mutate } = useSettings<StoreSettings>("store");

  // Initialize with safe defaults to avoid crashes if settings typically load partial data
  const [localStatuses, setLocalStatuses] = useState<
    typeof defaultStoreSettings.stockStatuses
  >([]);
  const [enableAlerts, setEnableAlerts] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalStatuses(settings.stockStatuses || []);
      // Safe access
      setEnableAlerts(settings.stock?.enableStockAlerts ?? false);
    }
  }, [settings]);

  const handleStatusChange = (
    index: number,
    field: keyof (typeof localStatuses)[0],
    value: string | number | null
  ) => {
    const newStatuses = [...localStatuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    setLocalStatuses(newStatuses);
  };

  const addStatus = () => {
    setLocalStatuses([
      ...localStatuses,
      {
        id: crypto.randomUUID(),
        min: 0,
        max: null,
        label: "Nuevo estado",
        color: "muted",
      },
    ]);
  };

  const removeStatus = (index: number) => {
    setLocalStatuses(localStatuses.filter((_, i) => i !== index));
  };

  // ... (handlers same as before) ...

  // Re-implement update logic manually since we removed the custom hook
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    try {
      const res = await fetch("/api/settings/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });
      const json = await res.json();
      if (json.success) {
        await mutate(); // Refresh SWR
        return { success: true };
      }
      return { success: false, error: json.error };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate rules logic
    const validStatuses = localStatuses.map((s) => ({
      ...s,
      min: Number(s.min) || 0,
      max: s.max === null || s.max === undefined ? null : Number(s.max),
    }));

    if (!settings) {
      toast.error("Error: No hay configuración cargada");
      setSaving(false);
      return;
    }

    const currentStock = settings.stock || defaultStoreSettings.stock;

    const result = await updateSettings({
      stock: { ...currentStock, enableStockAlerts: enableAlerts },
      stockStatuses: validStatuses,
    });

    if (result.success) {
      toast.success("Configuración de stock guardada correctamente");
    } else {
      toast.error(result.error || "Error al guardar");
    }
    setSaving(false);
  };

  if (loading) return <FormSkeleton rows={3} />;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Global toggle */}
      <div className="surface-secondary rounded-lg p-6 border border-muted">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-content-primary">
              Activar Indicadores de Stock
            </h3>
            <p className="text-sm text-muted">
              Habilitar o deshabilitar la visualización de etiquetas de stock en
              la tienda.
            </p>
          </div>
          <Switch checked={enableAlerts} onCheckedChange={setEnableAlerts} />
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-content-primary">
              Reglas de Estado de Stock
            </h3>
            <p className="text-muted text-sm">
              Define qué etiqueta mostrar según la cantidad de stock disponible.
            </p>
          </div>
          <Button type="button" onClick={addStatus} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Agregar Regla
          </Button>
        </div>

        <Alert
          variant="info"
          inline
          isOpen={true}
          onClose={() => {}}
          title="Cómo funciona"
          message="El sistema buscará la primera regla que coincida con el stock del producto. Si configuras 'Hasta: vacío', significa 'Hasta infinito'."
        />

        <div className="space-y-4">
          {localStatuses.map((status, index) => {
            const currentColor =
              STATUS_COLORS.find((c) => c.value === status.color) ||
              STATUS_COLORS[4];

            return (
              <div
                key={status.id}
                className="surface p-4 rounded-lg border border-muted shadow-sm hover:shadow-md transition-shadow relative group"
              >
                <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-end">
                  {/* Min */}
                  <div className="md:col-span-2">
                    <Label className="text-xs">Desde (Mín)</Label>
                    <Input
                      type="number"
                      value={status.min}
                      onChange={(e) =>
                        handleStatusChange(index, "min", e.target.value)
                      }
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  {/* Max */}
                  <div className="md:col-span-2">
                    <Label className="text-xs">Hasta (Máx)</Label>
                    <Input
                      type="number"
                      value={
                        status.max === null || status.max === undefined
                          ? ""
                          : status.max
                      }
                      onChange={(e) =>
                        handleStatusChange(
                          index,
                          "max",
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                      placeholder="∞"
                      min={0}
                    />
                    <span className="text-[10px] text-muted-foreground absolute -bottom-4 left-0 w-full truncate text-center">
                      {status.max === null || status.max === undefined
                        ? "Infinito"
                        : ""}
                    </span>
                  </div>

                  {/* Label */}
                  <div className="col-span-2 md:col-span-4">
                    <Label className="text-xs">Etiqueta</Label>
                    <Input
                      value={status.label}
                      onChange={(e) =>
                        handleStatusChange(index, "label", e.target.value)
                      }
                      placeholder="Ej: Stock Bajo"
                    />
                  </div>

                  {/* Color Selector */}
                  <div className="col-span-2 md:col-span-3">
                    <Label className="text-xs">Color</Label>
                    <select
                      value={status.color}
                      onChange={(e) =>
                        handleStatusChange(index, "color", e.target.value)
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {STATUS_COLORS.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-2 md:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStatus(index)}
                      className="text-muted hover:text-error hover:bg-error/10 aspect-square p-0"
                      title="Eliminar regla"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview Badge */}
                <div className="mt-4 pt-3 border-t border-muted/50 flex items-center justify-between">
                  <span className="text-xs text-muted">Vista previa:</span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-semibold",
                      currentColor.class
                    )}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}

          {localStatuses.length === 0 && (
            <div className="text-center py-8 bg-surface-secondary rounded-lg border border-dashed border-muted">
              <p className="text-muted">No hay reglas definidas.</p>
              <Button
                type="button"
                onClick={addStatus}
                variant="ghost"
                className="mt-2 text-primary hover:text-primary/80"
              >
                Agregar primera regla
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 sticky bottom-4">
        <Button
          type="submit"
          disabled={saving}
          size="lg"
          className="w-full sm:w-auto shadow-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
