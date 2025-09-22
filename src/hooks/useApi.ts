import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions<T> {
  initialData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  transform?: (data: unknown) => T;
}

interface ApiResponse<T> {
  data: T;
  error: string | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<void>;
  refresh: () => Promise<void>;
}

/**
 * Hook consolidado para manejo de APIs
 * Proporciona funcionalidad común de fetch, loading, error y cache
 */
export function useApi<T = unknown>(
  url: string | (() => string),
  options: UseApiOptions<T> = {},
): ApiResponse<T> {
  const {
    initialData,
    enabled = true,
    onSuccess,
    onError,
    transform,
  } = options;

  const [data, setData] = useState<T>(initialData as T);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!enabled) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (showLoading) {
          setIsLoading(true);
        } else {
          setIsValidating(true);
        }
        setError(null);

        const endpoint = typeof url === "function" ? url() : url;
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Handle API response format
        let finalData: T;
        if (result.success && result.data !== undefined) {
          finalData = transform ? transform(result.data) : result.data;
        } else if (result.data !== undefined) {
          finalData = transform ? transform(result.data) : result.data;
        } else {
          finalData = transform ? transform(result) : result;
        }

        setData(finalData);
        onSuccess?.(finalData);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Request was aborted, don't update state
        }

        const errorMessage =
          err instanceof Error ? err.message : "Error al cargar datos";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
        setIsValidating(false);
        abortControllerRef.current = null;
      }
    },
    [url, enabled, onSuccess, onError, transform],
  );

  const mutate = useCallback(() => fetchData(false), [fetchData]);
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    refresh,
  };
}

/**
 * Hook para APIs con paginación
 */
interface UsePaginatedApiOptions<T> extends UseApiOptions<T[]> {
  page?: number;
  limit?: number;
  totalKey?: string;
  dataKey?: string;
}

interface PaginatedApiResponse<T> extends Omit<ApiResponse<T[]>, "data"> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function usePaginatedApi<T = unknown>(
  baseUrl: string | (() => string),
  options: UsePaginatedApiOptions<T> = {},
): PaginatedApiResponse<T> {
  const {
    page = 1,
    limit = 12,
    totalKey = "total",
    dataKey = "data",
    ...apiOptions
  } = options;

  const buildUrl = useCallback(() => {
    const base = typeof baseUrl === "function" ? baseUrl() : baseUrl;
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("limit", limit.toString());
    return `${base}?${params.toString()}`;
  }, [baseUrl, page, limit]);

  const { data: response, ...rest } = useApi<Record<string, unknown>>(buildUrl, {
    enabled: apiOptions.enabled,
    onSuccess: undefined,
    onError: apiOptions.onError,
    transform: (data) => data as Record<string, unknown>,
  });

  const data = (response?.[dataKey] as T[]) || [];
  const total = (response?.[totalKey] as number) || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    ...rest,
    data,
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export default useApi;
