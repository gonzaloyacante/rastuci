import { GET, POST } from "../../src/app/api/products/route";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma - use vi.hoisted() to avoid initialization issues
const mockPrismaClient = vi.hoisted(() => ({
  products: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categories: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  default: mockPrismaClient,
  prisma: mockPrismaClient,
}));

// Mock rate limiter
vi.mock("@/lib/rateLimiter", () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ ok: true })),
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
  getRequestId: vi.fn(() => "test-request-id"),
}));

// Mock admin auth - bypass authentication for tests
vi.mock("@/lib/adminAuth", () => ({
  withAdminAuth: (handler: unknown) => handler,
  auth: () => ({ user: { role: "admin" } }),
}));

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn().mockResolvedValue({ user: { isAdmin: true } }), // Default as admin to match previous behavior
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

const mockPrisma = mockPrismaClient as {
  products: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  categories: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

describe("Products API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("debe retornar lista de productos paginados", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Producto 1",
          description: "Descripción",
          price: 100,
          salePrice: null,
          stock: 10,
          onSale: false,
          images: "[]",
          colorImages: null,
          sizes: null,
          colors: null,
          rating: null,
          reviewCount: 0,
          variants: [],
          categories: { id: "cat-1", name: "Categoría 1" },
        },
      ];

      mockPrisma.products.findMany.mockResolvedValue(mockProducts);
      mockPrisma.products.count.mockResolvedValue(1);

      const request = new NextRequest(
        "http://localhost:3000/api/products?page=1&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.data).toHaveLength(1);
      expect(data.data?.total).toBe(1);
    });

    it("debe aplicar filtro de categoría", async () => {
      mockPrisma.products.findMany.mockResolvedValue([]);
      mockPrisma.products.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/products?categoryId=cat-1"
      );
      await GET(request);

      expect(mockPrisma.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: "cat-1",
          }),
        })
      );
    });

    it("debe aplicar búsqueda por texto", async () => {
      mockPrisma.products.findMany.mockResolvedValue([]);
      mockPrisma.products.count.mockResolvedValue(0);

      const request = new NextRequest(
        "http://localhost:3000/api/products?search=test"
      );
      await GET(request);

      expect(mockPrisma.products.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                name: expect.objectContaining({ contains: "test" }),
              }),
            ]),
          }),
        })
      );
    });

    it("debe calcular paginación correctamente", async () => {
      mockPrisma.products.findMany.mockResolvedValue([]);
      mockPrisma.products.count.mockResolvedValue(50);

      const request = new NextRequest(
        "http://localhost:3000/api/products?page=2&limit=10"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.data?.page).toBe(2);
      expect(data.data?.limit).toBe(10);
      expect(data.data?.totalPages).toBe(5);
    });

    it("debe retornar 400 si los parámetros son inválidos", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/products?page=invalid"
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe("POST /api/products", () => {
    const validProductData = {
      name: "Producto Nuevo",
      description: "Descripción del producto",
      price: 150,
      stock: 5,
      categoryId: "cat-1",
      images: ["/img1.jpg", "/img2.jpg"],
    };

    it("debe crear producto con datos válidos", async () => {
      const mockCategory = {
        id: "cat-1",
        name: "Categoría",
        description: null,
      };

      const mockCreatedProduct = {
        id: "prod-new",
        ...validProductData,
        salePrice: null,
        onSale: false,
        images: JSON.stringify(validProductData.images),
        categories: mockCategory,
        product_variants: [],
        product_color_images: [],
        product_size_guides: [],
        colorImages: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.categories.findUnique.mockResolvedValue(mockCategory);
      mockPrisma.products.create.mockResolvedValue(mockCreatedProduct);

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(validProductData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe("prod-new");
    });

    it("debe retornar 400 si faltan campos requeridos", async () => {
      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify({ name: "Solo nombre" }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("validación");
    });

    it("debe retornar 404 si la categoría no existe", async () => {
      mockPrisma.categories.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(validProductData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Categoría no encontrada");
    });
  });
});
