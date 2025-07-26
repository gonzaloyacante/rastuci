import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Crear categorías
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Ropa de Bebé" },
      update: {},
      create: {
        name: "Ropa de Bebé",
        description: "Ropa cómoda y suave para los más pequeños",
      },
    }),
    prisma.category.upsert({
      where: { name: "Ropa de Niño" },
      update: {},
      create: {
        name: "Ropa de Niño",
        description: "Ropa divertida y resistente para niños activos",
      },
    }),
    prisma.category.upsert({
      where: { name: "Ropa de Niña" },
      update: {},
      create: {
        name: "Ropa de Niña",
        description: "Ropa elegante y colorida para niñas",
      },
    }),
    prisma.category.upsert({
      where: { name: "Accesorios" },
      update: {},
      create: {
        name: "Accesorios",
        description: "Zapatos, gorros, bufandas y más accesorios",
      },
    }),
    prisma.category.upsert({
      where: { name: "Pijamas" },
      update: {},
      create: {
        name: "Pijamas",
        description: "Pijamas cómodos para dormir",
      },
    }),
    prisma.category.upsert({
      where: { name: "Ropa de Baño" },
      update: {},
      create: {
        name: "Ropa de Baño",
        description: "Trajes de baño y ropa para la playa",
      },
    }),
  ]);

  console.log("Categorías creadas:", categories.length);

  // Crear productos
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Body de Bebé Rosa",
        description:
          "Body suave y cómodo para bebés de 0-6 meses. Fabricado con 100% algodón orgánico, perfecto para la piel sensible de los bebés. Diseño con botones de seguridad en la entrepierna para facilitar el cambio de pañal.",
        price: 2500,
        stock: 50,
        onSale: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
        ]),
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
    }),
    prisma.product.create({
      data: {
        name: "Conjunto Niño Azul",
        description:
          "Conjunto deportivo para niños de 2-4 años. Ideal para actividades físicas y juegos al aire libre. Material transpirable que mantiene a los niños frescos durante todo el día.",
        price: 4500,
        stock: 30,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
        ]),
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
    }),
    prisma.product.create({
      data: {
        name: "Vestido Niña Floral",
        description:
          "Vestido elegante con estampado floral perfecto para ocasiones especiales. Diseño suave y cómodo que permite libertad de movimiento. Ideal para fiestas y eventos familiares.",
        price: 3800,
        stock: 25,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
        ]),
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
    }),
    prisma.product.create({
      data: {
        name: "Zapatillas Deportivas",
        description:
          "Zapatillas cómodas para niños activos. Suela antideslizante y material transpirable. Diseño colorido que les encanta a los niños.",
        price: 3200,
        stock: 40,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
        ]),
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
    }),
    prisma.product.create({
      data: {
        name: "Pijama de Dinosaurios",
        description:
          "Pijama divertido con estampado de dinosaurios. Material suave y cómodo para una noche de sueño perfecta. Diseño que les encanta a los niños.",
        price: 2800,
        stock: 35,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
        ]),
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
    }),
    prisma.product.create({
      data: {
        name: "Traje de Baño Niño",
        description:
          "Traje de baño resistente al cloro y rayos UV. Material rápido secado y cómodo para la playa y piscina. Diseño con protección UV.",
        price: 2100,
        stock: 45,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=face",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=entropy",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center",
        ]),
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
    }),
  ]);

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
