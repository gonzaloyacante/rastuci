import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ApiResponse, Product } from "@/types";
import { checkRateLimit } from "@/lib/rateLimiter";
import { ok, fail, ApiErrorCode } from "@/lib/apiResponse";
import { getPreset, makeKey } from "@/lib/rateLimiterConfig";
import { ProductCreateSchema } from "@/lib/validation/product";
import { normalizeApiError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/products/[id] - Obtener producto por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const rl = checkRateLimit(request, {
      key: makeKey("GET", "/api/products/[id]"),
      ...getPreset("publicRead"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
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
      category: {
        ...product.category,
        description: product.category.description ?? undefined,
      },
    };

    return ok(responseProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al obtener el producto",
      500,
    );
    return fail(e.code as ApiErrorCode, e.message, e.status, e.details as Record<string, unknown>);
  }
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<Product>>> {
  try {
    const rl = checkRateLimit(request, {
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
      return fail("BAD_REQUEST", "Datos inválidos", 400, {
        issues: parsed.error.issues,
      });
    }
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      images,
      onSale,
      sizes,
      colors,
      features,
    } = parsed.data;

    // Verificar que la categoría existe
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return fail("BAD_REQUEST", "La categoría especificada no existe", 400);
    }

    const updatedPrismaProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        categoryId,
        images: Array.isArray(images) ? JSON.stringify(images) : images,
        onSale: onSale ?? undefined,
        sizes: sizes ?? undefined,
        colors: colors ?? undefined,
        features: features ?? undefined,
      },
      include: {
        category: true,
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
      category: {
        ...updatedPrismaProduct.category,
        description: updatedPrismaProduct.category.description ?? undefined,
      },
    };

    return ok(updatedProduct, "Producto actualizado exitosamente");
  } catch (error) {
    console.error("Error updating product:", error);
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al actualizar el producto",
      500,
    );
    return fail(e.code as ApiErrorCode, e.message, e.status, e.details as Record<string, unknown>);
  }
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const rl = checkRateLimit(request, {
      key: makeKey("DELETE", "/api/products/[id]"),
      ...getPreset("mutatingLow"),
    });
    if (!rl.ok) {
      return fail("RATE_LIMITED", "Too many requests", 429);
    }
    const { id } = await params;

    // Verificar si hay pedidos asociados a este producto
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      return fail(
        "BAD_REQUEST",
        "No se puede eliminar el producto porque está incluido en pedidos existentes",
        400,
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return ok(null, "Producto eliminado exitosamente");
  } catch (error) {
    console.error("Error deleting product:", error);
    const e = normalizeApiError(
      error,
      "INTERNAL_ERROR",
      "Error al eliminar el producto",
      500,
    );
    return fail(e.code as ApiErrorCode, e.message, e.status, e.details as Record<string, unknown>);
  }
}
