"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/logger";
import {
  type ContactSettings,
  defaultContactSettings,
} from "@/lib/validation/contact";
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import useSWR from "swr";

type ResponsePreference = "EMAIL" | "PHONE" | "WHATSAPP";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  responsePreference: ResponsePreference;
}

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
  responsePreference: "EMAIL",
};

// Fetcher para SWR
const fetcher = async (url: string): Promise<ContactSettings> => {
  const res = await fetch(url);
  const json = await res.json();
  if (json?.success && json.data) {
    return json.data;
  }
  return defaultContactSettings;
};

const ContactInfo = ({ contact }: { contact: ContactSettings }) => (
  <div>
    <h2 className="text-2xl mb-6 font-montserrat">Información de Contacto</h2>

    <div className="space-y-6">
      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <Mail size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">Email</h3>
              {contact.emails.map((em) => (
                <p className="muted" key={`email-${em}`}>
                  {em}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">Teléfono</h3>
              {contact.phones.map((ph) => (
                <p className="muted" key={`phone-${ph}`}>
                  {ph}
                </p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">Dirección</h3>
              {contact.address.lines.map((ln) => (
                <p className="muted" key={`address-line-${ln}`}>
                  {ln}
                </p>
              ))}
              <p className="muted">{contact.address.cityCountry}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="pill-icon">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg mb-2 font-montserrat">
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
);

const ContactForm = ({ contact }: { contact: ContactSettings }) => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validación básica
      if (!formData.name.trim()) {
        toast.error("Por favor, ingresa tu nombre");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Por favor, ingresa tu email");
        return;
      }
      if (!formData.message.trim()) {
        toast.error("Por favor, escribe un mensaje");
        return;
      }
      // Validar teléfono si la preferencia es PHONE o WHATSAPP
      if (
        (formData.responsePreference === "PHONE" ||
          formData.responsePreference === "WHATSAPP") &&
        !formData.phone.trim()
      ) {
        toast.error("Por favor, ingresa tu teléfono para poder contactarte");
        return;
      }

      // Enviar al endpoint
      const response = await fetch("/api/contact/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || "Error al enviar el mensaje");
      }

      setSubmitted(true);
      setFormData(initialFormData);
      toast.success("¡Mensaje enviado exitosamente!");
    } catch (error) {
      logger.error("Error al enviar formulario:", { error: error });
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al enviar el mensaje. Por favor, inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData(initialFormData);
  };

  return (
    <div>
      <h2 className="text-2xl mb-6 font-montserrat">{contact.form.title}</h2>

      {submitted ? (
        <Card className="surface border border-theme rounded-xl shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="muted mb-4">
              <Send size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl mb-2 font-montserrat">
              {contact.form.successTitle}
            </h3>
            <p className="muted mb-4">{contact.form.successMessage}</p>
            <Button onClick={resetForm} variant="hero">
              {contact.form.sendAnotherLabel}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="surface border border-theme rounded-xl shadow-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold mb-2 font-montserrat"
                  >
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
                    className="block text-sm font-semibold mb-2 font-montserrat"
                  >
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
                  className="block text-sm font-semibold mb-2 font-montserrat"
                >
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

              {/* Selector de preferencia de respuesta */}
              <div>
                <label className="block text-sm font-semibold mb-2 font-montserrat">
                  ¿Cómo preferís que te contactemos? *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, responsePreference: "EMAIL" })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.responsePreference === "EMAIL"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-theme surface hover:border-primary/50"
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm font-medium">Email</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, responsePreference: "PHONE" })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.responsePreference === "PHONE"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-theme surface hover:border-primary/50"
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-medium">Teléfono</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        responsePreference: "WHATSAPP",
                      })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.responsePreference === "WHATSAPP"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-theme surface hover:border-primary/50"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </button>
                </div>
                {(formData.responsePreference === "PHONE" ||
                  formData.responsePreference === "WHATSAPP") &&
                  !formData.phone && (
                    <p className="text-xs text-amber-600 mt-2">
                      * Para contactarte por{" "}
                      {formData.responsePreference === "PHONE"
                        ? "teléfono"
                        : "WhatsApp"}
                      , necesitamos tu número
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold mb-2 font-montserrat"
                >
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
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={20} className="animate-spin" />
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send size={20} />
                    <span>{contact.form.submitLabel}</span>
                  </div>
                )}
              </Button>

              <p className="text-xs muted text-center">* Campos obligatorios</p>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const FaqSection = ({ contact }: { contact: ContactSettings }) => (
  <div className="mt-16">
    <h2 className="text-3xl text-center mb-8 font-montserrat">
      Preguntas Frecuentes
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {contact.faqs.map((faq) => (
        <Card
          key={`faq-${faq.question.slice(0, 20)}`}
          className="surface border border-theme rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200"
        >
          <CardContent className="p-6">
            <h3 className="text-lg mb-3 font-montserrat">{faq.question}</h3>
            <p className="muted">{faq.answer}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const SocialLinks = ({ contact }: { contact: ContactSettings }) => {
  const hasSocialLinks =
    contact.social.instagram ||
    contact.social.facebook ||
    contact.social.whatsapp ||
    contact.social.tiktok ||
    contact.social.youtube;

  if (!hasSocialLinks) {
    return null;
  }

  return (
    <div className="mt-12 text-center">
      <h3 className="text-xl font-semibold mb-4 font-montserrat">Seguinos</h3>
      <div className="flex items-center justify-center gap-4 text-sm muted">
        {contact.social.instagram && (
          <a
            className="underline hover:text-primary transition-colors duration-200"
            href={contact.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        )}
        {contact.social.facebook && (
          <a
            className="underline hover:text-primary transition-colors duration-200"
            href={contact.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
        )}
        {contact.social.whatsapp && (
          <a
            className="underline hover:text-primary transition-colors duration-200"
            href={contact.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        )}
        {contact.social.tiktok && (
          <a
            className="underline hover:text-primary transition-colors duration-200"
            href={contact.social.tiktok}
            target="_blank"
            rel="noopener noreferrer"
          >
            TikTok
          </a>
        )}
        {contact.social.youtube && (
          <a
            className="underline hover:text-primary transition-colors duration-200"
            href={contact.social.youtube}
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube
          </a>
        )}
      </div>
    </div>
  );
};

export default function ContactPageClient() {
  // Usar SWR para cargar la configuración de contacto
  const {
    data: contact,
    error,
    isLoading,
  } = useSWR<ContactSettings>("/api/contact", fetcher, {
    fallbackData: defaultContactSettings,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (error) {
    logger.error("Error loading contact settings:", { error: error });
  }

  const contactData = contact || defaultContactSettings;

  return (
    <div className="min-h-screen surface">
      <main className="max-w-[1200px] mx-auto py-8 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 font-montserrat">
            {contactData.headerTitle}
          </h1>
          <p className="muted text-lg max-w-2xl mx-auto">
            {contactData.headerSubtitle}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <ContactInfo contact={contactData} />

              {/* Contact Form */}
              <ContactForm contact={contactData} />
            </div>

            {/* FAQ Section */}
            <FaqSection contact={contactData} />

            {/* Social links */}
            <SocialLinks contact={contactData} />
          </>
        )}
      </main>
    </div>
  );
}
