/*
  Warnings:

  - You are about to alter the column `shippingFloor` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.
  - You are about to alter the column `shippingApartment` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(3)`.
  - A unique constraint covering the columns `[caTrackingNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[caExtOrderId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CADeliveryType" AS ENUM ('D', 'S');

-- CreateEnum
CREATE TYPE "CADocumentType" AS ENUM ('DNI', 'CUIT');

-- CreateEnum
CREATE TYPE "CAProvinceCode" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PENDING_PAYMENT';

-- DropIndex
DROP INDEX "products_saleprice_idx";

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "caCustomerId" TEXT,
ADD COLUMN     "caOrderNumber" TEXT,
ADD COLUMN     "caShipmentId_rel" TEXT,
ADD COLUMN     "declaredValue" DOUBLE PRECISION,
ADD COLUMN     "estimatedDeliveryMax" TEXT,
ADD COLUMN     "estimatedDeliveryMin" TEXT,
ADD COLUMN     "ocaOrderId" TEXT,
ADD COLUMN     "ocaTrackingNumber" TEXT,
ADD COLUMN     "packageHeight" INTEGER,
ADD COLUMN     "packageLength" INTEGER,
ADD COLUMN     "packageWeight" INTEGER,
ADD COLUMN     "packageWidth" INTEGER,
ADD COLUMN     "rateValidTo" TIMESTAMP(3),
ADD COLUMN     "recipientCellPhone" TEXT,
ADD COLUMN     "recipientEmail" TEXT,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "recipientPhone" TEXT,
ADD COLUMN     "senderApartment" VARCHAR(3),
ADD COLUMN     "senderCellPhone" TEXT,
ADD COLUMN     "senderCity" TEXT,
ADD COLUMN     "senderEmail" TEXT,
ADD COLUMN     "senderFloor" VARCHAR(3),
ADD COLUMN     "senderLocality" TEXT,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "senderPhone" TEXT,
ADD COLUMN     "senderPostalCode" TEXT,
ADD COLUMN     "senderProvinceCode" CHAR(1),
ADD COLUMN     "senderStreetName" TEXT,
ADD COLUMN     "senderStreetNumber" TEXT,
ADD COLUMN     "shippingLocality" TEXT,
ADD COLUMN     "shippingProductType" TEXT DEFAULT 'CP',
ADD COLUMN     "shippingProvinceCode" CHAR(1),
ALTER COLUMN "shippingFloor" SET DATA TYPE VARCHAR(3),
ALTER COLUMN "shippingApartment" SET DATA TYPE VARCHAR(3);

-- CreateTable
CREATE TABLE "ca_agencies" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manager" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "packageReception" BOOLEAN NOT NULL DEFAULT false,
    "pickupAvailability" BOOLEAN NOT NULL DEFAULT false,
    "streetName" TEXT,
    "streetNumber" TEXT,
    "floor" TEXT,
    "apartment" TEXT,
    "locality" TEXT,
    "city" TEXT,
    "province" TEXT,
    "provinceCode" CHAR(1) NOT NULL,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "hours" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ca_agencies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ca_customers" (
    "customerId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "documentType" "CADocumentType" NOT NULL,
    "documentId" TEXT NOT NULL,
    "phone" TEXT,
    "cellPhone" TEXT,
    "streetName" TEXT,
    "streetNumber" TEXT,
    "floor" TEXT,
    "apartment" TEXT,
    "locality" TEXT,
    "city" TEXT,
    "provinceCode" CHAR(1),
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ca_customers_pkey" PRIMARY KEY ("customerId")
);

-- CreateTable
CREATE TABLE "ca_shipments" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "extOrderId" TEXT NOT NULL,
    "orderNumber" TEXT,
    "trackingNumber" TEXT,
    "productId" TEXT,
    "senderName" TEXT,
    "senderPhone" TEXT,
    "senderCellPhone" TEXT,
    "senderEmail" TEXT,
    "senderStreetName" TEXT,
    "senderStreetNumber" TEXT,
    "senderFloor" TEXT,
    "senderApartment" TEXT,
    "senderLocality" TEXT,
    "senderCity" TEXT,
    "senderProvinceCode" CHAR(1),
    "senderPostalCode" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT,
    "recipientCellPhone" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "deliveryType" "CADeliveryType" NOT NULL,
    "productType" TEXT NOT NULL,
    "agencyCode" TEXT,
    "destStreetName" TEXT,
    "destStreetNumber" TEXT,
    "destFloor" TEXT,
    "destApartment" TEXT,
    "destLocality" TEXT,
    "destCity" TEXT,
    "destProvinceCode" CHAR(1),
    "destPostalCode" TEXT,
    "weight" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "declaredValue" DOUBLE PRECISION NOT NULL,
    "status" TEXT,
    "importedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ca_shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ca_shipping_rates" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "postalCodeOrigin" TEXT NOT NULL,
    "postalCodeDestination" TEXT NOT NULL,
    "deliveryType" "CADeliveryType" NOT NULL,
    "productType" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "length" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "deliveryTimeMin" TEXT NOT NULL,
    "deliveryTimeMax" TEXT NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ca_shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ca_tracking_events" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "branch" TEXT NOT NULL,
    "status" TEXT,
    "sign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ca_tracking_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ca_agencies_city_idx" ON "ca_agencies"("city");

-- CreateIndex
CREATE INDEX "ca_agencies_provinceCode_idx" ON "ca_agencies"("provinceCode");

-- CreateIndex
CREATE INDEX "ca_agencies_status_idx" ON "ca_agencies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ca_customers_email_key" ON "ca_customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ca_customers_documentId_key" ON "ca_customers"("documentId");

-- CreateIndex
CREATE INDEX "ca_customers_documentId_idx" ON "ca_customers"("documentId");

-- CreateIndex
CREATE INDEX "ca_customers_email_idx" ON "ca_customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ca_shipments_extOrderId_key" ON "ca_shipments"("extOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ca_shipments_trackingNumber_key" ON "ca_shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "ca_shipments_customerId_idx" ON "ca_shipments"("customerId");

-- CreateIndex
CREATE INDEX "ca_shipments_extOrderId_idx" ON "ca_shipments"("extOrderId");

-- CreateIndex
CREATE INDEX "ca_shipments_status_idx" ON "ca_shipments"("status");

-- CreateIndex
CREATE INDEX "ca_shipments_trackingNumber_idx" ON "ca_shipments"("trackingNumber");

-- CreateIndex
CREATE INDEX "ca_shipping_rates_customerId_idx" ON "ca_shipping_rates"("customerId");

-- CreateIndex
CREATE INDEX "ca_shipping_rates_postalCodeDestination_idx" ON "ca_shipping_rates"("postalCodeDestination");

-- CreateIndex
CREATE INDEX "ca_shipping_rates_postalCodeOrigin_idx" ON "ca_shipping_rates"("postalCodeOrigin");

-- CreateIndex
CREATE INDEX "ca_shipping_rates_validTo_idx" ON "ca_shipping_rates"("validTo");

-- CreateIndex
CREATE INDEX "ca_tracking_events_eventDate_idx" ON "ca_tracking_events"("eventDate");

-- CreateIndex
CREATE INDEX "ca_tracking_events_event_idx" ON "ca_tracking_events"("event");

-- CreateIndex
CREATE INDEX "ca_tracking_events_shipmentId_idx" ON "ca_tracking_events"("shipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_caTrackingNumber_key" ON "orders"("caTrackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "orders_caExtOrderId_key" ON "orders"("caExtOrderId");

-- CreateIndex
CREATE INDEX "orders_caCustomerId_idx" ON "orders"("caCustomerId");

-- CreateIndex
CREATE INDEX "orders_ocaTrackingNumber_idx" ON "orders"("ocaTrackingNumber");

-- CreateIndex
CREATE INDEX "orders_shippingProvinceCode_idx" ON "orders"("shippingProvinceCode");

-- AddForeignKey
ALTER TABLE "ca_shipments" ADD CONSTRAINT "ca_shipments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "ca_customers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_shipping_rates" ADD CONSTRAINT "ca_shipping_rates_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "ca_customers"("customerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ca_tracking_events" ADD CONSTRAINT "ca_tracking_events_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "ca_shipments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_caCustomerId_fkey" FOREIGN KEY ("caCustomerId") REFERENCES "ca_customers"("customerId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_caShipmentId_rel_fkey" FOREIGN KEY ("caShipmentId_rel") REFERENCES "ca_shipments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
