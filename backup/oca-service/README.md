# Backup del Servicio OCA

## Fecha de Backup
17 de noviembre de 2025

## Motivo
Cambio de proveedor de mensajería de OCA a Correo Argentino. Se conserva todo el código y estructura para futura referencia.

## Archivos Respaldados

### Servicios
- `src/lib/oca-service.ts` - Servicio principal de OCA con toda la lógica de integración

### Hooks
- `src/hooks/useOCA.ts` - Hook personalizado para usar el servicio OCA en componentes React

### Componentes que usaban OCA
- `src/components/orders/OrderTracking.tsx` - Tracking de órdenes con OCA
- `src/components/checkout/ShippingCostCalculator.tsx` - Cálculo de costos de envío

## Campos de Base de Datos (Modelo Order)

Los siguientes campos en el modelo `Order` eran específicos de OCA:

```prisma
// OCA Tracking fields
ocaTrackingNumber String?
ocaOrderId        String?
shippingMethod    String? // 'domicilio' | 'sucursal'
trackingNumber    String? // Generic tracking field
estimatedDelivery DateTime?
shippingCost      Float?
```

### Índices relacionados
```prisma
@@index([ocaTrackingNumber])
@@index([trackingNumber])
```

## Funcionalidades Implementadas

1. **Cotización de Envíos**: Cálculo de costos de envío basado en peso, dimensiones y código postal
2. **Tracking**: Seguimiento de paquetes con número de seguimiento OCA
3. **Búsqueda de Sucursales**: Localización de sucursales OCA por código postal
4. **Estados de Envío**: Consulta de estados de envío en tiempo real

## Migración a Correo Argentino

Este servicio será reemplazado por una nueva implementación para Correo Argentino que incluirá:
- Servicio principal de Correo Argentino
- Hook personalizado para React
- Adaptación de componentes existentes
- Nuevos campos en la base de datos según las necesidades de la API de Correo Argentino

## Notas Importantes

- NO ELIMINAR estos archivos
- Mantener como referencia para futuras integraciones
- Revisar la estructura y patrones implementados para aplicar en el nuevo servicio
