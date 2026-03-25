import { NextRequest } from "next/server";
import { z } from "zod";

import { withAdminAuth } from "@/lib/adminAuth";
import { apiHandler, AppError } from "@/lib/api-handler";
import { generateHtmlContent } from "@/lib/policy-utils";
import { prisma } from "@/lib/prisma";

const updatePolicySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().max(500).optional(),
  sections: z.array(z.record(z.string(), z.unknown())).max(50).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return apiHandler(async () => {
      const policy = await prisma.legalPolicy.findUnique({
        where: { id },
        include: {
          sections: { orderBy: { sortOrder: "asc" } },
        },
      });

      if (!policy) {
        throw new AppError("Policy not found", 404);
      }

      return policy;
    }, "GET /api/admin/policies/[id]");
  }
);

export const PUT = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return apiHandler(async () => {
      const body = await req.json();
      const parsed = updatePolicySchema.safeParse(body);

      if (!parsed.success) {
        throw new AppError(parsed.error.issues[0].message, 400);
      }

      const { title, slug, description, sections, isActive } = parsed.data;

      // Check if slug update collides
      if (slug) {
        const existing = await prisma.legalPolicy.findUnique({
          where: { slug },
        });
        if (existing && existing.id !== id) {
          throw new AppError("Slug already in use", 409);
        }
      }

      // All operations are wrapped in a single transaction so that if section
      // replace fails, the policy metadata update is also rolled back.
      return prisma.$transaction(async (tx) => {
        await tx.legalPolicy.update({
          where: { id },
          data: {
            ...(title && { title }),
            ...(slug && { slug }),
            ...(description !== undefined && { description }),
            ...(sections && {
              htmlContent: generateHtmlContent(
                sections as unknown as import("@/lib/policy-utils").PolicySection[]
              ),
            }),
            ...(isActive !== undefined && { isActive }),
          },
        });

        if (sections) {
          await tx.legal_policy_section.deleteMany({ where: { policyId: id } });
          if (sections.length > 0) {
            await tx.legal_policy_section.createMany({
              data: sections.map((s, i) => ({
                policyId: id,
                title: (s as { title?: string }).title ?? "",
                content: (s as { content: string }).content,
                sortOrder: i,
              })),
            });
          }
        }

        return tx.legalPolicy.findUnique({
          where: { id },
          include: { sections: { orderBy: { sortOrder: "asc" } } },
        });
      });
    }, "PUT /api/admin/policies/[id]");
  }
);

export const DELETE = withAdminAuth(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return apiHandler(async () => {
      await prisma.legalPolicy.delete({
        where: { id },
      });
      return { success: true };
    }, "DELETE /api/admin/policies/[id]");
  }
);
