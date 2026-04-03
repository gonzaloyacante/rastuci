"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { useScrollToError } from "@/hooks/useScrollToError";
import { logger } from "@/lib/logger";
import { type ContactSettings } from "@/lib/validation/contact";

// Define schema directly or import if available.
// Assuming we want a specific schema for this form.
const PHONE_REGEX = /^[+\d][\d\s\-().]{5,19}$/;

const contactFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "Por favor, ingresa tu nombre (mínimo 2 caracteres)"),
    email: z
      .string()
      .email("Por favor, ingresa un email válido")
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .regex(
        PHONE_REGEX,
        "Ingresa un número de teléfono válido (ej: +54 9 11 1234-5678)"
      )
      .optional()
      .or(z.literal("")),
    message: z
      .string()
      .min(10, "Por favor, escribe un mensaje de al menos 10 caracteres"),
    responsePreference: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
  })
  .superRefine((data, ctx) => {
    if (data.responsePreference === "EMAIL" && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, ingresa tu email para poder contactarte",
        path: ["email"],
      });
    }
    if (
      (data.responsePreference === "PHONE" ||
        data.responsePreference === "WHATSAPP") &&
      (!data.phone || data.phone.trim().length < 6)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, ingresa tu teléfono para poder contactarte",
        path: ["phone"],
      });
    }
  });

type ContactFormData = z.infer<typeof contactFormSchema>;

export const PublicContactForm = ({
  contact,
}: {
  contact: ContactSettings;
}) => {
  const [submitted, setSubmitted] = useState(false);
  const { show } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue: _setValue,
    reset,
    formState: { errors, isValid: _isValid, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      responsePreference: "EMAIL",
    },
    mode: "onBlur",
  });

  const scrollToError = useScrollToError();

  const responsePreference = watch("responsePreference");

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contact/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg =
          typeof result.error === "string"
            ? result.error
            : result.error?.message || result.message || "Error desconocido";
        throw new Error(errorMsg);
      }

      setSubmitted(true);
      reset();
      show({ type: "success", message: "¡Mensaje enviado exitosamente!" });
    } catch (error) {
      logger.error("Error al enviar formulario:", { error });
      show({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error al enviar el mensaje. Por favor intenta nuevamente.",
      });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    reset();
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
            <Button onClick={handleReset} variant="hero">
              {contact.form.sendAnotherLabel}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="surface border border-theme rounded-xl shadow-sm">
          <CardContent className="p-8">
            <form
              onSubmit={handleSubmit(onSubmit, scrollToError)}
              className="space-y-6"
            >
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
                    {...register("name")}
                    placeholder="Tu nombre completo"
                    className={`form-input ${errors.name ? "border-error" : "h-12"}`}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold mb-2 font-montserrat"
                  >
                    {contact.form.emailLabel}
                    {responsePreference === "EMAIL" && (
                      <span className="text-error ml-1">*</span>
                    )}
                  </label>
                  <Input
                    id="email"
                    {...register("email")}
                    type="email"
                    placeholder="tu@email.com"
                    className={`form-input ${errors.email ? "border-error" : "h-12"}`}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold mb-2 font-montserrat"
                >
                  {contact.form.phoneLabel}
                  {(responsePreference === "PHONE" ||
                    responsePreference === "WHATSAPP") && (
                    <span className="text-error ml-1">*</span>
                  )}
                </label>
                <Input
                  id="phone"
                  {...register("phone")}
                  type="tel"
                  placeholder="+54 9 11 1234-5678"
                  className={`form-input ${errors.phone ? "border-error" : "h-12"}`}
                  autoComplete="tel"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Selector de preferencia de respuesta */}
              <div>
                <label className="block text-sm font-semibold mb-2 font-montserrat">
                  ¿Cómo preferís que te contactemos? *
                </label>
                <Controller
                  control={control}
                  name="responsePreference"
                  render={({ field }) => (
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => field.onChange("EMAIL")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-0 ${
                          field.value === "EMAIL"
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
                        onClick={() => field.onChange("PHONE")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-0 ${
                          field.value === "PHONE"
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
                        onClick={() => field.onChange("WHATSAPP")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 h-auto min-h-0 ${
                          field.value === "WHATSAPP"
                            ? "border-primary bg-primary/10 text-primary hover:bg-primary/20"
                            : "border-theme surface hover:border-primary/50 hover:bg-muted/10"
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">WhatsApp</span>
                      </Button>
                    </div>
                  )}
                />

                {(responsePreference === "PHONE" ||
                  responsePreference === "WHATSAPP") && (
                  <p className="text-xs text-amber-600 mt-2">
                    * Para contactarte por{" "}
                    {responsePreference === "PHONE" ? "teléfono" : "WhatsApp"},
                    necesitamos tu número arriba.
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
                  {...register("message")}
                  rows={6}
                  className={`form-input w-full px-4 py-3 resize-none ${errors.message ? "border-error" : ""}`}
                  placeholder="Escribe tu mensaje aquí..."
                  autoComplete="off"
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="xl"
                fullWidth
                disabled={isSubmitting}
                loading={isSubmitting}
                leftIcon={<Send size={20} />}
              >
                {contact.form.submitLabel}
              </Button>

              <p className="text-xs muted text-center">* Campos obligatorios</p>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
