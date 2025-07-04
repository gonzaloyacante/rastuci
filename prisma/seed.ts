import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Desactivamos la regla de ESLint para 'any' solo en este archivo de seed
/* eslint-disable @typescript-eslint/no-explicit-any */

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  // Limpiar datos existentes
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // No eliminamos usuarios existentes para evitar perder administradores configurados
  // Solo creamos uno si no hay ninguno

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Camisetas",
        description: "Camisetas casuales y deportivas para niños y niñas",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pantalones",
        description: "Jeans, joggers y pantalones infantiles",
      },
    }),
    prisma.category.create({
      data: {
        name: "Vestidos",
        description: "Vestidos elegantes y casuales para niñas",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accesorios",
        description: "Gorras, mochilas, cinturones y más",
      },
    }),
  ]);

  console.log(`✅ Creadas ${categories.length} categorías`);

  // Crear productos
  try {
    // Camisetas
    await prisma.product.create({
      data: {
        name: "Camiseta Básica Blanca",
        description:
          "Camiseta 100% algodón, corte regular, perfecta para el día a día",
        price: 45000,
        stock: 50,
        categoryId: categories[0].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    await prisma.product.create({
      data: {
        name: "Camiseta Polo Navy",
        description:
          "Polo clásico de algodón piqué, ideal para looks smart casual",
        price: 65000,
        stock: 30,
        categoryId: categories[0].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    await prisma.product.create({
      data: {
        name: "Camiseta Estampada",
        description: "Camiseta con estampado único, 100% algodón suave",
        price: 52000,
        stock: 25,
        categoryId: categories[0].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1503341960582-b45751874cf0?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    // Pantalones
    await prisma.product.create({
      data: {
        name: "Jeans Clásicos Azul",
        description:
          "Jeans de corte recto, 98% algodón, 2% elastano para mayor comodidad",
        price: 120000,
        stock: 40,
        categoryId: categories[1].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    await prisma.product.create({
      data: {
        name: "Pantalones Jogger",
        description:
          "Pantalones deportivos con cintura elástica y puños en los tobillos",
        price: 95000,
        stock: 35,
        categoryId: categories[1].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    // Vestidos
    await prisma.product.create({
      data: {
        name: "Vestido Floral",
        description:
          "Vestido estampado floral, perfecto para primavera y verano",
        price: 135000,
        stock: 20,
        categoryId: categories[2].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    // Accesorios
    await prisma.product.create({
      data: {
        name: "Gorra Baseball",
        description: "Gorra clásica de baseball con logo bordado",
        price: 35000,
        stock: 50,
        categoryId: categories[3].id,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop",
        ]),
      } as any,
    });

    console.log("✅ Productos creados exitosamente");
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    throw error;
  }

  // Crear algunas órdenes de ejemplo
  try {
    const products = await prisma.product.findMany();

    const order1 = await prisma.order.create({
      data: {
        customerName: "Juan Pérez",
        customerPhone: "+5712345678",
        customerAddress: "Calle 123 #45-67, Bogotá",
        total: 110000,
        status: "PENDING",
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: products[0].id,
        quantity: 1,
        price: 45000,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order1.id,
        productId: products[3].id,
        quantity: 1,
        price: 65000,
      },
    });

    console.log("✅ Órdenes de ejemplo creadas");
  } catch (error) {
    console.error("❌ Error al crear órdenes:", error);
  }

  // Crear usuario administrador si no existe
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@rastuci.com" },
    });

    if (!existingAdmin) {
      // Crear hash de la contraseña
      const hashedPassword = await bcrypt.hash("Admin123!", 10);

      await prisma.user.create({
        data: {
          name: "Administrador",
          email: "admin@rastuci.com",
          password: hashedPassword,
          isAdmin: true,
        },
      });
      console.log(
        "✅ Usuario administrador creado: admin@rastuci.com (contraseña: Admin123!)"
      );
    } else {
      console.log("✅ Usuario administrador ya existe, no se requiere crearlo");
    }
  } catch (error) {
    console.error("❌ Error al crear usuario administrador:", error);
  }

  console.log("✅ Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
