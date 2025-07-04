import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
// import { JWT } from "next-auth/jwt";
// import { Session } from "next-auth";
// import { User } from "@prisma/client";

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(
          "Authorize function started for email:",
          credentials?.email
        );
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log("Prisma user found:", user);

          if (!user || !user.password) {
            console.log("User not found or user has no password.");
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log("Password comparison result:", isPasswordCorrect);

          if (isPasswordCorrect) {
            console.log("Authorization successful");
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
              isAdmin: user.isAdmin,
            };
          } else {
            console.log("Password incorrect");
            return null;
          }
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null; // Important to return null on error
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      // El objeto `user` solo está disponible en el primer inicio de sesión
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
