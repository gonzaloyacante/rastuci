-- Enable pg_trgm extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index on lower(name) for faster ILIKE/search
-- Note: Prisma runs migrations in a transaction, so avoid CONCURRENTLY here
CREATE INDEX IF NOT EXISTS products_name_trgm_idx
  ON products USING GIN (LOWER(name) gin_trgm_ops);
