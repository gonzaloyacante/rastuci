# 📦 Guía para Poblar la Base de Datos

## 🎯 Objetivo
Agregar 25 productos adicionales distribuidos equitativamente entre las 6 categorías existentes, con algunos productos en oferta para mostrar el sistema de precios.

## 📋 Productos Agregados

### Por Categoría:
- **👗 Ropa de Niña**: 5 productos (2 en oferta)
- **👕 Ropa de Niño**: 5 productos (2 en oferta)  
- **👶 Ropa de Bebé**: 5 productos (2 en oferta)
- **👟 Accesorios**: 4 productos (2 en oferta)
- **🌙 Pijamas**: 4 productos (1 en oferta)
- **🏊 Ropa de Baño**: 4 productos (2 en oferta)
- **➕ Extras**: 3 productos variados (2 en oferta)

**Total**: 30 productos nuevos | **13 productos en oferta**

## 🚀 Cómo Ejecutar

### Opción 1: Prisma Studio
1. Abre Prisma Studio: `npx prisma studio`
2. Ve a la tabla `Product`
3. Copia y pega cada INSERT manualmente

### Opción 2: Base de Datos Directa
```bash
# Si usas PostgreSQL local
psql -d tu_base_de_datos -f seed-products.sql

# Si usas Neon u otro servicio
# Copia el contenido del archivo y pégalo en el query editor
```

### Opción 3: Prisma Migrate
```bash
# Crear una migración personalizada
npx prisma migrate dev --create-only --name seed_products
# Luego copia el contenido del SQL al archivo de migración generado
npx prisma migrate dev
```

## 🎨 Características de los Productos

### Precios Realistas
- **Rango**: $1,400 - $5,500 ARS
- **Ofertas**: 15-25% de descuento
- **Stock**: Entre 8-60 unidades

### Datos Completos
- ✅ Nombres descriptivos
- ✅ Descripciones detalladas
- ✅ Múltiples talles y colores
- ✅ Características específicas
- ✅ Ratings realistas (4.2-4.9)
- ✅ Cantidad de reseñas variable

### Imágenes
- 📸 URLs de Unsplash optimizadas
- 🖼️ Imágenes relacionadas con cada categoría
- 📱 Responsive (400px width)

## 🔍 Verificación

Después de ejecutar el script, verifica:

```sql
-- Contar productos por categoría
SELECT c.name, COUNT(p.id) as total_productos
FROM "Category" c
LEFT JOIN "Product" p ON c.id = p."categoryId"
GROUP BY c.id, c.name
ORDER BY c.name;

-- Contar productos en oferta
SELECT COUNT(*) as productos_en_oferta
FROM "Product"
WHERE "onSale" = true AND "salePrice" IS NOT NULL;

-- Ver productos con mayor descuento
SELECT name, price, "salePrice", 
       ROUND(((price - "salePrice") / price * 100)::numeric, 1) as descuento_porcentaje
FROM "Product"
WHERE "onSale" = true AND "salePrice" IS NOT NULL
ORDER BY descuento_porcentaje DESC;
```

## 🎉 Resultado Esperado

Al finalizar tendrás:
- **~36 productos totales** (6 originales + 30 nuevos)
- **~16 productos en oferta** con precios tachados
- **Distribución equilibrada** por categorías
- **Experiencia de ecommerce realista**

## 🐛 Troubleshooting

### Error: Duplicate key
Si algunos IDs ya existen, cambia los IDs en el script:
```sql
-- Cambiar de:
'prod_nina_001'
-- A:
'prod_nina_001_new'
```

### Error: Foreign key constraint
Verifica que los `categoryId` coincidan con tu BD:
```sql
SELECT id, name FROM "Category";
```

### Error: Column doesn't exist
Si `salePrice` no existe, ejecuta primero:
```sql
ALTER TABLE "Product" ADD COLUMN "salePrice" DECIMAL(10,2);
```

¡Listo para poblar tu ecommerce! 🛒✨
