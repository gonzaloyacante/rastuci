import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { ORDER_STATUS } from "@/lib/constants";
import { emailService } from "@/lib/resend";
import { getStoreSettings } from "@/lib/store-settings";

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
        if (order.customerEmail) {
          await emailService.sendOrderCancelled({
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
          });
        }
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
    // JOB 2: RECOVERY EMAILS (Dynamic Logic based on Store Settings)
    // ========================================================================
    const settings = await getStoreSettings();
    const mpExpirationMinutes = settings.payments.mpExpirationMinutes; // Default 60
    const transferExpirationHours = settings.payments.transferExpirationHours; // Default 48

    // LOGIC: Send reminder when 50% of the time has passed.
    // Example: Expires in 60m -> Remind at 30m
    // Example: Expires in 48h -> Remind at 24h

    // 1. Mercado Pago Reminders
    const mpHalfTime = mpExpirationMinutes / 2;
    // Window: from "expires ago" (oldest) to "half-time ago" (newest)
    const mpWindowStart = new Date(
      now.getTime() - mpExpirationMinutes * 60 * 1000
    );
    const mpWindowEnd = new Date(now.getTime() - mpHalfTime * 60 * 1000);

    // 2. Transfer Reminders
    const transferHalfTime = transferExpirationHours / 2;
    const transferWindowStart = new Date(
      now.getTime() - transferExpirationHours * 60 * 60 * 1000
    );
    const transferWindowEnd = new Date(
      now.getTime() - transferHalfTime * 60 * 60 * 1000
    );

    // We fetch two groups to be precise
    const abandonedOrders = await prisma.orders.findMany({
      where: {
        AND: [
          {
            OR: [
              // Mercado Pago Logic
              {
                status: ORDER_STATUS.PENDING_PAYMENT,
                paymentMethod: "mercadopago",
                createdAt: {
                  gte: mpWindowStart,
                  lte: mpWindowEnd,
                },
              },
              // Transfer Logic
              {
                status: ORDER_STATUS.WAITING_TRANSFER_PROOF,
                paymentMethod: "transfer",
                createdAt: {
                  gte: transferWindowStart,
                  lte: transferWindowEnd,
                },
              },
            ],
          },
          { paymentReminderSent: false },
          { mpPaymentId: null },
        ],
      },
      take: 20,
    });

    for (const order of abandonedOrders) {
      if (order.customerEmail) {
        try {
          // Send Email
          await emailService.sendPaymentReminder({
            id: order.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            total: Number(order.total),
            paymentMethod: order.paymentMethod || "unknown",
          });

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
