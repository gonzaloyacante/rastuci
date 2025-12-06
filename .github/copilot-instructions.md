<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instrucciones para GitHub Copilot - Rastuci E-commerce

## Contexto del Proyecto

Este es un proyecto de e-commerce llamado Rastuci desarrollado con Next.js 15, TypeScript, Tailwind CSS y Prisma ORM. La aplicación incluye:

- **Frontend web público**: Tienda online para clientes
- **Panel de administración web**: Gestión de productos, categorías y pedidos
- **API REST**: Backend integrado con Next.js API Routes
- **Base de datos**: PostgreSQL con Prisma ORM

## Stack Tecnológico

- **Frontend**: Next.js 15 con App Router, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: PostgreSQL + Prisma ORM
- **Almacenamiento**: Cloudinary para imágenes
- **Notificaciones**: OneSignal para push notifications
- **Despliegue**: Vercel (frontend + backend) + Neon/Railway (base de datos)

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/          # API Routes
│   ├── (public)/     # Páginas públicas del e-commerce
│   └── admin/        # Panel de administración
├── components/
│   ├── ui/           # Componentes UI base
│   └── layout/       # Componentes de layout
├── lib/              # Configuraciones (Prisma, Cloudinary, OneSignal)
├── hooks/            # Custom hooks (useCart, etc.)
├── utils/            # Utilidades (formatters, api client)
└── types/            # Definiciones TypeScript
```

## Modelos de Base de Datos

- **Category**: Categorías de productos
- **Product**: Productos con imágenes, precio, stock
- **Order**: Pedidos de clientes
- **OrderItem**: Items individuales de cada pedido

## Patrones de Código

### API Routes

- Usar `NextRequest` y `NextResponse` para tipado
- Retornar `ApiResponse<T>` para consistencia
- Validar parámetros y manejar errores apropiadamente
- Usar transacciones de Prisma cuando sea necesario

### Componentes

- Usar TypeScript estricto con interfaces bien definidas
- Implementar `forwardRef` para componentes UI
- Usar `cn()` utility para combinar clases de Tailwind
- Seguir convenciones de React (PascalCase para componentes)

### Hooks personalizados

- Prefijo `use` para hooks personalizados
- Manejar estado de carga y errores
- Implementar cleanup cuando sea necesario

### Utilidades

- Funciones puras sin efectos secundarios
- Tipado estricto con TypeScript
- Manejo de errores consistente

## Convenciones de Nomenclatura

- **Archivos**: PascalCase para componentes, camelCase para utilidades
- **Variables**: camelCase
- **Constantes**: SCREAMING_SNAKE_CASE
- **Interfaces**: PascalCase con prefijo descriptivo
- **Enums**: PascalCase

## Gestión de Estado

- `useState` y `useEffect` para estado local
- Custom hooks para lógica reutilizable
- LocalStorage para persistencia del carrito
- Context API para estado global cuando sea necesario

## Manejo de Errores

- Try-catch en API routes
- Validación de parámetros antes de procesar
- Mensajes de error en español
- Logging detallado para debugging

## Estilo y UX

- Diseño responsive con Tailwind CSS
- Componentes accesibles (ARIA labels, semántica HTML)
- Loading states y feedback visual
- Validación de formularios en tiempo real

## Integraciones Externas

- **Cloudinary**: Optimización y transformación de imágenes
- **OneSignal**: Notificaciones push para nuevos pedidos
- **Prisma**: ORM con schema-first approach

## Consideraciones de Rendimiento

- Server-side rendering (SSR) para SEO
- Lazy loading de imágenes
- Paginación para listados grandes
- Optimización de consultas de base de datos

## Seguridad

- Validación de entrada en todos los endpoints
- Sanitización de datos
- Variables de entorno para credenciales
- Rate limiting para APIs públicas

## Tarjetas de Prueba MercadoPago

### Argentina

**Mastercard**: 5031 7557 3453 0604 | CVV: 123 | Vencimiento: 11/30 ❌ NO FUNCIONA EN SANDBOX
**Visa**: 4509 9535 6623 3704 | CVV: 123 | Vencimiento: 11/30 ✅ FUNCIONA
**American Express**: 3711 803032 57522 | CVV: 1234 | Vencimiento: 11/30
**Mastercard Débito**: 5287 3383 1025 3304 | CVV: 123 | Vencimiento: 11/30
**Visa Débito**: 4002 7686 9439 5619 | CVV: 123 | Vencimiento: 11/30

### Estados de Pago por Nombre del Titular

- **APRO**: Pago aprobado (DNI: 12345678) ✅ USAR ESTE
- **OTHE**: Rechazado por error general
- **CONT**: Pendiente de pago
- **CALL**: Rechazado con validación para autorizar
- **FUND**: Rechazado por importe insuficiente
- **SECU**: Rechazado por código de seguridad inválido
- **EXPI**: Rechazado debido a un problema de fecha de vencimiento
- **FORM**: Rechazado debido a un error de formulario

### Recordatorio Crítico

- USAR ÚNICAMENTE tarjetas de test oficiales de MercadoPago
- NO usar tarjetas reales o inventadas (generan errores)
- SIEMPRE completar pruebas E2E con MercadoPago antes de aprobar cambios
- MASTERCARD 5031 NO FUNCIONA: usar VISA 4509 o otras alternativas
- Estado de frustración del usuario: EXTREMO - completar pruebas RÁPIDO
- NO usar Codacy automáticamente - solo cuando sea explícitamente solicitado

Cuando generes código, sigue estos patrones y mantén la consistencia con la arquitectura existente.
