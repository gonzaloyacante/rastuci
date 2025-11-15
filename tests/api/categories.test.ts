import { GET, POST } from "@/app/api/categories/route";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    category: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
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

// Mock admin auth
vi.mock("@/lib/adminAuth", () => ({
  withAdminAuth: (handler: unknown) => handler,
}));

const mockPrisma = prisma as unknown as {
  category: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe("Categories API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/categories", () => {
    it("debe retornar lista de categorías paginadas", async () => {
      const mockCategories = [
        {
          id: "cat-1",
          name: "Electrónica",
          description: "Productos electrónicos",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "cat-2",
          name: "Ropa",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.category.findMany.mockResolvedValue(mockCategories);
      mockPrisma.category.count.mockResolvedValue(2);

      const request = new NextRequest(
        "http://localhost:3000/api/categories?page=1&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.data).toHaveLength(2);
      expect(data.data?.total).toBe(2);
      expect(data.data?.page).toBe(1);
      expect(data.data?.limit).toBe(10);
    });

    it("debe aplicar búsqueda por nombre", async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: "cat-1",
          name: "Electrónica",
          description: "Productos electrónicos",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrisma.category.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/categories?search=Electr"
      );
      await GET(request);

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: "Electr" }),
              }),
            ]),
          }),
        })
      );
    });

    it("debe incluir conteo de productos si se solicita", async () => {
      mockPrisma.category.findMany.mockResolvedValue([
        {
          id: "cat-1",
          name: "Electrónica",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { products: 5 },
        },
      ]);
      mockPrisma.category.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/categories?includeProductCount=true"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data?.data[0]).toHaveProperty("productCount");
    });

    it("debe calcular totalPages correctamente", async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);
      mockPrisma.category.count.mockResolvedValue(25);

      const request = new NextRequest(
        "http://localhost:3000/api/categories?page=1&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data?.totalPages).toBe(3); // 25 / 10 = 3 páginas
    });

    it("debe retornar 400 si los parámetros son inválidos", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/categories?page=invalid"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("POST /api/categories", () => {
    it("debe crear nueva categoría con datos válidos", async () => {
      const newCategory = {
        id: "cat-new",
        name: "Nueva Categoría",
        description: "Descripción de prueba",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(newCategory);

      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "Nueva Categoría",
          description: "Descripción de prueba",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.name).toBe("Nueva Categoría");
    });

    it("debe retornar 409 si ya existe categoría con ese nombre", async () => {
      mockPrisma.category.findUnique.mockResolvedValue({
        id: "cat-existing",
        name: "Existente",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "Existente",
          description: "Test",
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Ya existe una categoría con ese nombre");
    });

    it("debe retornar 400 si faltan campos requeridos", async () => {
      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: JSON.stringify({
          description: "Solo descripción",
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

    it("debe permitir crear categoría sin descripción", async () => {
      const newCategory = {
        id: "cat-new",
        name: "Sin Descripción",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(newCategory);

      const request = new NextRequest("http://localhost:3000/api/categories", {
        method: "POST",
        body: JSON.stringify({
          name: "Sin Descripción",
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
  });
});
