import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { withAdminAuth } from '@/lib/adminAuth';

const BulkUpdateSchema = z.object({
  trackingIds: z.array(z.string()).min(1, 'Debe especificar al menos un ID'),
  status: z.enum(['pending', 'in-transit', 'delivered', 'delayed', 'error'])
});

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mapear estados de tracking a estados válidos de OrderStatus
const statusMapping = {
  'pending': 'PENDING',
  'in-transit': 'PROCESSED',
  'delivered': 'DELIVERED',
  'delayed': 'PENDING', // Tratamos delayed como pending
  'error': 'PENDING' // Tratamos error como pending
} as const;

export const POST = withAdminAuth(async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const validatedData = BulkUpdateSchema.parse(body);
    
    const { trackingIds, status } = validatedData;

    // Mapear el status a un valor válido de OrderStatus
    const mappedStatus = statusMapping[status];

    // Actualizar los estados en batch
    const updateResult = await prisma.order.updateMany({
      where: {
        id: { in: trackingIds }
      },
      data: {
        status: mappedStatus
      }
    });

    const response: ApiResponse = {
      success: true,
      data: { 
        updatedCount: updateResult.count,
        updatedIds: trackingIds 
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: `Datos inválidos: ${error.errors.map(e => e.message).join(', ')}`
      };
      
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    };

    return NextResponse.json(response, { status: 500 });
  }
});