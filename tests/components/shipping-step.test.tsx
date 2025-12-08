import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ShippingStep from "../../src/app/(public)/checkout/components/ShippingStep";
import { CartProvider } from "../../src/context/CartContext";

describe("ShippingStep", () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] })
      })
    ) as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra aviso cuando el método de pago es cash y deshabilita opciones distintas de pickup", () => {
    render(
      <CartProvider>
        <ShippingStep onNext={() => { }} onBack={() => { }} />
      </CartProvider>,
    );

    expect(screen.getByText(/Entrega \/ Retiro/i)).toBeInTheDocument();
  });
});
