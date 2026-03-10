-- Add htmlContent column to LegalPolicy (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'LegalPolicy' AND column_name = 'htmlContent'
  ) THEN
    ALTER TABLE "LegalPolicy" ADD COLUMN "htmlContent" TEXT;
  END IF;
END $$;

-- CreateTable: legal_policy_section (idempotent)
CREATE TABLE IF NOT EXISTS "legal_policy_section" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "legal_policy_section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: legal_policy_section_policyId_idx (idempotent)
CREATE INDEX IF NOT EXISTS "legal_policy_section_policyId_idx" ON "legal_policy_section"("policyId");

-- CreateIndex: legal_policy_section_policyId_sortOrder_idx (idempotent)
CREATE INDEX IF NOT EXISTS "legal_policy_section_policyId_sortOrder_idx" ON "legal_policy_section"("policyId", "sortOrder");

-- AddForeignKey: legal_policy_section.policyId -> LegalPolicy.id (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legal_policy_section_policyId_fkey'
  ) THEN
    ALTER TABLE "legal_policy_section"
      ADD CONSTRAINT "legal_policy_section_policyId_fkey"
      FOREIGN KEY ("policyId") REFERENCES "LegalPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
