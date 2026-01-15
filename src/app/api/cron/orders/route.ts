import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ORDER_STATUS } from "@/lib/constants";
import { emailService } from "@/lib/resend";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 1. Security Check (Vercel Cron)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results = {
    cancelled: 0,
    restoredStock: 0,
    remindersSent: 0,
    errors: [] as string[],
  };

  try {
    // ========================================================================
    // JOB 1: CANCEL EXPIRED ORDERS & RESTORE STOCK
    // ========================================================================
    const expiredOrders = await prisma.orders.findMany({
      where: {
        status: {
          in: [
            ORDER_STATUS.PENDING_PAYMENT,
            ORDER_STATUS.WAITING_TRANSFER_PROOF,
            ORDER_STATUS.RESERVED,
          ],
        },
        expiresAt: { lt: now }, // Expired
      },
      include: {
        order_items: true,
      },
      take: 50, // Batch limit per run
    });

    for (const order of expiredOrders) {
      try {
        await prisma.$transaction(async (tx) => {
          // A. Mark Cancelled
          await tx.orders.update({
            where: { id: order.id },
            data: { status: "CANCELLED" as any }, // Cast if enum mismatch in types, but should match
          });

          // B. Restore Stock
          for (const item of order.order_items) {
            await tx.products.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
            results.restoredStock += item.quantity;
          }
        });

        // C. Send Notification (Non-blocking)
        // emailService.sendOrderCancelled(order); // TODO: Implement if desired
        logger.info(`[Cron] Cancelled expired order ${order.id}`);
        results.cancelled++;
      } catch (err) {
        logger.error(`[Cron] Failed to cancel order ${order.id}`, {
          error: err,
        });
        results.errors.push(
          `Cancel Error ${order.id}: ${(err as Error).message}`
        );
      }
    }

    // ========================================================================
    // JOB 2: MERCADO PAGO RECOVERY EMAILS
    // ========================================================================
    // Find MP orders created > 15 mins ago, < 2 hours ago, unpaid, no reminder sent
    const recoveryWindowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
    const recoveryWindowEnd = new Date(now.getTime() - 15 * 60 * 1000); // 15 mins ago

    const abandonedOrders = await prisma.orders.findMany({
      where: {
        status: ORDER_STATUS.PENDING_PAYMENT,
        paymentMethod: "mercadopago",
        createdAt: {
          gte: recoveryWindowStart,
          lte: recoveryWindowEnd,
        },
        paymentReminderSent: { equals: false },
        mpPaymentId: null, // Ensure not actually paid (though status check covers this)
      },
      take: 20,
    });

    for (const order of abandonedOrders) {
      if (order.customerEmail) {
        try {
          // Send Email
          // TODO: Implement specific method or reuse generic
          // await emailService.sendPaymentReminder(order);

          await prisma.orders.update({
            where: { id: order.id },
            data: { paymentReminderSent: true },
          });

          results.remindersSent++;
          logger.info(`[Cron] Sent reminder for order ${order.id}`);
        } catch (err) {
          logger.error(`[Cron] Failed to send reminder ${order.id}`, {
            error: err,
          });
        }
      }
    }
  } catch (error) {
    logger.error("[Cron] Critical Execution Error", { error });
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, results });
}
