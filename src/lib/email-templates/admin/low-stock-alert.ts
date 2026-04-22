import { generateEmailHtml, STATUS_COLORS } from "../base";

export const getLowStockAlertEmail = (params: {
  productName: string;
  currentStock: number;
  productId: string;
}): string => {
  return generateEmailHtml({
    customerName: "Admin",
    orderId: "",
    title: "⚠️ Alerta de Stock Bajo",
    color: STATUS_COLORS.error,
    message: `El producto <strong>${params.productName}</strong> tiene pocas unidades.<br><br>
    <strong>Stock Actual: ${params.currentStock}</strong><br><br>
    Te recomendamos reponer inventario pronto o pausar la publicación del producto.`,
    orderUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com"}/admin/products/${params.productId}`,
    customButtonText: "Ver Producto",
  });
};
