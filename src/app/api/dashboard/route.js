import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkMembership } from "@/lib/checkMembership";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.emailVerified) {
    return Response.json({ error: "Email not verified" }, { status: 403 });
  }
  
  const membership = await checkMembership(userId);

  if (!membership) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  const org = membership.organization;

  const snapshot = await prisma.complianceSnapshot.findUnique({
    where: { organizationId: org.id },
  });

  if (!snapshot) {
    return Response.json({
      readinessScore: 0,
      riskLevel: "Not started",
      lastAssessmentAt: null,
      organisationName: org.name,
      stats: {
        highRisks: 0,
        actionsPending: 0,
        actionsCompleted: 0,
        scoreImprovement: 0,
      },
      nextAction: null,
    });
  }

  const nextAction = await prisma.complianceAction.findMany({
    where: {
      organizationId: org.id,
      assessmentId: snapshot.assessmentId,
      OR: [{ status: "PENDING" }, { status: "IN_PROGRESS" }],
    },
    select: {
      id: true,
      title: true,
      expectedIncrease: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({
    readinessScore: snapshot.readinessScore,
    riskLevel: snapshot.riskLevel,
    lastAssessmentAt: snapshot.lastAssessmentAt,
    organisationName: org.name,
    stats: {
      highRisks: snapshot.highRiskCount,
      actionsPending: snapshot.actionsPending,
      actionsCompleted: snapshot.actionsCompleted,
      scoreImprovement: snapshot.scoreImprovement,
    },
    nextAction: nextAction,
  });
}
