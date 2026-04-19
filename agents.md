# AGENTS.md - E-commerce Rastuci

> **CONTEXTO**: Plataforma de E-commerce real para venta de ropa infantil. Maneja pagos (MercadoPago
> — 3 métodos), envíos (Correo Argentino MiCorreo API), stock y facturación. **OBJETIVO**:
> **Estabilidad Financiera y de Datos**. Un error aquí significa pérdida de dinero o pedidos.
> Prioridad absoluta a la integridad de datos y UX de checkout.

---

## 1. 🛠 Stack & Herramientas (Estricto)

| Herramienta         | Versión exacta            | Restricción                                                                    |
| :------------------ | :------------------------ | :----------------------------------------------------------------------------- |
| **Package Manager** | `pnpm`                    | **PROHIBIDO** usar npm o yarn. Lockfile: `pnpm-lock.yaml`.                     |
| **Framework**       | Next.js `^16.2.2`         | **App Router exclusivamente.** No hay páginas en `pages/`.                     |
| **Lenguaje**        | TypeScript `^5.9.3`       | **Strict Mode.** Tipos para todas las respuestas de API son obligatorios.      |
| **Runtime**         | React `^19.2.4`           | Suspense, Server Components, Server Actions habilitados.                       |
| **Base de Datos**   | PostgreSQL (Neon Tech)    | Neon Branching activo. Ver sección 4.                                          |
| **ORM**             | Prisma `~6.19.3`          | Schema modular en `prisma/models/*.prisma`. **Nunca** `db push` en producción. |
| **Estilos**         | Tailwind CSS `^4.1.18`    | Config en `tailwind.config.ts`. Animaciones custom con `tailwindcss-animate`.  |
| **Estado Carrito**  | React Context             | `src/context/CartContext.tsx` + `CartProvider.tsx`. Split en 4 hooks internos. |
| **Data Fetching**   | SWR `^2.3.8`              | Fetcher estándar en `src/utils/fetcher.ts`. **No mezclar con React Query.**    |
| **Auth**            | NextAuth.js `^4.24.13`    | Providers: Google OAuth + Credentials. Adapter: `@auth/prisma-adapter`.        |
| **Pagos**           | mercadopago `^2.11.0`     | SDK oficial. Webhook: `/api/payments/mercadopago/webhook`. Ver sección 5.      |
| **Emails**          | Resend `^6.10.0`          | Templates en `src/lib/email-templates/`. No usar SMTP directo.                 |
| **Imágenes**        | Cloudinary `^2.8.0`       | `next-cloudinary ^6.17.5`. Upload via `/api/upload`.                           |
| **Rate Limiting**   | Upstash Redis + Ratelimit | `src/lib/rate-limiter.ts`. Presets: `api`, `auth`, `upload`, `adminApi`.       |
| **Monitoreo**       | Sentry `^10`              | Configurado en `src/instrumentation.ts` y `sentry.*.config.ts`.                |
| **Push Notif.**     | OneSignal                 | `src/lib/mobile-push.ts`. Registro: `/api/mobile/notifications/register`.      |
| **Testing**         | Vitest `^4.0.16`          | Unit + integration. 60+ test files en `tests/`.                                |
| **Testing E2E**     | Playwright `^1.57.0`      | Specs en `tests/e2e/`. Cobertura obligatoria: Checkout + Admin Login.          |
| **Storybook**       | `^10.2.10`                | `pnpm storybook`. 40+ stories de componentes UI.                               |

---

## 2. 📂 Arquitectura & Estructura

```
src/
├── app/
│   ├── (public)/               # E-commerce público
│   │   ├── page.tsx            # Home (usa HomePageSkeleton via loading.tsx)
│   │   ├── products/           # Catálogo y detalle de producto
│   │   ├── checkout/           # Flujo multi-step: Cliente → Envío → Pago → Confirmación
│   │   │   ├── components/     # Pasos individuales (ShippingStep, PaymentStep, etc.)
│   │   │   ├── success/        # Página de éxito post-pago
│   │   │   ├── failure/        # Página de fallo de pago
│   │   │   └── pending/        # Pago en proceso (transferencia)
│   │   ├── cart/               # Carrito de compras
│   │   ├── favorites/          # Lista de favoritos
│   │   ├── orders/[id]/        # Detalle de orden pública
│   │   ├── tracking/           # Tracking de envíos (cliente)
│   │   ├── reviews/rate/[id]/  # Formulario de review post-compra
│   │   └── legal/              # Políticas: privacy, terms, consumer-defense
│   ├── admin/                  # Panel de administración (requiere isAdmin = true)
│   │   ├── dashboard/          # KPIs, gráficos, actividad reciente
│   │   ├── analytics/          # Analytics de comportamiento
│   │   ├── products/           # CRUD productos + variantes
│   │   ├── categories/         # CRUD categorías
│   │   ├── orders/             # Gestión de órdenes + tracking CA
│   │   ├── users/              # Gestión de usuarios
│   │   ├── reviews/            # Moderación de reviews
│   │   ├── tracking/           # Tracking panel con Correo Argentino
│   │   ├── branches-ca/        # Gestión de sucursales CA
│   │   ├── shipping-analytics/ # Analytics de envíos
│   │   ├── home/               # CMS del home
│   │   ├── settings/           # Configuración tienda, pagos, envíos, stock
│   │   ├── legal/              # Editor de políticas legales
│   │   ├── contact/            # Bandeja de mensajes de contacto
│   │   ├── logistics/          # Logística y operaciones
│   │   ├── support/            # Soporte al cliente
│   │   └── metrics/            # Métricas avanzadas
│   └── api/                    # API Routes (ver tabla completa en sección 3)
├── components/
│   ├── ui/                     # Design System: Button, Input, Skeleton, Spinner, etc.
│   ├── admin/
│   │   ├── skeletons/          # 18 skeleton files + barrel index.tsx
│   │   ├── inventory/          # InventoryTable, InventoryFilters, StockAdjustmentModal, etc.
│   │   ├── layout/             # TabLayout, TabPanel, SearchFiltersBar, PageHeaderWithActions
│   │   ├── dashboard/          # AdvancedCharts, ModernDashboardCharts
│   │   ├── orders/             # OrderCard, OrderActionsCard, ShipmentControlCard, etc.
│   │   └── analytics/          # KPIGrid, MetricCard, RevenueChart, etc.
│   ├── public/
│   │   └── skeletons/          # 10 page skeletons + barrel (HomePageSkeleton, etc.)
│   ├── checkout/               # AgencySelector, pasos del checkout
│   ├── products/
│   │   ├── cards/              # ProductCard, AdminProductCard
│   │   ├── list/               # ProductGrid, ProductList, ProductListComponents
│   │   ├── detail/             # Secciones del detalle de producto
│   │   └── variants/           # ColorPicker, SizeManager, VariantManager
│   ├── forms/                  # ContactSettingsForm y otros forms especializados
│   ├── providers/              # AppProviders, SessionProvider, VacationProvider
│   ├── search/                 # SearchBar, SmartSearch, ProductFilters
│   ├── reviews/                # ReviewSystem, OrderReviewForm
│   └── pwa/                   # NotificationManager, OfflineIndicator, PWAInstallPrompt
├── hooks/                      # Custom hooks (ver listado completo en sección 2.1)
├── services/                   # Capa de servicios (ver sección 2.2)
├── lib/                        # Utilidades core y configuraciones (ver sección 2.3)
├── utils/                      # Helpers puros sin side effects (ver sección 2.4)
├── types/                      # TypeScript: index.ts, cart.ts, next-auth.d.ts
├── context/                    # CartContext, WishlistContext, PaymentContext, etc.
└── config/                     # admin-titles.ts (legacy, en revisión)
```

### 2.1 Hooks Principales

| Hook                  | Archivo                        | Descripción                                          |
| :-------------------- | :----------------------------- | :--------------------------------------------------- |
| `useSettings<T>`      | `hooks/useSettings.ts`         | Fetching genérico de settings por sección via SWR    |
| `useDashboard`        | `hooks/useDashboard.ts`        | Datos del dashboard admin vía `/api/admin/dashboard` |
| `useProducts`         | `hooks/useProducts.ts`         | Listado de productos con SWR                         |
| `useOrders`           | `hooks/useOrders.ts`           | Órdenes admin con filtros y paginación               |
| `useCategories`       | `hooks/useCategories.ts`       | Categorías con SWR                                   |
| `useUsers`            | `hooks/useUsers.ts`            | Usuarios admin con SWR                               |
| `useCorreoArgentino`  | `hooks/useCorreoArgentino.ts`  | Wrapper React para el servicio de Correo Argentino   |
| `useCoupon`           | `hooks/useCoupon.ts`           | Validación y aplicación de cupones                   |
| `useProductForm`      | `hooks/useProductForm.ts`      | Estado y validación del form de producto             |
| `useProductDetail`    | `hooks/useProductDetail.ts`    | Datos del detalle de producto                        |
| `useInfiniteProducts` | `hooks/useInfiniteProducts.ts` | Infinite scroll de productos                         |
| `useShippingSettings` | `hooks/useShippingSettings.ts` | Settings de envío (wrapper de `useSettings`)         |
| `useStoreSettings`    | `hooks/useStoreSettings.ts`    | Settings de tienda (wrapper de `useSettings`)        |
| `useVacationSettings` | `hooks/useVacationSettings.ts` | Settings de modo vacaciones                          |
| `useCheckoutSettings` | `hooks/useCheckoutSettings.ts` | Settings del checkout (métodos de pago, etc.)        |
| `useReviews`          | `hooks/useReviews.ts`          | Reviews de productos                                 |
| `useFavorites`        | `hooks/useFavorites.ts`        | Wishlist/favoritos del usuario                       |
| `useProductSearch`    | `hooks/useProductSearch.ts`    | Búsqueda de productos con debounce                   |

### 2.2 Servicios (`src/services/`)

| Archivo                   | Clase / Export     | Responsabilidad                                              |
| :------------------------ | :----------------- | :----------------------------------------------------------- |
| `order-service.ts`        | `OrderService`     | Crear, actualizar y mapear estados de órdenes                |
| `order-helpers.ts`        | Funciones puras    | Validación de items, stock, cálculo de totales, emails async |
| `order-service.types.ts`  | Types              | `OrderMetadata`, `OrderUpdateData`                           |
| `checkout-service.ts`     | `CheckoutService`  | Validación de carrito, verificación de stock en tiempo real  |
| `shipment-service.ts`     | `ShipmentService`  | Creación automática de envío CA al confirmar orden           |
| `product-service.ts`      | `ProductService`   | CRUD productos, variantes, imágenes                          |
| `variant-service.ts`      | `VariantService`   | Gestión de variantes (color + talle)                         |
| `analytics-service.ts`    | `AnalyticsService` | Registro de eventos, sesiones y analytics                    |
| `mp-webhook-service.ts`   | `MPWebhookService` | Procesamiento idempotente de webhooks de MercadoPago         |
| `notification-service.ts` | (legacy alias)     | Re-export de `mp-webhook-service.ts`                         |

### 2.3 Lib Core (`src/lib/`)

| Archivo / Carpeta                   | Descripción                                                                |
| :---------------------------------- | :------------------------------------------------------------------------- |
| `prisma.ts`                         | Cliente Prisma singleton (evita hot-reload leaks en development)           |
| `correo-argentino-service.ts`       | Facade principal del servicio CA                                           |
| `correo-argentino/`                 | Módulos internos: `auth.ts`, `rates.ts`, `shipping.ts`, `agencies.ts`      |
| `mercadopago.ts`                    | Helpers MP: crear preferencia, verificar firma HMAC, leer pagos            |
| `rate-limiter.ts`                   | Rate limiting con Upstash Redis. `rateLimiter.ts` re-exporta este.         |
| `email-service.ts`                  | Envío de emails via Resend                                                 |
| `email-templates/`                  | Templates: `auth.ts`, `order.ts`, `notifications.ts`, `base.ts`            |
| `orders.ts`                         | Helpers de consultas de órdenes con Prisma                                 |
| `store-settings.ts`                 | Lectura de configuración de tienda (caché de DB)                           |
| `checkoutUtils.ts`                  | Utilidades del flujo de checkout (server-side)                             |
| `input-sanitization.ts`             | Sanitización de inputs con `sanitize-html`                                 |
| `api-handler.ts` / `api-wrapper.ts` | Wrappers para API Routes con logging y manejo de errores                   |
| `logger.ts`                         | Logger estructurado (único activo — `logging.ts` eliminado)                |
| `dashboard/`                        | Lógica de métricas: `metrics.ts`, `queries.ts`, `charts.ts`, `types.ts`    |
| `validation/`                       | Schemas Zod por dominio: product, order, shipping, contact, vacation, etc. |
| `analytics/`                        | Manager de analytics, providers, tipos                                     |

### 2.4 Utils (`src/utils/`)

| Archivo                  | Descripción                                                                                      |
| :----------------------- | :----------------------------------------------------------------------------------------------- |
| `formatters.ts`          | **Fuente única** de `formatCurrency`, `formatDate`, `generateOrderNumber`, `escapeCsvCell`, etc. |
| `fetcher.ts`             | Fetcher SWR estándar (`fetch` + throw on !ok)                                                    |
| `queryBuilder.ts`        | Helpers para construcción de query strings                                                       |
| `stockReservations.ts`   | Utilidades para reserva/liberación de stock                                                      |
| `validateProductData.ts` | Validación de datos de producto antes de guardar                                                 |
| `agency-helpers.ts`      | Scoring y filtrado de sucursales CA                                                              |
| `sizes.ts` / `colors.ts` | Constantes y helpers de talles y colores                                                         |

---

## 3. 🔌 API Routes Completas

### Públicas

| Endpoint                                  | Métodos    | Descripción                                   |
| :---------------------------------------- | :--------- | :-------------------------------------------- |
| `/api/products`                           | GET        | Listado de productos con filtros y paginación |
| `/api/products/[id]`                      | GET        | Detalle de producto                           |
| `/api/products/[id]/reviews`              | GET, POST  | Reviews del producto                          |
| `/api/products/[id]/variants/[variantId]` | GET, PATCH | Variante específica                           |
| `/api/products/stats`                     | GET        | Estadísticas de productos                     |
| `/api/categories`                         | GET        | Listado de categorías                         |
| `/api/categories/[id]`                    | GET        | Detalle de categoría                          |
| `/api/checkout`                           | POST       | Crear orden + importar envío CA               |
| `/api/orders/[id]`                        | GET        | Detalle de orden (requiere ownership)         |
| `/api/orders/[id]/confirm-transfer`       | POST       | Confirmar pago por transferencia              |
| `/api/payments/mercadopago/preference`    | POST       | Crear preferencia de pago MP                  |
| `/api/payments/mercadopago/webhook`       | POST       | **Webhook crítico** — procesa pagos MP        |
| `/api/payments/methods`                   | GET        | Métodos de pago activos                       |
| `/api/shipping/calculate`                 | POST       | Cotizar envío con Correo Argentino            |
| `/api/shipping/agencies`                  | GET        | Agencias CA por provincia                     |
| `/api/shipping/tracking`                  | GET        | Tracking de envío (cliente)                   |
| `/api/coupons/validate`                   | POST       | Validar y calcular descuento de cupón         |
| `/api/home`                               | GET        | Configuración del home (CMS)                  |
| `/api/contact`                            | GET, POST  | Config de contacto / enviar mensaje           |
| `/api/reviews`                            | POST       | Crear review de producto                      |
| `/api/search/trending`                    | GET        | Búsquedas trending                            |
| `/api/wishlist/share`                     | POST       | Compartir wishlist anónima                    |
| `/api/wishlist/shared/[token]`            | GET        | Ver wishlist compartida                       |
| `/api/settings/store`                     | GET        | Config pública de tienda                      |
| `/api/settings/shipping-options`          | GET        | Opciones de envío activas                     |
| `/api/settings/payment-methods`           | GET        | Métodos de pago disponibles                   |
| `/api/settings/faqs`                      | GET        | FAQs activas                                  |
| `/api/settings/vacation`                  | GET        | Estado del modo vacaciones                    |
| `/api/analytics/events`                   | POST       | Registrar evento de analytics                 |
| `/api/health`                             | GET        | Health check del sistema                      |
| `/api/ready`                              | GET        | Readiness check                               |

### Admin (requieren `isAdmin = true`)

| Endpoint                                  | Métodos            | Descripción                                |
| :---------------------------------------- | :----------------- | :----------------------------------------- |
| `/api/admin/dashboard`                    | GET                | KPIs, métricas y actividad reciente        |
| `/api/admin/analytics`                    | GET                | Analytics detallado con filtros            |
| `/api/admin/orders/[id]/approve-transfer` | POST               | Aprobar pago por transferencia             |
| `/api/admin/orders/[id]/cancel`           | POST               | Cancelar orden y restaurar stock           |
| `/api/admin/orders/[id]/mark-delivered`   | POST               | Marcar como entregado                      |
| `/api/admin/orders/[id]/mark-processed`   | POST               | Marcar como procesado                      |
| `/api/admin/orders/[id]/retry-ca-import`  | POST               | Reintentar importación en Correo Argentino |
| `/api/admin/orders/[id]/sync-ca`          | POST               | Sincronizar estado con CA API              |
| `/api/admin/tracking`                     | GET, POST          | Tracking panel + sincronización masiva     |
| `/api/admin/tracking/refresh`             | POST               | Refresh de estados de tracking CA          |
| `/api/admin/tracking/bulk-update`         | POST               | Actualización masiva de tracking           |
| `/api/admin/tracking/export`              | GET                | Exportar tracking a CSV/Excel              |
| `/api/admin/sucursales-ca/sync`           | POST               | Sincronizar sucursales CA a DB local       |
| `/api/admin/products/bulk`                | POST               | Operaciones masivas en productos           |
| `/api/admin/products/export`              | GET                | Exportar productos a CSV                   |
| `/api/admin/reviews`                      | GET                | Listado de reviews                         |
| `/api/admin/reviews/[id]`                 | PATCH, DELETE      | Moderar review                             |
| `/api/admin/legal`                        | GET, POST          | Gestión de políticas legales               |
| `/api/admin/legal/[id]`                   | GET, PATCH, DELETE | Política específica                        |
| `/api/admin/support`                      | GET                | Mensajes de soporte                        |
| `/api/admin/logistics`                    | GET                | Datos de logística                         |
| `/api/admin/test-email`                   | POST               | Envío de email de prueba                   |
| `/api/settings/vacation/periods`          | GET, POST          | Períodos de vacaciones                     |
| `/api/settings/vacation/subscribers`      | GET                | Suscriptores de vacaciones                 |
| `/api/settings/vacation/toggle`           | POST               | Activar/desactivar modo vacaciones         |
| `/api/settings/vacation/notify`           | POST               | Notificar a suscriptores de vacaciones     |

### Cron Jobs (`/api/cron/`)

| Endpoint                           | Trigger   | Descripción                                 |
| :--------------------------------- | :-------- | :------------------------------------------ |
| `/api/cron/orders`                 | Scheduled | Expirar órdenes pendientes vencidas         |
| `/api/cron/tracking-notifications` | Scheduled | Enviar notificaciones de tracking por email |

### Auth (`/api/auth/`)

| Endpoint                    | Métodos | Descripción                                |
| :-------------------------- | :------ | :----------------------------------------- |
| `/api/auth/[...nextauth]`   | -       | NextAuth.js handler (Google + Credentials) |
| `/api/auth/login`           | POST    | Login con credentials                      |
| `/api/auth/forgot-password` | POST    | Solicitar reset de contraseña              |
| `/api/auth/reset-password`  | POST    | Resetear contraseña con token              |
| `/api/auth/clear-session`   | POST    | Limpiar sesión activa                      |

---

## 4. 💳 Reglas de Negocio Críticas (E-commerce)

### 4.1 Manejo de Dinero

- **NUNCA** usar `float` para precios. Jamás.
- En DB: `Decimal(10, 2)` en todos los campos monetarios.
- En código TypeScript: usar `Prisma.Decimal` o convertir a string para display.
- Para formatear: **siempre** usar `formatCurrency()` de `src/utils/formatters.ts`.
- `src/lib/utils.ts` **solo contiene `cn()`** (className helper). No formatCurrency.

### 4.2 Stock & Inventario

- El stock granular vive en `product_variants` (combinación Color + Talle).
- El campo `products.stock` es el stock total agregado (lectura rápida).
- **Race Conditions**: Al crear checkout, verificar stock en tiempo real con transacción Prisma.
- `stock_reservations`: bloquea stock durante el proceso de pago (con `expiresAt`).
- El cron `/api/cron/orders` libera reservas vencidas automáticamente.
- **NUNCA** modificar stock fuera de una transacción de DB.

### 4.3 Checkout Flow (3 métodos de pago)

```
1. MERCADOPAGO
   Cliente → POST /api/payments/mercadopago/preference
   → Redirige a MP → Webhook /api/payments/mercadopago/webhook
   → mp-webhook-service.ts procesa idempotentemente
   → Orden actualizada con mpPaymentId + status

2. TRANSFERENCIA BANCARIA
   Cliente → Crea orden con POST /api/checkout (status: WAITING_TRANSFER_PROOF)
   → Sube comprobante → POST /api/orders/[id]/confirm-transfer
   → Admin revisa → POST /api/admin/orders/[id]/approve-transfer

3. EFECTIVO
   Cliente → POST /api/checkout (status: PENDING_PAYMENT)
   → Email automático con instrucciones de pago
   → Admin procesa manualmente → mark-processed
```

- **Validación Cruzada**: El total **nunca** se lee del cliente. El backend recalcula en
  `checkout-service.ts` usando `validateAndPriceItems()` con precios de la DB.
- **Envíos**: costo calculado por `shipping-calculator.ts` usando CP + peso real de productos.
- Descuentos por método de pago configurables en `store_settings` (cashDiscount, transferDiscount,
  mpDiscount).
- Cupones validados en `/api/coupons/validate` con límite de uso y fecha de expiración.

### 4.4 Correo Argentino — Flujo Completo

```
Cotización → /api/shipping/calculate → correo-argentino/rates.ts
Checkout   → /api/checkout → shipment-service.ts → correo-argentino/shipping.ts
Tracking   → /api/admin/tracking → correo-argentino/auth.ts + shipping.ts
Sucursales → /api/admin/sucursales-ca/sync → correo-argentino/agencies.ts
```

- El servicio es un **Facade** (`src/lib/correo-argentino-service.ts`) que delega en 4 módulos.
- La autenticación CA renueva token automáticamente antes de cada llamada.
- Si el import de CA falla al hacer checkout, la orden se crea igual con `caImportStatus = "ERROR"`.
  El admin puede reintentar con `/api/admin/orders/[id]/retry-ca-import`.

### 4.5 Webhooks MP — Idempotencia

```typescript
// mp-webhook-service.ts verifica ANTES de procesar:
const existing = await prisma.orders.findFirst({
  where: { mpPaymentId: paymentId },
});
if (existing?.status === "PROCESSED") return; // Ya procesado — ignorar
```

- Nunca duplicar órdenes procesadas.
- Validar firma HMAC del webhook si `MP_WEBHOOK_SECRET` está configurado.

---

## 5. 🗄️ Base de Datos & Neon Branching

**Neon Branching** separa datos reales de pruebas. Schema modular en `prisma/models/`.

### Modelos por archivo

| Archivo            | Modelos                                                                                                                                                                                                                                                                                                                               |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `catalog.prisma`   | `products`, `categories`, `product_variants`, `product_reviews`, `stock_reservations`, `product_color_images`, `product_size_guides`, `shared_wishlists`                                                                                                                                                                              |
| `orders.prisma`    | `orders`, `order_items`, `OrderStatusHistory`                                                                                                                                                                                                                                                                                         |
| `auth.prisma`      | `User`, `Account`, `Session`, `SessionLog`, `VerificationToken`                                                                                                                                                                                                                                                                       |
| `settings.prisma`  | `store_settings`, `home_settings`, `home_benefits`, `contact_settings`, `stock_settings`, `stock_status_levels`, `shipping_settings`, `faq_items`, `payment_methods`, `shipping_options`, `settings` (DEPRECATED), `vacation_settings`, `vacation_period`, `vacation_subscriber`, `vacation_cart_item`, `contact_messages`, `coupons` |
| `shipping.prisma`  | `ca_agencies`, `agency_hours`, `ca_customers`, `ca_shipments`, `ca_shipping_rates`, `ca_tracking_events`                                                                                                                                                                                                                              |
| `analytics.prisma` | `analytics_events`, `analytics_sessions`, `search_analytics`, `cart_abandonment`, `cart_abandonment_items`                                                                                                                                                                                                                            |
| `legal.prisma`     | `legal_policies` (secciones y contenido de políticas legales)                                                                                                                                                                                                                                                                         |
| `enums.prisma`     | `OrderStatus`, `ReviewStatus`, `CADeliveryType`, `CADocumentType`, `StockStatusColor`                                                                                                                                                                                                                                                 |

### Convención de nombres DB

- Modelos no-auth: **snake_case** (ej: `products`, `order_items`, `ca_shipments`).
- Modelos NextAuth: **PascalCase** (ej: `User`, `Account`, `Session`) — requerido por el adapter.
- Campos: **camelCase** en Prisma (se mapea automáticamente a snake_case en PostgreSQL donde
  aplica).

### Neon Branches

| Branch    | Neon Branch       | Env File          | Uso                                        |
| :-------- | :---------------- | :---------------- | :----------------------------------------- |
| `main`    | `main`            | `.env.production` | **PRODUCCIÓN.** Datos reales. Solo merges. |
| `develop` | `preview/develop` | `.env` (local)    | Desarrollo y features.                     |

**Acciones Prohibidas en producción:**

- `pnpm db:push` directo.
- `prisma migrate reset`.
- Borrado masivo o seeding destructivo.

**Migraciones**: ejecutar `pnpm prisma:migrate-dev` en develop → validar → aplicar en prod. Nunca
aplicar `db push` en producción; usar migraciones versionadas.

> **DEPRECATED**: El modelo `settings` (tabla genérica key-value) está deprecado. Usar los modelos
> específicos (`store_settings`, `home_settings`, etc.). No agregar nuevas keys.

---

## 6. 🛡️ Seguridad & Integraciones

### 6.1 Credenciales

- Keys de MercadoPago, Correo Argentino, Cloudinary, Sentry, OneSignal viven en **Vercel Env Vars**.
- En local: archivo `.env` (nunca `.env.local` — el proyecto usa `.env`).
- **NUNCA** hardcodear tokens, secrets ni keys en el código fuente.

### 6.2 Autenticación y Autorización

- Rutas `/admin/*` protegidas por middleware (`src/middleware-utils/security.ts` +
  `src/lib/adminAuth.ts`).
- Verificación: `session.user.isAdmin === true` (campo en modelo `User`).
- Rate limiting en rutas de auth: 5 intentos / 15 min (`RATE_LIMITS.auth`).
- `src/lib/adminAuth.ts` provee `withAdminAuth()` para API Routes admin.

### 6.3 Webhooks MP

- Validar firma HMAC con `crypto.createHmac('sha256', MP_WEBHOOK_SECRET)`.
- Idempotencia: verificar `mpPaymentId` antes de procesar.
- Logging estructurado de todos los eventos via `logger.ts`.

### 6.4 Sanitización e Input Validation

- Todos los inputs de formularios: sanitizados con `src/lib/input-sanitization.ts` (usa
  `sanitize-html`).
- Validación de tipos: Zod schemas en `src/lib/validation/*.ts`.
- CSV injection prevention: `escapeCsvCell()` en `src/utils/formatters.ts`.

### 6.5 Rate Limiting (Upstash Redis)

```typescript
// src/lib/rate-limiter.ts — presets disponibles:
RATE_LIMITS.api; // 100 req / 15 min (APIs públicas)
RATE_LIMITS.auth; // 5 req / 15 min (login, reset-password)
RATE_LIMITS.adminAuth; // 3 req / 15 min (admin login)
RATE_LIMITS.upload; // 10 req / 1 min (upload de imágenes)
RATE_LIMITS.adminApi; // 200 req / 15 min (panel admin)
```

---

## 7. 🤖 Flujo de Trabajo para el Agente

### 🚨 REGLA DE ORO — FLUJO DE RAMAS (NUNCA VIOLAR)

> **JAMÁS** hacer commits de bugfixes, features o cambios de código directamente en `main`. `main` =
> producción. Solo recibe merges desde `develop` tras verificación completa.

```bash
# Flujo obligatorio:
git checkout develop          # Siempre trabajar en develop
git pull origin develop       # Sincronizar antes de empezar
# [hacer cambios + commits]
pnpm verify                   # Verificar ANTES del merge (type-check + lint + tests)
git checkout main && git merge develop --no-ff
git push origin main
git push origin develop       # Mantener develop sincronizado
```

**Reglas adicionales:**

- Cada tarea nueva grande: `git checkout -b feat/nombre-descriptivo` desde `develop`.
- Hotfixes críticos: rama `hotfix/nombre` desde `main`, merge en `main` Y `develop`.
- DB changes: `pnpm db:push` en develop primero → validar → aplicar en prod con `.env.production`.
- **Migraciones**: SIEMPRE en ambos entornos. Nunca dejar discrepancias de schema.
- **Commits**: sin Co-authored-by. Mensajes descriptivos en español o inglés, consistente por PR.

### 7.1 Scripts disponibles

```bash
pnpm dev                   # Desarrollo local
pnpm build                 # Build de producción
pnpm verify                # type-check + lint + test (requerido antes de merge)
pnpm verify:production     # verify + build (para pre-deploy)
pnpm test                  # Vitest
pnpm test:e2e              # Playwright E2E
pnpm test:coverage         # Coverage report
pnpm lint:fix              # Autofix de ESLint (incluyendo import sort)
pnpm db:push               # Aplicar schema a DB dev
pnpm db:push:prod          # Aplicar schema a DB producción
pnpm db:seed               # Seed de datos de prueba
pnpm db:studio             # Prisma Studio
pnpm storybook             # Storybook en :6006
```

### 7.2 Workflow Estándar

1. **Seguridad Primero**:
   - Si tocas pagos, checkout, stock o webhooks → revisión doble obligatoria.
   - Verificar que cambios no rompan la calculadora de envíos ni el flujo de checkout.

2. **Testing**:
   - "Si no está testeado, está roto."
   - Nuevas features: test unitario (Vitest) o E2E (Playwright) obligatorio.
   - `pnpm verify` debe pasar limpio antes de cualquier merge.

3. **Consultas DB**:
   - Cuidado con **N+1**. Usar `include` selectivo.
   - Reportes complejos: considerar `groupBy` o raw queries.
   - Stock y estados de orden: **siempre dentro de transacción Prisma** (`prisma.$transaction`).

4. **Skeleton/Loading**:
   - Cada página con data fetching debe tener `loading.tsx` (App Router).
   - Skeletons admin → `src/components/admin/skeletons/` + barrel.
   - Skeletons públicos → `src/components/public/skeletons/` + barrel.
   - Primitivos → `src/components/ui/Skeleton.tsx` y `src/components/ui/Spinner.tsx`.

---

## 8. 🚫 Anti-Patrones (E-commerce Edition)

- ❌ Confiar en el precio/total que viene del cliente (localStorage, body, etc.).
- ❌ Usar `float` para precios. Siempre `Decimal` de Prisma.
- ❌ Guardar datos de tarjetas de crédito en la DB (responsabilidad de MercadoPago).
- ❌ Usar `any` en respuestas de APIs de terceros (Correo Argentino, MP). Definir interfaces.
- ❌ Modificar stock sin transacción de base de datos.
- ❌ Ignorar errores de red en el checkout. El usuario debe saber si falló el pago.
- ❌ Procesar el mismo webhook MP dos veces (rompe idempotencia de órdenes).
- ❌ Crear componentes con múltiples responsabilidades. 1 componente = 1 archivo.
- ❌ Agrupar múltiples widgets/componentes no relacionados en un solo archivo.
- ❌ Escribir skeletons inline en páginas. Usar el sistema de skeletons de `components/`.
- ❌ Importar `formatCurrency` desde `lib/utils.ts` — esa función NO existe ahí. Solo `cn()`.
- ❌ Hacer `db push` directo en producción. Usar migraciones versionadas.
- ❌ Usar el modelo `settings` (tabla genérica) para datos nuevos. Está deprecado.
- ❌ Ignorar el pre-commit hook. Nunca usar `--no-verify` para saltear validaciones.
- ❌ Exponer datos sensibles (teléfono, dirección exacta, CUIT) en respuestas públicas de API.

---

## 9. 🧠 MEMORIA ACTIVA

> [!IMPORTANT] MEMORIA PERMANENTE Este proyecto está indexado en el Cerebro Digital. Antes de cada
> sesión, el Agente DEBE ejecutar `obsidian_global_search` en `~/cerebro/Proyectos/rastuci` para
> cargar el contexto de arquitectura, deuda técnica y decisiones cerradas.
>
> **Notas clave a consultar**:
>
> - `Proyectos/rastuci/SOP_Reglas.md` — Prohibiciones y reglas inquebrantables
> - `Proyectos/rastuci/Auditoria_Calidad_2026-04-16.md` — Deuda técnica detectada
> - `Proyectos/rastuci/Tareas_Pendientes.md` — Lista de tareas pendientes con prioridades
> - `Memoria/Logs/rastuci_SNAPSHOT_2026-04-16.md` — Estado del proyecto al 16/04/2026

### Correcciones pendientes documentadas en auditoría (2026-04-16)

| Archivo                               | Bug                                                   | Fix requerido                                   |
| ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| `src/services/checkout-service.ts:24` | `price: unknown`                                      | Cambiar a `Prisma.Decimal`                      |
| `yarn.lock`                           | Solo pnpm permitido                                   | Eliminar + agregar al `.gitignore`              |
| `src/lib/api-logger.ts`               | `console.log` sin guard de producción                 | Agregar `if (NODE_ENV === 'production') return` |
| `prisma/models/orders.prisma`         | Campos OCA legacy (`ocaOrderId`, `ocaTrackingNumber`) | Migración de limpieza                           |
| `src/components/ui/Dialog.tsx:72`     | `@ts-expect-error`                                    | Tipar correctamente                             |
