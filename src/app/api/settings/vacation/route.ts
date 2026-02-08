import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { VacationSettingsSchema } from "@/lib/validation/vacation";
// import { auth } from "@/auth"; // If auth is needed, but we start with open or existing middleware protection

export async function GET() {
  try {
    const settings = await prisma.vacation_settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Return default disabled state if not found
      return NextResponse.json({
        enabled: false,
        title: "Modo Vacaciones",
        message: "Estamos de vacaciones.",
        showEmailCollection: true,
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[Settings API] Error fetching vacation settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Auth check should be here or middleware
    // const session = await auth();
    // if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const parsed = VacationSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const settings = await prisma.vacation_settings.upsert({
      where: { id: "default" },
      update: {
        enabled: data.enabled,
        title: data.title,
        message: data.message,
        startDate: data.startDate,
        endDate: data.endDate,
        showEmailCollection: data.showEmailCollection,
      },
      create: {
        id: "default",
        enabled: data.enabled,
        title: data.title,
        message: data.message,
        startDate: data.startDate,
        endDate: data.endDate,
        showEmailCollection: data.showEmailCollection,
      },
    });

    // TODO: Handle History Logic (Create vacation_period when enabled=true)
    // This will be handled in a separate 'toggle' endpoint or integrated here logic later
    // For now, simple update.

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[Settings API] Error updating vacation settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
