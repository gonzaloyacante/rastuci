import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { PaymentMethodSelector } from "../../src/components/checkout/PaymentMethodSelector";

describe("PaymentMethodSelector", () => {
  it("muestra solo los métodos permitidos por allowedMethods", () => {
    const onChange = vi.fn();
    render(
      <PaymentMethodSelector
        selectedMethod=""
        onMethodChange={onChange}
        allowedMethods={["mercadopago"]}
      />,
    );

    // Debe mostrar solo un botón (MercadoPago) y no Efectivo
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(1);
    expect(screen.queryByText(/Efectivo/i)).toBeNull();
  });
});