import { useState, useCallback } from 'react';

interface TrackingValidationResponse {
  isValid: boolean;
  exists: boolean;
  trackingNumber: string;
  status?: string;
  description?: string;
  lastUpdate?: string;
  error?: string;
}

interface UseTrackingValidationResult {
  isLoading: boolean;
  error: string | null;
  validationResult: TrackingValidationResponse | null;
  validateTracking: (trackingNumber: string) => Promise<TrackingValidationResponse>;
  clearResult: () => void;
}

export function useTrackingValidation(): UseTrackingValidationResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<TrackingValidationResponse | null>(null);

  const clearResult = useCallback(() => {
    setError(null);
    setValidationResult(null);
  }, []);

  const validateTracking = useCallback(async (trackingNumber: string): Promise<TrackingValidationResponse> => {
    setIsLoading(true);
    setError(null);
    setValidationResult(null);
    
    try {
      // Validar el número de tracking localmente
      if (!trackingNumber || trackingNumber.trim().length === 0) {
        throw new Error('Número de tracking requerido');
      }

      if (trackingNumber.length > 50) {
        throw new Error('Número de tracking muy largo');
      }

      // Llamar al endpoint de validación
      const response = await fetch('/api/tracking/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackingNumber: trackingNumber.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Error al validar el tracking');
      }

      const validationData = result.data as TrackingValidationResponse;
      setValidationResult(validationData);
      
      return validationData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al validar tracking';
      setError(errorMessage);
      
      // Crear respuesta de error
      const errorResponse: TrackingValidationResponse = {
        isValid: false,
        exists: false,
        trackingNumber,
        error: errorMessage
      };
      
      setValidationResult(errorResponse);
      throw err;
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    validationResult,
    validateTracking,
    clearResult
  };
}

// Función utilitaria para validar tracking usando GET
export async function validateTrackingNumber(trackingNumber: string): Promise<TrackingValidationResponse> {
  if (!trackingNumber || trackingNumber.trim().length === 0) {
    throw new Error('Número de tracking requerido');
  }

  const encodedNumber = encodeURIComponent(trackingNumber.trim());
  const response = await fetch(`/api/tracking/validate?number=${encodedNumber}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || 
      `Error ${response.status}: ${response.statusText}`
    );
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.message || 'Error al validar el tracking');
  }

  return result.data as TrackingValidationResponse;
}

// Tipos para export
export type { TrackingValidationResponse, UseTrackingValidationResult };