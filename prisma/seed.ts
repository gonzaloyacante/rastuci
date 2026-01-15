import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// =========================================================================
// CONFIGURATION
// =========================================================================
const CATEGORIES = [
  {
    name: "Remeras",
    description: "Remeras y camisetas infantiles",
    icon: "Shirt",
  },
  { name: "Pantalones", description: "Pantalones y joggers", icon: "Scissors" },
  { name: "Vestidos", description: "Vestidos para niñas", icon: "Sparkles" },
  {
    name: "Abrigos",
    description: "Camperas y buzos",
    icon: "ThermometerSnowflake",
  },
  { name: "Accesorios", description: "Gorros, bufandas y más", icon: "Gift" },
];

// Realistic images from Unsplash with stable URLs
const PRODUCT_IMAGES: Record<string, Record<string, string[]>> = {
  // Remeras
  "Remera Básica Algodón": {
    Blanco: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=800&fit=crop",
    ],
    Negro: [
      "https://images.unsplash.com/photo-1503341338985-c0477be52513?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop",
    ],
    Celeste: [
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=800&fit=crop",
    ],
  },
  "Remera Estampada Dino": {
    Verde: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop",
    ],
    Gris: [
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=800&fit=crop",
    ],
  },
  // Pantalones
  "Jogger Deportivo": {
    "Azul Marino": [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop",
    ],
    Negro: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    ],
    Gris: [
      "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=800&fit=crop",
    ],
  },
  "Jean Clásico": {
    Azul: [
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
    ],
    Negro: [
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&h=800&fit=crop",
    ],
  },
  // Vestidos
  "Vestido Floral Primavera": {
    Rosa: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1596993100471-c3905dafa78e?w=600&h=800&fit=crop",
    ],
    Blanco: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    ],
  },
  "Vestido Casual Rayas": {
    Azul: [
      "https://images.unsplash.com/photo-1494578379344-d6c710782a3d?w=600&h=800&fit=crop",
    ],
    Rojo: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
    ],
  },
  // Abrigos
  "Campera Puffer": {
    Rojo: [
      "https://images.unsplash.com/photo-1544923246-77307dd628b5?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
    ],
    Negro: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=800&fit=crop",
    ],
  },
  "Buzo Canguro": {
    Gris: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&h=800&fit=crop",
    ],
    Azul: [
      "https://images.unsplash.com/photo-1620799139507-2a76f2a8b7b2?w=600&h=800&fit=crop",
    ],
  },
  // Accesorios
  "Gorro Lana Pompón": {
    Blanco: [
      "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=800&fit=crop",
    ],
    Rosa: [
      "https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=600&h=800&fit=crop",
    ],
  },
};

const SIZES = ["2-3", "4-5", "6-7", "8-10", "12-14"];

const PRODUCTS_DATA = [
  {
    name: "Remera Básica Algodón",
    category: "Remeras",
    price: 8500,
    features: ["100% Algodón", "Lavable en máquina"],
  },
  {
    name: "Remera Estampada Dino",
    category: "Remeras",
    price: 9800,
    features: ["Estampado exclusivo", "Algodón premium"],
  },
  {
    name: "Jogger Deportivo",
    category: "Pantalones",
    price: 14500,
    features: ["Elástico en cintura", "Puños ajustables"],
  },
  {
    name: "Jean Clásico",
    category: "Pantalones",
    price: 18900,
    features: ["Denim suave", "Botón y cierre"],
  },
  {
    name: "Vestido Floral Primavera",
    category: "Vestidos",
    price: 22000,
    features: ["Estampado floral", "Forro interior"],
    onSale: true,
    discount: 15,
  },
  {
    name: "Vestido Casual Rayas",
    category: "Vestidos",
    price: 19500,
    features: ["Diseño a rayas", "Algodón liviano"],
  },
  {
    name: "Campera Puffer",
    category: "Abrigos",
    price: 35000,
    features: ["Relleno térmico", "Capucha desmontable"],
    onSale: true,
    discount: 20,
  },
  {
    name: "Buzo Canguro",
    category: "Abrigos",
    price: 16800,
    features: ["Bolsillo canguro", "Capucha con cordón"],
  },
  {
    name: "Gorro Lana Pompón",
    category: "Accesorios",
    price: 6500,
    features: ["Lana suave", "Pompón decorativo"],
  },
];

// =========================================================================
// MAIN SEED FUNCTION
// =========================================================================
async function main() {
  console.log("🌱 Starting COMPREHENSIVE seed...\n");

  // 1. Clean Database
  console.log("🧹 Cleaning database...");
  await prisma.stock_reservations.deleteMany();
  await prisma.product_reviews.deleteMany();
  await prisma.order_items.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.product_variants.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categories.deleteMany();

  // 2. Create Categories
  console.log("📁 Creating categories...");
  const categoryMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const created = await prisma.categories.create({
      data: {
        id: crypto.randomUUID(),
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        updatedAt: new Date(),
      },
    });
    categoryMap[cat.name] = created.id;
  }

  // 3. Create Products
  console.log("👕 Creating products with realistic images...\n");

  for (const p of PRODUCTS_DATA) {
    const categoryId = categoryMap[p.category];
    const productColorImages = PRODUCT_IMAGES[p.name] || {};
    const colors = Object.keys(productColorImages);

    // Flatten all images for the 'images' field
    const allImages: string[] = [];
    for (const imgs of Object.values(productColorImages)) {
      allImages.push(...imgs);
    }

    // Calculate sale price if on sale
    const salePrice =
      p.onSale && p.discount ? p.price * (1 - p.discount / 100) : null;

    console.log(
      `  ✓ ${p.name} (${colors.length} colors, ${allImages.length} images)`
    );

    const product = await prisma.products.create({
      data: {
        id: crypto.randomUUID(),
        name: p.name,
        description: `${p.name} de alta calidad para niños. Perfecto para el uso diario. ${p.features.join(". ")}.`,
        price: p.price,
        salePrice: salePrice,
        categoryId: categoryId,
        stock: colors.length * SIZES.length * 10,
        images: JSON.stringify(allImages),
        // Legacy fields (kept for compatibility)
        colorImages: productColorImages,
        sizeGuide: {
          sizes: SIZES,
          chart: SIZES.map((s) => ({ size: s, measurements: "Standard fit" })),
        },
        // NEW EXPLICIT RELATIONS
        product_color_images: {
          create: colors.flatMap((color) =>
            productColorImages[color].map((url, idx) => ({
              color,
              imageUrl: url,
              sortOrder: idx,
            }))
          ),
        },
        // Populate size guides
        product_size_guides: {
          create: SIZES.map((size) => ({
            size,
            measurements: "Consultar tabla de talles",
            ageRange: size,
          })),
        },

        features: p.features,
        sizes: SIZES,
        colors: colors,
        onSale: p.onSale || false,
        weight: 300,
        height: 5,
        width: 25,
        length: 35,
        updatedAt: new Date(),
        isActive: true, // Explicitly set isActive
      },
    });

    // Create Variants
    for (const color of colors) {
      for (const size of SIZES) {
        await prisma.product_variants.create({
          data: {
            productId: product.id,
            color: color,
            size: size,
            stock: Math.floor(Math.random() * 15) + 3, // 3-17 per variant
            sku: `${product.id.slice(-4)}-${color.slice(0, 3).toUpperCase()}-${size}`,
          },
        });
      }
    }
  }

  console.log("\n✅ COMPREHENSIVE Seed completed successfully!");
  console.log(`   📦 ${PRODUCTS_DATA.length} products created`);
  console.log(`   📁 ${CATEGORIES.length} categories created`);
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
