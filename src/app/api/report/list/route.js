import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await prisma.organization.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!org) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  const reports = await prisma.report.findMany({
    where: {
      userId: session.user.id,
      organizationId: org.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ reports });
}
