import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Obtener categorías existentes
  const categories = await prisma.category.findMany();
  console.log("Categorías encontradas:", categories.length);

  // Mapear categorías por nombre
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.name] = cat.id;
    return acc;
  }, {} as Record<string, string>);

  // Productos nuevos para agregar (solo los más importantes)
  const newProducts = [
    // Ropa de Niña - 2 productos
    {
      name: 'Vestido Floral Primavera',
      description: 'Hermoso vestido con estampado floral perfecto para la primavera.',
      price: 3200, salePrice: 2400, stock: 15, onSale: true,
      images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400"],
      sizes: ["2", "4", "6", "8"], colors: ["Rosa", "Blanco", "Celeste"],
      features: ["100% Algodón", "Lavable en máquina"], rating: 4.7, reviewCount: 23,
      categoryName: 'Ropa de Niña'
    },
    {
      name: 'Blusa Bordada Artesanal',
      description: 'Blusa con bordados hechos a mano. Perfecta para ocasiones especiales.',
      price: 4500, salePrice: 3600, stock: 8, onSale: true,
      images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400"],
      sizes: ["2", "4", "6"], colors: ["Blanco", "Crema", "Rosa Pálido"],
      features: ["Bordado artesanal", "100% Algodón"], rating: 4.9, reviewCount: 12,
      categoryName: 'Ropa de Niña'
    },

    // Ropa de Niño - 2 productos
    {
      name: 'Camisa Cuadros Casual',
      description: 'Camisa a cuadros perfecta para el día a día. Cómoda y versátil.',
      price: 3500, salePrice: 2800, stock: 18, onSale: true,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"],
      sizes: ["4", "6", "8", "10"], colors: ["Azul", "Rojo", "Verde"],
      features: ["100% Algodón", "Botones resistentes"], rating: 4.6, reviewCount: 27,
      categoryName: 'Ropa de Niño'
    },
    {
      name: 'Polo Deportivo Mesh',
      description: 'Polo deportivo con tecnología mesh para mayor ventilación.',
      price: 2900, salePrice: 2200, stock: 30, onSale: true,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400"],
      sizes: ["6", "8", "10", "12"], colors: ["Azul", "Rojo", "Negro", "Blanco"],
      features: ["Tecnología mesh", "Secado rápido"], rating: 4.8, reviewCount: 42,
      categoryName: 'Ropa de Niño'
    },

    // Ropa de Bebé - 2 productos
    {
      name: 'Body Manga Larga Pack 3',
      description: 'Pack de 3 bodies de manga larga en colores pastel. Súper suaves.',
      price: 2400, salePrice: 1800, stock: 35, onSale: true,
      images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400"],
      sizes: ["0-3M", "3-6M", "6-9M", "9-12M"], colors: ["Rosa", "Celeste", "Amarillo"],
      features: ["100% Algodón orgánico", "Pack x3"], rating: 4.9, reviewCount: 67,
      categoryName: 'Ropa de Bebé'
    },
    {
      name: 'Conjunto Primer Paseo',
      description: 'Conjunto elegante para las primeras salidas del bebé.',
      price: 4500, salePrice: 3600, stock: 8, onSale: true,
      images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400"],
      sizes: ["0-3M", "3-6M"], colors: ["Blanco", "Crema", "Rosa Suave"],
      features: ["Algodón premium", "Incluye gorro"], rating: 4.8, reviewCount: 15,
      categoryName: 'Ropa de Bebé'
    },

    // Accesorios - 2 productos
    {
      name: 'Gorro Lana Pompón',
      description: 'Gorro tejido en lana con pompón. Perfecto para el frío.',
      price: 1800, salePrice: 1400, stock: 40, onSale: true,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      sizes: ["S", "M", "L"], colors: ["Rosa", "Azul", "Gris", "Rojo"],
      features: ["100% Lana", "Pompón desmontable"], rating: 4.5, reviewCount: 52,
      categoryName: 'Accesorios'
    },
    {
      name: 'Mochila Escolar Unicornio',
      description: 'Mochila con diseño de unicornio. Perfecta para el colegio.',
      price: 5200, salePrice: null, stock: 15, onSale: false,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"],
      sizes: ["Única"], colors: ["Rosa", "Morado", "Celeste"],
      features: ["Compartimentos múltiples", "Resistente al agua"], rating: 4.7, reviewCount: 38,
      categoryName: 'Accesorios'
    },

    // Pijamas - 2 productos
    {
      name: 'Pijama Superhéroes',
      description: 'Pijama con estampado de superhéroes. Para pequeños valientes.',
      price: 3200, salePrice: 2500, stock: 20, onSale: true,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      sizes: ["4", "6", "8", "10"], colors: ["Azul", "Rojo", "Negro"],
      features: ["100% Algodón", "Estampado resistente"], rating: 4.6, reviewCount: 44,
      categoryName: 'Pijamas'
    },
    {
      name: 'Pijama Térmica Invierno',
      description: 'Pijama térmica para las noches más frías. Extra abrigada.',
      price: 4200, salePrice: 3400, stock: 12, onSale: true,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      sizes: ["6", "8", "10", "12"], colors: ["Gris", "Azul Marino", "Burdeos"],
      features: ["Tela térmica", "Forro interior"], rating: 4.7, reviewCount: 28,
      categoryName: 'Pijamas'
    },

    // Ropa de Baño - 2 productos
    {
      name: 'Traje de Baño Sirena',
      description: 'Traje de baño con cola de sirena desmontable. Mágico y divertido.',
      price: 4800, salePrice: 3800, stock: 10, onSale: true,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      sizes: ["4", "6", "8", "10"], colors: ["Turquesa", "Rosa", "Morado"],
      features: ["Cola desmontable", "Protección UV"], rating: 4.9, reviewCount: 26,
      categoryName: 'Ropa de Baño'
    },
    {
      name: 'Bikini Flores Tropicales',
      description: 'Bikini con estampado de flores tropicales. Fresco y colorido.',
      price: 3200, salePrice: 2600, stock: 14, onSale: true,
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"],
      sizes: ["4", "6", "8", "10"], colors: ["Coral", "Amarillo", "Verde Agua"],
      features: ["Estampado tropical", "Protección UV"], rating: 4.6, reviewCount: 22,
      categoryName: 'Ropa de Baño'
    }
  ];

  // Crear productos
  let createdCount = 0;

  for (const productData of newProducts) {
    const categoryId = categoryMap[productData.categoryName];
    
    if (!categoryId) {
      console.log(`❌ Categoría no encontrada: ${productData.categoryName}`);
      continue;
    }

    // Verificar si el producto ya existe
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name }
    });

    if (existingProduct) {
      console.log(`⚠️  Ya existe: ${productData.name}`);
      continue;
    }

    const productPayload = {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      salePrice: productData.salePrice,
      stock: productData.stock,
      onSale: productData.onSale,
      images: JSON.stringify(productData.images),
      sizes: productData.sizes,
      colors: productData.colors,
      features: productData.features,
      rating: productData.rating,
      reviewCount: productData.reviewCount,
      categoryId: categoryId
    };

    await prisma.product.create({
      data: productPayload
    });
    createdCount++;
    console.log(`✅ Creado: ${productData.name}`);
  }

  // Actualizar productos existentes para ofertas
  const updates = [
    { name: 'Traje de Baño Niño', salePrice: 1800 },
    { name: 'Pijama de Dinosaurios', salePrice: 2200 },
    { name: 'Zapatillas Deportivas', salePrice: 3100 }
  ];

  for (const update of updates) {
    const result = await prisma.product.updateMany({
      where: { name: update.name },
      // Cast to any to avoid TS error if Prisma Client types are outdated
      data: { onSale: true, salePrice: update.salePrice } as any
    });
    if (result.count > 0) {
      console.log(`🔄 Oferta agregada: ${update.name}`);
    }
  }

  // Estadísticas finales
  const totalProducts = await prisma.product.count();
  const productsOnSale = await prisma.product.count({ where: { onSale: true } });
  
  console.log(`\n🎉 ¡Completado!`);
  console.log(`📦 Productos creados: ${createdCount}`);
  console.log(`📊 Total productos: ${totalProducts}`);
  console.log(`🏷️ Productos en oferta: ${productsOnSale}`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
