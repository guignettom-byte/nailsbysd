import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const clientAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "client-credentials",
      name: "client",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await prisma.client.findUnique({
          where: { email: credentials.email },
        });

        if (!client) return null;

        const isValid = await bcrypt.compare(credentials.password, client.password);
        if (!isValid) return null;

        return {
          id: client.id,
          email: client.email,
          name: `${client.firstName} ${client.lastName}`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/connexion",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.clientId = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { clientId?: string }).clientId = token.clientId as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
