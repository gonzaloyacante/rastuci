import { useState, useCallback } from 'react';
import { ocaService, type CotizarEnvioParams, type CotizacionResponse, type SucursalOCA, type EstadoEnvio, type TrackingCompleto } from '@/lib/oca-service';

interface UseOCAServiceResult {
  isLoading: boolean;
  error: string | null;
  cotizarEnvio: (params: CotizarEnvioParams) => Promise<CotizacionResponse>;
  obtenerSucursales: (codigoPostal: number) => Promise<SucursalOCA[]>;
  obtenerEstadoEnvio: (numeroEnvio: string) => Promise<EstadoEnvio>;
  obtenerTracking: (numeroEnvio: string) => Promise<TrackingCompleto>;
  clearError: () => void;
}

export function useOCAService(): UseOCAServiceResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const cotizarEnvio = useCallback(async (params: CotizarEnvioParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ocaService.cotizarEnvio(params);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cotizar envío';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerSucursales = useCallback(async (codigoPostal: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ocaService.obtenerSucursales(codigoPostal);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener sucursales';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerEstadoEnvio = useCallback(async (numeroEnvio: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ocaService.obtenerEstadoEnvio(numeroEnvio);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener estado del envío';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const obtenerTracking = useCallback(async (numeroEnvio: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ocaService.obtenerTracking(numeroEnvio);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener tracking';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    cotizarEnvio,
    obtenerSucursales,
    obtenerEstadoEnvio,
    obtenerTracking,
    clearError
  };
}