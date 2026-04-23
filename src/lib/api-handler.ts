import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { logger } from "@/lib/logger";

export class AppError extends Error {
  constructor(
    public override message: string,
    public status: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

type ApiHandler<T> = () => Promise<T>;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export async function apiHandler<T>(
  handler: ApiHandler<T>,
  context?: string
): Promise<NextResponse<ApiResponse<T>>> {
  try {
    const data = await handler();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Log error with context
    logger.error(`API Error [${context || "Unknown"}]:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
        },
        { status: error.status }
      );
    }

    const status =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
    );
  }
}
