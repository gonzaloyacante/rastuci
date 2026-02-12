import { z } from "zod";

export const HomeSettingsSchema = z.object({
  heroTitle: z.string().min(1).max(120),
  showHeroTitle: z.boolean().default(true).optional(),
  heroSubtitle: z.string().min(1).max(220),
  showHeroSubtitle: z.boolean().default(true).optional(),
  heroLogoUrl: z.string().max(500).optional(),
  showHeroLogo: z.boolean().default(true).optional(),
  heroImage: z.string().max(500).optional(),
  heroOverlayOpacity: z.number().min(0).max(100).default(20).optional(),
  headerLogoUrl: z.string().max(500).optional(),
  ctaPrimaryLabel: z.string().min(1).max(40),
  ctaPrimaryLink: z.string().min(1).max(200).default("/products").optional(),
  showCtaPrimary: z.boolean().default(true).optional(),
  ctaSecondaryLabel: z.string().min(1).max(40),
  ctaSecondaryLink: z.string().min(1).max(200).default("/about").optional(),
  showCtaSecondary: z.boolean().default(true).optional(),
  categoriesTitle: z.string().min(1).max(80),
  showCategoriesTitle: z.boolean().default(true).optional(),
  categoriesSubtitle: z.string().min(1).max(200),
  showCategoriesSubtitle: z.boolean().default(true).optional(),
  categoriesDisplay: z.enum(["image", "icon"]).default("image").optional(),
  featuredTitle: z.string().min(1).max(80),
  showFeaturedTitle: z.boolean().default(true).optional(),
  featuredSubtitle: z.string().min(1).max(200),
  showFeaturedSubtitle: z.boolean().default(true).optional(),
  featuredCount: z.number().min(1).max(12).default(4).optional(),
  benefitsTitle: z
    .string()
    .min(1)
    .max(80)
    .default("Por qué elegirnos")
    .optional(),
  benefits: z
    .array(
      z.object({
        icon: z.string().min(1).max(50).default("Truck"),
        title: z.string().min(1).max(80),
        description: z.string().min(1).max(160),
      })
    )
    .min(1)
    .max(6),
  footer: z
    .object({
      brand: z.string().min(1).max(80),
      showBrand: z.boolean().default(true).optional(),
      tagline: z.string().min(1).max(120),
      showTagline: z.boolean().default(true).optional(),
      logoUrl: z.string().max(200).optional(),
      showLogo: z.boolean().default(true).optional(),
    })
    .optional(),
});

export type HomeSettings = z.infer<typeof HomeSettingsSchema>;

export const defaultHomeSettings: HomeSettings = {
  heroTitle: "Bienvenido a Rastuci",
  showHeroTitle: true,
  heroSubtitle:
    "Ropa infantil de calidad, comodidad y estilo para los más pequeños",
  showHeroSubtitle: true,
  heroLogoUrl: "",
  showHeroLogo: true,
  heroImage: "",
  heroOverlayOpacity: 20,
  headerLogoUrl: "",
  ctaPrimaryLabel: "Ver Productos",
  ctaPrimaryLink: "/products",
  showCtaPrimary: true,
  ctaSecondaryLabel: "Explorar categorías",
  ctaSecondaryLink: "/about",
  showCtaSecondary: true,
  categoriesTitle: "Nuestras Categorías",
  showCategoriesTitle: true,
  categoriesSubtitle: "Explorá nuestras categorías de productos",
  showCategoriesSubtitle: true,
  categoriesDisplay: "image",
  featuredTitle: "Productos en Oferta",
  showFeaturedTitle: true,
  featuredSubtitle:
    "Descubrí los favoritos de esta semana con descuentos exclusivos.",
  showFeaturedSubtitle: true,
  featuredCount: 4,
  benefitsTitle: "Por qué elegirnos",
  benefits: [
    {
      icon: "Truck",
      title: "Envíos a todo el país",
      description: "Recibí tu compra donde quieras.",
    },
    {
      icon: "CreditCard",
      title: "3 Cuotas sin interés",
      description: "Con todas las tarjetas de crédito.",
    },
    {
      icon: "Shield",
      title: "Compra Segura",
      description: "Tus datos siempre protegidos.",
    },
  ],
  footer: {
    brand: "Rastući",
    showBrand: true,
    tagline: "Ropa con amor para los más peques.",
    showTagline: true,
    logoUrl: "",
    showLogo: true,
  },
};
