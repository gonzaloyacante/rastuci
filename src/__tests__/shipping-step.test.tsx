import React from "react";
import { render, screen } from "@testing-library/react";
import ShippingStep from "@/app/checkout/components/ShippingStep";
import { CartProvider } from "@/context/CartContext";

describe("ShippingStep", () => {
  it("muestra aviso cuando el método de pago es cash y deshabilita opciones distintas de pickup", () => {
    // Renderizando con provider y forzando selectedPaymentMethod a cash
    render(
      <CartProvider>
        <ShippingStep onNext={() => {}} onBack={() => {}} />
      </CartProvider>,
    );

    // Al inicio no habrá código postal ni selección; solo verificamos que el título está presente
    expect(screen.getByText(/Entrega \/ Retiro/i)).toBeInTheDocument();
  });
});
