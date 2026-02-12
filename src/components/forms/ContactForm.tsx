"use client";

import { useToast } from "@/components/ui/Toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ContactSettings,
  ContactSettingsSchema,
  defaultContactSettings,
} from "@/lib/validation/contact";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSettings } from "@/hooks/useSettings";

type Props = { initial?: ContactSettings };

export default function ContactForm({ initial }: Props) {
  const [values, setValues] = useState<ContactSettings>(
    initial ?? defaultContactSettings
  );
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!initial);

  // SWR Hook
  const {
    settings,
    loading: loadingSettings,
    mutate: mutateSettings,
  } = useSettings<ContactSettings>("contact");

  // Sync SWR data to local state on initial load
  useEffect(() => {
    if (initial) {
      setValues(initial);
      setLoading(false);
      return;
    }

    if (settings) {
      setValues(settings);
      setLoading(false);
    }
  }, [settings, initial]);

  // Handle loading
  useEffect(() => {
    if (!initial && loadingSettings) setLoading(true);
  }, [loadingSettings, initial]);

  // Generic update function for any field
  const update = <K extends keyof ContactSettings>(
    key: K,
    val: ContactSettings[K]
  ) => setValues((v) => ({ ...v, [key]: val }));

  // Email handlers
  const addEmail = () => {
    update("emails", [...(values.emails || []), ""]);
  };
  const updateEmail = (index: number, val: string) => {
    const newEmails = [...(values.emails || [])];
    newEmails[index] = val;
    update("emails", newEmails);
  };
  const removeEmail = (index: number) => {
    update(
      "emails",
      (values.emails || []).filter((_, i) => i !== index)
    );
    show({ type: "success", message: "Email eliminado de la lista" });
  };

  // Phone handlers
  const addPhone = () => {
    update("phones", [...(values.phones || []), ""]);
  };
  const updatePhone = (index: number, val: string) => {
    const newPhones = [...(values.phones || [])];
    newPhones[index] = val;
    update("phones", newPhones);
  };
  const removePhone = (index: number) => {
    update(
      "phones",
      (values.phones || []).filter((_, i) => i !== index)
    );
    show({ type: "success", message: "Teléfono eliminado de la lista" });
  };

  // Form submit handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: Don't save if data hasn't loaded yet
    if (loading || loadingSettings) {
      show({
        type: "error",
        message: "Espera a que carguen los datos antes de guardar",
      });
      return;
    }

    const parsed = ContactSettingsSchema.safeParse(values);
    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.flatten());
      show({ type: "error", message: "Por favor revisa los campos inválidos" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Error al guardar");
      }
      show({ type: "success", message: "Configuración de contacto guardada" });
      mutateSettings(); // Sync SWR cache
    } catch (err: unknown) {
      console.error(err);
      show({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error al guardar configuración",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Header Section */}
      <section className="space-y-4">
        <h3 className="font-semibold text-lg">Encabezado de Página</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Título"
            value={values.headerTitle || ""}
            onChange={(e) => update("headerTitle", e.target.value)}
          />
          <Input
            label="Subtítulo"
            value={values.headerSubtitle || ""}
            onChange={(e) => update("headerSubtitle", e.target.value)}
          />
        </div>
      </section>

      {/* Emails & Phones Section */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Emails de Contacto</h3>
          <p className="text-sm text-muted mb-3">
            Se mostrarán en la página de contacto y el footer.
          </p>
          <div className="space-y-2">
            {(values.emails || []).map((email, idx) => (
              <div key={`email-${idx}`} className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => updateEmail(idx, e.target.value)}
                  type="email"
                  placeholder="contacto@ejemplo.com"
                  containerClassName="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeEmail(idx)}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addEmail}>
              + Agregar email
            </Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Teléfonos</h3>
          <p className="text-sm text-muted mb-3">
            Números de contacto para clientes.
          </p>
          <div className="space-y-2">
            {(values.phones || []).map((phone, idx) => (
              <div key={`phone-${idx}`} className="flex gap-2">
                <Input
                  value={phone}
                  onChange={(e) => updatePhone(idx, e.target.value)}
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  containerClassName="flex-1"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removePhone(idx)}
                >
                  Quitar
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addPhone}>
              + Agregar teléfono
            </Button>
          </div>
        </div>
      </section>

      {/* Address & Hours Section */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Ubicación (Pública)</h3>
          <p className="text-sm text-muted mb-3">
            Se muestra en la página de contacto. No es la dirección de envío.
          </p>
          <div className="space-y-2">
            <Input
              label="Línea 1 (Dirección exacta - Privado)"
              placeholder="Av. Corrientes 1234"
              value={values.address?.lines?.[0] || ""}
              onChange={(e) =>
                update("address", {
                  lines: [e.target.value, values.address?.lines?.[1] || ""],
                  cityCountry: values.address?.cityCountry || "",
                })
              }
            />
            <Input
              label="Línea 2 (Piso/Depto - Privado)"
              placeholder="Piso 2, Oficina B"
              value={values.address?.lines?.[1] || ""}
              onChange={(e) =>
                update("address", {
                  lines: [values.address?.lines?.[0] || "", e.target.value],
                  cityCountry: values.address?.cityCountry || "",
                })
              }
            />
            <Input
              label="Ciudad y Provincia (Visible en Web y Checkout)"
              placeholder="Ej: La Plata, Buenos Aires"
              value={values.address?.cityCountry || ""}
              onChange={(e) =>
                update("address", {
                  lines: values.address?.lines || [],
                  cityCountry: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Horarios de Atención</h3>
          <p className="text-sm text-muted mb-3">
            Horarios visibles para los clientes.
          </p>
          <div className="space-y-2">
            <Input
              label="Título"
              placeholder="Horarios de Atención"
              value={values.hours?.title || ""}
              onChange={(e) =>
                update("hours", {
                  title: e.target.value,
                  weekdays: values.hours?.weekdays || "",
                  saturday: values.hours?.saturday || "",
                  sunday: values.hours?.sunday || "",
                })
              }
            />
            <Input
              label="Lunes a Viernes"
              placeholder="Lunes a Viernes: 9:00 - 18:00"
              value={values.hours?.weekdays || ""}
              onChange={(e) =>
                update("hours", {
                  title: values.hours?.title || "",
                  weekdays: e.target.value,
                  saturday: values.hours?.saturday || "",
                  sunday: values.hours?.sunday || "",
                })
              }
            />
            <Input
              label="Sábados"
              placeholder="Sábados: 9:00 - 14:00"
              value={values.hours?.saturday || ""}
              onChange={(e) =>
                update("hours", {
                  title: values.hours?.title || "",
                  weekdays: values.hours?.weekdays || "",
                  saturday: e.target.value,
                  sunday: values.hours?.sunday || "",
                })
              }
            />
            <Input
              label="Domingos"
              placeholder="Domingos: Cerrado"
              value={values.hours?.sunday || ""}
              onChange={(e) =>
                update("hours", {
                  title: values.hours?.title || "",
                  weekdays: values.hours?.weekdays || "",
                  saturday: values.hours?.saturday || "",
                  sunday: e.target.value,
                })
              }
            />
          </div>
        </div>
      </section>

      {/* Form Labels Section */}
      <section>
        <h3 className="font-semibold mb-2">Formulario de Contacto Público</h3>
        <p className="text-sm text-muted mb-4">
          Personaliza los textos del formulario que ven los clientes.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <Input
            label="Título del formulario"
            value={values.form?.title || ""}
            onChange={(e) =>
              update("form", { ...values.form!, title: e.target.value })
            }
          />
          <Input
            label="Etiqueta Nombre"
            value={values.form?.nameLabel || ""}
            onChange={(e) =>
              update("form", { ...values.form!, nameLabel: e.target.value })
            }
          />
          <Input
            label="Etiqueta Email"
            value={values.form?.emailLabel || ""}
            onChange={(e) =>
              update("form", { ...values.form!, emailLabel: e.target.value })
            }
          />
          <Input
            label="Etiqueta Teléfono"
            value={values.form?.phoneLabel || ""}
            onChange={(e) =>
              update("form", { ...values.form!, phoneLabel: e.target.value })
            }
          />
          <Input
            label="Etiqueta Mensaje"
            value={values.form?.messageLabel || ""}
            onChange={(e) =>
              update("form", { ...values.form!, messageLabel: e.target.value })
            }
          />
          <Input
            label="Texto del botón"
            value={values.form?.submitLabel || ""}
            onChange={(e) =>
              update("form", { ...values.form!, submitLabel: e.target.value })
            }
          />
          <Input
            label="Título de éxito"
            value={values.form?.successTitle || ""}
            onChange={(e) =>
              update("form", { ...values.form!, successTitle: e.target.value })
            }
          />
          <Input
            label="Mensaje de éxito"
            value={values.form?.successMessage || ""}
            onChange={(e) =>
              update("form", {
                ...values.form!,
                successMessage: e.target.value,
              })
            }
          />
          <Input
            label="Enviar otro mensaje"
            value={values.form?.sendAnotherLabel || ""}
            onChange={(e) =>
              update("form", {
                ...values.form!,
                sendAnotherLabel: e.target.value,
              })
            }
          />
        </div>
      </section>

      {/* Social Media Section */}
      <section>
        <h3 className="font-semibold mb-2">Redes Sociales</h3>
        <p className="text-sm text-muted mb-4">
          Links a tus redes sociales. Se muestran en el footer y contacto.
        </p>
        <div className="space-y-4">
          {(
            ["instagram", "facebook", "whatsapp", "tiktok", "youtube"] as const
          ).map((network) => (
            <div
              key={network}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-[var(--color-border)] rounded-lg"
            >
              <Input
                label={`${network.charAt(0).toUpperCase() + network.slice(1)} - Usuario`}
                placeholder="@usuario"
                value={values.social?.[network]?.username ?? ""}
                onChange={(e) => {
                  const currentSocial = values.social || {
                    instagram: { url: "", username: "" },
                    facebook: { url: "", username: "" },
                    youtube: { url: "", username: "" },
                    tiktok: { url: "", username: "" },
                    whatsapp: { url: "", username: "" },
                  };
                  update("social", {
                    ...currentSocial,
                    [network]: {
                      username: e.target.value,
                      url: currentSocial[network]?.url || "",
                    },
                  });
                }}
              />
              <Input
                label={`${network.charAt(0).toUpperCase() + network.slice(1)} - URL`}
                placeholder={`https://${network}.com/...`}
                value={values.social?.[network]?.url ?? ""}
                onChange={(e) => {
                  const currentSocial = values.social || {
                    instagram: { url: "", username: "" },
                    facebook: { url: "", username: "" },
                    youtube: { url: "", username: "" },
                    tiktok: { url: "", username: "" },
                    whatsapp: { url: "", username: "" },
                  };
                  update("social", {
                    ...currentSocial,
                    [network]: {
                      username: currentSocial[network]?.username || "",
                      url: e.target.value,
                    },
                  });
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          disabled={saving}
          size="lg"
          className="w-full sm:w-auto"
        >
          {saving ? "Guardando..." : "Guardar Configuración de Contacto"}
        </Button>
      </div>
    </form>
  );
}
