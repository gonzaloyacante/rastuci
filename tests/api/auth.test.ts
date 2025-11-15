import { POST } from "@/app/api/auth/login/route";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

const mockBcrypt = bcrypt as unknown as {
  compare: ReturnType<typeof vi.fn>;
};

describe("Auth API - POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: unknown) => {
    return new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  describe("Validación de entrada", () => {
    it("debe retornar 400 si falta el email", async () => {
      const request = createRequest({ password: "password123" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain("obligatorios");
    });

    it("debe retornar 400 si falta la contraseña", async () => {
      const request = createRequest({ email: "test@example.com" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain("obligatorios");
    });

    it("debe retornar 400 si el email tiene formato inválido", async () => {
      const request = createRequest({
        email: "invalid-email",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error?.field).toBe("email");
      expect(data.error?.message).toContain("formato");
    });
  });

  describe("Autenticación de usuario", () => {
    it("debe retornar 401 si el usuario no existe", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const request = createRequest({
        email: "noexiste@example.com",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.field).toBe("email");
      expect(data.data?.userExists).toBe(false);
    });

    it("debe retornar 401 si la contraseña es incorrecta", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: "hashedpassword",
        isAdmin: true,
        name: "Test User",
      });
      mockBcrypt.compare.mockResolvedValue(false);

      const request = createRequest({
        email: "test@example.com",
        password: "wrongpassword",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.field).toBe("password");
      expect(data.data?.userExists).toBe(true);
      expect(data.data?.passwordCorrect).toBe(false);
    });

    it("debe retornar 403 si el usuario no es admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "test@example.com",
        password: "hashedpassword",
        isAdmin: false,
        name: "Test User",
      });
      mockBcrypt.compare.mockResolvedValue(true);

      const request = createRequest({
        email: "test@example.com",
        password: "correctpassword",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain("permisos");
    });

    it("debe retornar 200 con login exitoso para admin", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "admin@example.com",
        password: "hashedpassword",
        isAdmin: true,
        name: "Admin User",
      });
      mockBcrypt.compare.mockResolvedValue(true);

      const request = createRequest({
        email: "admin@example.com",
        password: "correctpassword",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data?.userExists).toBe(true);
      expect(data.data?.passwordCorrect).toBe(true);
    });

    it("debe normalizar el email a minúsculas", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "admin@example.com",
        password: "hashedpassword",
        isAdmin: true,
        name: "Admin User",
      });
      mockBcrypt.compare.mockResolvedValue(true);

      const request = createRequest({
        email: "ADMIN@EXAMPLE.COM",
        password: "correctpassword",
      });
      await POST(request);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "admin@example.com" },
        select: expect.any(Object),
      });
    });

    it("debe manejar usuarios OAuth sin contraseña", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "oauth@example.com",
        password: null,
        isAdmin: true,
        name: "OAuth User",
      });

      const request = createRequest({
        email: "oauth@example.com",
        password: "anypassword",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain("proveedor externo");
    });
  });

  describe("Manejo de errores", () => {
    it("debe retornar 500 si hay un error de base de datos", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      const request = createRequest({
        email: "test@example.com",
        password: "password123",
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error?.message).toContain("Error interno");
    });
  });
});
