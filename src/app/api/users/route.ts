import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse, User } from "@/types";

// GET /api/users - Obtener todos los usuarios
export async function GET(): Promise<NextResponse<ApiResponse<User[]>>> {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
    });

    const safeUsers: User[] = users.map((user) => ({
      ...user,
      password: undefined, // No enviamos la contraseña
    }));

    return NextResponse.json({
      success: true,
      data: safeUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener los usuarios",
      },
      { status: 500 }
    );
  }
}

// POST /api/users - Crear nuevo usuario
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const body = await request.json();
    const { name, email, password, isAdmin } = body;

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Todos los campos son requeridos",
        },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "El email ya está registrado",
        },
        { status: 400 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: isAdmin || false,
      },
    });

    // Retornar el usuario sin la contraseña
    const safeUser: User = {
      ...user,
      password: undefined,
    };

    return NextResponse.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear el usuario",
      },
      { status: 500 }
    );
  }
}
