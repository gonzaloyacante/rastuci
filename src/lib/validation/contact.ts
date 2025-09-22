import { z } from "zod";

export const ContactSettingsSchema = z.object({
  headerTitle: z.string().min(1).max(100),
  headerSubtitle: z.string().min(1).max(240),
  emails: z.array(z.string().email()).min(1).max(5),
  phones: z.array(z.string().min(6).max(30)).min(0).max(5),
  address: z.object({
    lines: z.array(z.string().min(1).max(100)).min(1).max(3),
    cityCountry: z.string().min(1).max(80),
  }),
  hours: z.object({
    title: z.string().min(1).max(80),
    weekdays: z.string().min(1).max(80),
    saturday: z.string().min(1).max(80),
    sunday: z.string().min(1).max(80),
  }),
  form: z.object({
    title: z.string().min(1).max(100),
    nameLabel: z.string().min(1).max(40),
    emailLabel: z.string().min(1).max(40),
    phoneLabel: z.string().min(1).max(40),
    messageLabel: z.string().min(1).max(40),
    submitLabel: z.string().min(1).max(40),
    successTitle: z.string().min(1).max(100),
    successMessage: z.string().min(1).max(200),
    sendAnotherLabel: z.string().min(1).max(60),
  }),
  faqs: z
    .array(
      z.object({
        question: z.string().min(1).max(160),
        answer: z.string().min(1).max(400),
      })
    )
    .min(0)
    .max(20),
  social: z.object({
    instagram: z.string().url().optional().or(z.literal("")),
    facebook: z.string().url().optional().or(z.literal("")),
    whatsapp: z.string().url().optional().or(z.literal("")),
    tiktok: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
  }),
});

export type ContactSettings = z.infer<typeof ContactSettingsSchema>;

export const defaultContactSettings: ContactSettings = {
  headerTitle: "Contactanos",
  headerSubtitle:
    "¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ayudarte. Ponte en contacto con nosotros y te responderemos lo antes posible.",
  emails: ["contacto@rastući.com", "ventas@rastući.com"],
  phones: ["+54 9 11 1234-5678", "+54 9 11 8765-4321"],
  address: {
    lines: ["Av. Corrientes 1234"],
    cityCountry: "Buenos Aires, Argentina",
  },
  hours: {
    title: "Horarios de Atención",
    weekdays: "Lunes a Viernes: 9:00 - 18:00",
    saturday: "Sábados: 9:00 - 14:00",
    sunday: "Domingos: Cerrado",
  },
  form: {
    title: "Envíanos un Mensaje",
    nameLabel: "Nombre *",
    emailLabel: "Email *",
    phoneLabel: "Teléfono",
    messageLabel: "Mensaje *",
    submitLabel: "Enviar Mensaje",
    successTitle: "¡Mensaje Enviado!",
    successMessage:
      "Gracias por contactarnos. Te responderemos dentro de las próximas 24 horas.",
    sendAnotherLabel: "Enviar otro mensaje",
  },
  faqs: [
    {
      question: "¿Cuál es el tiempo de entrega?",
      answer:
        "Los envíos a todo el país tardan entre 3 a 7 días hábiles, dependiendo de la ubicación.",
    },
    {
      question: "¿Puedo cambiar o devolver un producto?",
      answer:
        "Sí, aceptamos cambios y devoluciones dentro de los 30 días posteriores a la compra.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos todas las tarjetas de crédito y débito, transferencias bancarias y efectivo.",
    },
    {
      question: "¿Las prendas vienen con garantía?",
      answer:
        "Todas nuestras prendas cuentan con garantía de calidad por defectos de fabricación.",
    },
  ],
  social: {
    instagram: "",
    facebook: "",
    whatsapp: "",
    tiktok: "",
    youtube: "",
  },
};
