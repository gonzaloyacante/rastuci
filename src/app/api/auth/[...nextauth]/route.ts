import { logger } from "@/lib/logger";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { JWT } from "next-auth/jwt";
// import { Session } from "next-auth";
// import { User } from "@prisma/client";

// Derivar `cookieDomain` desde `COOKIE_DOMAIN` o `NEXTAUTH_URL`.
// Para localhost / IPs devolvemos `undefined` para no forzar domain.
const cookieDomain = (() => {
  const envOverride = process.env.COOKIE_DOMAIN;
  if (envOverride && envOverride.trim().length > 0) {
    return envOverride.trim();
  }
  const nextAuthUrl = process.env.NEXTAUTH_URL || "";
  if (!nextAuthUrl) {
    return undefined;
  }
  try {
    const parsed = new URL(nextAuthUrl);
    const host = parsed.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host);
    if (isLocalhost || isIp) {
      return undefined;
    }
    return host.startsWith(".") ? host : `.${host}`;
  } catch {
    return undefined;
  }
})();

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  // Cookies configuradas para toda la aplicación (necesario para /api/auth/*)
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/", // Path raíz para que funcione en /api/auth/* y /admin/*
        secure: process.env.NODE_ENV === "production",
        domain: cookieDomain || undefined,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        domain: cookieDomain || undefined,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        domain: cookieDomain || undefined,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "checkbox" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("MISSING_CREDENTIALS");
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) {
            throw new Error("USER_NOT_FOUND");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordCorrect) {
            throw new Error("INVALID_PASSWORD");
          }

          if (!user.isAdmin) {
            throw new Error("NOT_ADMIN");
          }

          // El checkbox de recordarme se envía como un valor truthy cuando está marcado.
          // Simplificamos: cualquier valor presente se interpreta como "true".
          const rememberFlag = !!credentials?.remember;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
            remember: rememberFlag,
          };
        } catch (error) {
          // Retornar null para que NextAuth no rediriga
          logger.error("Authentication error", { error });
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // Configurar duración de sesión basada en "recordarme"
    maxAge: 30 * 24 * 60 * 60, // 30 días por defecto
  },
  jwt: {
    // Token durará según la opción "recordarme"
    maxAge: 30 * 24 * 60 * 60, // 30 días máximo
    // Manejar errores de descifrado JWT (tokens corruptos o encriptados con secret diferente)
    async decode({ token, secret }) {
      if (!token) return null;
      try {
        // Importar decode de next-auth/jwt dinámicamente para evitar dependencia circular
        const { decode: defaultDecode } = await import("next-auth/jwt");
        return await defaultDecode({ token, secret });
      } catch (error) {
        // Si hay error de descifrado, retornar null en lugar de lanzar excepción
        // Esto permite que NextAuth limpie el token corrupto automáticamente
        logger.warn("JWT decode failed, clearing corrupted token", { error });
        return null;
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      // El objeto `user` solo está disponible en el primer inicio de sesión
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.remember = user.remember;

        // Configurar expiración basada en "recordarme"
        if (user.remember) {
          // Si "recordarme" está marcado, sesión de 30 días
          token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
        } else {
          // Si no está marcado, sesión de 1 día
          token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.remember = token.remember;
        // Si el token incluye `exp`, usarlo para exponer la expiración real
        // del JWT en el campo `session.expires`. NextAuth por defecto calcula
        // `expires` a partir de la configuración global; aquí preferimos usar
        // la expiración del token que ajustamos en la callback `jwt`.
        try {
          if (token.exp) {
            const expNum =
              typeof token.exp === "number"
                ? token.exp
                : parseInt(String(token.exp), 10);
            if (!Number.isNaN(expNum) && expNum > 0) {
              session.expires = new Date(expNum * 1000).toISOString();
            }
          }
        } catch {
          // Silenciar errores de parseo y dejar que NextAuth calcule `expires`
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin",
    error: "/admin", // Redirigir errores de vuelta al login
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
