import { generateEmailHtml } from "../base";

/**
 * Email al cliente cuando uno de sus productos favoritos baja de precio.
 */
export const getWishlistPriceDropEmail = (params: {
  customerName: string;
  productName: string;
  oldPrice: number;
  newPrice: number;
  productUrl: string;
}): string => {
  const { customerName, productName, oldPrice, newPrice, productUrl } = params;
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  return generateEmailHtml({
    customerName,
    orderId: "",
    title: "📉 ¡Bajó el precio de un favorito!",
    color: "#10b981",
    message: `¡Buenas noticias! Uno de tus productos favoritos bajó de precio.<br><br>
    <strong>${productName}</strong><br>
    ~~$${oldPrice.toFixed(2)}~~ → <strong style="color:#16a34a; font-size:18px;">$${newPrice.toFixed(2)}</strong><br>
    <span style="color:#16a34a;">↓ ${discount}% de descuento</span><br><br>
    ¡Aprovechá antes de que se agote!`,
    orderUrl: productUrl,
    customButtonText: "🛍️ Comprar Ahora",
  });
};

/**
 * Email cuando el cliente comparte su lista de favoritos por link.
 */
export const getWishlistSharedEmail = (params: {
  customerName: string;
  shareUrl: string;
  itemCount: number;
}): string => {
  const { customerName, shareUrl, itemCount } = params;

  return generateEmailHtml({
    customerName,
    orderId: "",
    title: "❤️ Lista de favoritos compartida",
    color: "#ec4899",
    message: `Compartiste tu lista de ${itemCount} producto${itemCount !== 1 ? "s" : ""} favorito${itemCount !== 1 ? "s" : ""}.<br><br>
    Cualquier persona con este link puede ver tu lista.`,
    orderUrl: shareUrl,
    customButtonText: "Ver Mi Lista",
  });
};

/**
 * Email al cliente cuando un producto de su wishlist vuelve a tener stock.
 */
export const getWishlistBackInStockEmail = (params: {
  customerName: string;
  productName: string;
  productUrl: string;
  stockCount?: number;
}): string => {
  const { customerName, productName, productUrl, stockCount } = params;

  return generateEmailHtml({
    customerName,
    orderId: "",
    title: "🎉 ¡Volvió al stock!",
    color: "#f59e0b",
    message: `¡El producto que te gustaba volvió a estar disponible!<br><br>
    <strong>${productName}</strong><br><br>
    ${stockCount ? `Quedan solo <strong>${stockCount} unidades</strong>. ` : ""}¡No te lo pierdas esta vez!`,
    orderUrl: productUrl,
    customButtonText: "Ver Producto",
  });
};
