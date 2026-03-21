import { generateEmailHtml, STATUS_COLORS } from "./base";

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
    message: `Nos alegra tenerte en nuestra comunidad.<br><br>
    Tu cuenta ha sido creada exitosamente.<br>
    Email: <strong>${params.email}</strong><br><br>
    Ahora puedes acceder a tu panel para ver tus compras y gestionar tu perfil.`,
    orderUrl: params.loginUrl,
    customButtonText: "Iniciar Sesión",
  });
};
