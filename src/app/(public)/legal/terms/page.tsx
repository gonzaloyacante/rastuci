import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de Rastuci E-commerce",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-content-primary mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none space-y-6 text-content-secondary">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="mb-4">
              Al acceder y utilizar el sitio web de Rastuci, aceptas cumplir con
              estos términos y condiciones. Si no estás de acuerdo con alguna
              parte de estos términos, no debes utilizar nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              2. Uso del Sitio
            </h2>
            <p className="mb-4">
              Este sitio web está destinado exclusivamente para uso personal y
              no comercial. No puedes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usar el sitio para fines ilegales o fraudulentos</li>
              <li>Intentar acceder a áreas restringidas sin autorización</li>
              <li>Distribuir virus o código malicioso</li>
              <li>Copiar, modificar o distribuir contenido sin permiso</li>
              <li>Interferir con el funcionamiento normal del sitio</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              3. Productos y Precios
            </h2>
            <p className="mb-4">
              Nos esforzamos por mantener la información de productos y precios
              actualizada. Sin embargo:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Los precios están expresados en pesos argentinos (ARS) e
                incluyen IVA
              </li>
              <li>
                Los precios pueden cambiar sin previo aviso, pero no afectarán
                pedidos ya confirmados
              </li>
              <li>
                Las imágenes de productos son orientativas y pueden diferir
                levemente del producto real
              </li>
              <li>
                Nos reservamos el derecho de limitar cantidades de compra por
                producto
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              4. Proceso de Compra
            </h2>
            <p className="mb-4">Al realizar una compra:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Recibirás un email de confirmación una vez procesado el pago
              </li>
              <li>
                El contrato de compra se perfecciona al recibir la confirmación
                del pedido
              </li>
              <li>
                Los tiempos de entrega son estimados y dependen del método de
                envío seleccionado
              </li>
              <li>
                Nos reservamos el derecho de cancelar pedidos en caso de falta
                de stock o problemas con el pago
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              5. Pagos
            </h2>
            <p className="mb-4">
              Aceptamos pagos mediante <strong>MercadoPago</strong>. Al procesar
              tu pago:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Tus datos de pago son procesados de forma segura por MercadoPago
              </li>
              <li>No almacenamos información de tarjetas de crédito/débito</li>
              <li>El cargo se realizará al momento de confirmar el pedido</li>
              <li>
                En caso de problemas con el pago, te contactaremos por email
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              6. Envíos
            </h2>
            <p className="mb-4">Ofrecemos las siguientes opciones de envío:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Retiro en tienda:</strong> sin costo, disponible en
                24-48 horas
              </li>
              <li>
                <strong>Envío estándar:</strong> 5-7 días hábiles
              </li>
              <li>
                <strong>Envío express:</strong> 2-3 días hábiles
              </li>
              <li>
                <strong>Correo Argentino:</strong> según zona de destino
              </li>
            </ul>
            <p className="mt-4">
              Los costos de envío se calculan automáticamente según el método
              seleccionado y la dirección de entrega.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              7. Cambios y Devoluciones
            </h2>
            <p className="mb-4">
              Según la <strong>Ley de Defensa del Consumidor 24.240</strong>:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Tienes derecho a arrepentimiento dentro de los 10 días corridos
                desde la recepción del producto
              </li>
              <li>
                Para ejercer este derecho, el producto debe estar en su estado
                original, sin uso, con etiquetas y embalaje
              </li>
              <li>
                El reembolso se realizará dentro de los 15 días hábiles
                posteriores al retiro del producto
              </li>
              <li>
                En caso de productos defectuosos, ofrecemos cambio o devolución
                inmediata
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              8. Propiedad Intelectual
            </h2>
            <p className="mb-4">
              Todo el contenido de este sitio (textos, imágenes, logos, diseño)
              es propiedad de Rastuci y está protegido por las leyes de derechos
              de autor. No puedes reproducir, distribuir o modificar ningún
              contenido sin autorización previa por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              9. Limitación de Responsabilidad
            </h2>
            <p className="mb-4">
              Rastuci no será responsable por daños indirectos, incidentales o
              consecuentes que puedan surgir del uso del sitio o la compra de
              productos, excepto cuando la ley lo requiera.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              10. Modificaciones
            </h2>
            <p className="mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier
              momento. Los cambios entrarán en vigencia al ser publicados en
              esta página. Te recomendamos revisar periódicamente estos
              términos.
            </p>
            <p className="text-sm text-content-tertiary">
              Última actualización: {new Date().toLocaleDateString("es-AR")}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              11. Jurisdicción
            </h2>
            <p className="mb-4">
              Estos términos se rigen por las leyes de la República Argentina.
              Cualquier disputa se resolverá en los tribunales competentes de
              Buenos Aires, Argentina.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-content-primary mb-4">
              12. Contacto
            </h2>
            <p>
              Para consultas sobre estos términos y condiciones, contáctanos en:
            </p>
            <ul className="list-none space-y-2 mt-4">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@rastuci.com"
                  className="text-primary hover:underline"
                >
                  info@rastuci.com
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
