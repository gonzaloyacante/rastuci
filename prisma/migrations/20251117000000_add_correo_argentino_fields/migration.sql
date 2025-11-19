-- AddCorreoArgentinoFieldsAndProductDimensions
-- Agrega campos necesarios para integración con Correo Argentino API MiCorreo
-- y dimensiones de productos para cálculo de envíos

-- Agregar campos de dimensiones y peso a productos
ALTER TABLE "products"
ADD COLUMN IF NOT EXISTS "weight" INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS "height" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "width" INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS "length" INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS "sizeGuide" JSONB;

-- Comentarios para documentación
COMMENT ON COLUMN "products"."weight" IS 'Peso del producto en gramos (para API Correo Argentino)';
COMMENT ON COLUMN "products"."height" IS 'Alto del producto en centímetros (para API Correo Argentino)';
COMMENT ON COLUMN "products"."width" IS 'Ancho del producto en centímetros (para API Correo Argentino)';
COMMENT ON COLUMN "products"."length" IS 'Largo del producto en centímetros (para API Correo Argentino)';
COMMENT ON COLUMN "products"."sizeGuide" IS 'Guía de talles en formato JSON (estilo MercadoLibre)';

-- Eliminar campos antiguos de OCA del modelo Order (si existen)
ALTER TABLE "orders" DROP COLUMN IF EXISTS "ocaTrackingNumber";
ALTER TABLE "orders" DROP COLUMN IF EXISTS "ocaOrderId";

-- Agregar campos nuevos de Correo Argentino a orders
ALTER TABLE "orders"
ADD COLUMN IF NOT EXISTS "caTrackingNumber" TEXT,
ADD COLUMN IF NOT EXISTS "caShipmentId" TEXT,
ADD COLUMN IF NOT EXISTS "caExtOrderId" TEXT,
ADD COLUMN IF NOT EXISTS "shippingAgency" TEXT,
ADD COLUMN IF NOT EXISTS "shippingStreet" TEXT,
ADD COLUMN IF NOT EXISTS "shippingNumber" TEXT,
ADD COLUMN IF NOT EXISTS "shippingFloor" TEXT,
ADD COLUMN IF NOT EXISTS "shippingApartment" TEXT,
ADD COLUMN IF NOT EXISTS "shippingCity" TEXT,
ADD COLUMN IF NOT EXISTS "shippingProvince" TEXT,
ADD COLUMN IF NOT EXISTS "shippingPostalCode" TEXT;

-- Comentarios para campos de Correo Argentino
COMMENT ON COLUMN "orders"."caTrackingNumber" IS 'Número de tracking de Correo Argentino';
COMMENT ON COLUMN "orders"."caShipmentId" IS 'ID del envío en plataforma MiCorreo';
COMMENT ON COLUMN "orders"."caExtOrderId" IS 'ID externo único de la orden (para MiCorreo API)';
COMMENT ON COLUMN "orders"."shippingAgency" IS 'Código de sucursal de Correo Argentino (si shippingMethod = S)';

-- Eliminar índices antiguos de OCA (si existen)
DROP INDEX IF EXISTS "orders_ocaTrackingNumber_idx";

-- Crear índices nuevos para Correo Argentino
CREATE INDEX IF NOT EXISTS "orders_caTrackingNumber_idx" ON "orders"("caTrackingNumber");
CREATE INDEX IF NOT EXISTS "orders_caExtOrderId_idx" ON "orders"("caExtOrderId");

-- Actualizar registros existentes con valores por defecto
UPDATE "products"
SET
  "weight" = COALESCE("weight", 1000),
  "height" = COALESCE("height", 10),
  "width" = COALESCE("width", 20),
  "length" = COALESCE("length", 30)
WHERE "weight" IS NULL OR "height" IS NULL OR "width" IS NULL OR "length" IS NULL;
