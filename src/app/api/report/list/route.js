import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { checkMembership } from "@/lib/checkMembership";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const membership = await checkMembership(session.user.id);

  if (!membership) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  const org = membership.organization;

  const reports = await prisma.report.findMany({
    where: {
      userId: session.user.id,
      organizationId: org.id,
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ reports });
}
