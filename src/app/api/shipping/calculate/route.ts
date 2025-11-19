import { correoArgentinoService } from '@/lib/correo-argentino-service';
import { logger } from '@/lib/logger';
import type { ApiResponse } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

interface CalculateShippingRequest {
  provider: 'correo-argentino';
  destination: {
    postalCode: string;
    city: string;
    province: string;
    street?: string;
  };
  packages: Array<{
    weight: number; // gramos
    height: number; // cm
    width: number;  // cm
    length: number; // cm
  }>;
}

interface ShippingRate {
  serviceType: string;
  serviceName: string;
  description: string;
  price: number;
  deliveryTime: string;
  provider: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateShippingRequest = await request.json();

    // Validar datos requeridos
    if (!body.destination?.postalCode) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'Código postal es requerido',
        data: null
      }, { status: 400 });
    }

    if (!body.packages || body.packages.length === 0) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'Al menos un paquete es requerido',
        data: null
      }, { status: 400 });
    }

    // Validar proveedor
    if (body.provider !== 'correo-argentino') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        message: 'Proveedor no soportado',
        data: null
      }, { status: 400 });
    }

    // Calcular con Correo Argentino
    const rates: ShippingRate[] = [];

    try {
      // Autenticar con CA
      const authenticated = await correoArgentinoService.authenticate();
      if (!authenticated) {
        throw new Error('No se pudo autenticar con Correo Argentino');
      }

      // Calcular tarifas para cada paquete
      for (const pkg of body.packages) {
        const rateResult = await correoArgentinoService.calculateRates({
          customerId: process.env.CA_CUSTOMER_ID || '',
          postalCodeOrigin: '1425', // CABA por defecto
          postalCodeDestination: body.destination.postalCode,
          deliveredType: 'D', // Domicilio
          dimensions: {
            weight: pkg.weight,
            height: pkg.height,
            width: pkg.width,
            length: pkg.length
          }
        });

        if (rateResult?.success && rateResult.data?.rates && rateResult.data.rates.length > 0) {
          // Agregar las tarifas obtenidas
          rateResult.data.rates.forEach((rate) => {
            rates.push({
              serviceType: rate.productType?.toLowerCase() || 'standard',
              serviceName: rate.productName || 'Correo Argentino',
              description: `Entrega en ${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
              price: rate.price,
              deliveryTime: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días hábiles`,
              provider: 'correo-argentino'
            });
          });
        }
      }

      // Si no hay tarifas, usar valores estimados
      if (rates.length === 0) {
        logger.warn('No se obtuvieron tarifas de CA, usando valores estimados', {
          postalCode: body.destination.postalCode
        });

        rates.push(
          {
            serviceType: 'standard',
            serviceName: 'Correo Argentino Estándar',
            description: 'Envío estándar a domicilio',
            price: 1500,
            deliveryTime: '3-5 días hábiles',
            provider: 'correo-argentino'
          },
          {
            serviceType: 'express',
            serviceName: 'Correo Argentino Express',
            description: 'Envío express a domicilio',
            price: 2500,
            deliveryTime: '1-2 días hábiles',
            provider: 'correo-argentino'
          }
        );
      }

      return NextResponse.json<ApiResponse<{ rates: ShippingRate[] }>>({
        success: true,
        message: 'Tarifas calculadas correctamente',
        data: { rates }
      });

    } catch (caError) {
      // Si falla CA, retornar tarifas estimadas
      logger.error('Error al calcular con Correo Argentino', {
        error: caError,
        postalCode: body.destination.postalCode
      });

      const estimatedRates: ShippingRate[] = [
        {
          serviceType: 'standard',
          serviceName: 'Envío Estándar',
          description: 'Envío estándar a domicilio (estimado)',
          price: 1500,
          deliveryTime: '3-5 días hábiles',
          provider: 'correo-argentino'
        },
        {
          serviceType: 'express',
          serviceName: 'Envío Express',
          description: 'Envío express a domicilio (estimado)',
          price: 2500,
          deliveryTime: '1-2 días hábiles',
          provider: 'correo-argentino'
        }
      ];

      return NextResponse.json<ApiResponse<{ rates: ShippingRate[], estimated: boolean }>>({
        success: true,
        message: 'Tarifas estimadas (servicio temporalmente no disponible)',
        data: { rates: estimatedRates, estimated: true }
      });
    }

  } catch (error) {
    logger.error('Error en API de cálculo de envío', { error });

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      message: 'Error al calcular el costo de envío',
      data: null
    }, { status: 500 });
  }
}
