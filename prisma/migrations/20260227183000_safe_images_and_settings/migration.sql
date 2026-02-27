-- AlterTable
ALTER TABLE "ca_agencies" DROP COLUMN "hours";

-- AlterTable
ALTER TABLE "cart_abandonment" DROP COLUMN "cartItems";

-- AlterTable
ALTER TABLE "home_settings" ADD COLUMN     "benefitsTitle" TEXT NOT NULL DEFAULT 'Por qué elegirnos',
ADD COLUMN     "categoriesDisplay" TEXT NOT NULL DEFAULT 'image',
ADD COLUMN     "categoriesSubtitle" TEXT NOT NULL DEFAULT 'Explorá nuestras categorías de productos',
ADD COLUMN     "ctaPrimaryLink" TEXT NOT NULL DEFAULT '/products',
ADD COLUMN     "ctaSecondaryLink" TEXT NOT NULL DEFAULT '/about',
ADD COLUMN     "featuredCount" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "heroOverlayOpacity" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "showCategoriesSubtitle" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "images_new" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "products" SET "images_new" = ARRAY(
    SELECT jsonb_array_elements_text(
        CASE 
            WHEN "images" IS NULL OR "images" = '' OR "images" = '""' OR "images" = '[]' THEN '[]'::jsonb 
            WHEN "images" LIKE '[%]' THEN "images"::jsonb 
            ELSE '[]'::jsonb 
        END
    )
);

ALTER TABLE "products" DROP COLUMN "images";
ALTER TABLE "products" RENAME COLUMN "images_new" TO "images";

-- AlterTable
ALTER TABLE "store_settings" ADD COLUMN     "bankAlias" TEXT,
ADD COLUMN     "bankCbu" TEXT,
ADD COLUMN     "bankCuit" TEXT,
ADD COLUMN     "bankHolder" TEXT,
ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "cashDiscount" DECIMAL(5,2),
ADD COLUMN     "cashExpirationHours" INTEGER NOT NULL DEFAULT 48,
ADD COLUMN     "couponsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mpDiscount" DECIMAL(5,2),
ADD COLUMN     "mpExpirationMinutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "transferDiscount" DECIMAL(5,2),
ADD COLUMN     "transferExpirationHours" INTEGER NOT NULL DEFAULT 48;

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'wallet',
    "description" TEXT NOT NULL,
    "requiresShipping" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_options" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "estimatedDays" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "responsePreference" TEXT NOT NULL DEFAULT 'EMAIL',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount" DECIMAL(5,2) NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "usageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "minOrderTotal" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_methodId_key" ON "payment_methods"("methodId");

-- CreateIndex
CREATE INDEX "payment_methods_isActive_sortOrder_idx" ON "payment_methods"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_options_optionId_key" ON "shipping_options"("optionId");

-- CreateIndex
CREATE INDEX "shipping_options_isActive_sortOrder_idx" ON "shipping_options"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "contact_messages_isRead_isArchived_idx" ON "contact_messages"("isRead", "isArchived");

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_code_idx" ON "coupons"("code");

-- CreateIndex
CREATE INDEX "coupons_isActive_idx" ON "coupons"("isActive");

