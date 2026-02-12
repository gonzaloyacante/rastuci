-- CreateTable
CREATE TABLE "shared_wishlists" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "shared_wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_productsToshared_wishlists" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_productsToshared_wishlists_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "shared_wishlists_token_key" ON "shared_wishlists"("token");

-- CreateIndex
CREATE INDEX "shared_wishlists_token_idx" ON "shared_wishlists"("token");

-- CreateIndex
CREATE INDEX "shared_wishlists_createdAt_idx" ON "shared_wishlists"("createdAt");

-- CreateIndex
CREATE INDEX "_productsToshared_wishlists_B_index" ON "_productsToshared_wishlists"("B");

-- AddForeignKey
ALTER TABLE "_productsToshared_wishlists" ADD CONSTRAINT "_productsToshared_wishlists_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_productsToshared_wishlists" ADD CONSTRAINT "_productsToshared_wishlists_B_fkey" FOREIGN KEY ("B") REFERENCES "shared_wishlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
