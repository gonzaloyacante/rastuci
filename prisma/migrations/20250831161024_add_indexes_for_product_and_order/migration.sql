/*
  Warnings:

  - A unique constraint covering the columns `[mpPaymentId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "color" TEXT,
ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "mpPaymentId" TEXT,
ADD COLUMN     "mpPreferenceId" TEXT,
ADD COLUMN     "mpStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "orders_mpPaymentId_key" ON "orders"("mpPaymentId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_onSale_idx" ON "products"("onSale");

-- CreateIndex
CREATE INDEX "products_price_idx" ON "products"("price");

-- CreateIndex
CREATE INDEX "products_createdAt_idx" ON "products"("createdAt");

-- CreateIndex
CREATE INDEX "products_categoryId_onSale_idx" ON "products"("categoryId", "onSale");
