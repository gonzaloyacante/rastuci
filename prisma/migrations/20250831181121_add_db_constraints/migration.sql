-- Add CHECK constraint to enforce non-negative stock on products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_stock_nonnegative'
  ) THEN
    ALTER TABLE "products"
    ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);
  END IF;
END $$;
