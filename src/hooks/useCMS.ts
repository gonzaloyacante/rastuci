"use client";

import { useEffect, useState } from 'react';

export interface CMSData {
  [key: string]: unknown;
}

export function useCMS(key?: string) {
  const [data, setData] = useState<CMSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCMS = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = key
          ? `/api/cms?key=${encodeURIComponent(key)}`
          : '/api/cms';

        const response = await fetch(url);
        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Error al cargar configuración');
        }
      } catch {
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchCMS();
  }, [key]);

  const updateCMS = async (updateKey: string, value: unknown) => {
    try {
      const response = await fetch('/api/cms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: updateKey, value })
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar estado local
        setData(prev => ({
          ...prev,
          [updateKey]: value
        }));
        return true;
      } else {
        setError(result.message || 'Error al actualizar');
        return false;
      }
    } catch {
      setError('Error al actualizar configuración');
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    updateCMS
  };
}
