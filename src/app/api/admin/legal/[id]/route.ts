import { prisma } from "@/lib/prisma";
import { withAdminAuth } from "@/lib/adminAuth";
import { apiHandler, AppError } from "@/lib/api-handler";
import { NextRequest } from "next/server";
import { z } from "zod";
import { generateHtmlContent } from "@/lib/policy-utils";

const updatePolicySchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  description: z.string().optional(),
  sections: z.array(z.any()).optional(),
  isActive: z.boolean().optional(),
});

export const GET = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    return apiHandler(async () => {
      const policy = await prisma.legalPolicy.findUnique({
        where: { id: params.id },
      });

      if (!policy) {
        throw new AppError("Policy not found", 404);
      }

      return policy;
    }, "GET /api/admin/policies/[id]");
  }
);

export const PUT = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
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
        if (existing && existing.id !== params.id) {
          throw new AppError("Slug already in use", 409);
        }
      }

      const policy = await prisma.legalPolicy.update({
        where: { id: params.id },
        data: {
          ...(title && { title }),
          ...(slug && { slug }),
          ...(description !== undefined && { description }),
          ...(sections && {
            content: { sections } as any,
            htmlContent: generateHtmlContent(sections),
          }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return policy;
    }, "PUT /api/admin/policies/[id]");
  }
);

export const DELETE = withAdminAuth(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    return apiHandler(async () => {
      await prisma.legalPolicy.delete({
        where: { id: params.id },
      });
      return { success: true };
    }, "DELETE /api/admin/policies/[id]");
  }
);
