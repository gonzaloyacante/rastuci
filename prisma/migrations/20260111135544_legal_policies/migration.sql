-- CreateTable
CREATE TABLE "LegalPolicy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LegalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalPolicy_slug_key" ON "LegalPolicy"("slug");

-- CreateIndex
CREATE INDEX "orders_mpPaymentId_idx" ON "orders"("mpPaymentId");

-- CreateIndex
CREATE INDEX "orders_mpPreferenceId_idx" ON "orders"("mpPreferenceId");

-- CreateIndex
CREATE INDEX "products_categoryId_price_idx" ON "products"("categoryId", "price");

-- CreateIndex
CREATE INDEX "products_categoryId_name_idx" ON "products"("categoryId", "name");

-- CreateIndex
CREATE INDEX "products_onSale_price_idx" ON "products"("onSale", "price");

-- CreateIndex
CREATE INDEX "products_colors_idx" ON "products" USING GIN ("colors");

-- CreateIndex
CREATE INDEX "products_sizes_idx" ON "products" USING GIN ("sizes");

-- CreateIndex
CREATE INDEX "products_features_idx" ON "products" USING GIN ("features");
