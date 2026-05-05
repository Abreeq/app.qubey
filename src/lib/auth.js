import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("Invalid credentials");

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!valid) throw new Error("Invalid credentials");

        return user;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // default active org
        if (!token.activeOrganizationId) {
          const firstMembership = await prisma.membership.findFirst({
            where: { userId: user.id },
            select: { organizationId: true },
          });

          token.activeOrganizationId = firstMembership?.organizationId || null;
        }

        // load organizations
        const memberships = await prisma.membership.findMany({
          where: { userId: user.id },
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        token.organizations = memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          role: m.role,
        }));
      }

      // handle switch update
      if (trigger === "update" && token?.activeOrganizationId) {
        const memberships = await prisma.membership.findMany({
          where: { userId: token.id },
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        token.organizations = memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          role: m.role,
        }));
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.organizations = token.organizations || [];
      session.user.activeOrganizationId = token.activeOrganizationId || null;

      return session;
    },
  },
};