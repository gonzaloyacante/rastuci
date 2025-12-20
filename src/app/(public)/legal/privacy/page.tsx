import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de Rastuci",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-content-primary mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none space-y-6 text-content-secondary">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              1. Información que Recopilamos
            </h2>
            <p className="mb-4">
              En Rastuci, recopilamos la siguiente información cuando realizas
              una compra o creas una cuenta:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Datos personales:</strong> nombre, correo electrónico,
                teléfono
              </li>
              <li>
                <strong>Datos de envío:</strong> dirección, ciudad, código
                postal
              </li>
              <li>
                <strong>Datos de pago:</strong> procesados de forma segura por
                MercadoPago (no almacenamos información de tarjetas)
              </li>
              <li>
                <strong>Datos de navegación:</strong> cookies, dirección IP,
                tipo de navegador
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              2. Uso de la Información
            </h2>
            <p className="mb-4">Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Procesar y gestionar tus pedidos</li>
              <li>Enviarte confirmaciones y actualizaciones de envío</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>
                Enviarte comunicaciones de marketing (con tu consentimiento)
              </li>
              <li>Cumplir con obligaciones legales y fiscales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              3. Protección de Datos
            </h2>
            <p className="mb-4">
              Implementamos medidas de seguridad técnicas y organizativas para
              proteger tu información personal contra acceso no autorizado,
              pérdida o alteración. Cumplimos con la{" "}
              <strong>Ley de Protección de Datos Personales 25.326</strong> de
              Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              4. Compartir Información
            </h2>
            <p className="mb-4">
              No vendemos ni alquilamos tu información personal a terceros.
              Compartimos datos únicamente con:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>MercadoPago:</strong> para procesar pagos de forma
                segura
              </li>
              <li>
                <strong>Correo Argentino:</strong> para gestionar envíos
              </li>
              <li>
                <strong>Proveedores de servicios:</strong> que nos ayudan a
                operar el sitio (hosting, analíticas)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              5. Tus Derechos
            </h2>
            <p className="mb-4">
              Tienes derecho a acceder, rectificar, actualizar o eliminar tu
              información personal en cualquier momento. Para ejercer estos
              derechos, contáctanos en{" "}
              <a
                href="mailto:privacidad@rastuci.com"
                className="text-primary hover:underline"
              >
                privacidad@rastuci.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              6. Cookies
            </h2>
            <p className="mb-4">
              Utilizamos cookies para mejorar tu experiencia en nuestro sitio.
              Puedes configurar tu navegador para rechazar cookies, pero esto
              puede afectar la funcionalidad del sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              7. Cambios en esta Política
            </h2>
            <p className="mb-4">
              Nos reservamos el derecho de actualizar esta política en cualquier
              momento. Te notificaremos sobre cambios significativos publicando
              la nueva política en esta página.
            </p>
            <p className="text-sm text-content-tertiary">
              Última actualización: {new Date().toLocaleDateString("es-AR")}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              8. Contacto
            </h2>
            <p>
              Para cualquier consulta sobre esta política de privacidad,
              contáctanos en:
            </p>
            <ul className="list-none space-y-2 mt-4">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacidad@rastuci.com"
                  className="text-primary hover:underline"
                >
                  privacidad@rastuci.com
                </a>
              </li>
              <li>
                <strong>Teléfono:</strong> +54 9 11 1234-5678
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
