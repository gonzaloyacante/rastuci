import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Ropa de Bebé" },
      update: {
        imageUrl:
          "https://images.unsplash.com/photo-1606229365485-93a3b8aee0c3?w=800&auto=format&fit=crop",
      },
      create: {
        name: "Ropa de Bebé",
        description: "Ropa cómoda y suave para los más pequeños",
        imageUrl:
          "https://images.unsplash.com/photo-1606229365485-93a3b8aee0c3?w=800&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { name: "Ropa de Niño" },
      update: {
        imageUrl:
          "https://images.unsplash.com/photo-1520975922284-8b456906c813?w=800&auto=format&fit=crop",
      },
      create: {
        name: "Ropa de Niño",
        description: "Ropa divertida y resistente para niños activos",
        imageUrl:
          "https://images.unsplash.com/photo-1520975922284-8b456906c813?w=800&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { name: "Ropa de Niña" },
      update: {
        imageUrl:
          "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&auto=format&fit=crop",
      },
      create: {
        name: "Ropa de Niña",
        description: "Ropa elegante y colorida para niñas",
        imageUrl:
          "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { name: "Accesorios" },
      update: {
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop",
      },
      create: {
        name: "Accesorios",
        description: "Zapatos, gorros, bufandas y más accesorios",
        imageUrl:
          "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { name: "Pijamas" },
      update: {
        imageUrl:
          "https://images.unsplash.com/photo-1540924782259-1d6a1dfd2d6b?w=800&auto=format&fit=crop",
      },
      create: {
        name: "Pijamas",
        description: "Pijamas cómodos para dormir",
        imageUrl:
          "https://images.unsplash.com/photo-1540924782259-1d6a1dfd2d6b?w=800&auto=format&fit=crop",
      },
    }),
    prisma.category.upsert({
      where: { name: "Ropa de Baño" },
      update: {
        imageUrl:
          "https://images.unsplash.com/photo-1520974735194-6c0b5a5d2b9b?w=800&auto=format&fit=crop",
      },
      create: {
        name: "Ropa de Baño",
        description: "Trajes de baño y ropa para la playa",
        imageUrl:
          "https://images.unsplash.com/photo-1520974735194-6c0b5a5d2b9b?w=800&auto=format&fit=crop",
      },
    }),
  ]);

  console.log("Categorías creadas:", categories.length);

  // Helper para crear o actualizar producto por nombre (evita duplicados si corres el seed varias veces)
  async function upsertProductByName(data: {
    name: string;
    description?: string;
    price: number;
    stock: number;
    onSale?: boolean;
    images: string[];
    sizes: string[];
    colors: string[];
    features: string[];
    rating?: number;
    reviewCount?: number;
    categoryId: string;
  }) {
    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    const mappedData = {
      ...data,
      images: JSON.stringify(data.images),
    } as any;
    if (existing) {
      return prisma.product.update({ where: { id: existing.id }, data: mappedData });
    }
    return prisma.product.create({ data: mappedData });
  }

  // Definiciones de producto base
  const productDefs = [
    {
      name: "Body de Bebé Rosa",
      description:
        "Body suave y cómodo para bebés de 0-6 meses. Fabricado con 100% algodón orgánico, perfecto para la piel sensible de los bebés. Diseño con botones de seguridad en la entrepierna para facilitar el cambio de pañal.",
      price: 2500,
      stock: 50,
      onSale: true,
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
      ],
      sizes: ["0-3M", "3-6M", "6-9M", "9-12M"],
      colors: ["Rosa", "Azul", "Amarillo", "Blanco"],
      features: [
        "100% Algodón orgánico",
        "Lavable en máquina",
        "Diseño cómodo y fresco",
        "Botones de seguridad",
        "Sin etiquetas que irriten",
      ],
      rating: 4.8,
      reviewCount: 127,
      categoryId: categories[0].id,
    },
    {
      name: "Conjunto Niño Azul",
      description:
        "Conjunto deportivo para niños de 2-4 años. Ideal para actividades físicas y juegos al aire libre. Material transpirable que mantiene a los niños frescos durante todo el día.",
      price: 4500,
      stock: 30,
      onSale: true, // también en oferta para variedad
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
      ],
      sizes: ["2T", "3T", "4T", "5T"],
      colors: ["Azul", "Rojo", "Verde", "Negro"],
      features: [
        "Material transpirable",
        "Resistente al desgaste",
        "Elástico en la cintura",
        "Bolsillos laterales",
        "Ideal para deportes",
      ],
      rating: 4.6,
      reviewCount: 89,
      categoryId: categories[1].id,
    },
    {
      name: "Vestido Niña Floral",
      description:
        "Vestido elegante con estampado floral perfecto para ocasiones especiales. Diseño suave y cómodo que permite libertad de movimiento. Ideal para fiestas y eventos familiares.",
      price: 3800,
      stock: 25,
      onSale: true, // también en oferta para variedad
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
      ],
      sizes: ["2T", "3T", "4T", "5T", "6T"],
      colors: ["Rosa", "Azul", "Lavanda", "Amarillo"],
      features: [
        "Estampado floral duradero",
        "Tela suave al tacto",
        "Diseño elegante",
        "Fácil de lavar",
        "Perfecto para ocasiones especiales",
      ],
      rating: 4.9,
      reviewCount: 156,
      categoryId: categories[2].id,
    },
    {
      name: "Zapatillas Deportivas",
      description:
        "Zapatillas cómodas para niños activos. Suela antideslizante y material transpirable. Diseño colorido que les encanta a los niños.",
      price: 3200,
      stock: 40,
      onSale: true, // también en oferta para variedad
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
      ],
      sizes: ["25", "26", "27", "28", "29", "30"],
      colors: ["Azul", "Rojo", "Verde", "Negro", "Blanco"],
      features: [
        "Suela antideslizante",
        "Material transpirable",
        "Cierre con velcro",
        "Plantilla removible",
        "Ligero y cómodo",
      ],
      rating: 4.7,
      reviewCount: 203,
      categoryId: categories[3].id,
    },
    {
      name: "Pijama de Dinosaurios",
      description:
        "Pijama divertido con estampado de dinosaurios. Material suave y cómodo para una noche de sueño perfecta. Diseño que les encanta a los niños.",
      price: 2800,
      stock: 35,
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
      ],
      sizes: ["2T", "3T", "4T", "5T", "6T"],
      colors: ["Azul", "Verde", "Gris"],
      features: [
        "Estampado de dinosaurios",
        "Material suave",
        "Cómodo para dormir",
        "Lavable en máquina",
        "Sin etiquetas molestas",
      ],
      rating: 4.5,
      reviewCount: 78,
      categoryId: categories[4].id,
    },
    {
      name: "Traje de Baño Niño",
      description:
        "Traje de baño resistente al cloro y rayos UV. Material rápido secado y cómodo para la playa y piscina. Diseño con protección UV.",
      price: 2100,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
      ],
      sizes: ["2T", "3T", "4T", "5T", "6T"],
      colors: ["Azul", "Rojo", "Verde", "Naranja"],
      features: [
        "Resistente al cloro",
        "Protección UV",
        "Secado rápido",
        "Material duradero",
        "Cómodo para nadar",
      ],
      rating: 4.4,
      reviewCount: 92,
      categoryId: categories[5].id,
    },
  ];

  // Crear/actualizar productos sin duplicados
  const products = [] as any[];
  for (const def of productDefs) {
    const p = await upsertProductByName(def);
    products.push(p);
  }

  console.log("Productos creados:", products.length);

  // Crear algunas reseñas de ejemplo
  const reviews = await Promise.all([
    prisma.productReview.create({
      data: {
        rating: 5,
        comment:
          "Excelente calidad, mi bebé se ve adorable con este body. El material es muy suave.",
        customerName: "María González",
        productId: products[0].id,
      },
    }),
    prisma.productReview.create({
      data: {
        rating: 4,
        comment:
          "Muy cómodo para mi hijo, perfecto para el deporte. Se lava bien.",
        customerName: "Carlos Rodríguez",
        productId: products[1].id,
      },
    }),
    prisma.productReview.create({
      data: {
        rating: 5,
        comment:
          "Hermoso vestido, mi hija se ve como una princesa. La calidad es excelente.",
        customerName: "Ana Martínez",
        productId: products[2].id,
      },
    }),
    prisma.productReview.create({
      data: {
        rating: 4,
        comment:
          "Zapatillas muy cómodas, mi hijo las usa todos los días para la escuela.",
        customerName: "Luis Pérez",
        productId: products[3].id,
      },
    }),
    prisma.productReview.create({
      data: {
        rating: 5,
        comment:
          "A mi hijo le encanta el pijama de dinosaurios, duerme muy cómodo.",
        customerName: "Sofía López",
        productId: products[4].id,
      },
    }),
    prisma.productReview.create({
      data: {
        rating: 4,
        comment:
          "Perfecto para la piscina, se seca rápido y es muy resistente.",
        customerName: "Roberto Silva",
        productId: products[5].id,
      },
    }),
  ]);

  console.log("Reseñas creadas:", reviews.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
