import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/adminAuth';

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
      // En una implementación real con tracking, verificarías si existe tracking number
      // if (order.trackingNumber) {
        try {
          // Aquí podrías integrar con OCA API real
          // const ocaData = await ocaService.obtenerTracking(order.trackingNumber);
          
          // Simulación de actualización de estado
          // En producción esto se haría con la API real de OCA
          const shouldUpdate = Math.random() > 0.7; // Simulación
          
          if (shouldUpdate) {
            await prisma.order.update({
              where: { id: order.id },
              data: { 
                updatedAt: new Date()
              }
            });
            updatedCount++;
          }
        } catch (error) {
          errors.push(`Error actualizando orden ${order.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          continue;
        }

        // Pequeña pausa para no sobrecargar APIs externas
        await new Promise(resolve => setTimeout(resolve, 100));
      // }
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