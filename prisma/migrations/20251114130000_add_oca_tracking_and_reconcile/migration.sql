-- Reconcile manual migration: add missing columns if not exists, and add OCA tracking fields
-- This migration is idempotent (uses IF NOT EXISTS) to avoid conflicts with manual DB changes

-- categories.imageUrl
ALTER TABLE IF EXISTS "categories" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- products.salePrice
ALTER TABLE IF EXISTS "products" ADD COLUMN IF NOT EXISTS "salePrice" DOUBLE PRECISION;

-- orders: OCA tracking and shipping fields
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "ocaTrackingNumber" TEXT;
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "ocaOrderId" TEXT;
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "shippingMethod" TEXT;
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);
ALTER TABLE IF EXISTS "orders" ADD COLUMN IF NOT EXISTS "shippingCost" DOUBLE PRECISION;

-- Ensure indexes exist (create if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'orders' AND indexname = 'orders_ocaTrackingNumber_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS orders_ocaTrackingNumber_idx ON orders ("ocaTrackingNumber");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'products' AND indexname = 'products_salePrice_idx'
  ) THEN
    CREATE INDEX IF NOT EXISTS products_salePrice_idx ON products ("salePrice");
  END IF;
END $$;
