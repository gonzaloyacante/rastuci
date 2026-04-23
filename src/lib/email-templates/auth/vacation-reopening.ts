import { generateEmailHtml } from "../base";

/**
 * Email de reapertura de tienda tras modo vacaciones.
 * Funciona para AMBOS tipos de suscriptores:
 *  - Usuarios sin cuenta que solo ingresaron su email en el formulario de la web
 *  - Usuarios registrados que activaron la notificación
 * El contenido es idéntico en ambos casos: el sistema simplemente pasa el email.
 */
export const getVacationReopeningEmail = (params: {
  customerName?: string;
}): string => {
  return generateEmailHtml({
    customerName: params.customerName || "Cliente",
    orderId: "",
    title: "¡Ya volvimos!",
    color: "#10b981",
    message: `Nos alegra contarte que <strong>Rastuci</strong> está abierto nuevamente.<br><br>
    Ya podés visitar la tienda y finalizar tu compra. ¡Gracias por esperarnos!<br><br>
    Si tenías productos en mente, te recomendamos revisarlos pronto — el stock es limitado.`,
    orderUrl: process.env.NEXT_PUBLIC_APP_URL || "https://rastuci.com",
    customButtonText: "🛍️ Ir a la Tienda",
  });
};
