"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import {
  ContactSettings,
  ContactSettingsSchema,
  defaultContactSettings,
} from "@/lib/validation/contact";

type Props = { initial?: ContactSettings };

export default function ContactForm({ initial }: Props) {
  const [values, setValues] = useState<ContactSettings>(
    initial ?? defaultContactSettings
  );
  const [saving, setSaving] = useState(false);

  // Fetch initial data if not provided
  useEffect(() => {
    if (initial) {
      setValues(initial);
    } else {
      fetch("/api/contact")
        .then((res) => res.json())
        .then((data) => {
          if (data) setValues(data);
        })
        .catch((err) => {
          console.error("Error fetching contact settings:", err);
          toast.error("Error al cargar configuración");
        });
    }
  }, [initial]);

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
    update("emails", (values.emails || []).filter((_, i) => i !== index));
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
    update("phones", (values.phones || []).filter((_, i) => i !== index));
  };

  // Form submit handler
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = ContactSettingsSchema.safeParse(values);
    if (!parsed.success) {
      toast.error("Por favor revisa los campos inválidos");
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
      if (!json) {
        throw new Error("Error al guardar");
      }
      toast.success("Configuración de contacto guardada");
    } catch (err: unknown) {
      console.error(err);
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* Header Section */}
      <section className="grid md:grid-cols-2 gap-6">
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
      </section>

      {/* Emails & Phones Section */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Emails</h3>
          <div className="space-y-2">
            {(values.emails || []).map((email, idx) => (
              <div key={`email-${idx}`} className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => updateEmail(idx, e.target.value)}
                  type="email"
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
            <Button type="button" onClick={addEmail}>
              Agregar email
            </Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Teléfonos</h3>
          <div className="space-y-2">
            {(values.phones || []).map((phone, idx) => (
              <div key={`phone-${idx}`} className="flex gap-2">
                <Input
                  value={phone}
                  onChange={(e) => updatePhone(idx, e.target.value)}
                  type="tel"
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
            <Button type="button" onClick={addPhone}>
              Agregar teléfono
            </Button>
          </div>
        </div>
      </section>

      {/* Address & Hours Section */}
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Dirección (Pública)</h3>
          <div className="space-y-2">
            <Input
              placeholder="Línea 1"
              value={values.address?.lines?.[0] || ""}
              onChange={(e) =>
                update("address", {
                  ...(values.address || { lines: [], cityCountry: "", coordinates: { lat: 0, lng: 0 } }),
                  lines: [e.target.value, values.address?.lines?.[1] || ""],
                })
              }
            />
            <Input
              placeholder="Línea 2"
              value={values.address?.lines?.[1] || ""}
              onChange={(e) =>
                update("address", {
                  ...(values.address || { lines: [], cityCountry: "", coordinates: { lat: 0, lng: 0 } }),
                  lines: [values.address?.lines?.[0] || "", e.target.value],
                })
              }
            />
            <Input
              placeholder="Ciudad, País"
              value={values.address?.cityCountry || ""}
              onChange={(e) =>
                update("address", {
                  ...(values.address || { lines: [], cityCountry: "", coordinates: { lat: 0, lng: 0 } }),
                  cityCountry: e.target.value,
                })
              }
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Horarios</h3>
          <div className="space-y-2">
            <Input
              placeholder="Título de horarios"
              value={values.hours?.title || ""}
              onChange={(e) =>
                update("hours", { ...(values.hours || { title: "", weekdays: "", saturday: "", sunday: "" }), title: e.target.value })
              }
            />
            <Input
              placeholder="Lunes a Viernes"
              value={values.hours?.weekdays || ""}
              onChange={(e) =>
                update("hours", { ...(values.hours || { title: "", weekdays: "", saturday: "", sunday: "" }), weekdays: e.target.value })
              }
            />
            <Input
              placeholder="Sábados"
              value={values.hours?.saturday || ""}
              onChange={(e) =>
                update("hours", { ...(values.hours || { title: "", weekdays: "", saturday: "", sunday: "" }), saturday: e.target.value })
              }
            />
            <Input
              placeholder="Domingos"
              value={values.hours?.sunday || ""}
              onChange={(e) =>
                update("hours", { ...(values.hours || { title: "", weekdays: "", saturday: "", sunday: "" }), sunday: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* Form Labels Section */}
      <section>
        <h3 className="font-semibold mb-2">Formulario de Contacto</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Input
            label="Título del formulario"
            value={values.form?.title || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), title: e.target.value })
            }
          />
          <Input
            label="Etiqueta Nombre"
            value={values.form?.nameLabel || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), nameLabel: e.target.value })
            }
          />
          <Input
            label="Etiqueta Email"
            value={values.form?.emailLabel || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), emailLabel: e.target.value })
            }
          />
          <Input
            label="Etiqueta Teléfono"
            value={values.form?.phoneLabel || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), phoneLabel: e.target.value })
            }
          />
          <Input
            label="Etiqueta Mensaje"
            value={values.form?.messageLabel || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), messageLabel: e.target.value })
            }
          />
          <Input
            label="Texto del botón"
            value={values.form?.submitLabel || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), submitLabel: e.target.value })
            }
          />
          <Input
            label="Título de éxito"
            value={values.form?.successTitle || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), successTitle: e.target.value })
            }
          />
          <Input
            label="Mensaje de éxito"
            value={values.form?.successMessage || ""}
            onChange={(e) =>
              update("form", { ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }), successMessage: e.target.value })
            }
          />
          <Input
            label="Enviar otro mensaje"
            value={values.form?.sendAnotherLabel || ""}
            onChange={(e) =>
              update("form", {
                ...(values.form || { title: "", messageLabel: "", nameLabel: "", emailLabel: "", phoneLabel: "", submitLabel: "", successTitle: "", successMessage: "", sendAnotherLabel: "" }),
                sendAnotherLabel: e.target.value,
              })
            }
          />
        </div>
      </section>

      {/* Social Media Section */}
      <section>
        <h3 className="font-semibold mb-3">Redes Sociales</h3>
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
                onChange={(e) =>
                  update("social", {
                    ...(values.social || { instagram: { url: "", username: "" }, facebook: { url: "", username: "" }, youtube: { url: "", username: "" }, tiktok: { url: "", username: "" }, whatsapp: { url: "", username: "" } }),
                    [network]: {
                      ...(values.social?.[network] || { url: "", username: "" }),
                      username: e.target.value,
                    },
                  })
                }
              />
              <Input
                label={`${network.charAt(0).toUpperCase() + network.slice(1)} - URL`}
                placeholder={`https://${network}.com/...`}
                value={values.social?.[network]?.url ?? ""}
                onChange={(e) =>
                  update("social", {
                    ...(values.social || { instagram: { url: "", username: "" }, facebook: { url: "", username: "" }, youtube: { url: "", username: "" }, tiktok: { url: "", username: "" }, whatsapp: { url: "", username: "" } }),
                    [network]: {
                      ...(values.social?.[network] || { url: "", username: "" }),
                      url: e.target.value,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <Button type="submit" disabled={saving}>
        {saving ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
