import { TrackingValidator } from "@/components/tracking/TrackingValidator";
import { Info, Search } from "lucide-react";
import Link from "next/link";

export default function TrackingPage() {
  return (
    <div className="py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Search className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">
              Seguimiento de Envíos
            </h1>
          </div>
          <p className="muted max-w-2xl mx-auto">
            Ingresa tu número de tracking para verificar el estado actual de tu
            envío. Nuestro sistema valida la información directamente con Correo
            Argentino para brindarte datos precisos y actualizados.
          </p>
        </div>

        {/* Buscador principal */}
        <div className="max-w-xl mx-auto mb-8">
          <TrackingValidator
            placeholder="Ejemplo: 0123456789"
            showDetails={true}
          />
        </div>

        {/* Información adicional */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="surface border border-muted rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary">
                  ¿Dónde encontrar tu tracking?
                </h3>
              </div>
            </div>
            <ul className="space-y-2 text-sm muted">
              <li>• En el email de confirmación de tu pedido</li>
              <li>• En la página de confirmación después de la compra</li>
              <li>• En la sección "Mis Pedidos" de tu cuenta</li>
              <li>• En el SMS que enviamos cuando despachamos tu pedido</li>
            </ul>
          </div>

          <div className="surface border border-muted rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <Search className="w-6 h-6 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-primary">Estados de envío</h3>
              </div>
            </div>
            <ul className="space-y-2 text-sm muted">
              <li>
                <span className="text-warning">• Preparación:</span> Tu pedido
                está siendo empaquetado
              </li>
              <li>
                <span className="text-primary">• En tránsito:</span> Tu pedido
                está camino a destino
              </li>
              <li>
                <span className="text-primary">• En distribución:</span> Será
                entregado pronto
              </li>
              <li>
                <span className="text-success">• Entregado:</span> Tu pedido
                llegó a destino
              </li>
            </ul>
          </div>
        </div>

        {/* Proveedores de envío */}
        <div className="surface border border-muted rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-primary">
                Proveedores de envío
              </h3>
            </div>
          </div>
          <p className="text-sm muted mb-3">
            Trabajamos con Correo Argentino para garantizar que tu pedido llegue
            en tiempo y forma:
          </p>
          <div className="p-4 bg-primary/5 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">
              Correo Argentino
            </h4>
            <p className="text-sm muted">
              Red nacional con más de 1000 sucursales. Seguimiento en tiempo
              real, entrega puerta a puerta y retiro en sucursal disponible para
              mayor flexibilidad.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="surface border border-muted rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-4">
            <details className="group">
              <summary className="font-medium text-primary cursor-pointer list-none flex items-center justify-between">
                ¿Mi tracking no aparece, qué hago?
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-2 text-sm muted pl-4">
                <p>Si tu tracking no aparece, puede ser por estas razones:</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    • El envío aún no fue procesado por el proveedor (espera
                    24-48hs)
                  </li>
                  <li>• Verifica que el número esté escrito correctamente</li>
                  <li>• Tu pedido puede estar siendo preparado aún</li>
                  <li>• Los tiempos de actualización pueden variar</li>
                </ul>
              </div>
            </details>

            <details className="group">
              <summary className="font-medium text-primary cursor-pointer list-none flex items-center justify-between">
                ¿Cuánto tiempo tarda en actualizarse?
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-2 text-sm muted pl-4">
                <p>El tracking se actualiza automáticamente:</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    • Cada vez que el paquete pasa por un centro de distribución
                  </li>
                  <li>• Cuando sale para entrega</li>
                  <li>• Cuando es entregado exitosamente</li>
                  <li>
                    • Puede haber demoras de 2-4 horas en las actualizaciones
                  </li>
                </ul>
              </div>
            </details>

            <details className="group">
              <summary className="font-medium text-primary cursor-pointer list-none flex items-center justify-between">
                ¿Puedo cambiar la dirección de entrega?
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="mt-2 text-sm muted pl-4">
                <p>
                  Una vez que el envío está en tránsito, no es posible cambiar
                  la dirección. Si necesitas modificarla, contáctanos
                  inmediatamente para ver si podemos interceptar el paquete
                  antes del despacho.
                </p>
              </div>
            </details>
          </div>
        </div>

        {/* Enlaces útiles */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm muted">¿No encuentras lo que buscas?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a href="/contacto" className="text-primary hover:underline">
              Contactar Soporte
            </a>
            <a
              href="https://www.correoargentino.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Correo Argentino
            </a>
            <Link href="/orders" className="text-primary hover:underline">
              Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
