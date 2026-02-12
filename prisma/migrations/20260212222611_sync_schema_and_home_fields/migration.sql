/*
  Warnings:

  - You are about to drop the column `hours` on the `ca_agencies` table. All the data in the column will be lost.
  - You are about to drop the column `cartItems` on the `cart_abandonment` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StockStatusColor" AS ENUM ('success', 'warning', 'error', 'info', 'muted', 'primary', 'secondary', 'accent');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'WAITING_TRANSFER_PROOF';
ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_REVIEW';
ALTER TYPE "OrderStatus" ADD VALUE 'RESERVED';
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "LegalPolicy" ADD COLUMN     "htmlContent" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ca_agencies" DROP COLUMN "hours";

-- AlterTable
ALTER TABLE "cart_abandonment" DROP COLUMN "cartItems";

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentReminderSent" BOOLEAN DEFAULT false,
ADD COLUMN     "transferProofAt" TIMESTAMP(3),
ADD COLUMN     "transferProofUrl" TEXT,
ADD COLUMN     "transferSenderName" TEXT,
ADD COLUMN     "transferTransactionId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "cart_abandonment_items" (
    "id" TEXT NOT NULL,
    "abandonmentId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "productName" TEXT,
    "variant" TEXT,

    CONSTRAINT "cart_abandonment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_color_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_color_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_size_guides" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "measurements" TEXT NOT NULL,
    "ageRange" TEXT,

    CONSTRAINT "product_size_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'Rastuci',
    "adminEmail" TEXT,
    "salesEmail" TEXT,
    "supportEmail" TEXT,
    "senderName" TEXT,
    "addressStreet" TEXT,
    "addressCity" TEXT,
    "addressProvince" TEXT,
    "addressPostalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "headerLogoUrl" TEXT,
    "heroLogoUrl" TEXT,
    "heroImage" TEXT,
    "heroOverlayOpacity" INTEGER NOT NULL DEFAULT 20,
    "heroTitle" TEXT NOT NULL DEFAULT 'Bienvenidos a Rastuci',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Ropa para niños con estilo',
    "ctaPrimaryLabel" TEXT NOT NULL DEFAULT 'Ver Productos',
    "ctaPrimaryLink" TEXT NOT NULL DEFAULT '/products',
    "ctaSecondaryLabel" TEXT NOT NULL DEFAULT 'Conocer Más',
    "ctaSecondaryLink" TEXT NOT NULL DEFAULT '/about',
    "categoriesTitle" TEXT NOT NULL DEFAULT 'Categorías',
    "benefitsTitle" TEXT NOT NULL DEFAULT 'Por qué elegirnos',
    "categoriesSubtitle" TEXT NOT NULL DEFAULT 'Explorá nuestras categorías de productos',
    "categoriesDisplay" TEXT NOT NULL DEFAULT 'image',
    "featuredTitle" TEXT NOT NULL DEFAULT 'Ofertas Destacadas',
    "featuredSubtitle" TEXT NOT NULL DEFAULT 'Los mejores productos con descuento',
    "featuredCount" INTEGER NOT NULL DEFAULT 4,
    "showHeroLogo" BOOLEAN NOT NULL DEFAULT true,
    "showHeroTitle" BOOLEAN NOT NULL DEFAULT true,
    "showHeroSubtitle" BOOLEAN NOT NULL DEFAULT true,
    "showCtaPrimary" BOOLEAN NOT NULL DEFAULT true,
    "showCtaSecondary" BOOLEAN NOT NULL DEFAULT true,
    "showCategoriesTitle" BOOLEAN NOT NULL DEFAULT true,
    "showCategoriesSubtitle" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedTitle" BOOLEAN NOT NULL DEFAULT true,
    "showFeaturedSubtitle" BOOLEAN NOT NULL DEFAULT true,
    "footerLogoUrl" TEXT,
    "footerBrand" TEXT NOT NULL DEFAULT 'Rastuci',
    "footerTagline" TEXT NOT NULL DEFAULT 'Moda infantil con amor',
    "showFooterLogo" BOOLEAN NOT NULL DEFAULT true,
    "showFooterBrand" BOOLEAN NOT NULL DEFAULT true,
    "showFooterTagline" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_benefits" (
    "id" TEXT NOT NULL,
    "homeSettingsId" TEXT NOT NULL DEFAULT 'default',
    "icon" TEXT NOT NULL DEFAULT 'Truck',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "home_benefits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "headerTitle" TEXT NOT NULL DEFAULT 'Contacto',
    "headerSubtitle" TEXT NOT NULL DEFAULT 'Estamos aquí para ayudarte',
    "emails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "phones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "addressCityCountry" TEXT,
    "hoursTitle" TEXT NOT NULL DEFAULT 'Horarios de Atención',
    "hoursWeekdays" TEXT NOT NULL DEFAULT 'Lunes a Viernes: 9:00 - 18:00',
    "hoursSaturday" TEXT NOT NULL DEFAULT 'Sábados: 9:00 - 14:00',
    "hoursSunday" TEXT NOT NULL DEFAULT 'Domingos: Cerrado',
    "formTitle" TEXT NOT NULL DEFAULT 'Envíanos un mensaje',
    "formNameLabel" TEXT NOT NULL DEFAULT 'Nombre',
    "formEmailLabel" TEXT NOT NULL DEFAULT 'Email',
    "formPhoneLabel" TEXT NOT NULL DEFAULT 'Teléfono',
    "formMessageLabel" TEXT NOT NULL DEFAULT 'Mensaje',
    "formSubmitLabel" TEXT NOT NULL DEFAULT 'Enviar',
    "formSuccessTitle" TEXT NOT NULL DEFAULT '¡Mensaje enviado!',
    "formSuccessMessage" TEXT NOT NULL DEFAULT 'Te responderemos pronto',
    "formSendAnother" TEXT NOT NULL DEFAULT 'Enviar otro mensaje',
    "instagramUrl" TEXT,
    "instagramUsername" TEXT,
    "facebookUrl" TEXT,
    "facebookUsername" TEXT,
    "whatsappUrl" TEXT,
    "whatsappUsername" TEXT,
    "tiktokUrl" TEXT,
    "tiktokUsername" TEXT,
    "youtubeUrl" TEXT,
    "youtubeUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "criticalStockThreshold" INTEGER NOT NULL DEFAULT 2,
    "enableLowStockAlerts" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_status_levels" (
    "id" TEXT NOT NULL,
    "stockSettingsId" TEXT NOT NULL DEFAULT 'default',
    "min" INTEGER NOT NULL DEFAULT 0,
    "max" INTEGER,
    "label" TEXT NOT NULL,
    "color" "StockStatusColor" NOT NULL DEFAULT 'muted',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "stock_status_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enableFreeShipping" BOOLEAN NOT NULL DEFAULT false,
    "freeShippingMin" DECIMAL(10,2),
    "defaultCarrier" TEXT NOT NULL DEFAULT 'correo_argentino',
    "originPostalCode" TEXT,
    "originCity" TEXT,
    "originProvince" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "vacation_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL DEFAULT 'Modo Vacaciones',
    "message" TEXT NOT NULL DEFAULT 'Estamos de vacaciones.',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "showEmailCollection" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_period" (
    "id" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endAt" TIMESTAMP(3),
    "plannedEndAt" TIMESTAMP(3),

    CONSTRAINT "vacation_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_subscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "cartSnapshot" JSONB,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agency_hours" (
    "id" TEXT NOT NULL,
    "agencyCode" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "open" TEXT NOT NULL,
    "close" TEXT NOT NULL,

    CONSTRAINT "agency_hours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cart_abandonment_items_abandonmentId_idx" ON "cart_abandonment_items"("abandonmentId");

-- CreateIndex
CREATE INDEX "cart_abandonment_items_productId_idx" ON "cart_abandonment_items"("productId");

-- CreateIndex
CREATE INDEX "product_color_images_productId_idx" ON "product_color_images"("productId");

-- CreateIndex
CREATE INDEX "product_color_images_productId_color_idx" ON "product_color_images"("productId", "color");

-- CreateIndex
CREATE INDEX "product_size_guides_productId_idx" ON "product_size_guides"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "product_size_guides_productId_size_key" ON "product_size_guides"("productId", "size");

-- CreateIndex
CREATE INDEX "home_benefits_homeSettingsId_idx" ON "home_benefits"("homeSettingsId");

-- CreateIndex
CREATE INDEX "home_benefits_sortOrder_idx" ON "home_benefits"("sortOrder");

-- CreateIndex
CREATE INDEX "stock_status_levels_stockSettingsId_idx" ON "stock_status_levels"("stockSettingsId");

-- CreateIndex
CREATE INDEX "faq_items_isActive_sortOrder_idx" ON "faq_items"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_methodId_key" ON "payment_methods"("methodId");

-- CreateIndex
CREATE INDEX "payment_methods_isActive_sortOrder_idx" ON "payment_methods"("isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_options_optionId_key" ON "shipping_options"("optionId");

-- CreateIndex
CREATE INDEX "shipping_options_isActive_sortOrder_idx" ON "shipping_options"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "vacation_subscriber_periodId_idx" ON "vacation_subscriber"("periodId");

-- CreateIndex
CREATE INDEX "agency_hours_agencyCode_idx" ON "agency_hours"("agencyCode");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- AddForeignKey
ALTER TABLE "cart_abandonment_items" ADD CONSTRAINT "cart_abandonment_items_abandonmentId_fkey" FOREIGN KEY ("abandonmentId") REFERENCES "cart_abandonment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_abandonment_items" ADD CONSTRAINT "cart_abandonment_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_color_images" ADD CONSTRAINT "product_color_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_size_guides" ADD CONSTRAINT "product_size_guides_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "home_benefits" ADD CONSTRAINT "home_benefits_homeSettingsId_fkey" FOREIGN KEY ("homeSettingsId") REFERENCES "home_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_status_levels" ADD CONSTRAINT "stock_status_levels_stockSettingsId_fkey" FOREIGN KEY ("stockSettingsId") REFERENCES "stock_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_subscriber" ADD CONSTRAINT "vacation_subscriber_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "vacation_period"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agency_hours" ADD CONSTRAINT "agency_hours_agencyCode_fkey" FOREIGN KEY ("agencyCode") REFERENCES "ca_agencies"("code") ON DELETE CASCADE ON UPDATE CASCADE;
