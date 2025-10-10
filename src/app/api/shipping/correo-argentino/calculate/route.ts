import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Esquema de validación para el cálculo de envío
const calculateShippingSchema = z.object({
  postalCode: z.string().min(4).max(8),
  weight: z.number().positive().optional().default(1000), // gramos
  dimensions: z.object({
    height: z.number().positive().optional().default(10),
    width: z.number().positive().optional().default(20),
    length: z.number().positive().optional().default(30),
  }).optional(),
});

// Simulación de la API de Correo Argentino
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postalCode, weight, dimensions: _dimensions } = calculateShippingSchema.parse(body);
    
    // Simular delay de API real
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Lógica de cálculo basada en código postal (simulada)
    const numericCode = parseInt(postalCode.replace(/[A-Z]/i, ''));
    let basePrice = 1500; // Precio base
    let estimatedDays = '3-5 días';
    
    // Simulación de zonas de envío
    if (numericCode >= 1000 && numericCode <= 1499) {
      // CABA
      basePrice = 800;
      estimatedDays = '1-2 días';
    } else if (numericCode >= 1500 && numericCode <= 1999) {
      // GBA
      basePrice = 1200;
      estimatedDays = '2-3 días';
    } else if (numericCode >= 2000 && numericCode <= 3999) {
      // Provincias cercanas
      basePrice = 1800;
      estimatedDays = '3-5 días';
    } else {
      // Resto del país
      basePrice = 2500;
      estimatedDays = '5-7 días';
    }
    
    // Ajustar precio por peso
    const weightMultiplier = Math.ceil(weight / 1000);
    const standardPrice = basePrice * weightMultiplier;
    const expressPrice = Math.round(standardPrice * 1.8);
    
    // Opciones de envío disponibles
    const shippingOptions = [
      {
        id: 'pickup',
        name: 'Retiro en tienda',
        description: 'Retira tu pedido en nuestra tienda física',
        price: 0,
        estimatedDays: 'Inmediato',
        serviceType: 'pickup',
      },
      {
        id: 'standard',
        name: 'Envío estándar',
        description: `Envío a domicilio en ${estimatedDays}`,
        price: standardPrice,
        estimatedDays: estimatedDays,
        serviceType: 'standard',
      },
      {
        id: 'express',
        name: 'Envío express',
        description: 'Envío prioritario en 24-48 horas',
        price: expressPrice,
        estimatedDays: '24-48 horas',
        serviceType: 'express',
      },
    ];
    
    // Información adicional de la zona
    const zoneInfo = {
      postalCode,
      zone: numericCode >= 1000 && numericCode <= 1499 ? 'CABA' :
            numericCode >= 1500 && numericCode <= 1999 ? 'GBA' :
            numericCode >= 2000 && numericCode <= 3999 ? 'Provincias cercanas' :
            'Interior del país',
      coverage: true,
      restrictions: [],
    };
    
    return NextResponse.json({
      success: true,
      data: {
        options: shippingOptions,
        zoneInfo,
        calculatedAt: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('Error calculating shipping:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error calculando el envío' 
      },
      { status: 500 }
    );
  }
}
