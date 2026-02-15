# AGENTS.md - E-commerce Rastuci

> **CONTEXTO**: Plataforma de E-commerce real para venta de ropa infantil. Maneja pagos, envíos
> (Correo Argentino), stock y facturación. **OBJETIVO**: **Estabilidad Financiera y de Datos**. Un
> error aquí significa pérdida de dinero o pedidos. Prioridad absoluta a la integridad de datos y UX
> de checkout.

---

## 1. 🛠 Stack & Herramientas (Estricto)

| Herramienta         | Versión/Detalle         | Restricción                                                            |
| :------------------ | :---------------------- | :--------------------------------------------------------------------- |
| **Package Manager** | `pnpm`                  | **PROHIBIDO** usar npm o yarn.                                         |
| **Framework**       | Next.js 16 (App Router) | Migración gradual de Pages a App Router (Verificar directorio actual). |
| **Lenguaje**        | TypeScript              | **Strict Mode**. Tipos para API Responses son obligatorios.            |
| **Base de Datos**   | PostgreSQL (Neon Tech)  | Neon Branching activo.                                                 |
| **ORM**             | Prisma                  | Schema complejo con Relaciones JSON migradas a tablas.                 |
| **Estilos**         | Tailwind CSS 4          | Configuración extensa en `tailwind.config.ts`. Animaciones custom.     |
| **Estado Global**   | Zustand / Context       | Carrito de compras (`CartContext` o store).                            |
| **Auth**            | NextAuth.js v4          | Providers: Google y Credentials.                                       |
| **Pagos**           | MercadoPago             | SDK oficial. Webhooks críticos en `/api/webhooks/mercadopago`.         |
| **Testing**         | Vitest + Playwright     | Cobertura obligatoria para Checkout y Cálculo de Envíos.               |

---

## 2. 📂 Arquitectura & Estructura

- **`/src/app`**: Rutas principales (Checkout, Productos, Admin).
  - `checkout/`: Flujo crítico. Validar cada paso (Envío -> Pago -> Confirmación).
  - `admin/`: Panel de gestión de productos y órdenes.
- **`/src/components`**:
  - `ui/`: Design System propio (Botones, Inputs, Badges de estado).
  - `products/`: Cards de producto, selectores de variantes (Color/Talle).
- **`/src/lib`**: Lógica core.
  - `utils.ts`: Formateo de moneda (`formatCurrency`). **Siempre usar esta función**.
  - `prisma.ts`: Cliente DB.
- **`/src/services`**: Capa de servicio para integraciones externas.
  - `shipping.service.ts`: Lógica de Correo Argentino.
  - `mercadopago.service.ts`: Creación de preferencias.
- **`/src/hooks`**: Custom hooks.
  - `useCart`: Lógica del carrito (add, remove, update quantity, sync with local storage).

---

## 3. 💳 Reglas de Negocio Críticas (E-commerce)

1.  **Manejo de Dinero**:
    - **NUNCA** usar `float` para precios.
    - En DB: `Decimal(10, 2)`.
    - En código: Usar bibliotecas o enteros (centavos) si es necesario manipular, pero preferir
      `Decimal` de Prisma.

2.  **Stock & Inventario**:
    - El stock vive en `product_variants` (Color + Talle).
    - **Race Conditions**: Al iniciar checkout, verificar stock en tiempo real.
    - Reserva de stock: Usar `stock_reservations` para bloquear items durante el pago
      (opcional/avanzado).

3.  **Checkout Flow**:
    - **Validación Cruzada**: El precio del frontend es visual. El backend (API Routes/Actions) DEBE
      recalcular el total sumando items de la DB. Jamás confiar en el total enviado por el cliente.
    - **Envíos**: Calcular costo de envío basado en CP y peso real de los productos en el carrito.

---

## 4. 🗄️ Base de Datos & Neon Branching

**Neon Branching** separa los datos reales de ventas de las pruebas.

### **Producción (`main`)**

- **Branch**: `main`
- **DB URL**: `ep-polished-river...` (Ver `.env.production`)
- **PELIGRO**: Cada registro aquí es una venta o un cliente real.
- **Acciones Prohibidas**: `db push` directo, borrado masivo, seeding destructivo.

### **Desarrollo (`develop`)**

- **Branch**: `preview/develop`
- **DB URL**: `ep-twilight-firefly...` (Ver `.env` local)
- **Uso**: Desarrollo de features, pruebas de integración.
- **Seeds**: `pnpm db:seed` puebla esta base con productos y categorías de prueba.

---

## 5. 🛡️ Seguridad & Integraciones

1.  **Credenciales**:
    - Keys de MercadoPago y Correo Argentino viven en Vercel Env Vars.
    - En local, deben estar en `.env`.
    - **NUNCA** hardcodear tokens.

2.  **Webhooks**:
    - Los webhooks de pago deben validar la firma o el origen (IPs de MP) si es posible.
    - Idempotencia: Procesar el mismo webhook dos veces no debe duplicar la orden.

3.  **Datos de Usuario**:
    - No exponer datos sensibles (teléfono, dirección exacta) en respuestas públicas de API.
    - Proteger rutas `/admin` con middleware estricto (`role === 'ADMIN'`).

---

## 6. 🤖 Flujo de Trabajo para el Agente

1.  **Seguridad Primero**:
    - Si tocas lógica de pagos o checkout, pide revisión doble.
    - Verifica que tus cambios no rompan la calculadora de envíos.

2.  **Testing**:
    - "Si no está testeado, está roto".
    - Nuevas features deben incluir test unitario (Vitest) o E2E (Playwright).
    - Ejecuta `pnpm verify` antes de decir "listo".

3.  **Consultas DB**:
    - Prisma es poderoso pero cuidado con el **N+1**. Usa `include` sabiamente.
    - Para reportes de dashboard, considera usar `groupBy` o raw queries si es muy complejo/lento.

---

## 7. 🚫 Anti-Patrones (E-commerce Edition)

- ❌ Confiar en el precio que viene del `localStorage` o del cliente.
- ❌ Guardar tarjetas de crédito en nuestra DB (Eso es trabajo de MercadoPago).
- ❌ Usar `any` en respuestas de API de terceros. Definir interfaces para la respuesta de Correo
  Argentino/MP.
- ❌ Modificar stock sin transacción de base de datos.
- ❌ Ignorar errores de red en el checkout. El usuario debe saber si falló el pago.
