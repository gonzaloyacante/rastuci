"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { SectionLoader } from "@/components/ui/Spinner";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import VacationHistory from "@/components/vacation/VacationHistory";
import { logger } from "@/lib/logger";
import {
  VacationSettingsFormData,
  VacationSettingsSchema,
} from "@/lib/validation/vacation";

// Define Form Data extending Schema to handle dates as strings for input if needed
// Zod schema expects Dates, but inputs use strings. React Hook Form handles this with Controller usually.
// Or we simplify.

export default function VacationSettingsForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [notifySubscribers, setNotifySubscribers] = useState(true);

  const { show: toast } = useToast();

  const form = useForm<VacationSettingsFormData>({
    resolver: zodResolver(VacationSettingsSchema),
    defaultValues: {
      enabled: false,
      title: "Modo Vacaciones",
      message: "Estamos de vacaciones.",
      showEmailCollection: true,
      startDate: null,
      endDate: null,
    },
  });

  // Fetch Logic
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings/vacation");
        const json = await res.json();
        const data = json.success ? json.data : json;
        // Determine proper date format or obj
        form.reset({
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        });
      } catch (e) {
        logger.error("Error loading vacation settings", { error: e });
      } finally {
        setIsLoading(false);
      }
    }
    void load();
  }, [form]);

  // Submit Handler
  const onSubmit = async (data: VacationSettingsFormData) => {
    // ... (comments)

    setIsSaving(true);
    try {
      // ... (logic)

      const payload = {
        ...data,
        startDate: data.startDate
          ? new Date(data.startDate).toISOString()
          : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
      };

      const res = await fetch("/api/settings/vacation/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar");

      toast({
        title: "Cambios guardados exitosamente",
        message: "La configuración se ha actualizado correctamente.",
        type: "success",
      });

      // ... (logic)
    } catch (_e) {
      toast({
        type: "error",
        title: "Error",
        message: "No se pudieron guardar los cambios.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleChange = (checked: boolean) => {
    if (!checked && form.getValues("enabled")) {
      // User is turning it OFF. Show Dialog.
      setShowEndDialog(true);
      // We don't change form state yet, wait for confirmation.
      return;
    }
    form.setValue("enabled", checked);
  };

  const confirmEndVacation = async () => {
    form.setValue("enabled", false);
    setShowEndDialog(false);
    setIsSaving(true);

    try {
      const formData = form.getValues();
      const payload = {
        ...formData,
        enabled: false,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
      };

      const res = await fetch("/api/settings/vacation/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar");

      const json = await res.json();
      const closedPeriodId: string | null = json.closedPeriodId ?? null;

      if (notifySubscribers && closedPeriodId) {
        const notifyRes = await fetch("/api/settings/vacation/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ periodId: closedPeriodId }),
        });
        const notifyData = await notifyRes.json();
        toast({
          type: "success",
          title: "Vacaciones finalizadas",
          message: notifyData.sent
            ? `Se notificaron ${notifyData.sent} suscriptores.`
            : "Período finalizado. No había suscriptores pendientes.",
        });
      } else {
        toast({
          type: "success",
          title: "Vacaciones finalizadas",
          message: "La tienda está abierta nuevamente.",
        });
      }
    } catch (e) {
      logger.error("Error ending vacation", { error: e });
      form.setValue("enabled", true); // revert on error
      toast({
        type: "error",
        title: "Error",
        message: "No se pudo finalizar el período de vacaciones.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <SectionLoader className="h-64" />;

  const isEnabled = form.watch("enabled");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Vacaciones</CardTitle>
          <CardDescription>
            Gestiona los periodos de receso y notificaciones automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-surface-secondary">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Vacaciones</Label>
                <p className="text-sm text-muted">
                  {isEnabled
                    ? "La tienda está cerrada actualmente."
                    : "La tienda está abierta normalmente."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isEnabled ? (
                  <Lock className="w-4 h-4 text-error" />
                ) : (
                  <Unlock className="w-4 h-4 text-success" />
                )}
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggleChange}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Título del Banner</Label>
                <Input
                  {...form.register("title")}
                  placeholder="Modo Vacaciones"
                  disabled={!isEnabled}
                />
                {form.formState.errors.title && (
                  <p className="text-error text-xs">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Mensaje Visible</Label>
                <Input
                  {...form.register("message")}
                  placeholder="Estamos descansando..."
                  disabled={!isEnabled}
                />
                {form.formState.errors.message && (
                  <p className="text-error text-xs">
                    {form.formState.errors.message.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de Inicio"
                      date={field.value}
                      setDate={field.onChange}
                      minDate={new Date()}
                      disabled={!isEnabled}
                      placeholder="Seleccionar inicio"
                    />
                  )}
                />
                {form.formState.errors.startDate && (
                  <p className="text-error text-xs">
                    {form.formState.errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Controller
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de Regreso (Estimada)"
                      date={field.value}
                      setDate={field.onChange}
                      minDate={form.watch("startDate") || new Date()}
                      disabled={!isEnabled}
                      placeholder="Seleccionar regreso"
                    />
                  )}
                />
                {form.formState.errors.endDate && (
                  <p className="text-error text-xs">
                    {form.formState.errors.endDate.message}
                  </p>
                )}
                <p className="text-xs text-muted">
                  Se usará para el mensaje "Volvemos el..."
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="emailCollection"
                checked={form.watch("showEmailCollection")}
                onCheckedChange={(c) =>
                  form.setValue("showEmailCollection", c as boolean)
                }
              />
              <label
                htmlFor="emailCollection"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Mostrar formulario de recolección de emails
              </label>
            </div>

            <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Finalizar Vacaciones?</DialogTitle>
                  <DialogDescription>
                    Esto abrirá la tienda y permitirá nuevas compras
                    inmediatamente.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-start space-x-2 pt-4">
                  <Checkbox
                    id="notify"
                    checked={notifySubscribers}
                    onCheckedChange={(c) => setNotifySubscribers(c as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="notify"
                      className="text-sm font-medium leading-none"
                    >
                      Notificar suscriptores por email
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Se enviará un correo de "¡Volvimos!" a todos los
                      registrados en este periodo.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEndDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={confirmEndVacation}>Abrir Tienda</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              type="submit"
              disabled={isSaving}
              loading={isSaving}
              className="w-full md:w-auto"
            >
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      <VacationHistory />
    </div>
  );
}
