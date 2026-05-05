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

  return Response.json({ 
    report: {
      ...report,
      keyFindings: JSON.parse(report.keyFindings || "[]"),
      recommendations: JSON.parse(report.recommendations || "[]"),
    }
   });
}
