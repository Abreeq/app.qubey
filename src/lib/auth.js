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
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (!user.password) {
          throw new Error("This email is registered using Google login");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth",
  },

  events: {
    async createUser({ user }) {
      // ✅ Auto-verify newly created OAuth users (Google)
      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial login
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }

      // Refresh token after update()
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            emailVerified: true,
            role: true,
          },
        });

        if (dbUser) {
          token.emailVerified = dbUser.emailVerified;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.emailVerified = token.emailVerified;
      return session;
    },
  },
};
