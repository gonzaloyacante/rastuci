import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ApiResponse, User } from "@/types";

// GET /api/users/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    const safeUser: User = {
      ...user,
      password: undefined,
    };

    return NextResponse.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener el usuario",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<User>>> {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, isAdmin } = body;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email },
      });

      if (emailInUse) {
        return NextResponse.json(
          {
            success: false,
            error: "El email ya está registrado",
          },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: {
      name?: string;
      email?: string;
      password?: string;
      isAdmin?: boolean;
    } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;

    // Encriptar nueva contraseña si se proporciona
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar el usuario
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar el usuario",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar el usuario",
      },
      { status: 500 }
    );
  }
}
