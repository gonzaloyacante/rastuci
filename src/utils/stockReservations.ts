import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

const RESERVATION_DURATION_MS = 15 * 60 * 1000; // 15 minutos

interface ReservationResult {
  success: boolean;
  message?: string;
  reservation?: {
    id: string;
    expiresAt: Date;
  };
}

/**
 * Crea una reserva temporal de stock para un producto
 * @param productId ID del producto
 * @param quantity Cantidad a reservar
 * @param sessionId ID único de la sesión de checkout
 * @returns Resultado de la reserva
 */
export async function createStockReservation(
  productId: string,
  quantity: number,
  sessionId: string
): Promise<ReservationResult> {
  try {
    // Verificar stock disponible (considerando reservas activas)
    const availableStock = await getAvailableStock(productId);

    if (availableStock < quantity) {
      return {
        success: false,
        message: `Stock insuficiente. Disponible: ${availableStock}`,
      };
    }

    // Crear reserva
    const expiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
    const reservation = await prisma.stock_reservations.create({
      data: {
        productId,
        quantity,
        sessionId,
        expiresAt,
      },
    });

    logger.info("[Stock] Reservation created", {
      reservationId: reservation.id,
      productId,
      quantity,
      sessionId,
      expiresAt,
    });

    return {
      success: true,
      reservation: {
        id: reservation.id,
        expiresAt: reservation.expiresAt,
      },
    };
  } catch (error) {
    logger.error("[Stock] Error creating reservation", { error });
    return {
      success: false,
      message: "Error al reservar stock",
    };
  }
}

/**
 * Libera una reserva de stock (cuando el usuario cancela el checkout)
 * @param sessionId ID de la sesión
 */
export async function releaseStockReservation(
  sessionId: string
): Promise<void> {
  try {
    const deleted = await prisma.stock_reservations.deleteMany({
      where: { sessionId },
    });

    logger.info("[Stock] Reservation released", { sessionId, count: deleted.count });
  } catch (error) {
    logger.error("[Stock] Error releasing reservation", { error, sessionId });
  }
}

/**
 * Confirma una reserva y decrementa el stock real
 * @param sessionId ID de la sesión
 */
export async function confirmStockReservation(
  sessionId: string
): Promise<boolean> {
  try {
    // Obtener todas las reservas de esta sesión
    const reservations = await prisma.stock_reservations.findMany({
      where: { sessionId },
    });

    if (reservations.length === 0) {
      logger.warn("[Stock] No reservations found for session", { sessionId });
      return false;
    }

    // Decrementar stock para cada producto
    for (const reservation of reservations) {
      await prisma.products.update({
        where: { id: reservation.productId },
        data: {
          stock: {
            decrement: reservation.quantity,
          },
        },
      });
    }

    // Eliminar las reservas
    await prisma.stock_reservations.deleteMany({
      where: { sessionId },
    });

    logger.info("[Stock] Reservations confirmed and stock decremented", {
      sessionId,
      count: reservations.length,
    });

    return true;
  } catch (error) {
    logger.error("[Stock] Error confirming reservation", { error, sessionId });
    return false;
  }
}

/**
 * Obtiene el stock disponible para un producto (real - reservado)
 * @param productId ID del producto
 * @returns Stock disponible
 */
export async function getAvailableStock(productId: string): Promise<number> {
  try {
    // Obtener producto
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { stock: true },
    });

    if (!product) {
      return 0;
    }

    // Obtener reservas activas (no expiradas)
    const now = new Date();
    const activeReservations = await prisma.stock_reservations.aggregate({
      where: {
        productId,
        expiresAt: {
          gt: now,
        },
      },
      _sum: {
        quantity: true,
      },
    });

    const reserved = activeReservations._sum.quantity || 0;
    return Math.max(0, product.stock - reserved);
  } catch (error) {
    logger.error("[Stock] Error getting available stock", {
      error,
      productId,
    });
    return 0;
  }
}

/**
 * Limpia reservas expiradas (debe ejecutarse en cron job)
 */
export async function cleanExpiredReservations(): Promise<void> {
  try {
    const now = new Date();
    const deleted = await prisma.stock_reservations.deleteMany({
      where: {
        expiresAt: {
          lte: now,
        },
      },
    });

    if (deleted.count > 0) {
      logger.info("[Stock] Expired reservations cleaned", {
        count: deleted.count,
      });
    }
  } catch (error) {
    logger.error("[Stock] Error cleaning expired reservations", { error });
  }
}

/**
 * Extiende el tiempo de una reserva (cuando el usuario sigue activo)
 * @param sessionId ID de la sesión
 */
export async function extendStockReservation(
  sessionId: string
): Promise<boolean> {
  try {
    const newExpiresAt = new Date(Date.now() + RESERVATION_DURATION_MS);
    const updated = await prisma.stock_reservations.updateMany({
      where: { sessionId },
      data: { expiresAt: newExpiresAt },
    });

    logger.info("[Stock] Reservation extended", {
      sessionId,
      count: updated.count,
      newExpiresAt,
    });

    return updated.count > 0;
  } catch (error) {
    logger.error("[Stock] Error extending reservation", { error, sessionId });
    return false;
  }
}
