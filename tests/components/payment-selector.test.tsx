import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { PaymentMethodSelector } from "../../src/components/checkout/PaymentMethodSelector";

describe("PaymentMethodSelector", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: true,
            data: [
              {
                id: "mercadopago",
                name: "Mercado Pago",
                description: "Paga con tarjetas o dinero en cuenta",
                icon: "credit-card",
              },
              {
                id: "cash",
                name: "Efectivo",
                description: "Paga al retirar",
                icon: "banknote",
              },
            ],
          }),
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra solo los métodos permitidos por allowedMethods", async () => {
    const onChange = vi.fn();
    render(
      <PaymentMethodSelector
        selectedMethod=""
        onMethodChange={onChange}
        allowedMethods={["mercadopago"]}
      />,
    );

    // Esperar a que se carguen los datos
    await screen.findByText("Mercado Pago");

    // Debe mostrar solo un botón (MercadoPago) y no Efectivo
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(1);
    expect(screen.queryByText(/Efectivo/i)).toBeNull();
  });
});