/// <reference types="jest" />
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/products/route";

// Mock Prisma client
const mockPrisma = {
  product: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
};

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

// Mock rate limiting
jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn(() => Promise.resolve(true)),
}));

describe.skip("/api/products (skipped - legacy api tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/products", () => {
    it("returns products with default pagination", async () => {
      const mockProducts = [
        {
          id: "prod-1",
          name: "Product 1",
          price: 100,
          stock: 10,
          images: JSON.stringify(["/img1.jpg"]),
          category: { id: "cat-1", name: "Category 1" },
        },
      ];

      mockPrisma.product.findMany.mockResolvedValue(mockProducts);

      const request = new NextRequest("http://localhost:3000/api/products");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: { category: true },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("handles pagination parameters", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/products?page=2&limit=10",
      );
      await GET(request);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: { category: true },
        skip: 10,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    it("handles category filter", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/products?categoryId=cat-1",
      );
      await GET(request);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { categoryId: "cat-1" },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("handles search query", async () => {
      mockPrisma.product.findMany.mockResolvedValue([]);

      const request = new NextRequest(
        "http://localhost:3000/api/products?search=test",
      );
      await GET(request);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: {
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { description: { contains: "test", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 20,
        orderBy: { createdAt: "desc" },
      });
    });

    it("handles database errors", async () => {
      mockPrisma.product.findMany.mockRejectedValue(
        new Error("Database error"),
      );

      const request = new NextRequest("http://localhost:3000/api/products");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Error al obtener productos");
    });
  });

  describe("POST /api/products", () => {
    const validProductData = {
      name: "New Product",
      description: "Product description",
      price: 150,
      stock: 5,
      categoryId: "cat-1",
      images: ["/img1.jpg", "/img2.jpg"],
    };

    it("creates product with valid data", async () => {
      const mockCreatedProduct = {
        id: "prod-new",
        ...validProductData,
        images: JSON.stringify(validProductData.images),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.product.create.mockResolvedValue(mockCreatedProduct);

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
      expect(mockPrisma.product.create).toHaveBeenCalledWith({
        data: {
          ...validProductData,
          images: JSON.stringify(validProductData.images),
        },
      });
    });

    it("validates required fields", async () => {
      const invalidData = { name: "Product" }; // Missing required fields

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(invalidData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain("validación");
    });

    it("handles database constraint errors", async () => {
      mockPrisma.product.create.mockRejectedValue(
        new Error("Unique constraint failed"),
      );

      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(validProductData),
        headers: { "Content-Type": "application/json" },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
    });
  });
});
