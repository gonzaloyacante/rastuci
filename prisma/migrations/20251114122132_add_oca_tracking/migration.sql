-- DropIndex
-- DROP INDEX "products_saleprice_idx"; -- Comentado: índice no existe

-- CreateIndex
-- Ensure trackingNumber column exists (safe for dev)
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "trackingNumber" text;

-- Create index if not exists
CREATE INDEX IF NOT EXISTS "orders_trackingNumber_idx" ON "orders"("trackingNumber");

-- Rename old index if present (guarded)
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
		WHERE c.relkind = 'i' AND c.relname = 'orders_ocatrackingnumber_idx'
	) THEN
		ALTER INDEX "orders_ocatrackingnumber_idx" RENAME TO "orders_ocaTrackingNumber_idx";
	END IF;
END
$$;
