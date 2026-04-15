# 👶 **Rastuci** - E-commerce de Ropa Infantil

<div align="center">

![Rastuci Logo](https://img.shields.io/badge/Rastuci-E--commerce-E91E63?style=for-the-badge&logo=react&logoColor=white)

### 🌟 _Ropa infantil de calidad, comodidad y estilo para los más pequeños_

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)

[ **Ver Sitio Oficial**](https://www.rastuci.com/) |
[ **Mi Portfolio**](https://gonzaloyacante.com/)

</div>

---

## ⚠️ **Aviso de Portfolio**

Este proyecto es un **Showcase Personal** de arquitectura y desarrollo Full Stack. Aunque el código
es abierto para fines educativos, **no se aceptan contribuciones (Pull Requests)** externas en este
momento, ya que el objetivo es demostrar habilidades individuales.

---

## ✨ **¿Qué es Rastuci?**

**Rastuci** es una **plataforma e-commerce moderna y completa** diseñada específicamente para la
venta de ropa infantil. Combina una experiencia de usuario excepcional con herramientas
administrativas poderosas, ofreciendo todo lo necesario para gestionar un negocio de moda infantil
en línea con pagos, envíos, facturación y analytics integrados.

### 🎯 **¿Por qué elegir Rastuci?**

- **🛍️ Experiencia de Compra Superior**: Checkout multi-step optimizado con 3 métodos de pago
- **📱 100% Responsive**: Diseñado para funcionar en móviles, tablets y desktop
- **⚡ Rendimiento Extremo**: Lazy Loading, skeletons por ruta, cache inteligente con SWR
- **♿ Accesibilidad**: Cumplimiento de estándares WCAG, navegación por teclado, SkipLink
- **🔒 Seguridad Total**: NextAuth, rate limiting (Upstash), sanitización, HMAC webhooks
- **🎨 Diseño Moderno**: Dark/light mode, Framer Motion, design system propio
- **📊 Panel Admin Completo**: Dashboard, inventario, tracking CA, analytics, CMS

---

## 🚀 **Características Principales**

### **🛒 Para Clientes**

- **Catálogo Dinámico**: Navegación por categorías con filtros avanzados y búsqueda inteligente
- **Carrito Persistente**: Mantiene los productos incluso al cerrar la app (localStorage)
- **Checkout Multi-Step**: Datos personales → Envío → Pago → Confirmación
- **3 Métodos de Pago**: MercadoPago (tarjeta/débito), Transferencia bancaria, Efectivo
- **Envíos con Correo Argentino**: Cotización real, domicilio o sucursal, tracking en tiempo real
- **Lista de Favoritos**: Compartible via token único con snapshot de productos
- **Sistema de Reviews**: Calificaciones verificadas post-compra
- **Tracking de Envíos**: Estado actualizado directamente desde CA API
- **Modo Vacaciones**: Banner + captura de emails para notificación de reapertura
- **Notificaciones Push**: Via OneSignal para ofertas y actualizaciones
- **PWA Ready**: Installable, offline indicator, service worker

### **👨‍💼 Para Administradores**

- **Dashboard Analytics**: KPIs, gráficos de ventas, actividad reciente, low-stock alerts
- **Gestión de Inventario**: CRUD completo de productos con variantes (Color + Talle), imágenes por
  color
- **Sistema de Categorías**: CRUD con ícono y estado activo/inactivo
- **Gestión de Pedidos**: Tracking completo desde compra hasta entrega, aprobación de transferencias
- **Panel de Tracking CA**: Sincronización masiva, refresh de estados, exportación a CSV
- **Gestión de Sucursales CA**: Carga por provincia, búsqueda, exportación, sincronización a DB
- **Panel de Usuarios**: CRUD de cuentas, permisos de admin
- **Moderación de Reviews**: Aprobar/rechazar comentarios
- **CMS del Home**: Edición completa de hero, categorías, beneficios y footer sin código
- **Editor Legal**: Políticas de privacidad, términos y defensa del consumidor
- **Configuración Completa**: Tienda, pagos (descuentos por método), envíos, stock, FAQs
- **Modo Vacaciones Admin**: Activar/desactivar, gestionar períodos y suscriptores
- **Analytics Avanzado**: Sesiones, eventos, búsquedas, cart abandonment, shipping performance
- **Soporte**: Bandeja de mensajes de contacto entrantes
- **Sistema de Cupones**: Descuentos por porcentaje o monto fijo, límite de uso, expiración

---

## 🛠️ **Stack Tecnológico**

<div align="center">

| **Frontend**      | **Backend**        | **Database**      | **Cloud**    |
| :---------------- | :----------------- | :---------------- | :----------- |
| Next.js `^16.2`   | API Routes (Next)  | PostgreSQL (Neon) | Vercel       |
| React `^19.2`     | NextAuth.js `v4`   | Prisma ORM `v6`   | Cloudinary   |
| TypeScript `^5.9` | MercadoPago SDK v2 | Upstash Redis     | OneSignal    |
| Tailwind CSS `v4` | Resend (emails)    | Neon Branching    | Sentry `^10` |
| SWR `^2.3`        | Rate Limiting      | -                 | -            |

</div>

### **🎨 Frontend**

- **Next.js 16** App Router — SSR/SSG, Server Components, loading.tsx por ruta
- **React 19** con Suspense, concurrent features y Server Actions
- **TypeScript strict** en todo el proyecto — cero `any` en respuestas de API
- **Tailwind CSS 4** con design system personalizado y animaciones custom
- **Framer Motion `^12`** para transiciones y animaciones fluidas
- **SWR** como estándar único de data fetching del cliente
- **React Hook Form + Zod** para formularios con validación type-safe
- **Radix UI** como base del design system de primitivos

### **🔥 Backend**

- **API Routes** organizadas por dominio (`/api/admin/`, `/api/payments/`, `/api/shipping/`, etc.)
- **NextAuth.js v4** — Google OAuth + Credentials provider, Prisma adapter
- **Prisma 6** con schema modular (`prisma/models/*.prisma`)
- **Rate Limiting** con Upstash Redis — presets por tipo de endpoint
- **Sanitización** de inputs con `sanitize-html`
- **Validación** con Zod schemas en `src/lib/validation/`
- **Sentry** para error monitoring en client, server y edge

### **☁️ Infraestructura**

- **Vercel** — hosting, CI/CD automático, cron jobs via `vercel.json`
- **Neon** — PostgreSQL serverless con branching (main = prod, preview/develop = dev)
- **Cloudinary** — optimización y transformación de imágenes de productos
- **Upstash Redis** — rate limiting distribuido y cache
- **OneSignal** — notificaciones push móvil y web
- **Resend** — transaccional de emails (órdenes, resets, notificaciones)

---

## 🏗️ **Estructura del Proyecto**

```
rastuci/
├── src/
│   ├── app/
│   │   ├── (public)/           # E-commerce público
│   │   │   ├── page.tsx        # Home (CMS dinámico)
│   │   │   ├── products/       # Catálogo y detalle
│   │   │   ├── checkout/       # Flujo de compra multi-step
│   │   │   │   ├── components/ # ShippingStep, PaymentStep, etc.
│   │   │   │   ├── success/    # Confirmación de pago
│   │   │   │   ├── failure/    # Fallo de pago
│   │   │   │   └── pending/    # Pago en proceso
│   │   │   ├── cart/           # Carrito
│   │   │   ├── favorites/      # Wishlist
│   │   │   ├── orders/[id]/    # Detalle de orden
│   │   │   ├── tracking/       # Tracking de envíos
│   │   │   ├── reviews/rate/   # Reviews post-compra
│   │   │   └── legal/          # Políticas legales
│   │   ├── admin/              # Panel de administración
│   │   │   ├── dashboard/      # KPIs y métricas
│   │   │   ├── analytics/      # Analytics detallado
│   │   │   ├── products/       # CRUD productos
│   │   │   ├── categories/     # CRUD categorías
│   │   │   ├── orders/         # Gestión de pedidos
│   │   │   ├── tracking/       # Tracking Correo Argentino
│   │   │   ├── branches-ca/    # Sucursales CA
│   │   │   ├── users/          # Gestión de usuarios
│   │   │   ├── reviews/        # Moderación de reviews
│   │   │   ├── home/           # CMS del home
│   │   │   ├── settings/       # Configuración global
│   │   │   ├── legal/          # Editor de políticas
│   │   │   ├── contact/        # Mensajes de contacto
│   │   │   ├── shipping-analytics/ # Analytics de envíos
│   │   │   └── metrics/        # Métricas avanzadas
│   │   └── api/                # API Routes (~85 endpoints)
│   ├── components/
│   │   ├── ui/                 # Design System (40+ componentes)
│   │   ├── admin/
│   │   │   ├── skeletons/      # 18 skeleton files + barrel
│   │   │   ├── inventory/      # InventoryTable, StockAdjustmentModal, etc.
│   │   │   ├── layout/         # TabLayout, SearchFiltersBar, etc.
│   │   │   ├── orders/         # OrderCard, ShipmentControlCard, etc.
│   │   │   └── analytics/      # KPIGrid, RevenueChart, etc.
│   │   ├── public/
│   │   │   └── skeletons/      # 10 page skeletons + barrel
│   │   ├── checkout/           # AgencySelector, pasos del checkout
│   │   ├── products/           # Cards, grid, detalle, variantes
│   │   ├── forms/              # Formularios especializados
│   │   ├── reviews/            # ReviewSystem, OrderReviewForm
│   │   ├── providers/          # AppProviders, SessionProvider, VacationProvider
│   │   ├── search/             # SearchBar, SmartSearch, ProductFilters
│   │   └── pwa/                # NotificationManager, OfflineIndicator
│   ├── services/               # Lógica de negocio server-side
│   │   ├── order-service.ts    # OrderService — crear/actualizar órdenes
│   │   ├── order-helpers.ts    # Helpers: stock, emails, precios, cupones
│   │   ├── checkout-service.ts # CheckoutService — validación de carrito
│   │   ├── shipment-service.ts # ShipmentService — envíos CA
│   │   ├── product-service.ts  # ProductService — CRUD productos
│   │   ├── variant-service.ts  # VariantService — variantes
│   │   ├── analytics-service.ts # AnalyticsService — eventos y sesiones
│   │   └── mp-webhook-service.ts # MPWebhookService — webhooks MP idempotentes
│   ├── lib/                    # Utilidades core
│   │   ├── correo-argentino-service.ts  # Facade principal CA
│   │   ├── correo-argentino/   # Módulos: auth, rates, shipping, agencies
│   │   ├── mercadopago.ts      # Helpers MP: preferencias, firma HMAC
│   │   ├── email-service.ts    # Resend email sender
│   │   ├── email-templates/    # Templates: auth, order, notifications
│   │   ├── rate-limiter.ts     # Upstash rate limiting
│   │   ├── validation/         # Zod schemas por dominio
│   │   ├── dashboard/          # Lógica de métricas del dashboard
│   │   ├── analytics/          # Manager y providers de analytics
│   │   ├── prisma.ts           # Cliente Prisma singleton
│   │   └── logger.ts           # Logger estructurado
│   ├── hooks/                  # 30+ custom hooks
│   ├── utils/
│   │   ├── formatters.ts       # formatCurrency, formatDate, generateOrderNumber
│   │   ├── fetcher.ts          # SWR fetcher estándar
│   │   └── stockReservations.ts # Helpers de reserva de stock
│   ├── context/                # CartContext, WishlistContext, PaymentContext
│   └── types/                  # TypeScript types globales
├── prisma/
│   ├── models/                 # Schema modular (8 archivos .prisma)
│   ├── migrations/             # Historial de migraciones (27+)
│   └── seed.ts                 # Seed de datos de desarrollo
├── tests/                      # 60+ test files
│   ├── api/                    # Tests de API routes
│   ├── core/                   # Tests de lógica de negocio
│   ├── services/               # Tests de servicios
│   ├── components/             # Tests de componentes
│   ├── e2e/                    # Playwright E2E specs
│   ├── security/               # Tests de seguridad
│   └── utils/                  # Tests de utilidades
└── public/                     # Archivos estáticos
```

---

## 🚀 **Instalación y Configuración**

### **📋 Prerequisitos**

```
Node.js >= 18.0.0
pnpm >= 8.0.0
PostgreSQL >= 14 (o cuenta en Neon Tech)
```

### **⚡ Instalación Rápida**

```bash
# 1. Clonar el repositorio
git clone https://github.com/gonzaloyacante/rastuci.git
cd rastuci

# 2. Instalar dependencias (OBLIGATORIO usar pnpm)
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Generar cliente Prisma y aplicar schema
pnpm prisma:generate
pnpm db:push

# 5. Opcional: seed de datos de prueba
pnpm db:seed

# 6. Ejecutar en desarrollo
pnpm dev
```

### **🔧 Variables de Entorno Completas**

```env
# ── Base de Datos (Neon PostgreSQL) ──
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/rastuci?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-xxx.neon.tech/rastuci?sslmode=require"

# ── NextAuth ──
NEXTAUTH_SECRET="your-super-secure-secret-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# ── MercadoPago ──
MERCADOPAGO_ACCESS_TOKEN="APP_USR-xxx"           # o TEST-xxx para sandbox
MERCADOPAGO_PUBLIC_KEY="APP_USR-xxx"
MP_WEBHOOK_SECRET="your-mp-webhook-secret"       # para validar firma HMAC

# ── Correo Argentino (MiCorreo API) ──
CORREO_ARGENTINO_API_URL="https://api.correoargentino.com.ar/micorreo/v1"
CORREO_ARGENTINO_USERNAME="your-username"
CORREO_ARGENTINO_PASSWORD="your-password"
CORREO_ARGENTINO_CUSTOMER_ID="your-customer-id"

# ── Cloudinary ──
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"

# ── Upstash Redis (Rate Limiting) ──
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# ── Resend (Emails transaccionales) ──
RESEND_API_KEY="re_xxx"

# ── OneSignal (Push Notifications) ──
NEXT_PUBLIC_ONESIGNAL_APP_ID="your-app-id"
ONESIGNAL_REST_API_KEY="your-rest-api-key"

# ── Sentry (Error Monitoring) ──
SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@xxx.ingest.sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-auth-token"

# ── App ──
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="your-cron-secret"                  # para autenticar endpoints de cron
```

### **🗄️ Base de Datos**

```bash
# Desarrollo — aplica schema sin migración (rápido para iterar)
pnpm db:push

# Seed de datos de prueba
pnpm db:seed

# Seed de usuario admin en desarrollo
pnpm db:seed:admin:dev

# Producción — siempre usar el script específico con .env.production
pnpm db:push:prod

# Seed de admin en producción
pnpm db:seed:admin:prod

# Prisma Studio (explorador visual de DB)
pnpm db:studio
```

---

## 💳 **Integración con MercadoPago**

Rastuci soporta **3 métodos de pago** integrados con MercadoPago y procesamiento seguro de webhooks.

### **Flujo de Pago con Tarjeta/Débito**

```
POST /api/payments/mercadopago/preference
  → Crea preferencia MP con items + payer + back_urls
  → Cliente completa pago en MP Checkout Pro
  → POST /api/payments/mercadopago/webhook
  → mp-webhook-service.ts valida firma HMAC
  → Actualiza orden idempotentemente
```

### **Webhook — Validación y Procesamiento**

```typescript
// src/lib/mercadopago.ts
// Verificación de firma HMAC:
const signature = crypto
  .createHmac("sha256", process.env.MP_WEBHOOK_SECRET!)
  .update(body)
  .digest("hex");
```

### **Mapeo de Estados MP → OrderStatus**

| MP Status    | OrderStatus       |
| :----------- | :---------------- |
| `approved`   | `PROCESSED`       |
| `in_process` | `PENDING_PAYMENT` |
| `pending`    | `PENDING_PAYMENT` |
| `rejected`   | `CANCELLED`       |
| `cancelled`  | `CANCELLED`       |

---

## 📦 **Integración con Correo Argentino (MiCorreo API)**

Integración completa para cotización, importación de envíos y tracking en tiempo real.

### **Servicio Facade** (`src/lib/correo-argentino-service.ts`)

Delega en 4 módulos especializados:

```
src/lib/correo-argentino/
├── auth.ts       # Token JWT con renovación automática
├── rates.ts      # Cotización de tarifas (domicilio/sucursal)
├── shipping.ts   # Importar envíos + tracking
└── agencies.ts   # Sucursales por provincia
```

### **Flujo Completo**

```
1. COTIZACIÓN (checkout → paso envío)
   POST /api/shipping/calculate
   → correo-argentino/rates.ts → CA API
   → Opciones D (domicilio) y S (sucursal) con precios y tiempos estimados

2. IMPORTACIÓN (al confirmar orden)
   POST /api/checkout → checkout-service.ts → shipment-service.ts
   → correo-argentino/shipping.ts → CA API importShipment()
   → Order actualizada con caTrackingNumber y caShipmentId
   → Si falla: caImportStatus = "ERROR" (orden igual se crea)

3. TRACKING
   GET /api/admin/tracking → correo-argentino/shipping.ts → getTracking()
   → Eventos en ca_tracking_events con timestamp y estado

4. REINTENTAR IMPORTACIÓN FALLIDA
   POST /api/admin/orders/[id]/retry-ca-import
   → ShipmentService.createCAShipment(orderId)
```

### **Endpoints de Envío**

| Endpoint                         | Método | Descripción                             |
| :------------------------------- | :----- | :-------------------------------------- |
| `/api/shipping/calculate`        | POST   | Cotizar tarifas CA (requiere CP y peso) |
| `/api/shipping/agencies`         | GET    | Agencias CA por provincia               |
| `/api/shipping/tracking`         | GET    | Tracking de envío para el cliente       |
| `/api/shipping/import`           | POST   | Importar envío manualmente              |
| `/api/shipping/test-credentials` | POST   | Verificar credenciales CA               |
| `/api/shipping/diagnose`         | POST   | Diagnóstico de conectividad CA          |
| `/api/admin/tracking`            | GET    | Tracking panel admin                    |
| `/api/admin/tracking/refresh`    | POST   | Refresh masivo de estados desde CA      |
| `/api/admin/tracking/export`     | GET    | Exportar a CSV/Excel                    |
| `/api/admin/sucursales-ca/sync`  | POST   | Sincronizar sucursales a DB local       |

### **Selección de Sucursal en Checkout**

```tsx
import { AgencySelector } from "@/components/checkout/AgencySelector";

<AgencySelector province="B" onSelect={(agency) => handleAgencySelect(agency)} />;
```

### **Hook React**

```tsx
import { useCorreoArgentino } from "@/hooks";

const { calculateRates, importShipment, getTracking, getAgencies, loading, error } =
  useCorreoArgentino();
```

### **Modelos DB de Correo Argentino**

| Modelo               | Descripción                      |
| :------------------- | :------------------------------- |
| `ca_customers`       | Clientes registrados en MiCorreo |
| `ca_shipments`       | Envíos importados (con tracking) |
| `ca_shipping_rates`  | Cotizaciones cacheadas           |
| `ca_tracking_events` | Eventos de tracking por envío    |
| `ca_agencies`        | Sucursales sincronizadas         |
| `agency_hours`       | Horarios de cada sucursal        |

---

## 🗄️ **Schema de Base de Datos**

Schema modular en `prisma/models/`. Todos los campos monetarios usan `Decimal(10, 2)`.

### **Modelos Principales**

| Modelo               | Campos clave                                                             |
| :------------------- | :----------------------------------------------------------------------- |
| `products`           | `price Decimal`, `stock Int`, `product_variants`, `product_color_images` |
| `product_variants`   | `color`, `size`, `stock` — combinación única por producto                |
| `orders`             | `total Decimal`, `status OrderStatus`, `mpPaymentId`, `caTrackingNumber` |
| `order_items`        | `price Decimal` snapshot al momento de la compra                         |
| `OrderStatusHistory` | Historial de cambios de estado por orden                                 |
| `stock_reservations` | Reservas temporales con `expiresAt` durante el checkout                  |
| `coupons`            | `discount Decimal`, `discountType` (PERCENTAGE/FIXED), `usageLimit`      |
| `User`               | `isAdmin Boolean`, `loginCount`, `lastLoginAt`                           |

### **Estados de Orden**

```
PENDING              → Orden creada, esperando acción
PENDING_PAYMENT      → Pago iniciado en MP / esperando confirmación
WAITING_TRANSFER_PROOF → Esperando comprobante de transferencia
PAYMENT_REVIEW       → Admin revisando comprobante
RESERVED             → Stock reservado, pendiente de procesamiento
PROCESSED            → Pago confirmado, preparando envío
DELIVERED            → Entregado al cliente
CANCELLED            → Cancelado (stock restaurado)
```

---

## 🧪 **Testing**

### **Estructura de Tests**

```
tests/
├── api/              # checkout, products, orders, shipping, webhook, auth…
├── core/             # pricing-engine, shipping-calculator, cart-calculations…
├── services/         # order-service, checkout-service, correo-argentino…
├── components/       # ProductCard, PaymentSelector, ShippingStep…
├── context/          # CartContext, WishlistContext
├── e2e/              # admin-login.spec.ts, checkout.spec.ts
├── security/         # csrf, headers, rateLimit, webhookSignature, withAdminAuth
├── hooks/            # useCategories, useWishlist
├── integration/      # cart-flow, checkout-flow
└── utils/            # formatters, validators, date-helpers…
```

### **Comandos**

```bash
pnpm test                 # Todos los tests con Vitest
pnpm test:coverage        # Reporte de cobertura
pnpm test:ui              # Vitest UI mode
pnpm test:e2e             # Playwright E2E
pnpm test:e2e:ui          # Playwright UI mode
```

### **Cobertura Obligatoria**

- ✅ Checkout flow completo (3 métodos de pago)
- ✅ Cálculo de envíos (Correo Argentino)
- ✅ Validación de stock (race conditions)
- ✅ Webhook MP (idempotencia)
- ✅ Seguridad (CSRF, rate limiting, auth admin)
- ✅ Sanitización de inputs

---

## 📊 **Analytics y Dashboard**

### **Sistema de Analytics Propio**

```
Eventos → POST /api/analytics/events → analytics_events
Sesiones → analytics_sessions (automatizado)
Búsquedas → search_analytics
Cart Abandonment → cart_abandonment + cart_abandonment_items
Shipping → GET /api/analytics/shipping-performance
```

### **Dashboard Admin** (`/admin/dashboard`)

- KPIs: Ventas totales, órdenes, productos, usuarios
- Gráfico de ventas mensual
- Actividad reciente
- Productos con bajo stock
- Comparativa de períodos

### **Analytics Detallado** (`/admin/analytics`)

- Sesiones por dispositivo/browser/país
- Tasa de conversión de carrito
- Búsquedas más frecuentes
- Funnel de checkout

---

## 📱 **Demo Local**

Después de la instalación, accede a:

- **Tienda Online**: `http://localhost:3000`
- **Panel Admin**: `http://localhost:3000/admin`
- **Storybook**: `http://localhost:6006` (ejecutar `pnpm storybook`)

### **Credenciales de Prueba (desarrollo)**

```bash
# Crear usuario admin de prueba
pnpm db:seed:admin:dev

# Seed completo con productos, categorías, órdenes
pnpm db:seed
```

_Para probar pagos, usar credenciales Sandbox de MercadoPago (tarjetas de prueba disponibles en su
documentación)._

---

## 📈 **Roadmap**

### **🚀 Próximas Mejoras**

- [ ] **App Mobile Nativa** (React Native)
- [ ] **Integración WhatsApp Business API** para soporte automatizado
- [ ] **Sistema de Marketplace** (Multi-vendor)
- [ ] **IA para recomendaciones** de talla y estilo
- [ ] **Analítica Predictiva** de stock y demanda
- [ ] **Normalización de tabla `orders`** — separar shipping, recipient y sender en tablas dedicadas

---

## 👨‍💻 **Sobre el Desarrollador**

<div align="center">

### **Gonzalo Yacante**

_Full Stack Developer & Entrepreneur_

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/gonzaloyacante)
[![Portfolio](https://img.shields.io/badge/Portfolio-E91E63?style=flat-square&logo=react&logoColor=white)](https://gonzaloyacante.com/)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:gyacante9@gmail.com)

</div>

Desarrollador con **5+ años de experiencia** en tecnologías web modernas. Especializado en
**React**, **Next.js** y **arquitecturas escalables**. Apasionado por crear productos digitales que
generen impacto real en los negocios.

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**[📖 Ver Documentación](#instalación-y-configuración)** •
**[💻 Código Fuente](https://github.com/gonzaloyacante/rastuci)** •
**[📞 Contacto](mailto:gyacante9@gmail.com)**

---

**© 2026 Rastuci - Hecho con ❤️ en Argentina 🇦🇷**

</div>
