import { POST } from "@/app/api/checkout/route";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    order: {
      create: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock MercadoPago
vi.mock("@/lib/mercadopago", () => ({
  createPreference: vi.fn(),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const mockPrisma = prisma as unknown as {
  order: {
    create: ReturnType<typeof vi.fn>;
  };
  product: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe("Checkout API - POST /api/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validCustomer = {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "123456789",
    address: "Calle 123",
    city: "Buenos Aires",
    province: "Buenos Aires",
    postalCode: "1000",
  };

  const validItems = [
    {
      productId: "prod-1",
      name: "Producto Test",
      quantity: 2,
      price: 100,
    },
  ];

  describe("Validación de entrada", () => {
    it("debe retornar 400 si items está vacío", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: [],
          customer: validCustomer,
          paymentMethod: "cash",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("carrito");
    });

    it("debe retornar 400 si falta customer", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          paymentMethod: "cash",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("cliente");
    });

    it("debe retornar 400 si falta paymentMethod", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("Pago en efectivo", () => {
    it("debe crear pedido con pago en efectivo", async () => {
      const mockOrder = {
        id: "order-1",
        customerName: "Juan Pérez",
        customerEmail: "juan@example.com",
        customerPhone: "123456789",
        customerAddress: "Calle 123, Buenos Aires, Buenos Aires",
        total: 200,
        status: "PENDING",
        mpPaymentId: null,
        mpPreferenceId: null,
        mpStatus: "cash_payment",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      };

      mockPrisma.order.create.mockResolvedValue(mockOrder);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
          paymentMethod: "cash",
          orderData: {
            total: 200,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.paymentMethod).toBe("cash");
      expect(data.orderId).toBe("order-1");
    });

    it("debe crear order items correctamente", async () => {
      mockPrisma.order.create.mockResolvedValue({
        id: "order-1",
        customerName: "Juan Pérez",
        customerEmail: "juan@example.com",
        customerPhone: "123456789",
        customerAddress: "Calle 123",
        total: 200,
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      });

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
          paymentMethod: "cash",
          orderData: {
            total: 200,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            items: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  productId: "prod-1",
                  quantity: 2,
                  price: 100,
                }),
              ]),
            }),
          }),
        })
      );
    });
  });

  describe("Información del cliente", () => {
    it("debe guardar nombre del cliente", async () => {
      mockPrisma.order.create.mockResolvedValue({
        id: "order-1",
        customerName: "Juan Pérez",
        total: 200,
        items: [],
      } as any);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
          paymentMethod: "cash",
          orderData: { total: 200 },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerName: "Juan Pérez",
          }),
        })
      );
    });

    it("debe guardar email del cliente", async () => {
      mockPrisma.order.create.mockResolvedValue({
        id: "order-1",
        customerEmail: "juan@example.com",
        total: 200,
        items: [],
      } as any);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
          paymentMethod: "cash",
          orderData: { total: 200 },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerEmail: "juan@example.com",
          }),
        })
      );
    });

    it("debe combinar dirección completa", async () => {
      mockPrisma.order.create.mockResolvedValue({
        id: "order-1",
        total: 200,
        items: [],
      } as any);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
          paymentMethod: "cash",
          orderData: { total: 200 },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            customerAddress: expect.stringContaining("Calle 123"),
          }),
        })
      );
    });
  });

  describe("Cálculo de totales", () => {
    it("debe usar el total proporcionado", async () => {
      mockPrisma.order.create.mockResolvedValue({
        id: "order-1",
        total: 500,
        items: [],
      } as any);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          items: validItems,
          customer: validCustomer,
          paymentMethod: "cash",
          orderData: { total: 500 },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: 500,
          }),
        })
      );
    });
  });
});
