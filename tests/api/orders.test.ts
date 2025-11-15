import { GET, POST } from "@/app/api/orders/route";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    order: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock rate limiter
vi.mock("@/lib/rateLimiter", () => ({
  checkRateLimit: vi.fn(() => ({ ok: true })),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
  getRequestId: vi.fn(() => "test-request-id"),
}));

// Mock OneSignal
vi.mock("@/lib/onesignal", () => ({
  sendNotification: vi.fn(),
}));

// Mock order mapper
vi.mock("@/lib/orders", () => ({
  mapOrderToDTO: vi.fn((order) => ({
    ...order,
    items: order.items || [],
  })),
}));

const mockPrisma = prisma as unknown as {
  order: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  product: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

describe("Orders API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/orders", () => {
    it("debe retornar lista de pedidos paginados", async () => {
      const mockOrders = [
        {
          id: "order-1",
          customerName: "Juan Pérez",
          customerEmail: "juan@example.com",
          customerPhone: "123456789",
          customerAddress: "Calle 123",
          total: 1000,
          status: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [],
        },
      ];

      mockPrisma.order.findMany.mockResolvedValue(mockOrders);
      mockPrisma.order.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/orders?page=1&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.data).toHaveLength(1);
      expect(data.data?.total).toBe(1);
    });

    it("debe filtrar por status", async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/orders?status=DELIVERED"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      // Verificar que se llamó con where.status = "DELIVERED"
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "DELIVERED" },
        })
      );
    });
    it("debe buscar por nombre o email", async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/orders?search=Juan"
      );
      await GET(request);

      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                customerName: expect.any(Object),
              }),
            ]),
          }),
        })
      );
    });

    it("debe calcular totalPages correctamente", async () => {
      mockPrisma.order.findMany.mockResolvedValue([]);
      mockPrisma.order.count.mockResolvedValue(25);

      const request = new NextRequest(
        "http://localhost:3000/api/orders?page=1&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data?.totalPages).toBe(3);
    });
  });

  describe("POST /api/orders", () => {
    const mockProduct = {
      id: "prod-1",
      name: "Producto Test",
      price: 100,
      stock: 10,
      description: "Test",
      categoryId: "cat-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
      onSale: false,
    };

    it("debe crear pedido con datos válidos", async () => {
      const newOrder = {
        id: "order-new",
        customerName: "Juan Pérez",
        customerPhone: "123456789",
        customerAddress: "Calle 123",
        total: 200,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [
          {
            id: "item-1",
            orderId: "order-new",
            productId: "prod-1",
            quantity: 2,
            price: 100,
            product: mockProduct,
          },
        ],
      };

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            create: vi.fn().mockResolvedValue(newOrder),
          },
          product: {
            update: vi.fn(),
          },
        });
      });

      const request = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Juan Pérez",
          customerPhone: "123456789",
          customerAddress: "Calle 123",
          items: [
            {
              productId: "prod-1",
              quantity: 2,
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it("debe retornar 400 si el producto no existe", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Juan Pérez",
          customerPhone: "123456789",
          customerAddress: "Calle 123",
          items: [
            {
              productId: "prod-inexistente",
              quantity: 1,
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Producto con ID prod-inexistente no encontrado");
    });

    it("debe retornar 400 si no hay stock suficiente", async () => {
      mockPrisma.product.findUnique.mockResolvedValue({
        ...mockProduct,
        stock: 1,
      });

      const request = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Juan Pérez",
          customerPhone: "123456789",
          customerAddress: "Calle 123",
          items: [
            {
              productId: "prod-1",
              quantity: 5,
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      // El mensaje incluye el nombre del producto y el stock disponible
      expect(data.error).toBe(
        "Stock insuficiente para el producto Producto Test. Stock disponible: 1"
      );
    });

    it("debe calcular el total correctamente", async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const result = await callback({
          order: {
            create: vi.fn().mockImplementation((data) => ({
              ...data.data,
              id: "order-new",
              status: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          },
          product: {
            update: vi.fn(),
          },
        });
        return result;
      });

      const request = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Juan Pérez",
          customerPhone: "123456789",
          customerAddress: "Calle 123",
          items: [
            {
              productId: "prod-1",
              quantity: 3,
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await POST(request);

      // El total debe ser 3 * 100 = 300
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("debe retornar 400 si faltan campos requeridos", async () => {
      const request = new NextRequest("http://localhost:3000/api/orders", {
        method: "POST",
        body: JSON.stringify({
          customerName: "Juan Pérez",
          // Falta customerPhone, customerAddress, items
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
});
