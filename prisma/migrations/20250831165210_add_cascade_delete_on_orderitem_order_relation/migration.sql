-- DropForeignKey
ALTER TABLE "public"."order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
