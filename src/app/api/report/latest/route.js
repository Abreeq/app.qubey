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

  const report = await prisma.report.findFirst({
    where: {
      userId: session.user.id,
      organizationId: org.id,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!report) {
    return Response.json({ error: "No report found" }, { status: 404 });
  }

  return Response.json({ report });
}
