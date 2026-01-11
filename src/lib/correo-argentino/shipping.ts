import axios, { AxiosInstance, AxiosError } from "axios";
import {
  ImportShipmentParams,
  ImportShipmentResponse,
  ApiResponse,
  GetTrackingParams,
  TrackingInfo,
  TrackingErrorResponse,
} from "./types";
import { logger } from "@/lib/logger";

export class CorreoArgentinoShipping {
  private api: AxiosInstance;

  constructor(api: AxiosInstance) {
    this.api = api;
  }

  /**
   * Importa un envío a MiCorreo
   */
  public async importShipment(
    params: ImportShipmentParams
  ): Promise<ApiResponse<ImportShipmentResponse>> {
    // Payload container for error logging scope in case of failure
    let requestBody = {} as ImportShipmentParams;

    try {
      logger.info("[CorreoArgentino] Importing shipment", {
        extOrderId: params.extOrderId,
        deliveryType: params.shipping.deliveryType,
      });

      // Validar datos según tipo de envío
      if (params.shipping.deliveryType === "D") {
        // Envío a domicilio requiere dirección completa
        if (
          !params.shipping.address?.streetName ||
          !params.shipping.address?.streetNumber ||
          !params.shipping.address?.city ||
          !params.shipping.address?.provinceCode ||
          !params.shipping.address?.postalCode
        ) {
          return {
            success: false,
            error: {
              code: "MISSING_ADDRESS",
              message: "Envío a domicilio requiere dirección completa",
            },
          };
        }
      } else if (params.shipping.deliveryType === "S") {
        // Envío a sucursal requiere código de sucursal
        if (!params.shipping.agency) {
          return {
            success: false,
            error: {
              code: "MISSING_AGENCY",
              message: "Envío a sucursal requiere código de sucursal",
            },
          };
        }
      }

      // Preparar body limpiando campos innecesarios
      // NOTA: Para "Ventanilla", el sender debe ir con campos NULL explícitos según doc oficial
      requestBody = {
        customerId: params.customerId,
        extOrderId: params.extOrderId,
        orderNumber: params.orderNumber,
        sender: params.sender,
        recipient: params.recipient,
        shipping: { ...params.shipping },
      };

      // Limpieza de strings largos (API limit)
      if (requestBody.shipping.address?.floor) {
        requestBody.shipping.address.floor =
          requestBody.shipping.address.floor.substring(0, 3);
      }
      if (requestBody.shipping.address?.apartment) {
        requestBody.shipping.address.apartment =
          requestBody.shipping.address.apartment.substring(0, 3);
      }

      // Asegurar enteros
      requestBody.shipping.weight = Math.round(requestBody.shipping.weight);
      requestBody.shipping.height = Math.round(requestBody.shipping.height);
      requestBody.shipping.length = Math.round(requestBody.shipping.length);
      requestBody.shipping.width = Math.round(requestBody.shipping.width);

      // Eliminar campos no soportados por la API REST si se colaron
      delete requestBody.shipping.originAgency;

      const response = await this.api.post<ImportShipmentResponse>(
        "/shipping/import",
        requestBody
      );

      // Intentar parsear respuesta si viene como texto (hotfix común en esta API)
      if (typeof response.data === "string") {
        try {
          response.data = JSON.parse(response.data);
        } catch (_e) {
          logger.warn(
            "[CorreoArgentino] Response data was string but failed to parse",
            { data: response.data }
          );
        }
      }

      return { success: true, data: response.data };
    } catch (error: unknown) {
      let errorText = "Unknown error";
      let status: number | undefined;
      let details: unknown;

      if (axios.isAxiosError(error)) {
        status = error.response?.status;
        details = error.response?.data;
        errorText = error.message;
        if (details && typeof details === "object") {
          try {
            errorText = JSON.stringify(details);
          } catch {
            /* ignore circular */
          }
        }
      } else if (error instanceof Error) {
        errorText = error.message;
      }

      logger.error("[CorreoArgentino] Import shipment failed", {
        status: status,
        error: errorText.substring(0, 200),
        payload: JSON.stringify(requestBody),
      });

      return {
        success: false,
        error: {
          code: "IMPORT_ERROR",
          message: "Error importando envío",
          details: details,
        },
      };
    }
  }

  /**
   * Obtiene el tracking de un envío (si estuviera disponible en REST)
   */
  public async getTracking(
    params: GetTrackingParams
  ): Promise<
    ApiResponse<TrackingInfo | TrackingInfo[] | TrackingErrorResponse>
  > {
    try {
      // Implementación base según doc, aunque endpoint suele ser inestable
      const response = await this.api.get<TrackingInfo | TrackingInfo[]>(
        `/shipping/tracking?shippingId=${params.shippingId}`
      );
      return { success: true, data: response.data };
    } catch (error: unknown) {
      let details: unknown;
      if (axios.isAxiosError(error)) {
        details = error.response?.data;
      }
      return {
        success: false,
        error: {
          code: "TRACKING_ERROR",
          message: "Error obteniendo tracking",
          details,
        },
      };
    }
  }
}
