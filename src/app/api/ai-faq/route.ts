import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

// Interfaces
interface FAQResponse {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  relatedFAQs: string[];
}

interface CategoryData {
  category: string;
  keywords: string[];
  responses: FAQResponse[];
}

interface SearchResult extends FAQResponse {
  category: string;
  relevanceScore: number;
  matchedKeywords: string[];
}

interface FAQStats {
  views: number;
  helpful: number;
  notHelpful: number;
  feedbacks: Array<{
    feedback: string;
    wasHelpful: boolean;
    timestamp: string;
  }>;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  customerEmail: string;
  category: string;
  createdAt: string;
  source: string;
}

// Esquemas de validación
// const FAQQuerySchema = z.object({
//   question: z.string().min(3).max(500),
//   category: z.string().optional(),
//   language: z.enum(['es', 'en']).default('es')
// });

const FAQFeedbackSchema = z.object({
  faqId: z.string(),
  wasHelpful: z.boolean(),
  feedback: z.string().optional(),
});

// Base de conocimientos simulada
const knowledgeBase = new Map<string, CategoryData>([
  [
    "envios",
    {
      category: "Envíos",
      keywords: [
        "envío",
        "enviar",
        "entrega",
        "delivery",
        "shipping",
        "cuanto tarda",
        "demora",
        "tiempo",
      ],
      responses: [
        {
          id: "env-001",
          question: "¿Cuánto tiempo tarda en llegar mi pedido?",
          answer:
            "Los envíos dentro de CABA llegan en 24-48hs. Al interior del país entre 3-7 días hábiles según la zona.",
          confidence: 0.95,
          relatedFAQs: ["env-002", "env-003"],
        },
        {
          id: "env-002",
          question: "¿Cuál es el costo de envío?",
          answer:
            "Envío gratis en compras superiores a $15.000. Para montos menores, el costo varía según destino (entre $800-$2.500).",
          confidence: 0.92,
          relatedFAQs: ["env-001", "env-004"],
        },
        {
          id: "env-003",
          question: "¿Puedo rastrear mi pedido?",
          answer:
            "Sí, una vez despachado recibirás un código de seguimiento por email para rastrear tu pedido en tiempo real.",
          confidence: 0.98,
          relatedFAQs: ["env-001"],
        },
      ],
    },
  ],
  [
    "pagos",
    {
      category: "Pagos",
      keywords: [
        "pago",
        "pagar",
        "tarjeta",
        "credito",
        "debito",
        "mercadopago",
        "transferencia",
        "efectivo",
      ],
      responses: [
        {
          id: "pag-001",
          question: "¿Qué métodos de pago aceptan?",
          answer:
            "Aceptamos tarjetas de crédito/débito, MercadoPago, transferencia bancaria y efectivo contra entrega en CABA.",
          confidence: 0.97,
          relatedFAQs: ["pag-002", "pag-003"],
        },
        {
          id: "pag-002",
          question: "¿Puedo pagar en cuotas?",
          answer:
            "Sí, ofrecemos hasta 12 cuotas sin interés con tarjetas de crédito participantes y MercadoPago.",
          confidence: 0.94,
          relatedFAQs: ["pag-001"],
        },
        {
          id: "pag-003",
          question: "¿Es seguro pagar online?",
          answer:
            "Absolutamente. Usamos cifrado SSL y todos los pagos se procesan a través de plataformas certificadas.",
          confidence: 0.96,
          relatedFAQs: ["pag-001"],
        },
      ],
    },
  ],
  [
    "productos",
    {
      category: "Productos",
      keywords: [
        "producto",
        "stock",
        "disponible",
        "talle",
        "color",
        "medida",
        "especificacion",
      ],
      responses: [
        {
          id: "prod-001",
          question: "¿Cómo sé si hay stock disponible?",
          answer:
            "El stock se muestra en tiempo real en cada producto. Si no hay stock, puedes suscribirte para recibir notificaciones.",
          confidence: 0.93,
          relatedFAQs: ["prod-002"],
        },
        {
          id: "prod-002",
          question: "¿Tienen guía de talles?",
          answer:
            "Sí, cada producto de ropa incluye una tabla de medidas detallada. También ofrecemos asesoramiento personalizado.",
          confidence: 0.91,
          relatedFAQs: ["prod-001"],
        },
      ],
    },
  ],
  [
    "devoluciones",
    {
      category: "Devoluciones",
      keywords: [
        "devolucion",
        "cambio",
        "reembolso",
        "defectuoso",
        "garantia",
        "reclamo",
      ],
      responses: [
        {
          id: "dev-001",
          question: "¿Puedo devolver un producto?",
          answer:
            "Sí, tienes 30 días para devolver productos en perfecto estado. El envío de devolución es gratuito.",
          confidence: 0.96,
          relatedFAQs: ["dev-002", "dev-003"],
        },
        {
          id: "dev-002",
          question: "¿Cómo inicio una devolución?",
          answer:
            "Desde tu cuenta puedes iniciar el proceso de devolución. Te enviaremos una etiqueta prepaga.",
          confidence: 0.94,
          relatedFAQs: ["dev-001"],
        },
        {
          id: "dev-003",
          question: "¿Cuándo recibo el reembolso?",
          answer:
            "Una vez que recibamos y procesemos la devolución, el reembolso se acredita en 5-10 días hábiles.",
          confidence: 0.92,
          relatedFAQs: ["dev-001", "dev-002"],
        },
      ],
    },
  ],
  [
    "cuenta",
    {
      category: "Cuenta de Usuario",
      keywords: [
        "cuenta",
        "login",
        "password",
        "contraseña",
        "perfil",
        "registro",
        "datos",
      ],
      responses: [
        {
          id: "cta-001",
          question: "¿Cómo creo una cuenta?",
          answer:
            'Puedes registrarte con tu email en el botón "Crear Cuenta" o durante el proceso de compra.',
          confidence: 0.95,
          relatedFAQs: ["cta-002"],
        },
        {
          id: "cta-002",
          question: "¿Olvidé mi contraseña, qué hago?",
          answer:
            'Usa la opción "Olvidé mi contraseña" en el login. Te enviaremos un link para restablecerla.',
          confidence: 0.97,
          relatedFAQs: ["cta-001"],
        },
      ],
    },
  ],
]);

// Estadísticas de FAQs
const faqStats = new Map<string, FAQStats>();

import { checkRateLimit } from "@/lib/rateLimiter";

// ...

// GET - Buscar respuestas a preguntas
export async function GET(request: NextRequest) {
  try {
    // Rate limit: 30 requests per minute
    const rl = await checkRateLimit(request, {
      key: "ai-faq:search",
      limit: 30,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const question = searchParams.get("question");
    const category = searchParams.get("category");
    const action = searchParams.get("action");

    // Obtener estadísticas de FAQs
    if (action === "stats") {
      const stats = {
        totalQueries: Array.from(faqStats.values()).reduce(
          (sum, stat) => sum + stat.views,
          0
        ),
        successRate: calculateSuccessRate(),
        popularCategories: getPopularCategories(),
        topFAQs: getTopFAQs(),
      };

      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Obtener todas las categorías
    if (action === "categories") {
      const categories = Array.from(knowledgeBase.entries()).map(
        ([key, value]) => ({
          id: key,
          name: value.category,
          count: value.responses.length,
        })
      );

      return NextResponse.json({
        success: true,
        data: categories,
      });
    }

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: "Pregunta requerida",
        },
        { status: 400 }
      );
    }

    // Buscar respuestas usando IA simulada
    const searchResults = await intelligentSearch(question, category);

    // Registrar consulta para estadísticas
    recordQuery(question, category, searchResults.length > 0);

    return NextResponse.json({
      success: true,
      data: {
        question,
        results: searchResults,
        hasResults: searchResults.length > 0,
        suggestionMessage:
          searchResults.length === 0
            ? "No encontramos una respuesta exacta. ¿Te gustaría contactar con soporte?"
            : null,
      },
    });
  } catch (error) {
    // Error logging para debugging
    logger.error("Error in GET /api/ai-faq:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// POST - Enviar feedback sobre respuestas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "feedback":
        const validatedFeedback = FAQFeedbackSchema.parse(data);

        // Registrar feedback
        const stat = faqStats.get(validatedFeedback.faqId) || {
          views: 0,
          helpful: 0,
          notHelpful: 0,
          feedbacks: [],
        };

        if (validatedFeedback.wasHelpful) {
          stat.helpful++;
        } else {
          stat.notHelpful++;
        }

        if (validatedFeedback.feedback) {
          stat.feedbacks.push({
            feedback: validatedFeedback.feedback,
            wasHelpful: validatedFeedback.wasHelpful,
            timestamp: new Date().toISOString(),
          });
        }

        faqStats.set(validatedFeedback.faqId, stat);

        return NextResponse.json({
          success: true,
          message: "Feedback registrado exitosamente",
        });

      case "suggest-improvement":
        const { question, suggestion } = data;

        // En un sistema real, esto iría a un sistema de mejora continua
        // Debug logging para análisis
        logger.info("Sugerencia de mejora:", {
          data: { question, suggestion },
        });

        return NextResponse.json({
          success: true,
          message: "Sugerencia registrada para revisión",
        });

      case "request-human-support":
        const { userQuestion, userEmail, context } = data;

        // Crear ticket automático para soporte humano
        const supportTicket = await createSupportTicket({
          question: userQuestion,
          email: userEmail,
          context: context || "Usuario solicitó soporte humano desde FAQ",
        });

        return NextResponse.json({
          success: true,
          data: supportTicket,
          message: "Solicitud de soporte creada exitosamente",
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Acción no válida",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos de entrada inválidos",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Error logging para debugging
    logger.error("Error in POST /api/ai-faq:", { error: error });
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// Función de búsqueda inteligente simulada
async function intelligentSearch(
  question: string,
  categoryFilter?: string | null
): Promise<SearchResult[]> {
  const normalizedQuestion = question.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Buscar en todas las categorías o en la específica
  const categories = categoryFilter
    ? [[categoryFilter, knowledgeBase.get(categoryFilter)]]
    : Array.from(knowledgeBase.entries());

  for (const [, categoryData] of categories) {
    if (!categoryData || typeof categoryData === "string") {
      continue;
    }

    // Calcular relevancia por palabras clave
    const keywordMatches = categoryData.keywords.filter((keyword: string) =>
      normalizedQuestion.includes(keyword.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      // Buscar respuestas específicas en la categoría
      for (const response of categoryData.responses) {
        const questionSimilarity = calculateSimilarity(
          normalizedQuestion,
          response.question.toLowerCase()
        );
        const answerSimilarity = calculateSimilarity(
          normalizedQuestion,
          response.answer.toLowerCase()
        );

        const relevanceScore =
          Math.max(questionSimilarity, answerSimilarity * 0.7) +
          keywordMatches.length * 0.1;

        if (relevanceScore > 0.3) {
          // Umbral de relevancia
          results.push({
            ...response,
            category: categoryData.category,
            relevanceScore: Math.min(relevanceScore, 1.0),
            matchedKeywords: keywordMatches,
          });

          // Actualizar estadísticas
          updateFAQStats(response.id);
        }
      }
    }
  }

  // Ordenar por relevancia y confianza
  results.sort((a, b) => {
    const scoreA = a.relevanceScore * a.confidence;
    const scoreB = b.relevanceScore * b.confidence;
    return scoreB - scoreA;
  });

  // Retornar top 3 resultados
  return results.slice(0, 3);
}

// Calcular similitud básica entre strings
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(" ").filter((w) => w.length > 2);
  const words2 = str2.split(" ").filter((w) => w.length > 2);

  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }

  return matches / Math.max(words1.length, words2.length);
}

// Actualizar estadísticas de FAQ
function updateFAQStats(faqId: string): void {
  const current = faqStats.get(faqId) || {
    views: 0,
    helpful: 0,
    notHelpful: 0,
    feedbacks: [],
  };

  current.views++;
  faqStats.set(faqId, current);
}

// Registrar consulta para estadísticas
function recordQuery(
  question: string,
  category: string | null,
  foundAnswer: boolean
): void {
  // En un sistema real, esto se guardaría en base de datos
  // Debug logging para análisis
  logger.info("Query recorded:", { data: { question, category, foundAnswer } });
}

// Calcular tasa de éxito
function calculateSuccessRate(): number {
  const allStats = Array.from(faqStats.values());
  if (allStats.length === 0) {
    return 0;
  }

  const totalViews = allStats.reduce((sum, stat) => sum + stat.views, 0);
  const totalHelpful = allStats.reduce((sum, stat) => sum + stat.helpful, 0);

  return totalViews > 0 ? (totalHelpful / totalViews) * 100 : 0;
}

// Obtener categorías populares
function getPopularCategories(): Array<{ name: string; views: number }> {
  const categoryStats = new Map();

  for (const [faqId, stats] of faqStats.entries()) {
    // Encontrar categoría del FAQ
    for (const [, categoryData] of knowledgeBase.entries()) {
      const faq = categoryData.responses.find((r) => r.id === faqId);
      if (faq) {
        const current = categoryStats.get(categoryData.category) || {
          name: categoryData.category,
          views: 0,
        };
        current.views += stats.views;
        categoryStats.set(categoryData.category, current);
        break;
      }
    }
  }

  return Array.from(categoryStats.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
}

// Obtener FAQs más consultadas
function getTopFAQs(): Array<
  FAQResponse & { category: string; views: number; helpfulPercentage: number }
> {
  const topFaqs = [];

  for (const [faqId, stats] of faqStats.entries()) {
    // Encontrar el FAQ completo
    for (const [, categoryData] of knowledgeBase.entries()) {
      const faq = categoryData.responses.find((r) => r.id === faqId);
      if (faq) {
        topFaqs.push({
          ...faq,
          category: categoryData.category,
          views: stats.views,
          helpfulPercentage:
            stats.views > 0 ? (stats.helpful / stats.views) * 100 : 0,
        });
        break;
      }
    }
  }

  return topFaqs.sort((a, b) => b.views - a.views).slice(0, 10);
}

// Crear ticket de soporte automático
async function createSupportTicket(data: {
  question: string;
  email: string;
  context: string;
}): Promise<SupportTicket> {
  // En un sistema real, esto llamaría al API de tickets
  return {
    id: `TICK-FAQ-${Date.now()}`,
    title: `FAQ - ${data.question.substring(0, 50)}...`,
    description: `Pregunta original: ${data.question}\n\nContexto: ${data.context}`,
    status: "abierto",
    priority: "media",
    customerEmail: data.email,
    category: "FAQ - Soporte Humano",
    createdAt: new Date().toISOString(),
    source: "ai-faq",
  };
}
