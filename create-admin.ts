import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const adminEmail = "admin@rastuci.com";
    const adminPassword = "admin123";
    
    // Verificar si ya existe un admin
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log("✅ Usuario admin ya existe:", adminEmail);
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Crear usuario admin
    const admin = await prisma.user.create({
      data: {
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true,
      }
    });

    console.log("✅ Usuario admin creado exitosamente!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Contraseña:", adminPassword);
    console.log("👤 ID:", admin.id);

  } catch (error) {
    console.error("❌ Error creando usuario admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();