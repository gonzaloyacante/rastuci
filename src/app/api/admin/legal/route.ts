import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminAuth";
import { apiHandler, AppError } from "@/lib/api-handler";
import { NextRequest, NextResponse } from "next/server";
import { fail, ok } from "@/lib/apiResponse";
import { z } from "zod";
import { generateHtmlContent } from "@/lib/policy-utils";

const createPolicySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  description: z.string().optional(),
  sections: z.array(z.any()).optional(), // JSON content
  isActive: z.boolean().optional(),
});

export const GET = withAdminAuth(async (req: NextRequest) => {
  return apiHandler(async () => {
    const policies = await prisma.legalPolicy.findMany({
      orderBy: { updatedAt: "desc" },
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
        content: { sections: sections || [] } as any,
        htmlContent: generateHtmlContent(sections),
        isActive: isActive ?? true,
      },
    });

    return policy;
  }, "POST /api/admin/policies");
});
