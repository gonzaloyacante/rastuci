"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";

/**
 * Botón de Arrepentimiento - Resolución 424/2020 de la Secretaría de Comercio Interior
 * Obligatorio para todo e-commerce en Argentina.
 * El consumidor puede arrepentirse de la compra dentro de los 10 días hábiles
 * de recibido el producto, sin expresión de causa.
 */
export default function RepentanceButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <span aria-hidden="true" className="text-xs text-muted">
        ↩
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center text-xs text-muted hover:text-primary underline underline-offset-2 transition-colors"
      >
        Botón de Arrepentimiento
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="repentance-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

          {/* Modal */}
          <div className="relative surface rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h2
              id="repentance-title"
              className="text-lg font-bold flex items-center gap-2"
            >
              <span aria-hidden="true">↩</span>
              Derecho de Arrepentimiento
            </h2>

            <div className="text-sm space-y-3 text-muted">
              <p>
                De acuerdo con la{" "}
                <strong className="text-foreground">
                  Ley 24.240 (Art. 34)
                </strong>{" "}
                y la{" "}
                <strong className="text-foreground">Resolución 424/2020</strong>{" "}
                de la Secretaría de Comercio Interior, tenés derecho a
                arrepentirte de tu compra dentro de los{" "}
                <strong className="text-foreground">
                  10 días hábiles desde que recibiste el producto
                </strong>
                , sin necesidad de dar explicaciones.
              </p>

              <div className="rounded-lg bg-surface-secondary p-4 space-y-2">
                <p className="font-semibold text-foreground">
                  ¿Cómo ejercer este derecho?
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Enviá un email a{" "}
                    <a
                      href="mailto:contacto@rastuci.com.ar"
                      className="underline hover:text-primary"
                    >
                      contacto@rastuci.com.ar
                    </a>{" "}
                    dentro de los 10 días hábiles de recibido el producto.
                  </li>
                  <li>
                    Indicá tu nombre, número de pedido y motivo (opcional).
                  </li>
                  <li>
                    El producto debe estar en su estado original, sin uso y con
                    sus etiquetas.
                  </li>
                  <li>
                    Te reintegraremos el importe pagado dentro de los plazos
                    legales.
                  </li>
                </ol>
              </div>

              <p className="text-xs">
                También podés hacer tu consulta o reclamo en el portal oficial
                del Gobierno de Argentina:{" "}
                <a
                  href="https://www.argentina.gob.ar/produccion/defensadelconsumidor/formulario"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-primary"
                >
                  Defensa del Consumidor
                </a>
                .
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
