"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ContactSettings, ContactSettingsSchema, defaultContactSettings } from "@/lib/validation/contact";

type Props = { initial?: ContactSettings };

interface EmailItem {
  id: string;
  value: string;
}

interface PhoneItem {
  id: string;
  value: string;
}

export default function ContactForm({ initial }: Props) {
  const [values, setValues] = useState<ContactSettings>(initial ?? defaultContactSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Estados para manejar arrays con IDs únicos
  const [emailItems, setEmailItems] = useState<EmailItem[]>([]);
  const [phoneItems, setPhoneItems] = useState<PhoneItem[]>([]);

  useEffect(() => { 
    if (initial) {
      setValues(initial);
      // Convertir arrays a objetos con ID
      setEmailItems(initial.emails.map((email, idx) => ({
        id: `email-${Date.now()}-${idx}-${Math.random()}`,
        value: email
      })));
      setPhoneItems(initial.phones.map((phone, idx) => ({
        id: `phone-${Date.now()}-${idx}-${Math.random()}`,
        value: phone
      })));
    } else {
      // Inicializar con arrays vacíos o por defecto
      setEmailItems(defaultContactSettings.emails.map((email, idx) => ({
        id: `email-default-${idx}-${Math.random()}`,
        value: email
      })));
      setPhoneItems(defaultContactSettings.phones.map((phone, idx) => ({
        id: `phone-default-${idx}-${Math.random()}`,
        value: phone
      })));
    }
  }, [initial]);

  // Sincronizar los arrays con IDs con el estado principal
  useEffect(() => {
    setValues(v => ({
      ...v,
      emails: emailItems.map(item => item.value),
      phones: phoneItems.map(item => item.value)
    }));
  }, [emailItems, phoneItems]);

  const update = <K extends keyof ContactSettings>(key: K, val: ContactSettings[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const updateEmailItem = (id: string, value: string) => {
    setEmailItems(items => items.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const updatePhoneItem = (id: string, value: string) => {
    setPhoneItems(items => items.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const addEmailItem = () => {
    setEmailItems(items => [...items, {
      id: `email-new-${Date.now()}-${Math.random()}`,
      value: ""
    }]);
  };

  const addPhoneItem = () => {
    setPhoneItems(items => [...items, {
      id: `phone-new-${Date.now()}-${Math.random()}`,
      value: ""
    }]);
  };

  const removeEmailItem = (id: string) => {
    setEmailItems(items => items.filter(item => item.id !== id));
  };

  const removePhoneItem = (id: string) => {
    setPhoneItems(items => items.filter(item => item.id !== id));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(null);
    const parsed = ContactSettingsSchema.safeParse(values);
    if (!parsed.success) { setMessage(parsed.error.errors.map((er) => er.message).join("; ")); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/contact", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const json = await res.json();
      if (!json.success) {throw new Error(json.error || "Error al guardar");}
      setMessage("Guardado correctamente");
    } catch (err: unknown) { setMessage(err instanceof Error ? err.message : "Error inesperado"); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input className="w-full border rounded-md px-3 py-2" value={values.headerTitle} onChange={(e) => update("headerTitle", e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subtítulo</label>
          <input className="w-full border rounded-md px-3 py-2" value={values.headerSubtitle} onChange={(e) => update("headerSubtitle", e.target.value)} />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Emails</h3>
          <div className="space-y-2">
            {emailItems.map((emailItem) => (
              <div key={emailItem.id} className="flex gap-2">
                <input className="flex-1 border rounded-md px-3 py-2" value={emailItem.value} onChange={(e) => updateEmailItem(emailItem.id, e.target.value)} />
                <Button type="button" variant="destructive" onClick={() => removeEmailItem(emailItem.id)}>Quitar</Button>
              </div>
            ))}
            <Button type="button" onClick={addEmailItem}>Agregar email</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Teléfonos</h3>
          <div className="space-y-2">
            {phoneItems.map((phoneItem) => (
              <div key={phoneItem.id} className="flex gap-2">
                <input className="flex-1 border rounded-md px-3 py-2" value={phoneItem.value} onChange={(e) => updatePhoneItem(phoneItem.id, e.target.value)} />
                <Button type="button" variant="destructive" onClick={() => removePhoneItem(phoneItem.id)}>Quitar</Button>
              </div>
            ))}
            <Button type="button" onClick={addPhoneItem}>Agregar teléfono</Button>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Dirección</h3>
          <div className="space-y-2">
            <input key="address-line-0" className="w-full border rounded-md px-3 py-2" placeholder="Línea 1" value={values.address.lines[0] || ""} onChange={(e) => update("address", { ...values.address, lines: [e.target.value, values.address.lines[1] || ""] })} />
            <input key="address-line-1" className="w-full border rounded-md px-3 py-2" placeholder="Línea 2" value={values.address.lines[1] || ""} onChange={(e) => update("address", { ...values.address, lines: [values.address.lines[0] || "", e.target.value] })} />
            <input className="w-full border rounded-md px-3 py-2" value={values.address.cityCountry} onChange={(e) => update("address", { ...values.address, cityCountry: e.target.value })} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Horarios</h3>
          <div className="space-y-2">
            <input className="w-full border rounded-md px-3 py-2" value={values.hours.title} onChange={(e) => update("hours", { ...values.hours, title: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" value={values.hours.weekdays} onChange={(e) => update("hours", { ...values.hours, weekdays: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" value={values.hours.saturday} onChange={(e) => update("hours", { ...values.hours, saturday: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" value={values.hours.sunday} onChange={(e) => update("hours", { ...values.hours, sunday: e.target.value })} />
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-2">Formulario</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <input className="w-full border rounded-md px-3 py-2" value={values.form.title} onChange={(e) => update("form", { ...values.form, title: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.nameLabel} onChange={(e) => update("form", { ...values.form, nameLabel: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.emailLabel} onChange={(e) => update("form", { ...values.form, emailLabel: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.phoneLabel} onChange={(e) => update("form", { ...values.form, phoneLabel: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.messageLabel} onChange={(e) => update("form", { ...values.form, messageLabel: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.submitLabel} onChange={(e) => update("form", { ...values.form, submitLabel: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.successTitle} onChange={(e) => update("form", { ...values.form, successTitle: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.successMessage} onChange={(e) => update("form", { ...values.form, successMessage: e.target.value })} />
          <input className="w-full border rounded-md px-3 py-2" value={values.form.sendAnotherLabel} onChange={(e) => update("form", { ...values.form, sendAnotherLabel: e.target.value })} />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Redes Sociales</h3>
        <div className="space-y-4">
          {(["instagram", "facebook", "whatsapp", "tiktok", "youtube"] as const).map(network => (
            <div key={network} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border border-muted rounded-lg">
              <div>
                <label className="block text-xs font-medium mb-1 capitalize">{network} - Usuario</label>
                <input 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder={`@usuario`}
                  value={values.social[network]?.username ?? ""} 
                  onChange={(e) => update("social", { 
                    ...values.social, 
                    [network]: { ...values.social[network], username: e.target.value }
                  })} 
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 capitalize">{network} - URL</label>
                <input 
                  className="w-full border rounded-md px-3 py-2" 
                  placeholder={`https://${network}.com/...`}
                  value={values.social[network]?.url ?? ""} 
                  onChange={(e) => update("social", { 
                    ...values.social, 
                    [network]: { ...values.social[network], url: e.target.value }
                  })} 
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {message && <p className="text-sm muted">{message}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
    </form>
  );
}
