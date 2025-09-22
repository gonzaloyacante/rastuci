"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ContactSettings, ContactSettingsSchema, defaultContactSettings } from "@/lib/validation/contact";

type Props = { initial?: ContactSettings };

export default function ContactForm({ initial }: Props) {
  const [values, setValues] = useState<ContactSettings>(initial ?? defaultContactSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => { if (initial) setValues(initial); }, [initial]);

  const update = <K extends keyof ContactSettings>(key: K, val: ContactSettings[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const updateArray = (key: "emails" | "phones", idx: number, val: string) =>
    setValues((v) => ({ ...v, [key]: v[key].map((x, i) => (i === idx ? val : x)) }));

  const addArrayItem = (key: "emails" | "phones") =>
    setValues((v) => ({ ...v, [key]: [...v[key], ""] }));

  const removeArrayItem = (key: "emails" | "phones", idx: number) =>
    setValues((v) => ({ ...v, [key]: v[key].filter((_, i) => i !== idx) }));

  const updateFaq = (idx: number, field: "question" | "answer", val: string) =>
    setValues((v) => ({ ...v, faqs: v.faqs.map((f, i) => (i === idx ? { ...f, [field]: val } : f)) }));

  const addFaq = () => setValues((v) => ({ ...v, faqs: [...v.faqs, { question: "", answer: "" }] }));
  const removeFaq = (idx: number) => setValues((v) => ({ ...v, faqs: v.faqs.filter((_, i) => i !== idx) }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(null);
    const parsed = ContactSettingsSchema.safeParse(values);
    if (!parsed.success) { setMessage(parsed.error.errors.map((er) => er.message).join("; ")); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/contact", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al guardar");
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
            {values.emails.map((em, i) => (
              <div key={i} className="flex gap-2">
                <input className="flex-1 border rounded-md px-3 py-2" value={em} onChange={(e) => updateArray("emails", i, e.target.value)} />
                <Button type="button" variant="destructive" onClick={() => removeArrayItem("emails", i)}>Quitar</Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem("emails")}>Agregar email</Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Teléfonos</h3>
          <div className="space-y-2">
            {values.phones.map((ph, i) => (
              <div key={i} className="flex gap-2">
                <input className="flex-1 border rounded-md px-3 py-2" value={ph} onChange={(e) => updateArray("phones", i, e.target.value)} />
                <Button type="button" variant="destructive" onClick={() => removeArrayItem("phones", i)}>Quitar</Button>
              </div>
            ))}
            <Button type="button" onClick={() => addArrayItem("phones")}>Agregar teléfono</Button>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Dirección</h3>
          <div className="space-y-2">
            {values.address.lines.map((ln, i) => (
              <input key={i} className="w-full border rounded-md px-3 py-2" value={ln} onChange={(e) => update("address", { ...values.address, lines: values.address.lines.map((x, j) => (j === i ? e.target.value : x)) })} />
            ))}
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
        <h3 className="font-semibold mb-2">Preguntas Frecuentes</h3>
        <div className="space-y-4">
          {values.faqs.map((f, i) => (
            <div key={i} className="grid md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <input className="w-full border rounded-md px-3 py-2" placeholder="Pregunta" value={f.question} onChange={(e) => updateFaq(i, "question", e.target.value)} />
              </div>
              <div className="md:col-span-6">
                <input className="w-full border rounded-md px-3 py-2" placeholder="Respuesta" value={f.answer} onChange={(e) => updateFaq(i, "answer", e.target.value)} />
              </div>
              <div className="md:col-span-1">
                <Button type="button" variant="destructive" onClick={() => removeFaq(i)}>Quitar</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3"><Button type="button" onClick={addFaq}>Agregar FAQ</Button></div>
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Redes sociales</h3>
          <div className="space-y-2">
            <input className="w-full border rounded-md px-3 py-2" placeholder="Instagram URL" value={values.social.instagram ?? ""} onChange={(e) => update("social", { ...values.social, instagram: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="Facebook URL" value={values.social.facebook ?? ""} onChange={(e) => update("social", { ...values.social, facebook: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="WhatsApp URL" value={values.social.whatsapp ?? ""} onChange={(e) => update("social", { ...values.social, whatsapp: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="TikTok URL" value={values.social.tiktok ?? ""} onChange={(e) => update("social", { ...values.social, tiktok: e.target.value })} />
            <input className="w-full border rounded-md px-3 py-2" placeholder="YouTube URL" value={values.social.youtube ?? ""} onChange={(e) => update("social", { ...values.social, youtube: e.target.value })} />
          </div>
        </div>
      </section>

      {message && <p className="text-sm muted">{message}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
    </form>
  );
}
