-- DropIndex
-- DROP INDEX "products_saleprice_idx"; -- Comentado: índice no existe

-- CreateIndex
CREATE INDEX "orders_trackingNumber_idx" ON "orders"("trackingNumber");

-- RenameIndex
ALTER INDEX "orders_ocatrackingnumber_idx" RENAME TO "orders_ocaTrackingNumber_idx";
