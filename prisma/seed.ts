import { PrismaClient } from "@prisma/client";

// Safety guard: only allow running seed in development or explicitly with SEED_DEV/--dev
const isDevSeed =
  process.env.NODE_ENV === "development" ||
  process.env.SEED_DEV === "true" ||
  process.argv.includes("--dev");

if (!isDevSeed) {
  // eslint-disable-next-line no-console
  console.error(
    'Abort: El seed sólo puede ejecutarse en entorno de desarrollo. Usa NODE_ENV=development, SEED_DEV=true o pasa --dev.'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  // Crear 3 categorías completas con icono, imagen, título y descripción
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Bebés" },
      update: {
        description: "Ropa y accesorios suaves pensados para la comodidad de los bebés",
        imageUrl:
          "https://images.unsplash.com/photo-1606229365485-93a3b8aee0c3?w=1200&auto=format&fit=crop",
        icon: "Baby",
      },
      create: {
        name: "Bebés",
        description: "Ropa y accesorios suaves pensados para la comodidad de los bebés",
        imageUrl:
          "https://images.unsplash.com/photo-1606229365485-93a3b8aee0c3?w=1200&auto=format&fit=crop",
        icon: "Baby",
      },
    }),
    prisma.category.upsert({
      where: { name: "Niños" },
      update: {
        description: "Ropa deportiva, juegos y accesorios para niños activos",
        imageUrl:
          "https://images.unsplash.com/photo-1520975922284-8b456906c813?w=1200&auto=format&fit=crop",
        icon: "Tshirt",
      },
      create: {
        name: "Niños",
        description: "Ropa deportiva, juegos y accesorios para niños activos",
        imageUrl:
          "https://images.unsplash.com/photo-1520975922284-8b456906c813?w=1200&auto=format&fit=crop",
        icon: "Tshirt",
      },
    }),
    prisma.category.upsert({
      where: { name: "Niñas" },
      update: {
        description: "Vestidos, conjuntos y accesorios para niñas con estilo",
        imageUrl:
          "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&auto=format&fit=crop",
        icon: "Dress",
      },
      create: {
        name: "Niñas",
        description: "Vestidos, conjuntos y accesorios para niñas con estilo",
        imageUrl:
          "https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&auto=format&fit=crop",
        icon: "Dress",
      },
    }),
  ]);

  console.log(`Categorías creadas/actualizadas: ${categories.length}`);

  // Helper para upsert de productos por nombre
  async function upsertProduct(data: {
    name: string;
    description?: string;
    price: number;
    salePrice?: number | null;
    stock: number;
    onSale?: boolean;
    images: string[];
    sizes?: string[];
    colors?: string[];
    features?: string[];
    rating?: number;
    reviewCount?: number;
    weight?: number;
    height?: number;
    width?: number;
    length?: number;
    categoryName: string;
  }) {
    const category = categories.find((c) => c.name === data.categoryName);
    if (!category) {throw new Error(`Categoría no encontrada: ${data.categoryName}`);}

    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    const payload: any = {
      name: data.name,
      description: data.description,
      price: data.price,
      salePrice: data.salePrice ?? null,
      stock: data.stock,
      onSale: !!data.onSale,
      images: JSON.stringify(data.images),
      sizes: data.sizes ?? [],
      colors: data.colors ?? [],
      features: data.features ?? [],
      rating: data.rating ?? 0,
      reviewCount: data.reviewCount ?? 0,
      weight: data.weight ?? 1000,
      height: data.height ?? 10,
      width: data.width ?? 20,
      length: data.length ?? 30,
      categoryId: category.id,
    };

    if (existing) {
      return prisma.product.update({ where: { id: existing.id }, data: payload });
    }
    return prisma.product.create({ data: payload });
  }

  // Crear una lista amplia de productos (12) distribuidos en 3 categorías
  const productDefs = [
    // Bebés
    {
      name: "Body Orgánico Blanco",
      description: "Body 100% algodón orgánico, ideal para piel sensible.",
      price: 2200,
      salePrice: 1999,
      stock: 80,
      onSale: true,
      images: [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop",
      ],
      sizes: ["0-3M", "3-6M", "6-12M"],
      colors: ["Blanco", "Gris", "Crudo"],
      features: ["Algodón orgánico", "Botones seguros"],
      rating: 4.8,
      reviewCount: 120,
      categoryName: "Bebés",
    },
    {
      name: "Manta de Algodón Suave",
      description: "Manta ligera y cálida para cochecito y cuna.",
      price: 3400,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop",
      ],
      sizes: ["70x70", "90x90"],
      colors: ["Rosa", "Azul", "Beige", "Gris"],
      features: ["Lavable", "Hipoalergénica"],
      rating: 4.7,
      reviewCount: 45,
      categoryName: "Bebés",
    },
    {
      name: "Set de Regalo Bebé",
      description: "Set con body, gorro y manoplas, ideal para baby shower.",
      price: 5200,
      stock: 40,
      images: [
        "https://images.unsplash.com/photo-1526662098353-9d6a6bde1b48?w=800&auto=format&fit=crop",
      ],
      sizes: ["0-3M", "3-6M"],
      colors: ["Blanco", "Gris", "Celeste"],
      features: ["Perfecto para regalo", "Incluye caja"],
      rating: 4.9,
      reviewCount: 30,
      categoryName: "Bebés",
    },

    // Niños
    {
      name: "Conjunto Deportivo Niño",
      description: "Conjunto transpirable para actividades al aire libre.",
      price: 4500,
      stock: 50,
      onSale: true,
      images: [
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop",
      ],
      sizes: ["4T", "6T", "8T", "10T"],
      colors: ["Azul", "Rojo", "Negro"],
      features: ["Transpirable", "Secado rápido"],
      rating: 4.6,
      reviewCount: 70,
      categoryName: "Niños",
    },
    {
      name: "Zapatillas Sport",
      description: "Zapatillas con suela antideslizante y plantilla cómoda.",
      price: 3900,
      stock: 75,
      images: [
        "https://images.unsplash.com/photo-1519741494545-0b5a1d6a0b1f?w=800&auto=format&fit=crop",
      ],
      sizes: ["28", "29", "30", "31", "32"],
      colors: ["Negro", "Blanco", "Azul"],
      features: ["Plantilla removible", "Ligero"],
      rating: 4.5,
      reviewCount: 95,
      categoryName: "Niños",
    },
    {
      name: "Pijama Súper Suave",
      description: "Pijama cómodo con estampados divertidos.",
      price: 2800,
      stock: 60,
      images: [
        "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop",
      ],
      sizes: ["4T", "6T", "8T"],
      colors: ["Azul", "Verde", "Gris"],
      features: ["Material suave", "Diseños divertidos"],
      rating: 4.4,
      reviewCount: 40,
      categoryName: "Niños",
    },

    // Niñas
    {
      name: "Vestido Floral Niña",
      description: "Vestido con estampado floral, ideal para eventos.",
      price: 4200,
      stock: 45,
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop",
      ],
      sizes: ["4T", "6T", "8T", "10T"],
      colors: ["Rosa", "Lavanda", "Marfil"],
      features: ["Tela suave", "Corte pensado para movimiento"],
      rating: 4.8,
      reviewCount: 65,
      categoryName: "Niñas",
    },
    {
      name: "Conjunto Chic Niña",
      description: "Blusa y falda con detalles bordados.",
      price: 4800,
      stock: 30,
      images: [
        "https://images.unsplash.com/photo-1520974735194-6c0b5a5d2b9b?w=800&auto=format&fit=crop",
      ],
      sizes: ["4T", "6T", "8T"],
      colors: ["Rosa", "Marfil", "Beige"],
      features: ["Detalles bordados", "Material premium"],
      rating: 4.9,
      reviewCount: 22,
      categoryName: "Niñas",
    },
    {
      name: "Sandalias Verano",
      description: "Sandalias ligeras y resistentes al agua.",
      price: 2500,
      stock: 80,
      images: [
        "https://images.unsplash.com/photo-1501889088095-0e3d4d8b5a3b?w=800&auto=format&fit=crop",
      ],
      sizes: ["25", "26", "27", "28", "29"],
      colors: ["Beige", "Rosa", "Marrón"],
      features: ["Resistente al agua", "Plantilla cómoda"],
      rating: 4.6,
      reviewCount: 55,
      categoryName: "Niñas",
    },
  ];

  const created: any[] = [];
  for (const def of productDefs) {
    const p = await upsertProduct(def);
    created.push(p);
  }

  console.log(`Productos creados/actualizados: ${created.length}`);

  // Crear reseñas de ejemplo para algunos productos
  const sampleReviews = [
    { rating: 5, comment: "Excelente calidad!", customerName: "Lucía" },
    { rating: 4, comment: "Muy cómodo", customerName: "Pedro" },
    { rating: 5, comment: "Lo volvería a comprar", customerName: "Carla" },
  ];

  const reviewsPromises = created.slice(0, 6).map((prod, idx) =>
    prisma.productReview.upsert({
      where: { id: prod.id },
      update: {
        rating: sampleReviews[idx % sampleReviews.length].rating,
        comment: sampleReviews[idx % sampleReviews.length].comment,
        customerName: sampleReviews[idx % sampleReviews.length].customerName,
        productId: prod.id,
      },
      create: {
        rating: sampleReviews[idx % sampleReviews.length].rating,
        comment: sampleReviews[idx % sampleReviews.length].comment,
        customerName: sampleReviews[idx % sampleReviews.length].customerName,
        productId: prod.id,
      },
    })
  );

  const reviews = await Promise.all(reviewsPromises);
  console.log(`Reseñas creadas/actualizadas: ${reviews.length}`);

  // ==================== CORREO ARGENTINO ====================

  // Crear cliente de MiCorreo (CACustomer)
  const caCustomers = await Promise.all([
    prisma.cACustomer.upsert({
      where: { customerId: "0090000024" },
      update: {},
      create: {
        customerId: "0090000024",
        firstName: "Juan",
        lastName: "Pérez",
        email: "juan.perez@example.com",
        documentType: "DNI",
        documentId: "32471960",
        phone: "1165446544",
        cellPhone: "1165446544",
        streetName: "Vicente Lopez",
        streetNumber: "448",
        floor: "1",
        apartment: "D",
        locality: "Monte Grande",
        city: "Esteban Echeverria",
        provinceCode: "B",
        postalCode: "B1842ZAB",
      },
    }),
    prisma.cACustomer.upsert({
      where: { customerId: "0090000025" },
      update: {},
      create: {
        customerId: "0090000025",
        firstName: "María",
        lastName: "González",
        email: "maria.gonzalez@example.com",
        documentType: "CUIT",
        documentId: "27325789643",
        phone: "1144556677",
        cellPhone: "1144556677",
        streetName: "San Martín",
        streetNumber: "1234",
        locality: "Palermo",
        city: "Buenos Aires",
        provinceCode: "C",
        postalCode: "C1425ABC",
      },
    }),
  ]);
  console.log(`Clientes CA creados/actualizados: ${caCustomers.length}`);

  // Crear sucursales de Correo Argentino (CAAgency)
  const caAgencies = await Promise.all([
    prisma.cAAgency.upsert({
      where: { code: "B0107" },
      update: {},
      create: {
        code: "B0107",
        name: "Monte Grande",
        manager: "Denardo, Matías Gabriel",
        email: "sopoficina@correoargentino.com.ar",
        phone: "(03401) 448396",
        packageReception: true,
        pickupAvailability: true,
        streetName: "Vicente Lopez",
        streetNumber: "448",
        locality: "Monte Grande",
        city: "Esteban Echeverria",
        province: "Buenos Aires",
        provinceCode: "B",
        postalCode: "B1842ZAB",
        latitude: -34.81939997,
        longitude: -58.46747615,
        hours: {
          sunday: null,
          monday: { start: "0930", end: "1800" },
          tuesday: { start: "1000", end: "1800" },
          wednesday: { start: "1000", end: "1800" },
          thursday: { start: "1000", end: "1800" },
          friday: { start: "1000", end: "1800" },
          saturday: null,
          holidays: null,
        },
        status: "ACTIVE",
      },
    }),
    prisma.cAAgency.upsert({
      where: { code: "C0001" },
      update: {},
      create: {
        code: "C0001",
        name: "Correo Central",
        manager: "Rodríguez, Ana",
        email: "central@correoargentino.com.ar",
        phone: "(011) 4316-7777",
        packageReception: true,
        pickupAvailability: true,
        streetName: "Av. Corrientes",
        streetNumber: "4444",
        locality: "Almagro",
        city: "Buenos Aires",
        province: "Capital Federal",
        provinceCode: "C",
        postalCode: "C1195AAR",
        latitude: -34.60368,
        longitude: -58.42105,
        hours: {
          sunday: null,
          monday: { start: "0900", end: "1900" },
          tuesday: { start: "0900", end: "1900" },
          wednesday: { start: "0900", end: "1900" },
          thursday: { start: "0900", end: "1900" },
          friday: { start: "0900", end: "1900" },
          saturday: { start: "0900", end: "1300" },
          holidays: null,
        },
        status: "ACTIVE",
      },
    }),
  ]);
  console.log(`Sucursales CA creadas/actualizadas: ${caAgencies.length}`);

  // Crear cotizaciones de envío de ejemplo (CAShippingRate)
  const caRates = await Promise.all([
    prisma.cAShippingRate.create({
      data: {
        customerId: "0090000024",
        postalCodeOrigin: "B1842ZAB",
        postalCodeDestination: "C1195AAR",
        deliveryType: "D", // Domicilio
        productType: "CP",
        productName: "Correo Argentino Clasico",
        weight: 2500,
        height: 10,
        width: 20,
        length: 30,
        price: 498.06,
        deliveryTimeMin: "2",
        deliveryTimeMax: "5",
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    }),
    prisma.cAShippingRate.create({
      data: {
        customerId: "0090000024",
        postalCodeOrigin: "B1842ZAB",
        postalCodeDestination: "C1195AAR",
        deliveryType: "S", // Sucursal
        productType: "CP",
        productName: "Correo Argentino Clasico",
        weight: 2500,
        height: 10,
        width: 20,
        length: 30,
        price: 398.06,
        deliveryTimeMin: "2",
        deliveryTimeMax: "5",
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);
  console.log(`Cotizaciones CA creadas: ${caRates.length}`);

  // Crear envío de ejemplo (CAShipment)
  const caShipment = await prisma.cAShipment.create({
    data: {
      customerId: "0090000024",
      extOrderId: "ORDER-DEV-2024-001",
      orderNumber: "100001",
      trackingNumber: "000500076393019A3G0C701",
      productId: "HC",
      // Sender
      senderName: "Rastuci Tienda",
      senderPhone: "1165446544",
      senderEmail: "contacto@rastuci.com",
      senderStreetName: "Vicente Lopez",
      senderStreetNumber: "448",
      senderCity: "Esteban Echeverria",
      senderProvinceCode: "B",
      senderPostalCode: "B1842ZAB",
      // Recipient
      recipientName: "María González",
      recipientPhone: "1144556677",
      recipientEmail: "maria.gonzalez@example.com",
      // Shipping
      deliveryType: "D",
      productType: "CP",
      destStreetName: "San Martín",
      destStreetNumber: "1234",
      destCity: "Buenos Aires",
      destProvinceCode: "C",
      destPostalCode: "C1425ABC",
      // Package
      weight: 2500,
      height: 10,
      width: 20,
      length: 30,
      declaredValue: 5200.0,
      status: "EN_TRANSITO",
      importedAt: new Date(),
    },
  });
  console.log(`Envío CA creado: ${caShipment.trackingNumber}`);

  // Crear eventos de tracking
  const trackingEvents = await Promise.all([
    prisma.cATrackingEvent.create({
      data: {
        shipmentId: caShipment.id,
        event: "PREIMPOSICION",
        eventDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // hace 2 días
        branch: "CORREO ARGENTINO - MONTE GRANDE",
        status: "RECIBIDO",
      },
    }),
    prisma.cATrackingEvent.create({
      data: {
        shipmentId: caShipment.id,
        event: "EN_TRANSITO",
        eventDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // hace 1 día
        branch: "CORREO ARGENTINO - CENTRO DE DISTRIBUCION",
        status: "EN_CAMINO",
      },
    }),
  ]);
  console.log(`Eventos de tracking creados: ${trackingEvents.length}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
