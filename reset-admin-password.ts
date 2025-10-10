import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const adminEmail = "admin@rastuci.com";
    const newPassword = "rastuci123";
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("🔐 Hash generado:", hashedPassword);

    // Actualizar la contraseña del admin
    const admin = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        password: hashedPassword,
      }
    });

    console.log("✅ Contraseña del admin actualizada!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Nueva contraseña:", newPassword);
    console.log("👤 Usuario:", admin.name);

  } catch (error) {
    console.error("❌ Error actualizando contraseña:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();