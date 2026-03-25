import { NextRequest } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/lib/adminAuth";
import { apiHandler, AppError } from "@/lib/api-handler";
import { generateHtmlContent } from "@/lib/policy-utils";
import { prisma } from "@/lib/prisma";

const createPolicySchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  description: z.string().max(500).optional(),
  sections: z
    .array(
      z.object({
        title: z.string().max(200).default(""),
        content: z.string().max(50000),
      })
    )
    .max(50)
    .optional(),
  isActive: z.boolean().optional(),
});

export const GET = withAdminAuth(async () => {
  return apiHandler(async () => {
    const policies = await prisma.legalPolicy.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });
    return policies;
  }, "GET /api/admin/policies");
});

export const POST = withAdminAuth(async (req: NextRequest) => {
  return apiHandler(async () => {
    const body = await req.json();
    const parsed = createPolicySchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 400);
    }

    const { title, slug, description, sections, isActive } = parsed.data;

    const existing = await prisma.legalPolicy.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new AppError("A policy with this slug already exists", 409);
    }

    const policy = await prisma.legalPolicy.create({
      data: {
        title,
        slug,
        description,
        htmlContent: generateHtmlContent(sections),
        isActive: isActive ?? true,
        sections:
          sections && sections.length > 0
            ? {
                create: sections.map((s, i) => ({
                  title: s.title,
                  content: s.content,
                  sortOrder: i,
                })),
              }
            : undefined,
      },
      include: {
        sections: { orderBy: { sortOrder: "asc" } },
      },
    });

    return policy;
  }, "POST /api/admin/policies");
});
