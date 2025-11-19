-- Add icon column to categories table (nullable text)
ALTER TABLE IF EXISTS "categories" ADD COLUMN IF NOT EXISTS "icon" text;

-- safe no-op if column already exists
