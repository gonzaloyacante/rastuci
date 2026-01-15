import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { withAdminAuth } from "@/lib/adminAuth";
import { normalizeApiError } from "@/lib/errors";
import { deleteImage, extractPublicId } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ProductCreateSchema } from "@/lib/validation/product";
import { variantService } from "@/services/variant-service";
import { ApiResponse, Product } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const rl = await checkRateLimit(request, {
      key: makeKey("GET", "/api/products/[id]"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: true,
        product_variants: true,
      },
    });

    if (!product) {
      return fail("NOT_FOUND", "Producto no encontrado", 404);
    }

    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin;

    if (!product.isActive && !isAdmin) {
      return fail("NOT_FOUND", "Producto no encontrado", 404);
    }

    const safelyParseImages = (images: string | string[]): string[] => {
      if (Array.isArray(images)) return images;
      try {
        return JSON.parse(images);
      } catch {
        return [];
      }
    };

    const responseProduct: Product = {
      ...product,
      price: Number(product.price), // Convert Decimal
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      description: product.description ?? undefined,
      images: safelyParseImages(product.images),
      colorImages:
        product.colorImages &&
        typeof product.colorImages === "object" &&
        !Array.isArray(product.colorImages)
          ? (product.colorImages as unknown as Record<string, string[]>)
          : typeof product.colorImages === "string"
            ? JSON.parse(product.colorImages)
            : null,
      categories: {
        ...product.categories,
        description: product.categories.description ?? undefined,
      },
      variants: product.product_variants.map((v) => ({
        ...v,
        sku: v.sku ?? undefined,
      })),
    };

    return ok(responseProduct);
  } catch (error) {
    logger.error("Error fetching product:", { error });
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener el producto",
      500
    );
    return fail(
      e.code as ApiErrorCode,
      e.message,
      e.status,
      e.details as Record<string, unknown>
    );
  }
}

// PUT /api/products/[id] - Actualizar producto (ADMIN ONLY)
export const PUT = withAdminAuth(
  async (
    request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<Product>>> => {
    try {
      const rl = await checkRateLimit(request, {
        key: makeKey("PUT", "/api/products/[id]"),
        ...getPreset("mutatingMedium"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429);
      }
      const { id } = await params;
      const body = await request.json();

      // DEBUG: Log del body recibido
      logger.info(`PUT /api/products/${id} - Body recibido:`, { body });

      const parsed = ProductCreateSchema.safeParse(body);
      if (!parsed.success) {
        // DEBUG: Log del error de validación
        logger.error(`PUT /api/products/${id} - Error de validación:`, {
          error: parsed.error.issues,
          body,
        });

        return fail("BAD_REQUEST", "Datos inválidos", 400, {
          issues: parsed.error.issues,
        });
      }
      const {
        name,
        description,
        price,
        salePrice,
        stock,
        categoryId,
        images,
        onSale,
        isActive,
        sizes,
        colors,
        features,
        weight,
        height,
        width,
        length,
        variants: inputVariants, // Rename to avoid conflict if necessary or just variants
        colorImages,
      } = parsed.data;

      // Verificar que la categoría existe
      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return fail("BAD_REQUEST", "La categoría especificada no existe", 400);
      }

      if (inputVariants) {
        try {
          // Sync variants (create, update, delete)
          await variantService.syncVariants(
            id,
            inputVariants.map((v) => ({
              ...v,
              productId: id,
              id: "", // Service/DB handles IDs
            }))
          );
        } catch (error) {
          logger.error("Error syncing variants", { error });
          // We could fail or continue. Let's fail because data integrity matters.
          throw error;
        }
      }

      // Obtener producto actual para comparar imágenes
      const currentProduct = await prisma.products.findUnique({
        where: { id },
      });

      if (currentProduct && currentProduct.images) {
        const oldImages: string[] =
          typeof currentProduct.images === "string"
            ? JSON.parse(currentProduct.images)
            : currentProduct.images;

        const newImages = Array.isArray(images) ? images : [];

        // Identificar imágenes eliminadas
        const imagesToDelete = oldImages.filter(
          (img) => !newImages.includes(img)
        );

        if (imagesToDelete.length > 0) {
          logger.info(
            `Deleting ${imagesToDelete.length} removed images from Cloudinary`
          );
          // Eliminar en segundo plano para no bloquear la respuesta
          Promise.allSettled(
            imagesToDelete.map(async (url) => {
              const publicId = extractPublicId(url);
              if (publicId) {
                await deleteImage(publicId);
              }
            })
          ).then((results) => {
            logger.info("Image deletion results", { results });
          });
        }
      }

      const updatedPrismaProduct = await prisma.products.update({
        where: { id },
        data: {
          name,
          description: description ?? null,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          stock: Number(stock),
          categoryId,
          images: Array.isArray(images) ? JSON.stringify(images) : images,
          onSale: onSale ?? false,
          isActive: isActive ?? true,
          sizes: sizes ?? undefined,
          colors: colors ?? undefined,
          features: features ?? undefined,
          weight: weight ?? null,
          height: height ?? null,
          width: width ?? null,
          length: length ?? null,
          updatedAt: new Date(),
          colorImages: colorImages ?? undefined,
        },
        include: {
          categories: true,
          product_variants: true,
        },
      });

      const updatedProduct: Product = {
        ...updatedPrismaProduct,
        price: Number(updatedPrismaProduct.price), // Convert Decimal
        salePrice: updatedPrismaProduct.salePrice
          ? Number(updatedPrismaProduct.salePrice)
          : undefined,
        description: updatedPrismaProduct.description ?? undefined,
        images:
          typeof updatedPrismaProduct.images === "string"
            ? JSON.parse(updatedPrismaProduct.images)
            : updatedPrismaProduct.images,
        colorImages:
          (updatedPrismaProduct.colorImages as unknown as Record<
            string,
            string[]
          >) ?? null,
        categories: {
          ...updatedPrismaProduct.categories,
          description: updatedPrismaProduct.categories.description ?? undefined,
        },
        variants: updatedPrismaProduct.product_variants
          ? updatedPrismaProduct.product_variants.map((v) => ({
              ...v,
              sku: v.sku ?? undefined,
            }))
          : [],
      };

      return ok(updatedProduct, "Producto actualizado exitosamente");
    } catch (error) {
      logger.error("Error updating product:", { error });
      const e = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al actualizar el producto",
        500
      );
      return fail(
        e.code as ApiErrorCode,
        e.message,
        e.status,
        e.details as Record<string, unknown>
      );
    }
  }
);

// DELETE /api/products/[id] - Eliminar producto (ADMIN ONLY)
export const DELETE = withAdminAuth(
  async (
    request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<null>>> => {
    try {
      const rl = await checkRateLimit(request, {
        key: makeKey("DELETE", "/api/products/[id]"),
        ...getPreset("mutatingLow"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429);
      }
      const { id } = await params;

      // Soft Delete: Just mark as inactive
      // We do NOT check for order_items because we want to allow "deleting" (archiving)
      // products even if they have been sold, preserving the history.

      await prisma.products.update({
        where: { id },
        data: { isActive: false },
      });

      // We do NOT delete images for soft-deleted products to preserve history.

      return ok(null, "Producto eliminado exitosamente");
    } catch (error) {
      logger.error("Error deleting product:", { error });
      const e = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al eliminar el producto",
        500
      );
      return fail(
        e.code as ApiErrorCode,
        e.message,
        e.status,
        e.details as Record<string, unknown>
      );
    }
  }
);
