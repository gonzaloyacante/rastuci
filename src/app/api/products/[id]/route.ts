import { ApiErrorCode, fail, ok } from "@/lib/apiResponse";
import { normalizeApiError } from "@/lib/errors";
import { deleteImage, extractPublicId } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ProductCreateSchema } from "@/lib/validation/product";
import { ApiResponse, Product } from "@/types";
import { NextRequest, NextResponse } from "next/server";

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
      },
    });

    if (!product) {
      return fail("NOT_FOUND", "Producto no encontrado", 404);
    }

    const responseProduct: Product = {
      ...product,
      description: product.description ?? undefined,
      salePrice: product.salePrice ?? undefined,
      images:
        typeof product.images === "string"
          ? JSON.parse(product.images)
          : product.images,
      categories: {
        ...product.categories,
        description: product.categories.description ?? undefined,
      },
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

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Product>>> {
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
        body
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
      sizes,
      colors,
      features,
      weight,
      height,
      width,
      length,
    } = parsed.data;

    // Verificar que la categoría existe
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return fail("BAD_REQUEST", "La categoría especificada no existe", 400);
    }

    // Obtener producto actual para comparar imágenes
    const currentProduct = await prisma.products.findUnique({
      where: { id },
    });

    if (currentProduct && currentProduct.images) {
      const oldImages: string[] = typeof currentProduct.images === 'string'
        ? JSON.parse(currentProduct.images)
        : currentProduct.images;

      const newImages = Array.isArray(images) ? images : [];

      // Identificar imágenes eliminadas
      const imagesToDelete = oldImages.filter(img => !newImages.includes(img));

      if (imagesToDelete.length > 0) {
        logger.info(`Deleting ${imagesToDelete.length} removed images from Cloudinary`);
        // Eliminar en segundo plano para no bloquear la respuesta
        Promise.allSettled(imagesToDelete.map(async (url) => {
          const publicId = extractPublicId(url);
          if (publicId) {
            await deleteImage(publicId);
          }
        })).then(results => {
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
      },
    });

    const updatedProduct: Product = {
      ...updatedPrismaProduct,
      description: updatedPrismaProduct.description ?? undefined,
      salePrice: updatedPrismaProduct.salePrice ?? undefined,
      images:
        typeof updatedPrismaProduct.images === "string"
          ? JSON.parse(updatedPrismaProduct.images)
          : updatedPrismaProduct.images,
      categories: {
        ...updatedPrismaProduct.categories,
        description: updatedPrismaProduct.categories.description ?? undefined,
      },
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

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const rl = await checkRateLimit(request, {
      key: makeKey("DELETE", "/api/products/[id]"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    // Verificar si hay pedidos asociados a este producto
    const orderItemsCount = await prisma.order_items.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      return fail(
        "BAD_REQUEST",
        "No se puede eliminar el producto porque está incluido en pedidos existentes",
        400
      );
    }

    const productToDelete = await prisma.products.findUnique({
      where: { id },
    });

    await prisma.products.delete({
      where: { id },
    });

    // Eliminar imágenes de Cloudinary si existen
    if (productToDelete && productToDelete.images) {
      const images: string[] = typeof productToDelete.images === 'string'
        ? JSON.parse(productToDelete.images)
        : productToDelete.images;

      if (images.length > 0) {
        logger.info(`Deleting ${images.length} images for deleted product ${id}`);
        // No esperamos (await) para no demorar la respuesta, o podemos esperar si es crítico.
        // Dado que el producto ya se borró de la DB, mejor limpiar asíncronamente.
        Promise.allSettled(images.map(async (url) => {
          const publicId = extractPublicId(url);
          if (publicId) {
            await deleteImage(publicId);
          }
        })).catch(err => logger.error("Error cleaning up images", { err }));
      }
    }

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
