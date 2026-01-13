"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { logger } from "@/lib/logger";
import { type ContactSettings } from "@/lib/validation/contact";
import { Loader2, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

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

export const PublicContactForm = ({
  contact,
}: {
  contact: ContactSettings;
}) => {
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
      console.log("Contact API Response:", { status: response.status, result }); // DEBUG

      if (!response.ok || !result.success) {
        // apiResponse returns error as a string, but sometimes it might be nested
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : result.error?.message ||
              result.message ||
              "Error desconocido (FALLBACK)";

        console.error("API Error Details:", errorMsg);
        throw new Error(errorMsg);
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
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setFormData({ ...formData, responsePreference: "EMAIL" })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-0 ${
                      formData.responsePreference === "EMAIL"
                        ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                        : "border-theme surface hover:border-primary/50 hover:bg-muted/10"
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm font-medium">Email</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setFormData({ ...formData, responsePreference: "PHONE" })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-0 ${
                      formData.responsePreference === "PHONE"
                        ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                        : "border-theme surface hover:border-primary/50 hover:bg-muted/10"
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-medium">Teléfono</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        responsePreference: "WHATSAPP",
                      })
                    }
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-0 ${
                      formData.responsePreference === "WHATSAPP"
                        ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                        : "border-theme surface hover:border-primary/50 hover:bg-muted/10"
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </Button>
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
