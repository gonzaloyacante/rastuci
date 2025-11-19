# 👶 **Rastuci** - E-commerce de Ropa Infantil

<div align="center">

![Rastuci Logo](https://img.shields.io/badge/Rastuci-E--commerce-E91E63?style=for-the-badge&logo=react&logoColor=white)

### 🌟 *Ropa infantil de calidad, comodidad y estilo para los más pequeños*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)

[ **Documentación**](#documentación)

</div>

---

## ✨ **¿Qué es Rastuci?**

**Rastuci** es una **plataforma e-commerce moderna y completa** diseñada específicamente para la venta de ropa infantil. Combina una experiencia de usuario excepcional con herramientas administrativas poderosas, ofreciendo todo lo necesario para gestionar un negocio de moda infantil en línea.

### 🎯 **¿Por qué elegir Rastuci?**

- **🛍️ Experiencia de Compra Superior**: Navegación intuitiva, búsqueda avanzada y proceso de checkout optimizado
- **📱 100% Responsive**: Diseñado para funcionar perfectamente en móviles, tablets y desktop
- **⚡ Rendimiento Extremo**: Carga rápida con optimizaciones avanzadas y cache inteligente
- **🔒 Seguridad Total**: Autenticación robusta, pagos seguros con MercadoPago y protección de datos
- **🎨 Diseño Moderno**: Interface elegante con modo oscuro/claro y componentes reutilizables
- **📊 Panel Admin Completo**: Gestión total de productos, categorías, pedidos y usuarios

---

## 🚀 **Características Principales**

### **🛒 Para Clientes**
- **Catálogo Dinámico**: Navegación por categorías con filtros avanzados
- **Búsqueda Inteligente**: Encuentra productos instantáneamente
- **Carrito Persistente**: Mantiene los productos incluso al cerrar la app
- **Pagos Seguros**: Integración completa con MercadoPago
- **Lista de Favoritos**: Guarda productos para comprar después
- **Sistema de Reviews**: Calificaciones y comentarios reales
- **Notificaciones Push**: Alertas de ofertas y actualizaciones

### **👨‍💼 Para Administradores**
- **Dashboard Analytics**: Métricas en tiempo real de ventas y productos
- **Gestión de Inventario**: Control total de stock y variantes
- **Sistema de Categorías**: Organización jerárquica de productos
- **Gestión de Pedidos**: Seguimiento completo desde compra hasta entrega
- **Panel de Usuarios**: Administración de cuentas y permisos
- **CMS Integrado**: Edición de contenido del home sin código
- **Reportes Avanzados**: Análisis de ventas y tendencias

### **🔧 Para Desarrolladores**
- **Arquitectura Moderna**: Next.js 15 con App Router
- **TypeScript Completo**: Tipado estricto en todo el proyecto
- **Base de Datos Robusta**: PostgreSQL + Prisma ORM
- **Cache Inteligente**: Sistema optimizado para máximo rendimiento
- **Testing Incluido**: Vitest + Testing Library configurado
- **CI/CD Ready**: Despliegue automático con Vercel
- **Documentación Completa**: Código bien documentado y mantenible

---

## 🛠️ **Stack Tecnológico**

<div align="center">

| **Frontend** | **Backend** | **Database** | **Cloud** |
|:---:|:---:|:---:|:---:|
| Next.js 15 | Next.js API Routes | PostgreSQL | Vercel |
| React 18 | NextAuth.js | Prisma ORM | Cloudinary |
| TypeScript | MercadoPago API | Redis Cache | OneSignal |
| Tailwind CSS | Rate Limiting | - | Neon DB |

</div>

### **🎨 Frontend Moderno**
- **Next.js 15** con App Router para SSR/SSG optimizado
- **React 18** con Suspense y componentes modernos
- **TypeScript** para desarrollo type-safe
- **Tailwind CSS** con design system personalizado
- **Framer Motion** para animaciones fluidas
- **Next Themes** para modo oscuro/claro

### **🔥 Backend Potente**
- **API Routes** integradas en Next.js
- **NextAuth.js** para autenticación segura
- **Prisma ORM** con migraciones automáticas
- **Rate Limiting** para protección contra ataques
- **CSRF Protection** y headers de seguridad
- **Middleware personalizado** para validaciones

### **☁️ Infraestructura Cloud**
- **Vercel** para hosting y despliegue continuo
- **PostgreSQL** en la nube (Neon/Railway)
- **Cloudinary** para optimización de imágenes
- **OneSignal** para notificaciones push
- **Cache distribuido** para máximo rendimiento

---

## 📸 **Screenshots**

<div align="center">

### 🏠 **Home Page**
![Home Page](https://via.placeholder.com/800x400/E91E63/FFFFFF?text=Rastuci+Home)

### 🛍️ **Catálogo de Productos**
![Productos](https://via.placeholder.com/800x400/E91E63/FFFFFF?text=Catálogo+de+Productos)

### 📱 **Responsive Design**
![Mobile](https://via.placeholder.com/300x600/E91E63/FFFFFF?text=Mobile+View) ![Tablet](https://via.placeholder.com/400x600/E91E63/FFFFFF?text=Tablet+View)

### 📊 **Admin Dashboard**
![Admin](https://via.placeholder.com/800x400/E91E63/FFFFFF?text=Admin+Dashboard)

</div>

---

## 🚀 **Instalación y Configuración**

### **📋 Prerequisitos**
```bash
Node.js >= 18.0.0
Yarn >= 4.0.0
PostgreSQL >= 14
```

### **⚡ Instalación Rápida**
```bash
# 1. Clonar el repositorio
git clone https://github.com/gonzaloyacante/rastuci.git
cd rastuci

# 2. Instalar dependencias
yarn install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Configurar base de datos
yarn prisma:generate
yarn prisma:migrate

# 5. Ejecutar en desarrollo
yarn dev
```

### **🔧 Variables de Entorno**
```env
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/rastuci"
DIRECT_URL="postgresql://user:password@localhost:5432/rastuci"

# Autenticación
NEXTAUTH_SECRET="your-super-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# MercadoPago (usa tus credenciales de sandbox)
MERCADOPAGO_ACCESS_TOKEN="TEST-your-test-token-here"

# Cloudinary (obtén tus credenciales en cloudinary.com)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# OneSignal (obtén tus credenciales en onesignal.com)
ONESIGNAL_APP_ID="your-app-id"
ONESIGNAL_REST_API_KEY="your-rest-api-key"
```

---

## 🏗️ **Arquitectura del Proyecto**

```
rastuci/
├── 📁 src/
│   ├── 📁 app/                 # Next.js 15 App Router
│   │   ├── 📁 (public)/        # Páginas públicas del e-commerce
│   │   ├── 📁 admin/           # Panel de administración
│   │   └── 📁 api/             # API Routes del backend
│   ├── 📁 components/          # Componentes reutilizables
│   │   ├── 📁 ui/              # Componentes base (Button, Input, etc.)
│   │   ├── 📁 layout/          # Componentes de layout
│   │   └── 📁 forms/           # Formularios especializados
│   ├── 📁 hooks/               # Custom hooks
│   ├── 📁 lib/                 # Configuraciones y utilidades
│   ├── 📁 context/             # Contextos de React
│   └── 📁 types/               # Definiciones TypeScript
├── 📁 prisma/                  # Schema y migraciones de DB
├── 📁 tests/                   # Tests unitarios e integración
└── 📁 public/                  # Archivos estáticos
```

### **🎯 Principios de Diseño**
- **Separation of Concerns**: Cada módulo tiene una responsabilidad específica
- **Reusabilidad**: Componentes modulares y reutilizables
- **Performance First**: Optimizado para velocidad y SEO
- **Type Safety**: TypeScript en todo el proyecto
- **Accessibility**: Componentes accesibles por defecto
- **Mobile First**: Diseño responsive desde el inicio

---

## 🎯 **Casos de Uso**

### **👥 Para Emprendedores**
- **Lanzar tu tienda online** de ropa infantil sin conocimientos técnicos
- **Gestionar inventario** de manera profesional
- **Procesar pagos** de forma segura y automática
- **Analizar ventas** con reportes detallados

### **🏢 Para Empresas**
- **Digitalizar** tu negocio físico de ropa infantil
- **Expandir** tu alcance a todo el país
- **Automatizar** procesos de venta y gestión
- **Mejorar** la experiencia del cliente

### **👨‍💻 Para Desarrolladores**
- **Base sólida** para proyectos e-commerce
- **Ejemplos reales** de arquitectura moderna
- **Código limpio** y bien documentado
- **Patrones avanzados** de React y Next.js

---

## 📱 **Demo Local**

### **🌐 Desarrollo Local**
Después de la instalación, accede a:
- **Tienda Online**: `http://localhost:3000`
- **Panel Admin**: `http://localhost:3000/admin`

### **🔐 Configuración de Admin**
Para acceder al panel de administración en tu instalación local:
1. Ejecuta `yarn prisma:seed` para crear datos de prueba
2. O crea un usuario admin manualmente desde la base de datos

### **💳 Pagos de Prueba**
Para probar la integración con MercadoPago, usa las tarjetas de prueba oficiales:
```
Visa: 4509 9535 6623 3704
CVV: 123 | Vencimiento: 11/30
Titular: APRO (para aprobado)
```
*Consulta la documentación de MercadoPago para más tarjetas de prueba*

---

## 📦 **Integración con Correo Argentino (MiCorreo API)**

Rastuci incluye integración completa con **Correo Argentino** a través de la API MiCorreo, permitiendo cotización de envíos, importación de pedidos y tracking en tiempo real.

### **🔑 Configuración de Credenciales**

1. **Obtener Credenciales**:
   - Registrarse en el portal MiCorreo de Correo Argentino
   - Solicitar credenciales de API (username + password)
   - Obtener Customer ID desde el portal

2. **Configurar Variables de Entorno**:
```env
# Correo Argentino (MiCorreo API)
# Ambiente de Testing (desarrollo)
CORREO_ARGENTINO_API_URL="https://apitest.correoargentino.com.ar/micorreo/v1"

# Ambiente de Producción (comentar en desarrollo)
# CORREO_ARGENTINO_API_URL="https://api.correoargentino.com.ar/micorreo/v1"

# Credenciales (solicitar a Correo Argentino)
CORREO_ARGENTINO_USERNAME="YOUR_USERNAME_HERE"
CORREO_ARGENTINO_PASSWORD="YOUR_PASSWORD_HERE"
CORREO_ARGENTINO_CUSTOMER_ID="YOUR_CUSTOMER_ID_HERE"

# Datos de la tienda (remitente)
STORE_NAME="Rastuci"
STORE_ADDRESS="Calle Ejemplo 123"
STORE_CITY="CABA"
STORE_PROVINCE="C"
STORE_POSTAL_CODE="1425"
STORE_PHONE="1122334455"
STORE_EMAIL="info@rastuci.com.ar"
```

### **🚀 Flujo Completo: Checkout → Import → Tracking**

#### **1. Cotización de Envío** (`/api/shipping/calculate`)
El sistema calcula automáticamente el costo de envío durante el checkout:
```typescript
// Cliente selecciona productos y dirección
// → API calcula rates con Correo Argentino
// → Muestra opciones de envío (domicilio/sucursal)
// → Cliente elige opción
```

#### **2. Importación de Pedido** (`/api/checkout`)
Cuando el cliente confirma el pedido:
```typescript
// 1. Se crea el Order en la DB
// 2. Se llama a correoArgentinoService.importShipment()
// 3. Se recibe tracking number y shipment ID
// 4. Se actualiza Order con caTrackingNumber y caShipmentId
```

#### **3. Tracking en Tiempo Real** (`/api/admin/tracking`)
Admin y cliente pueden seguir el envío:
```typescript
// Panel Admin: /admin/tracking
// - GET /api/admin/tracking → obtiene tracking de ambos proveedores (OCA + CA)
// - POST /api/admin/tracking?action=refresh → sincroniza estados
// - Muestra historial de eventos de tracking

// Cliente: /tracking
// - Ingresa número de tracking
// - Sistema detecta proveedor (OCA o CA)
// - Muestra estado actual y eventos
```

### **📡 APIs Disponibles**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/shipping/calculate` | POST | Calcula tarifas de envío con CA |
| `/api/checkout` | POST | Crea order e importa envío a CA |
| `/api/admin/tracking` | GET | Obtiene tracking de pedidos (dual-provider) |
| `/api/admin/tracking` | POST | Sincroniza estados desde CA API |
| `/api/admin/sucursales-ca/sync` | POST | Sincroniza sucursales a DB local |

### **🏢 Gestión de Sucursales**

El sistema permite gestionar sucursales de Correo Argentino:
```typescript
// Panel Admin: /admin/sucursales-ca
// - Cargar sucursales por provincia desde API
// - Buscar y filtrar sucursales
// - Exportar a CSV
// - Sincronizar a base de datos local
```

Componente para selección de sucursales en checkout:
```tsx
import { AgencySelector } from '@/components/checkout/AgencySelector';

<AgencySelector
  province="B"
  onSelect={(agency) => handleAgencySelect(agency)}
/>
```

### **🔧 Servicios y Hooks**

**Servicio completo** (`src/lib/correo-argentino-service.ts`):
```typescript
import { correoArgentinoService } from '@/lib/correo-argentino-service';

// Autenticación
await correoArgentinoService.authenticate();

// Calcular tarifas
const rates = await correoArgentinoService.calculateRates({
  customerId, postalCodeOrigin, postalCodeDestination,
  deliveredType: 'D', dimensions: { weight, height, width, length }
});

// Importar envío
const shipment = await correoArgentinoService.importShipment({
  customerId, extOrderId, sender, recipient, deliveredType, packages
});

// Obtener tracking
const tracking = await correoArgentinoService.getTracking({
  shippingId: trackingNumber
});

// Obtener sucursales
const agencies = await correoArgentinoService.getAgencies({
  province: 'B'
});
```

**Hook para React** (`src/hooks/useCorreoArgentino.ts`):
```tsx
import { useCorreoArgentino } from '@/hooks';

function MyComponent() {
  const {
    authenticate, calculateRates, importShipment,
    getTracking, getAgencies, loading, error
  } = useCorreoArgentino();

  // Usar métodos con manejo automático de estado
}
```

### **📊 Modelos de Base de Datos**

El sistema incluye 5 modelos para Correo Argentino:
- **CACustomer**: Clientes registrados en MiCorreo
- **CAShippingRate**: Cotizaciones de envío
- **CAShipment**: Envíos importados
- **CATrackingEvent**: Eventos de tracking
- **CAAgency**: Sucursales de Correo Argentino

Además, el modelo **Order** se extiende con 40+ campos para datos de CA (sender, recipient, shipping, package details).

### **📈 Analytics**

Panel de analytics con comparativa OCA vs Correo Argentino:
```
/admin/shipping-analytics
- Tiempo promedio de entrega por proveedor
- Tasa de entregas a tiempo
- Costos promedio
- Performance por región
```

### **🧪 Testing**

Tests unitarios completos para el servicio:
```bash
yarn test tests/lib/correo-argentino-service.test.ts
```

---

## 🤝 **Contribuir**

¡Las contribuciones son bienvenidas! Este proyecto está diseñado para ser un ejemplo de calidad y una base sólida para proyectos reales.

### **🛠️ Cómo Contribuir**
1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **📝 Guidelines**
- Seguir las convenciones de código establecidas
- Incluir tests para nuevas funcionalidades
- Actualizar documentación si es necesario
- Usar commits descriptivos y en inglés

---

## 📈 **Roadmap**

### **🚀 v2.0 - Q1 2025**
- [ ] **App Mobile** nativa con React Native
- [ ] **Integración WhatsApp** para soporte en tiempo real
- [ ] **Sistema de Afiliados** para vendedores
- [ ] **Multi-idioma** (inglés, portugués)
- [ ] **PWA Completa** con funcionalidades offline

### **🎯 v2.1 - Q2 2025**
- [ ] **IA para Recomendaciones** personalizadas
- [ ] **Realidad Aumentada** para probadores virtuales
- [ ] **Marketplace** multi-vendor
- [ ] **Analytics Avanzados** con BI integrado
- [ ] **API Pública** para integraciones

---

## 👨‍💻 **Sobre el Desarrollador**

<div align="center">

### **Gonzalo Yacante**
*Full Stack Developer & Entrepreneur*

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/gonzaloyacante)
[![Email](https://img.shields.io/badge/Email-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:contact@example.com)

</div>

Desarrollador con **5+ años de experiencia** en tecnologías web modernas. Especializado en **React**, **Next.js** y **arquitecturas escalables**. Apasionado por crear productos digitales que generen impacto real en los negocios.

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## ⭐ **¿Te gusta el proyecto?**

<div align="center">

### **¡Dale una estrella ⭐ si este proyecto te resulta útil!**

**Comparte con otros desarrolladores y ayúdanos a crecer 🚀**

[![Star History Chart](https://api.star-history.com/svg?repos=gonzaloyacante/rastuci&type=Date)](https://star-history.com/#gonzaloyacante/rastuci&Date)

</div>

---

<div align="center">

### 🎉 **¡Gracias por tu interés en Rastuci!** 🎉

*Construyendo el futuro del e-commerce infantil, una línea de código a la vez.*

**[� Ver Documentación](#instalación-y-configuración)** • **[💻 Descargar Código](https://github.com/gonzaloyacante/rastuci)** • **[📞 Contacto](mailto:contact@example.com)**

---

**© 2025 Rastuci - Hecho con ❤️ en Argentina 🇦🇷**

</div>
