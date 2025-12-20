import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

// SECURITY: JWT_SECRET must be configured in environment variables
const JWT_SECRET_STRING = process.env.JWT_SECRET;
if (!JWT_SECRET_STRING) {
  // In development, warn but allow startup
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[SECURITY WARNING] JWT_SECRET not configured. Using insecure fallback for development only."
    );
  }
}
const JWT_SECRET = new TextEncoder().encode(
  JWT_SECRET_STRING ||
    (process.env.NODE_ENV === "development"
      ? "dev-only-secret-do-not-use-in-prod"
      : "")
);

export interface SessionData {
  userId: string;
  email: string;
  isAdmin: boolean;
  iat: number;
  exp: number;
}

export interface SessionOptions {
  expiresIn?: string; // e.g., '7d', '1h', '30m'
  issuer?: string;
  audience?: string;
}

// Create JWT token
export async function createSession(
  payload: Omit<SessionData, "iat" | "exp">,
  options: SessionOptions = {}
): Promise<string> {
  const {
    expiresIn = "7d",
    issuer = "rastuci",
    audience = "rastuci-users",
  } = options;

  const now = Math.floor(Date.now() / 1000);
  const exp = now + parseExpiresIn(expiresIn);

  return new SignJWT({ ...payload, iat: now, exp })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(now)
    .setExpirationTime(exp)
    .setIssuer(issuer)
    .setAudience(audience)
    .sign(JWT_SECRET);
}

// Verify JWT token
export async function verifySession(
  token: string
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "rastuci",
      audience: "rastuci-users",
    });

    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

// Get session from request
export async function getSession(
  request: NextRequest
): Promise<SessionData | null> {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifySession(token);
  }

  // Try cookie
  const cookieToken = request.cookies.get("session")?.value;
  if (cookieToken) {
    return verifySession(cookieToken);
  }

  return null;
}

// Refresh token if needed
export async function refreshSessionIfNeeded(
  session: SessionData,
  refreshThreshold = 24 * 60 * 60 // 24 hours in seconds
): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = session.exp - now;

  // If token expires within threshold, create new one
  if (timeUntilExpiry < refreshThreshold) {
    return createSession({
      userId: session.userId,
      email: session.email,
      isAdmin: session.isAdmin,
    });
  }

  return null;
}

// Parse expires in string to seconds
function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    throw new Error(
      'Invalid expiresIn format. Use format like "7d", "1h", "30m", "60s"'
    );
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case "d":
      return num * 24 * 60 * 60; // days to seconds
    case "h":
      return num * 60 * 60; // hours to seconds
    case "m":
      return num * 60; // minutes to seconds
    case "s":
      return num; // seconds
    default:
      throw new Error("Invalid time unit");
  }
}

// Session management utilities
export const sessionUtils = {
  // Create session cookie options
  getCookieOptions: (secure = process.env.NODE_ENV === "production") => ({
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  }),

  // Clear session cookie
  clearSessionCookie: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }),

  // Validate session data
  isValidSession: (session: SessionData | null): session is SessionData => {
    if (!session) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return (
      session.exp > now &&
      typeof session.userId === "string" &&
      typeof session.email === "string" &&
      typeof session.isAdmin === "boolean"
    );
  },

  // Check if user is admin
  isAdmin: (session: SessionData | null): boolean => {
    return sessionUtils.isValidSession(session) && session.isAdmin;
  },

  // Get user ID from session
  getUserId: (session: SessionData | null): string | null => {
    return sessionUtils.isValidSession(session) ? session.userId : null;
  },
};
