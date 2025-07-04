import { ApiResponse } from "@/types";

/**
 * Manejar respuestas de API
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Error del servidor" }));
    throw new Error(errorData.error || `Error ${response.status}`);
  }

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Error desconocido");
  }

  return data.data as T;
};

/**
 * Cliente API base
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    return handleApiResponse<T>(response);
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async uploadFile<T>(endpoint: string, file: File): Promise<T> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    return handleApiResponse<T>(response);
  }
}

// Instancia global del cliente API
export const apiClient = new ApiClient();

/**
 * Generar parámetros de consulta
 */
export const buildQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};
