import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import { JWT } from "next-auth/jwt";
// import { Session } from "next-auth";
// import { User } from "@prisma/client";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
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

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
            remember: credentials.remember === "true",
          };
        } catch (error) {
          // Retornar null para que NextAuth no rediriga
          // eslint-disable-next-line no-console
          console.error("Authentication error:", error);
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
          token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        } else {
          // Si no está marcado, sesión de 1 día
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
        session.user.remember = token.remember;
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
