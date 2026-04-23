import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCategories } from "@/hooks/useCategories";

// Mock SWR (implementación actual de useCategories)
const mockUseSWR = vi.hoisted(() => vi.fn());

vi.mock("swr", () => ({
  default: mockUseSWR,
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

  it("debe retornar categorías desde SWR", async () => {
    mockUseSWR.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.error).toBeNull();
  });

  it("debe manejar errores de SWR", async () => {
    const mockError = new Error("Network error");
    mockUseSWR.mockReturnValue({
      data: undefined,
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

  it("debe iniciar con loading true mientras carga", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toEqual([]);
  });

  it("debe retornar array vacío si no hay data", () => {
    mockUseSWR.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toEqual([]);
  });

  it("debe proporcionar función mutate para refetch", () => {
    const mockMutate = vi.fn();
    mockUseSWR.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: undefined,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useCategories());

    result.current.mutate();

    expect(mockMutate).toHaveBeenCalled();
  });

  it("debe manejar array vacío de categorías", () => {
    mockUseSWR.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    const { result } = renderHook(() => useCategories());

    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("debe usar dedupingInterval de 10 minutos en SWR", () => {
    mockUseSWR.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    renderHook(() => useCategories());

    expect(mockUseSWR).toHaveBeenCalledWith(
      expect.stringContaining("/api/categories"),
      expect.any(Function),
      expect.objectContaining({
        dedupingInterval: 10 * 60 * 1000,
      })
    );
  });

  it("debe mantener referencia de categorías entre renders", () => {
    mockUseSWR.mockReturnValue({
      data: mockCategories,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    const { result, rerender } = renderHook(() => useCategories());

    const firstCategories = result.current.categories;

    rerender();

    expect(result.current.categories).toBe(firstCategories);
  });
});
