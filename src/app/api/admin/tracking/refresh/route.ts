import { withAdminAuth } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const POST = withAdminAuth(async (_request: NextRequest): Promise<NextResponse> => {
  try {
    // Actualizar todos los tracking codes activos
    const orders = await prisma.order.findMany({
      where: {
        status: { notIn: ['DELIVERED'] } // Solo actualizar envíos activos
      }
    });

    let updatedCount = 0;
    const errors: string[] = [];

    for (const order of orders) {
      if (order.trackingNumber) {
        try {
          // TODO: Integrar con API de Correo Argentino para obtener estado actualizado
          // const caService = new CorreoArgentinoService({...credentials});
          // const trackingData = await caService.getTracking({trackingNumber: order.trackingNumber});

          // Actualizar el pedido con nueva información
          await prisma.order.update({
            where: { id: order.id },
            data: {
              updatedAt: new Date()
            }
          });
          updatedCount++;
        } catch (error) {
          errors.push(`Error actualizando orden ${order.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          continue;
        }

        // Pequeña pausa para no sobrecargar APIs externas
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const response: ApiResponse = {
      success: true,
      data: {
        updatedCount,
        totalProcessed: orders.length,
        errors: errors.length > 0 ? errors : undefined
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
});
