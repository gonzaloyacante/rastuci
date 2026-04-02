import { Prisma } from "@prisma/client";
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

// ---------------------------------------------------------------------------
// Module-level helpers  — keep route handlers below 50 NLOC
// ---------------------------------------------------------------------------

function safelyParseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images as string[];
  if (typeof images === "string" && images.length > 0) return [images];
  return [];
}

type PrismaProductWithRelations = Prisma.productsGetPayload<{
  include: {
    categories: true;
    product_variants: true;
    product_color_images: true;
    product_size_guides: true;
  };
}>;

function mapPrismaProductToResponse(p: PrismaProductWithRelations): Product {
  return {
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice ? Number(p.salePrice) : undefined,
    description: p.description ?? undefined,
    images: safelyParseImages(p.images),
    colorImages: colorImageRowsToRecord(p.product_color_images),
    sizeGuide: sizeGuideRowsToArray(p.product_size_guides),
    categories: {
      ...p.categories,
      description: p.categories.description ?? undefined,
    },
    variants: (p.product_variants ?? []).map((v) => ({
      ...v,
      sku: v.sku ?? undefined,
    })),
  };
}

async function deleteRemovedCloudinaryImages(
  productId: string,
  newImages: string[]
): Promise<void> {
  const current = await prisma.products.findUnique({
    where: { id: productId },
    select: { images: true },
  });
  if (!current?.images) return;
  const oldImages: string[] = safelyParseImages(current.images);
  const toDelete = oldImages.filter((img) => !newImages.includes(img));
  if (toDelete.length === 0) return;
  logger.info(`Deleting ${toDelete.length} removed images from Cloudinary`);
  void Promise.allSettled(
    toDelete.map(async (url) => {
      const publicId = extractPublicId(url);
      if (publicId) await deleteImage(publicId);
    })
  ).then((results) => {
    logger.info("Image deletion results", { results });
  });
}

async function syncRelationalData(
  productId: string,
  colorImages: Record<string, string[]> | null | undefined,
  sizeGuideData: unknown
): Promise<void> {
  const colorImageRows = colorImages
    ? colorImageRecordToRows(colorImages)
    : null;
  const sizeGuideRows = sizeGuideToRows(sizeGuideData);

  await prisma.$transaction(async (tx) => {
    if (colorImageRows !== null) {
      await tx.product_color_images.deleteMany({ where: { productId } });
      if (colorImageRows.length > 0) {
        await tx.product_color_images.createMany({
          data: colorImageRows.map((row) => ({ ...row, productId })),
        });
      }
    }
    if (sizeGuideRows.length > 0) {
      await tx.product_size_guides.deleteMany({ where: { productId } });
      await tx.product_size_guides.createMany({
        data: sizeGuideRows.map((row) => ({ ...row, productId })),
      });
    }
  });
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
    if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429);

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

    if (!product) return fail("NOT_FOUND", "Producto no encontrado", 404);

    const session = await getServerSession(authOptions);
    if (!product.isActive && !session?.user?.isAdmin) {
      return fail("NOT_FOUND", "Producto no encontrado", 404);
    }

    return ok(
      mapPrismaProductToResponse(product as PrismaProductWithRelations)
    );
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
      if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429);

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
        variants: inputVariants,
        colorImages,
      } = parsed.data;

      const category = await prisma.categories.findUnique({
        where: { id: categoryId },
      });
      if (!category)
        return fail("BAD_REQUEST", "La categoría especificada no existe", 400);

      if (inputVariants) {
        try {
          await variantService.syncVariants(
            id,
            inputVariants.map((v) => ({ ...v, productId: id, id: "" }))
          );
        } catch (error) {
          logger.error("Error syncing variants", { error });
          throw error;
        }
      }

      const newImages = Array.isArray(images) ? images : [];
      await deleteRemovedCloudinaryImages(id, newImages);
      await syncRelationalData(
        id,
        colorImages,
        (parsed.data as { sizeGuide?: unknown }).sizeGuide
      );

      const updatedPrismaProduct = await prisma.products.update({
        where: { id },
        data: {
          name,
          description: description ?? null,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          stock: Number(stock),
          categoryId,
          images: newImages,
          onSale: onSale ?? false,
          // Si isActive no viene en el body, Prisma no actualiza el campo (preserva el valor actual).
          // Esto evita que editar un producto inactivo lo reactive accidentalmente.
          isActive: isActive !== undefined ? isActive : undefined,
          sizes: sizes ?? undefined,
          colors: colors ?? undefined,
          features: features ?? undefined,
          weight: weight ?? null,
          height: height ?? null,
          width: width ?? null,
          length: length ?? null,
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

      revalidatePath("/products");
      revalidatePath(`/products/${(await params).id}`);
      return ok(
        mapPrismaProductToResponse(
          updatedPrismaProduct as PrismaProductWithRelations
        ),
        "Producto actualizado exitosamente"
      );
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
      if (!rl.ok) return fail("RATE_LIMITED", "Too many requests", 429);

      const { id } = await params;
      const body = await request.json();

      const hasIsActive = typeof body.isActive === "boolean";
      const hasStock =
        typeof body.stock === "number" &&
        body.stock >= 0 &&
        Number.isInteger(body.stock);
      if (!hasIsActive && !hasStock) {
        return fail(
          "BAD_REQUEST",
          "Se requiere 'isActive' (boolean) o 'stock' (integer ≥ 0)",
          400
        );
      }

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (hasIsActive) updateData.isActive = body.isActive;
      if (hasStock) updateData.stock = body.stock;

      const updatedPrismaProduct = await prisma.products.update({
        where: { id },
        data: updateData,
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

      revalidatePath("/products");
      return ok(
        mapPrismaProductToResponse(
          updatedPrismaProduct as PrismaProductWithRelations
        ),
        "Producto actualizado correctamente"
      );
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
      const product = await prisma.products.findUnique({
        where: { id },
        select: { id: true, images: true },
      });
      if (!product) return fail("NOT_FOUND", "Producto no encontrado", 404);

      // Verificar si el producto tiene pedidos asociados.
      // Si los tiene, no podemos eliminarlo porque violaría la integridad referencial.
      const orderCount = await prisma.order_items.count({
        where: { productId: id },
      });
      if (orderCount > 0) {
        return fail(
          "CONFLICT",
          `Este producto tiene ${orderCount} pedido(s) asociado(s) y no puede ser eliminado. Podés desactivarlo desde la lista para que no sea visible en la tienda.`,
          409
        );
      }

      // Eliminar primero los ítems de carrito abandonado (datos analíticos, no críticos).
      await prisma.cart_abandonment_items.deleteMany({
        where: { productId: id },
      });

      await prisma.products.delete({ where: { id } });

      const images: string[] = safelyParseImages(product.images);
      if (images.length > 0) {
        const results = await Promise.allSettled(
          images.map(async (url) => {
            const publicId = extractPublicId(url);
            if (publicId) await deleteImage(publicId);
          })
        );
        logger.info("Product image deletion results", { results });
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
