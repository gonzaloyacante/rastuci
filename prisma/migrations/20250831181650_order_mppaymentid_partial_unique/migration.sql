-- Make orders.mpPaymentId unique only when not null
-- Drop previous unique index if it exists (created by Prisma for @unique)
DROP INDEX IF EXISTS "Order_mpPaymentId_key";

-- Create partial unique index on non-null mpPaymentId values
CREATE UNIQUE INDEX IF NOT EXISTS "orders_mpPaymentId_unique_not_null"
ON "orders" ("mpPaymentId")
WHERE "mpPaymentId" IS NOT NULL;
