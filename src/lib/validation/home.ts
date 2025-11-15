import { z } from "zod";

export const HomeSettingsSchema = z.object({
  heroTitle: z.string().min(1).max(120),
  heroSubtitle: z.string().min(1).max(220),
  ctaPrimaryLabel: z.string().min(1).max(40),
  ctaSecondaryLabel: z.string().min(1).max(40),
  categoriesTitle: z.string().min(1).max(80),
  categoriesDisplay: z.enum(["image", "icon"]).default("image").optional(),
  featuredTitle: z.string().min(1).max(80),
  featuredSubtitle: z.string().min(1).max(200),
  benefits: z
    .array(
      z.object({
        icon: z.enum(["truck", "credit", "shield"]).default("truck"),
        title: z.string().min(1).max(80),
        description: z.string().min(1).max(160),
      })
    )
    .min(1)
    .max(6),
  footer: z
    .object({
      brand: z.string().min(1).max(80),
      tagline: z.string().min(1).max(120),
      email: z.string().email().max(100),
      phone: z.string().min(1).max(30),
      socialLinks: z.object({
        instagram: z.string().url().optional(),
        facebook: z.string().url().optional(),
        twitter: z.string().url().optional(),
      }),
    })
    .optional(),
});

export type HomeSettings = z.infer<typeof HomeSettingsSchema>;

export const defaultHomeSettings: HomeSettings = {
  heroTitle: "Bienvenido a Rastuci",
  heroSubtitle:
    "Ropa infantil de calidad, comodidad y estilo para los más pequeños",
  ctaPrimaryLabel: "Ver Productos",
  ctaSecondaryLabel: "Explorar categorías",
  categoriesTitle: "Nuestras Categorías",
  categoriesDisplay: "image",
  featuredTitle: "Productos en Oferta",
  featuredSubtitle:
    "Descubrí los favoritos de esta semana con descuentos exclusivos.",
  benefits: [
    {
      icon: "truck",
      title: "Envíos a todo el país",
      description: "Recibí tu compra donde quieras.",
    },
    {
      icon: "credit",
      title: "3 Cuotas sin interés",
      description: "Con todas las tarjetas de crédito.",
    },
    {
      icon: "shield",
      title: "Compra Segura",
      description: "Tus datos siempre protegidos.",
    },
  ],
  footer: {
    brand: "Rastući",
    tagline: "Ropa con amor para los más peques.",
    email: "contacto@rastući.com",
    phone: "+54 9 11 1234-5678",
    socialLinks: {
      instagram: "#",
      facebook: "#",
      twitter: "#",
    },
  },
};
