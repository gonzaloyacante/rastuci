import { generateEmailHtml, STATUS_COLORS } from "../base";

/**
 * Bienvenida al nuevo usuario registrado.
 * La cuenta permite: historial de compras, tracking, wishlist persistente y puntos de fidelidad.
 * El registro es OPCIONAL — las compras sin cuenta siguen funcionando igual.
 */
export const getWelcomeEmail = (params: {
  name: string;
  email: string;
  loginUrl: string;
}): string => {
  return generateEmailHtml({
    customerName: params.name,
    orderId: "",
    title: "¡Bienvenido a Rastuci!",
    color: STATUS_COLORS.processed,
    message: `Nos alegra tenerte como parte de nuestra comunidad.<br><br>
    Tu cuenta fue creada exitosamente con:<br>
    📧 <strong>${params.email}</strong><br><br>
    Con tu cuenta podés:<br>
    📋 Ver el historial y estado de todos tus pedidos<br>
    🚚 Hacer seguimiento de tus envíos<br>
    ❤️ Guardar tu lista de favoritos<br>
    🎁 Acumular puntos con cada compra y canjearlos por beneficios<br><br>
    Recordá que <strong>no es obligatorio</strong> iniciar sesión para comprar — podés seguir comprando como invitado cuando quieras.`,
    orderUrl: params.loginUrl,
    customButtonText: "Ir a Mi Cuenta",
  });
};
