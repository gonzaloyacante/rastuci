import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/mercadopago';
import { z } from 'zod';

// Esquema de validación para el pago
const paymentSchema = z.object({
  token: z.string(),
  installments: z.number().min(1).max(24),
  payment_method_id: z.string(),
  payer: z.object({
    email: z.string().email(),
    identification: z.object({
      type: z.string(),
      number: z.string(),
    }).optional(),
  }),
  transaction_amount: z.number().positive(),
  description: z.string(),
  external_reference: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos de entrada
    const validatedData = paymentSchema.parse(body);
    
    // Crear el pago en MercadoPago
    const payment = await createPayment(validatedData);
    
    // Responder con el resultado
    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        status_detail: payment.status_detail,
        transaction_amount: payment.transaction_amount,
        currency_id: payment.currency_id,
        date_created: payment.date_created,
        external_reference: payment.external_reference,
      }
    });
    
  } catch (error) {
    console.error('Error processing payment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos de pago inválidos',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
