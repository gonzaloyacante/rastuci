# Rastuci - Ecommerce Platform

Plataforma de ecommerce moderna construida con Next.js, TypeScript y Tailwind CSS con sistema de colores semánticos, seguridad robusta y experiencia de usuario optimizada.

## 🚀 Características

### Core Features
- 🛍️ **Catálogo de productos** con filtros avanzados, búsqueda y sorting
- 🛒 **Carrito de compras** funcional con persistencia
- ❤️ **Sistema de favoritos/wishlist** completo
- 📱 **Diseño responsive** y accesible
- 🌙 **Modo oscuro** con switching automático
- 🔐 **Panel de administración** seguro
- 📊 **Dashboard** con métricas en tiempo real

### Seguridad y Performance
- 🛡️ **Seguridad robusta**: CSRF protection, rate limiting, input sanitization
- 🔒 **Autenticación JWT** con session management
- ⚡ **Loading states** y skeleton components
- 🎯 **Error boundaries** y manejo de errores
- 🔍 **SEO optimizado** con meta tags dinámicos

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS con sistema de colores semánticos
- **Base de datos**: PostgreSQL con Prisma ORM
- **Seguridad**: JWT, CSRF tokens, Rate limiting
- **Testing**: Jest, React Testing Library
- **Deployment**: Vercel ready

## 🎨 Sistema de Colores Semánticos

### Utilidades CSS Disponibles

#### Colores de Superficie
```css
.surface          /* Fondo de superficie principal */
.hover-surface    /* Estado hover de superficie */
.muted           /* Texto/elementos secundarios */
```

#### Colores Semánticos
```css
.text-primary    /* Color primario de texto */
.text-error      /* Color de error */
.text-success    /* Color de éxito */
.text-warning    /* Color de advertencia */
.text-info       /* Color informativo */

.bg-primary      /* Fondo primario */
.bg-error        /* Fondo de error */
.bg-success      /* Fondo de éxito */
.bg-warning      /* Fondo de advertencia */

.border-primary  /* Borde primario */
.border-error    /* Borde de error */
.border-muted    /* Borde sutil */
```

#### Variables CSS Disponibles
```css
/* Colores principales */
--color-primary: #e91e63;
--color-primary-dark: #c2185b;
--color-primary-light: #f8bbd9;

/* Estados */
--color-success: #4caf50;
--color-warning: #ff9800;
--color-error: #f44336;
--color-info: #2196f3;

/* Superficies */
--color-background: #ffffff;
--color-surface: #f8f9fa;
--color-surface-hover: #f1f3f4;

/* Texto */
--color-text: #212529;
--color-text-muted: #6c757d;

/* Bordes */
--color-border: #dee2e6;
--color-border-muted: #e9ecef;
```

### Modo Oscuro
El sistema automáticamente adapta todos los colores para modo oscuro:

```css
.dark {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-surface-hover: #334155;
  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
  --color-border-muted: #475569;
}
```

### Convenciones de Uso

#### ✅ Recomendado
```tsx
// Usar utilidades semánticas
<div className="surface border border-muted">
  <h2 className="text-primary">Título</h2>
  <p className="muted">Descripción</p>
  <button className="bg-primary text-white">Acción</button>
</div>
```

#### ❌ Evitar
```tsx
// No usar colores hardcodeados
<div className="bg-white border-gray-200">
  <h2 className="text-pink-600">Título</h2>
  <p className="text-gray-500">Descripción</p>
  <button className="bg-pink-600 text-white">Acción</button>
</div>
```

## 📦 Instalación

1. **Clona el repositorio:**
```bash
git clone https://github.com/tu-usuario/rastuci.git
cd rastuci
```

2. **Instala las dependencias:**
```bash
yarn install
```

3. **Configura las variables de entorno:**
```bash
cp .env.example .env.local
```

Configura las siguientes variables:
```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Security
JWT_SECRET="your-jwt-secret"
ADMIN_API_TOKEN="your-admin-token"

# Next.js
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Ejecuta las migraciones:**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Inicia el servidor:**
```bash
yarn dev
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
yarn test

# Tests en modo watch
yarn test:watch

# Coverage report
yarn test:coverage

# Type checking
yarn type-check

# Linting
yarn lint
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── admin/             # Panel de administración
│   ├── api/               # API routes
│   ├── productos/         # Páginas de productos
│   └── globals.css        # Estilos globales y variables CSS
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── forms/            # Componentes de formularios
│   ├── layout/           # Componentes de layout
│   └── products/         # Componentes específicos de productos
├── context/              # Contextos de React
│   ├── CartContext.tsx   # Estado del carrito
│   └── WishlistContext.tsx # Estado de favoritos
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
│   ├── rate-limit.ts     # Rate limiting
│   ├── input-sanitization.ts # Sanitización
│   └── session-jwt.ts    # Manejo de JWT
├── middleware/           # Middleware de seguridad
├── types/                # Definiciones de tipos
└── utils/                # Funciones utilitarias
```

## 🔒 Seguridad

### Headers de Seguridad
- **CSP (Content Security Policy)**: Previene XSS
- **HSTS**: Fuerza HTTPS en producción
- **X-Frame-Options**: Previene clickjacking
- **X-Content-Type-Options**: Previene MIME sniffing

### Protección CSRF
- Tokens CSRF en todos los formularios
- Validación en middleware

### Rate Limiting
```typescript
// Configuraciones predefinidas
const rateLimits = {
  api: { requests: 100, window: '15m' },
  auth: { requests: 5, window: '15m' },
  search: { requests: 50, window: '1m' }
};
```

### Sanitización de Inputs
- Validación con Zod schemas
- Sanitización automática de strings
- Prevención de SQL injection

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Variables de Entorno en Producción
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="production-jwt-secret"
ADMIN_API_TOKEN="production-admin-token"
NEXTAUTH_SECRET="production-nextauth-secret"
NEXTAUTH_URL="https://tu-dominio.com"
```

## 📊 Scripts Disponibles

```bash
# Desarrollo
yarn dev              # Servidor de desarrollo
yarn build            # Build para producción
yarn start            # Servidor de producción

# Testing y Calidad
yarn test             # Ejecutar tests
yarn test:watch       # Tests en modo watch
yarn test:coverage    # Coverage report
yarn lint             # ESLint
yarn type-check       # TypeScript checking

# Base de datos
yarn db:migrate       # Ejecutar migraciones
yarn db:seed          # Seed de datos
yarn db:studio        # Prisma Studio
yarn db:reset         # Reset completo de DB
```

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de notificaciones por email
- [ ] Gestión avanzada de inventario
- [ ] Seguimiento de pedidos en tiempo real
- [ ] Soporte multiidioma (i18n)
- [ ] PWA support
- [ ] Integración con pasarelas de pago

### Optimizaciones Técnicas
- [ ] React Query para caching
- [ ] Image optimization avanzada
- [ ] Bundle splitting optimizado
- [ ] Performance monitoring
- [ ] CI/CD pipeline completo

## 🤝 Contribución

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Sigue** las convenciones de colores semánticos
4. **Ejecuta** tests y linting (`yarn test && yarn lint`)
5. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
6. **Push** a la rama (`git push origin feature/AmazingFeature`)
7. **Abre** un Pull Request

### Convenciones de Código
- Usar utilidades semánticas de color
- Seguir patrones de accesibilidad
- Incluir tests para nuevas funcionalidades
- Documentar componentes complejos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ por el equipo de Rastuci**