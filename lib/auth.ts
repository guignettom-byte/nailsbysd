import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const isProd = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    // Admin login
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: "ADMIN" };
      },
    }),
    // Client login
    CredentialsProvider({
      id: "client-credentials",
      name: "Client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const client = await prisma.client.findUnique({ where: { email: credentials.email } });
        if (!client) return null;
        const ok = await bcrypt.compare(credentials.password, client.password);
        if (!ok) return null;
        return {
          id: client.id,
          email: client.email,
          name: `${client.firstName} ${client.lastName}`,
          role: "CLIENT",
        };
      },
    }),
  ],
  pages: {
    signIn: "/connexion",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; userId?: string }).role = token.role as string;
        (session.user as { role?: string; userId?: string }).userId = token.userId as string;
      }
      return session;
    },
  },
  // En production : cookie valable sur tous les sous-domaines *.nailsbysd.com
  ...(isProd && {
    cookies: {
      sessionToken: {
        name: "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax" as const,
          path: "/",
          secure: true,
          domain: ".nailsbysd.com",
        },
      },
    },
  }),
  secret: process.env.NEXTAUTH_SECRET,
};
