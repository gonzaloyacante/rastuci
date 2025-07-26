// import { config } from "dotenv";
// import { PrismaClient } from "@prisma/client";

// // Cargar variables de entorno
// config({ path: ".env.local" });

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Poblando base de datos con datos de ejemplo...");

//   try {
//     // Crear categorías
//     const categories = await Promise.all([
//       prisma.category.upsert({
//         where: { name: "Niña" },
//         update: {},
//         create: {
//           name: "Niña",
//           description: "Ropa elegante y cómoda para niñas",
//         },
//       }),
//       prisma.category.upsert({
//         where: { name: "Niño" },
//         update: {},
//         create: {
//           name: "Niño",
//           description: "Ropa divertida y resistente para niños",
//         },
//       }),
//       prisma.category.upsert({
//         where: { name: "Bebé" },
//         update: {},
//         create: {
//           name: "Bebé",
//           description: "Ropa suave y delicada para bebés",
//         },
//       }),
//     ]);

//     console.log(
//       "✅ Categorías creadas:",
//       categories.map((c) => c.name).join(", ")
//     );

//     // Verificar si ya hay productos
//     const existingProducts = await prisma.product.count();
//     if (existingProducts > 0) {
//       console.log(
//         "⚠️  Ya hay productos en la base de datos. Saltando creación de productos."
//       );
//     } else {
//       // Crear productos de ejemplo
//       const products = [
//         {
//           name: "Vestido Floral de Verano",
//           description:
//             "Hermoso vestido con estampado floral, perfecto para el verano",
//           price: 2999,
//           stock: 10,
//           images: JSON.stringify([
//             "https://res.cloudinary.com/djlknirsd/image/upload/v1234567890/Rastuci/vestido-floral.jpg",
//           ]),
//           categoryId: categories[0].id, // Niña
//         },
//         {
//           name: "Camiseta de Dinosaurio",
//           description: "Camiseta divertida con estampado de dinosaurios",
//           price: 1599,
//           stock: 15,
//           images: JSON.stringify([
//             "https://res.cloudinary.com/djlknirsd/image/upload/v1234567890/Rastuci/camiseta-dinosaurio.jpg",
//           ]),
//           categoryId: categories[1].id, // Niño
//         },
//         {
//           name: "Conjunto de Algodón para Bebé",
//           description: "Conjunto suave de algodón 100% natural",
//           price: 2599,
//           stock: 8,
//           images: JSON.stringify([
//             "https://res.cloudinary.com/djlknirsd/image/upload/v1234567890/Rastuci/conjunto-bebe.jpg",
//           ]),
//           categoryId: categories[2].id, // Bebé
//         },
//         {
//           name: "Shorts de Jean",
//           description: "Shorts cómodos de jean para el día a día",
//           price: 1999,
//           stock: 12,
//           images: JSON.stringify([
//             "https://res.cloudinary.com/djlknirsd/image/upload/v1234567890/Rastuci/shorts-jean.jpg",
//           ]),
//           categoryId: categories[1].id, // Niño
//         },
//         {
//           name: "Blusa con Bordado",
//           description: "Blusa elegante con bordados delicados",
//           price: 2499,
//           stock: 6,
//           images: JSON.stringify([
//             "https://res.cloudinary.com/djlknirsd/image/upload/v1234567890/Rastuci/blusa-bordado.jpg",
//           ]),
//           categoryId: categories[0].id, // Niña
//         },
//         {
//           name: "Body para Bebé",
//           description: "Body cómodo con broches en el hombro",
//           price: 1299,
//           stock: 20,
//           images: JSON.stringify([
//             "https://res.cloudinary.com/djlknirsd/image/upload/v1234567890/Rastuci/body-bebe.jpg",
//           ]),
//           categoryId: categories[2].id, // Bebé
//         },
//       ];

//       await prisma.product.createMany({
//         data: products,
//       });

//       console.log("✅ Productos creados:", products.length);
//     }
//     console.log("🎉 Base de datos poblada exitosamente!");
//   } catch (error) {
//     console.error("❌ Error:", error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
