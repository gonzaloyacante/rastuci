import { useCallback, useEffect, useRef, useState } from "react";

// Tipo para el cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

// Cache global en memoria
class GlobalCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private listeners = new Map<string, Set<() => void>>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.notifyListeners(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
    this.notifyListeners(key);
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
      this.notifyListeners(key);
    } else {
      this.cache.clear();
      this.listeners.forEach((_, key) => this.notifyListeners(key));
    }
  }

  subscribe(key: string, callback: () => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Retornar función de unsubscribe
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  private notifyListeners(key: string): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((callback) => callback());
    }
  }

  // Método para verificar si hay datos frescos
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return true;
    }
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Método para obtener todos los keys
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Método para obtener estadísticas del cache
  getStats(): { size: number; keys: string[]; totalSize: number } {
    const keys = this.getKeys();
    const totalSize = keys.reduce((acc, key) => {
      const entry = this.cache.get(key);
      if (entry) {
        try {
          return acc + JSON.stringify(entry.data).length;
        } catch {
          return acc;
        }
      }
      return acc;
    }, 0);

    return {
      size: this.cache.size,
      keys,
      totalSize,
    };
  }
}

// Instancia singleton del cache
const globalCache = new GlobalCache();

// Map para rastrear fetches en progreso (prevenir duplicados)
const pendingFetches = new Map<string, Promise<unknown>>();

// Hook para usar el cache con reactividad
export function useGlobalCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    revalidateOnMount?: boolean;
    revalidateOnFocus?: boolean;
  } = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por defecto
    revalidateOnMount = false,
    revalidateOnFocus = false,
  } = options;

  const [data, setData] = useState<T | null>(() => globalCache.get<T>(key));
  const [isLoading, setIsLoading] = useState<boolean>(!globalCache.get<T>(key));
  const [error, setError] = useState<Error | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async () => {
    // Si ya hay un fetch en progreso para esta key, reutilizarlo
    if (pendingFetches.has(key)) {
      try {
        const result = (await pendingFetches.get(key)) as T;
        setData(result);
        setIsLoading(false);
        return;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    // Crear y guardar el promise del fetch
    const fetchPromise = fetcherRef.current();
    pendingFetches.set(key, fetchPromise);

    try {
      const result = await fetchPromise;
      globalCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
    } finally {
      setIsLoading(false);
      // Limpiar el fetch pendiente después de un pequeño delay
      setTimeout(() => pendingFetches.delete(key), 100);
    }
  }, [key, ttl]);

  // Suscribirse a cambios en el cache
  const updateData = useCallback(() => {
    const cachedData = globalCache.get<T>(key);
    if (cachedData !== null) {
      setData(cachedData);
      setIsLoading(false);
    }
  }, [key]);

  // Efecto para suscribirse al cache
  useEffect(() => {
    const unsubscribe = globalCache.subscribe(key, updateData);
    return unsubscribe;
  }, [key, updateData]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const cachedData = globalCache.get<T>(key);
    if (
      cachedData === null ||
      (revalidateOnMount && globalCache.isStale(key))
    ) {
      fetchData();
    } else {
      setData(cachedData);
      setIsLoading(false);
    }
  }, [key, revalidateOnMount, fetchData]);

  // Revalidación en focus
  useEffect(() => {
    if (!revalidateOnFocus) {
      return;
    }

    const handleFocus = () => {
      if (globalCache.isStale(key)) {
        fetchData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [key, revalidateOnFocus, fetchData]);

  const mutate = useCallback(
    async (newData?: T) => {
      if (newData !== undefined) {
        globalCache.set(key, newData, ttl);
        setData(newData);
      } else {
        await fetchData();
      }
    },
    [key, ttl, fetchData]
  );

  const clearCache = useCallback(() => {
    globalCache.clear(key);
    setData(null);
  }, [key]);

  return {
    data,
    isLoading,
    error,
    mutate,
    clearCache,
    isStale: globalCache.isStale(key),
  };
}

// Hook para acceder directamente al cache sin reactividad
export function useCacheOnly<T>(key: string): T | null {
  return globalCache.get<T>(key);
}

// Hook para limpiar cache
export function useClearCache() {
  return useCallback((key?: string) => {
    globalCache.clear(key);
  }, []);
}

// Hook para estadísticas del cache
export function useCacheStats() {
  const [stats, setStats] = useState(() => globalCache.getStats());

  const updateStats = useCallback(() => {
    setStats(globalCache.getStats());
  }, []);

  return { stats, updateStats };
}

export { globalCache };
export default useGlobalCache;
