import { useCategories } from "@/hooks/useCategories";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock useGlobalCache (usar vi.hoisted para evitar errores de inicialización)
const mockUseGlobalCache = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/useGlobalCache", () => ({
  default: mockUseGlobalCache,
}));

describe("useCategories Hook", () => {
  const mockCategories = [
    {
      id: "1",
      name: "Electrónica",
      description: "Productos electrónicos",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      name: "Ropa",
      description: "Indumentaria",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe retornar categorías desde el cache", async () => {
    mockUseGlobalCache.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it("debe manejar errores desde el cache", async () => {
    const mockError = new Error("Network error");
    mockUseGlobalCache.mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBe("Network error");
  });

  it("debe iniciar con loading true", () => {
    mockUseGlobalCache.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toEqual([]);
  });

  it("debe retornar array vacío si no hay data", () => {
    mockUseGlobalCache.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toEqual([]);
  });

  it("debe proporcionar función mutate para refetch", () => {
    const mockMutate = vi.fn();
    mockUseGlobalCache.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useCategories());

    result.current.mutate();

    expect(mockMutate).toHaveBeenCalled();
  });

  it("debe manejar array vacío de categorías", () => {
    mockUseGlobalCache.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("debe usar cache para optimizar rendimiento", () => {
    mockUseGlobalCache.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toBe(mockCategories);
    expect(mockUseGlobalCache).toHaveBeenCalledWith(
      "categories",
      expect.any(Function),
      expect.objectContaining({
        ttl: 600000, // 10 minutos
      })
    );
  });

  it("debe mantener referencia de categorías entre renders", () => {
    mockUseGlobalCache.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: null,
      mutate: vi.fn(),
    });

    const { result, rerender } = renderHook(() => useCategories());

    const firstCategories = result.current.categories;

    rerender();

    expect(result.current.categories).toBe(firstCategories);
  });
});
