import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";

interface SafeUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

// GET /api/users - Obtener todos los usuarios
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;
    const search = searchParams.get("search") || "";

    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const offset = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    const safeUsers: SafeUser[] = users.map((user: any) => ({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin,
    }));

    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      success: true,
      data: {
        data: safeUsers,
        total,
        page,
        limit,
        totalPages,
      },
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
): Promise<NextResponse<ApiResponse<SafeUser>>> {
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
    const safeUser: SafeUser = {
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      isAdmin: user.isAdmin,
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
