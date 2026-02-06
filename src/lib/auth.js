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

        // Fetch all organizations the user belongs to (assuming it's a relation in Prisma)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            organizations: {
              select: {
                name: true,  // Get the organization names
              },
            },
          },
        });

        // If the user belongs to any organizations, attach the list of organization names to the token
        if (dbUser?.organizations) {
          token.organizations = dbUser.organizations.map(org => org.name); // Store organization names as an array
        } else {
          token.organizations = [];  // No organizations
        }
      }

      // Refresh token after update()
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            emailVerified: true,
            role: true,
            organizations: {
              select: {
                name: true,
              },
            },
          },
        });

        if (dbUser) {
          token.emailVerified = dbUser.emailVerified;
          token.role = dbUser.role;
          if(dbUser?.organizations) {
            token.organizations = dbUser.organizations.map(org => org.name);
          }
          token.organizations = [];  // No organizations
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.emailVerified = token.emailVerified;
      session.user.organizations = token.organizations; // Add organizations to the session
      return session;
    },
  },
};
