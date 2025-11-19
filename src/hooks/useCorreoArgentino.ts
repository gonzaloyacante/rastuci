/**
 * Hook personalizado para usar el servicio de Correo Argentino (API MiCorreo) en componentes React
 *
 * @author Rastuci E-commerce
 * @version 2.0.0
 */

import { useState, useCallback } from "react";
import {
  correoArgentinoService,
  type CalculateRatesParams,
  type CalculateRatesResponse,
  type Agency,
  type GetAgenciesParams,
  type ImportShipmentParams,
  type ImportShipmentResponse,
  type GetTrackingParams,
  type TrackingInfo,
  type TrackingErrorResponse,
  type ValidateUserParams,
  type ValidateUserResponse,
  type RegisterUserParams,
  type RegisterUserResponse,
} from "@/lib/correo-argentino-service";
import { logger } from "@/lib/logger";

interface UseCorreoArgentinoResult {
  // Estado
  loading: boolean;
  error: string | null;

  // Autenticación
  authenticate: () => Promise<boolean>;
  validateUser: (params: ValidateUserParams) => Promise<ValidateUserResponse | null>;
  registerUser: (params: RegisterUserParams) => Promise<RegisterUserResponse | null>;

  // Cotización
  calculateRates: (params: CalculateRatesParams) => Promise<CalculateRatesResponse | null>;

  // Sucursales
  getAgencies: (params: GetAgenciesParams) => Promise<Agency[] | null>;

  // Envíos
  importShipment: (params: ImportShipmentParams) => Promise<ImportShipmentResponse | null>;

  // Tracking
  getTracking: (params: GetTrackingParams) => Promise<TrackingInfo | TrackingInfo[] | TrackingErrorResponse | null>;

  // Utilidades
  isValidPostalCode: (postalCode: string) => boolean;
  getCustomerId: () => string | undefined;
  setCustomerId: (customerId: string) => void;
}

export function useCorreoArgentino(): UseCorreoArgentinoResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autenticar
  const authenticate = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Authenticating");

      const result = await correoArgentinoService.authenticate();

      if (!result.success) {
        const errorMsg = result.error?.message || "Error al autenticar";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Authentication failed", { error: errorMsg });
        return false;
      }

      logger.info("[useCorreoArgentino] Authentication successful");
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al autenticar";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar usuario
  const validateUser = useCallback(async (params: ValidateUserParams): Promise<ValidateUserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Validating user", { email: params.email });

      const result = await correoArgentinoService.validateUser(params);

      if (!result.success || !result.data) {
        const errorMsg = result.error?.message || "Error al validar usuario";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Validation failed", { error: errorMsg });
        return null;
      }

      logger.info("[useCorreoArgentino] User validated successfully", {
        customerId: result.data.customerId
      });

      // Guardar customerId automáticamente
      correoArgentinoService.setCustomerId(result.data.customerId);

      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al validar usuario";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar usuario
  const registerUser = useCallback(async (params: RegisterUserParams): Promise<RegisterUserResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Registering user", { email: params.email });

      const result = await correoArgentinoService.registerUser(params);

      if (!result.success || !result.data) {
        const errorMsg = result.error?.message || "Error al registrar usuario";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Registration failed", { error: errorMsg });
        return null;
      }

      logger.info("[useCorreoArgentino] User registered successfully", {
        customerId: result.data.customerId
      });

      // Guardar customerId automáticamente
      correoArgentinoService.setCustomerId(result.data.customerId);

      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al registrar usuario";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular tarifas
  const calculateRates = useCallback(async (params: CalculateRatesParams): Promise<CalculateRatesResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Calculating rates", {
        origin: params.postalCodeOrigin,
        destination: params.postalCodeDestination
      });

      const result = await correoArgentinoService.calculateRates(params);

      if (!result.success || !result.data) {
        const errorMsg = result.error?.message || "Error al calcular tarifas";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Rate calculation failed", { error: errorMsg });
        return null;
      }

      logger.info("[useCorreoArgentino] Rates calculated successfully", {
        ratesCount: result.data.rates.length
      });

      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al calcular tarifas";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener sucursales
  const getAgencies = useCallback(async (params: GetAgenciesParams): Promise<Agency[] | null> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Getting agencies", {
        provinceCode: params.provinceCode
      });

      const result = await correoArgentinoService.getAgencies(params);

      if (!result.success || !result.data) {
        const errorMsg = result.error?.message || "Error al obtener sucursales";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Get agencies failed", { error: errorMsg });
        return null;
      }

      logger.info("[useCorreoArgentino] Agencies retrieved successfully", {
        count: result.data.length
      });

      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al obtener sucursales";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Importar envío
  const importShipment = useCallback(async (params: ImportShipmentParams): Promise<ImportShipmentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Importing shipment", {
        extOrderId: params.extOrderId
      });

      const result = await correoArgentinoService.importShipment(params);

      if (!result.success || !result.data) {
        const errorMsg = result.error?.message || "Error al importar envío";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Import shipment failed", { error: errorMsg });
        return null;
      }

      logger.info("[useCorreoArgentino] Shipment imported successfully");

      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al importar envío";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener tracking
  const getTracking = useCallback(async (
    params: GetTrackingParams
  ): Promise<TrackingInfo | TrackingInfo[] | TrackingErrorResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      logger.info("[useCorreoArgentino] Getting tracking", {
        shippingId: params.shippingId
      });

      const result = await correoArgentinoService.getTracking(params);

      if (!result.success || !result.data) {
        const errorMsg = result.error?.message || "Error al obtener tracking";
        setError(errorMsg);
        logger.error("[useCorreoArgentino] Get tracking failed", { error: errorMsg });
        return null;
      }

      logger.info("[useCorreoArgentino] Tracking retrieved successfully");

      return result.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error inesperado al obtener tracking";
      setError(errorMsg);
      logger.error("[useCorreoArgentino] Unexpected error", { error: err });
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar código postal
  const isValidPostalCode = useCallback((postalCode: string): boolean => {
    return correoArgentinoService.isValidPostalCode(postalCode);
  }, []);

  // Obtener customerId
  const getCustomerId = useCallback((): string | undefined => {
    return correoArgentinoService.getCustomerId();
  }, []);

  // Establecer customerId
  const setCustomerId = useCallback((customerId: string): void => {
    correoArgentinoService.setCustomerId(customerId);
  }, []);

  return {
    loading,
    error,
    authenticate,
    validateUser,
    registerUser,
    calculateRates,
    getAgencies,
    importShipment,
    getTracking,
    isValidPostalCode,
    getCustomerId,
    setCustomerId,
  };
}
