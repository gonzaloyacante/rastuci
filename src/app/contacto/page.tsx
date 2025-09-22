"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { type ContactSettings, defaultContactSettings } from "@/lib/validation/contact";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contact, setContact] = useState<ContactSettings>(defaultContactSettings);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/contact");
        const json = await res.json();
        if (json?.success && json.data) setContact(json.data as ContactSettings);
        else setContact(defaultContactSettings);
      } catch {
        setContact(defaultContactSettings);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío del formulario
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Page Header */
        }
        <div className="text-center mb-12">
          <h1
            className="text-4xl mb-4 font-montserrat">
            {contact.headerTitle}
          </h1>
          <p className="muted text-lg max-w-2xl mx-auto">
            {contact.headerSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2
              className="text-2xl mb-6 font-montserrat">
              Información de Contacto
            </h2>

            <div className="space-y-6">
              <Card className="surface border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="pill-icon">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-2 font-montserrat">
                        Email
                      </h3>
                      {contact.emails.map((em, i) => (
                        <p className="muted" key={i}>{em}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="pill-icon">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-2 font-montserrat">
                        Teléfono
                      </h3>
                      {contact.phones.map((ph, i) => (
                        <p className="muted" key={i}>{ph}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="pill-icon">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-2 font-montserrat">
                        Dirección
                      </h3>
                      {contact.address.lines.map((ln, i) => (
                        <p className="muted" key={i}>{ln}</p>
                      ))}
                      <p className="muted">{contact.address.cityCountry}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="surface border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="pill-icon">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-2 font-montserrat">
                        {contact.hours.title}
                      </h3>
                      <p className="muted">{contact.hours.weekdays}</p>
                      <p className="muted">{contact.hours.saturday}</p>
                      <p className="muted">{contact.hours.sunday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2
              className="text-2xl mb-6 font-montserrat">
              {contact.form.title}
            </h2>

            {submitted ? (
              <Card className="surface border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="muted mb-4">
                    <Send size={48} className="mx-auto" />
                  </div>
                  <h3
                    className="text-xl mb-2 font-montserrat">
                    {contact.form.successTitle}
                  </h3>
                  <p className="muted mb-4">{contact.form.successMessage}</p>
                  <Button onClick={() => setSubmitted(false)} variant="hero">
                    {contact.form.sendAnotherLabel}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="surface border-0 shadow-md">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-semibold mb-2 font-montserrat">
                          {contact.form.nameLabel}
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="form-input h-12"
                          placeholder="Tu nombre completo"
                          autoComplete="name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-semibold mb-2 font-montserrat">
                          {contact.form.emailLabel}
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="form-input h-12"
                          placeholder="tu@email.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold mb-2 font-montserrat">
                        {contact.form.phoneLabel}
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input h-12"
                        placeholder="+54 9 11 1234-5678"
                        autoComplete="tel"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold mb-2 font-montserrat">
                        {contact.form.messageLabel}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="form-input w-full px-4 py-3 resize-none"
                        placeholder="Escribe tu mensaje aquí..."
                        autoComplete="off"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="xl"
                      fullWidth
                      disabled={isSubmitting}
                      loading={isSubmitting}>
                      {isSubmitting ? (
                        <span>Enviando...</span>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send size={20} />
                          <span>{contact.form.submitLabel}</span>
                        </div>
                      )}
                    </Button>

                    <p className="text-xs muted text-center">
                      * Campos obligatorios
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2
            className="text-3xl text-center mb-8 font-montserrat">
            Preguntas Frecuentes
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contact.faqs.map((faq, index) => (
              <Card key={index} className="surface border-0 shadow-md">
                <CardContent className="p-6">
                  <h3
                    className="text-lg mb-3 font-montserrat">
                    {faq.question}
                  </h3>
                  <p className="muted">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Social links (optional) */}
        {(contact.social.instagram || contact.social.facebook || contact.social.whatsapp || contact.social.tiktok || contact.social.youtube) && (
          <div className="mt-12 text-center">
            <h3 className="text-xl font-semibold mb-4 font-montserrat">Seguinos</h3>
            <div className="flex items-center justify-center gap-4 text-sm muted">
              {contact.social.instagram && <a className="underline" href={contact.social.instagram} target="_blank" rel="noreferrer">Instagram</a>}
              {contact.social.facebook && <a className="underline" href={contact.social.facebook} target="_blank" rel="noreferrer">Facebook</a>}
              {contact.social.whatsapp && <a className="underline" href={contact.social.whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>}
              {contact.social.tiktok && <a className="underline" href={contact.social.tiktok} target="_blank" rel="noreferrer">TikTok</a>}
              {contact.social.youtube && <a className="underline" href={contact.social.youtube} target="_blank" rel="noreferrer">YouTube</a>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
