import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { withAdminAuth } from "@/lib/adminAuth";
import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { deleteImage, extractPublicId } from "@/lib/cloudinary";
import { normalizeApiError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import {
  colorImageRecordToRows,
  colorImageRowsToRecord,
  sizeGuideRowsToArray,
  sizeGuideToRows,
} from "@/lib/product-mappers";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ProductCreateSchema } from "@/lib/validation/product";
import { variantService } from "@/services/variant-service";
import { ApiResponse, Product } from "@/types";

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
        product_color_images: {
          select: { color: true, imageUrl: true, sortOrder: true },
          orderBy: { sortOrder: "asc" },
        },
        product_size_guides: {
          select: { size: true, measurements: true, ageRange: true },
        },
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
      // Backward compat: if somehow still a string (during migration grace period)
      if (typeof images === "string" && images.length > 0) return [images];
      return [];
    };

    const responseProduct: Product = {
      ...product,
      price: Number(product.price), // Convert Decimal
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      description: product.description ?? undefined,
      images: safelyParseImages(product.images),
      // Source from relational tables
      colorImages: colorImageRowsToRecord(product.product_color_images),
      sizeGuide: sizeGuideRowsToArray(product.product_size_guides),
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

      const parsed = ProductCreateSchema.safeParse(body);
      if (!parsed.success) {
        logger.warn(`PUT /api/products/${id} - Error de validación:`, {
          error: parsed.error.issues,
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
          void Promise.allSettled(
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

      // Prepare relational data for color images and size guide
      const colorImageRows = colorImages
        ? colorImageRecordToRows(colorImages)
        : null;
      const sizeGuideRows = sizeGuideToRows(
        (parsed.data as { sizeGuide?: unknown }).sizeGuide
      );

      // Sync relational tables: delete old rows, create new ones
      if (colorImageRows !== null) {
        await prisma.product_color_images.deleteMany({
          where: { productId: id },
        });
        if (colorImageRows.length > 0) {
          await prisma.product_color_images.createMany({
            data: colorImageRows.map((row) => ({ ...row, productId: id })),
          });
        }
      }

      if (sizeGuideRows.length > 0) {
        await prisma.product_size_guides.deleteMany({
          where: { productId: id },
        });
        await prisma.product_size_guides.createMany({
          data: sizeGuideRows.map((row) => ({ ...row, productId: id })),
        });
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
          images: Array.isArray(images) ? images : [],
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
          // Dual-write: keep Json fields during grace period
          colorImages: colorImages ?? undefined,
        },
        include: {
          categories: true,
          product_variants: true,
          product_color_images: {
            select: { color: true, imageUrl: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
          },
          product_size_guides: {
            select: { size: true, measurements: true, ageRange: true },
          },
        },
      });

      const updatedProduct: Product = {
        ...updatedPrismaProduct,
        price: Number(updatedPrismaProduct.price), // Convert Decimal
        salePrice: updatedPrismaProduct.salePrice
          ? Number(updatedPrismaProduct.salePrice)
          : undefined,
        description: updatedPrismaProduct.description ?? undefined,
        images: Array.isArray(updatedPrismaProduct.images)
          ? updatedPrismaProduct.images
          : [],
        // Source from relational tables
        colorImages: colorImageRowsToRecord(
          updatedPrismaProduct.product_color_images
        ),
        sizeGuide: sizeGuideRowsToArray(
          updatedPrismaProduct.product_size_guides
        ),
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

      revalidatePath("/products");
      revalidatePath(`/products/${(await params).id}`);
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

// PATCH /api/products/[id] - Actualización parcial rápida (e.g. Toggle Active)
export const PATCH = withAdminAuth(
  async (
    request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<Product>>> => {
    try {
      const rl = await checkRateLimit(request, {
        key: makeKey("PATCH", "/api/products/[id]"),
        ...getPreset("mutatingMedium"),
      });
      if (!rl.ok) {
        return fail("RATE_LIMITED", "Too many requests", 429);
      }
      const { id } = await params;
      const body = await request.json();

      // Solo permitimos actualización de isActive por ahora para este método rápido
      if (typeof body.isActive !== "boolean") {
        return fail("BAD_REQUEST", "Solo se permite actualizar isActive", 400);
      }

      const updatedPrismaProduct = await prisma.products.update({
        where: { id },
        data: {
          isActive: body.isActive,
          updatedAt: new Date(),
        },
        include: {
          categories: true,
          product_variants: true,
          product_color_images: {
            select: { color: true, imageUrl: true, sortOrder: true },
            orderBy: { sortOrder: "asc" },
          },
          product_size_guides: {
            select: { size: true, measurements: true, ageRange: true },
          },
        },
      });

      const updatedProduct: Product = {
        ...updatedPrismaProduct,
        price: Number(updatedPrismaProduct.price),
        salePrice: updatedPrismaProduct.salePrice
          ? Number(updatedPrismaProduct.salePrice)
          : undefined,
        description: updatedPrismaProduct.description ?? undefined,
        images: Array.isArray(updatedPrismaProduct.images)
          ? updatedPrismaProduct.images
          : [],
        // Source from relational tables
        colorImages: colorImageRowsToRecord(
          updatedPrismaProduct.product_color_images
        ),
        sizeGuide: sizeGuideRowsToArray(
          updatedPrismaProduct.product_size_guides
        ),
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

      revalidatePath("/products");
      return ok(updatedProduct, "Estado actualizado correctamente");
    } catch (error) {
      logger.error("Error patching product:", { error });
      const e = normalizeApiError(
        error,
        "INTERNAL_ERROR",
        "Error al actualizar el estado",
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
    _request: NextRequest,
    { params }: RouteParams
  ): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> => {
    try {
      const { id } = await params;

      // Fetch product to get images for cleanup
      const product = await prisma.products.findUnique({
        where: { id },
        select: { id: true, images: true },
      });

      if (!product) {
        return fail("NOT_FOUND", "Producto no encontrado", 404);
      }

      // Delete product (cascades to variants, color images, size guides via DB relations)
      await prisma.products.delete({ where: { id } });

      // Fix #109: await Cloudinary cleanup — in serverless the fn exits after response,
      // so fire-and-forget Promises never execute. Must complete before returning.
      if (product.images) {
        const images: string[] = Array.isArray(product.images)
          ? product.images
          : [];

        if (images.length > 0) {
          const results = await Promise.allSettled(
            images.map(async (url) => {
              const publicId = extractPublicId(url);
              if (publicId) {
                await deleteImage(publicId);
              }
            })
          );
          logger.info("Product image deletion results", { results });
        }
      }

      logger.info(`[Admin] Deleted product ${id}`);
      revalidatePath("/products");
      return ok({ deleted: true }, "Producto eliminado correctamente");
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
