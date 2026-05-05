import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

   const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      emailVerified: true,

      accounts: {
        select: {
          provider: true,
          type: true,
        },
      },

      memberships: {
        where: { role: "OWNER" },
        select: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const orgs = user.memberships.map((m) => m.organization);
  user.organizations = orgs[0] || null; // Assuming one org per user for now
  delete user.memberships;

  return Response.json(user);
}

export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  return Response.json(updated);
}
