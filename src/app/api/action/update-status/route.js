import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { actionId, status } = await req.json();

  if (!actionId || !status) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (!["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!org) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  const action = await prisma.complianceAction.findUnique({
    where: { id: actionId },
  });

  if (!action || action.organizationId !== org.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action.status === "COMPLETED") {
    return Response.json({ success: true });
  }

  const validTransition =
    (action.status === "PENDING" &&
      ["IN_PROGRESS", "COMPLETED"].includes(status)) ||
    (action.status === "IN_PROGRESS" && status === "COMPLETED");

  if (!validTransition) {
    return Response.json({ error: "Invalid transition" }, { status: 400 });
  }

  // Update action status
  await prisma.complianceAction.update({
    where: { id: actionId },
    data: { status },
  });

  if (status !== "COMPLETED") {
    return Response.json({ success: true });
  }

  // -----------------------
  // Snapshot recalculation
  // -----------------------

  const snapshot = await prisma.complianceSnapshot.findUnique({
    where: { organizationId: org.id },
  });

  const newScore = Math.min(
    100,
    (snapshot?.readinessScore || 0) + action.expectedIncrease
  );

  const highRiskOpen = await prisma.complianceAction.count({
    where: {
      organizationId: org.id,
      status: { not: "COMPLETED" }
    },
  });

  const calculateRiskLevel = (score) => {
    if (score >= 71) return "Low";
    if (score >= 41) return "Medium";
    return "High";
  };

  await prisma.complianceSnapshot.update({
    where: { organizationId: org.id },
    data: {
      readinessScore: newScore,
      highRiskCount: highRiskOpen,
      actionsPending: {
        decrement: 1,
      },
      scoreImprovement: {
        increment: action.expectedIncrease,
      },
      riskLevel: calculateRiskLevel(newScore),
      actionsCompleted: {
        increment: 1,
      },
      lastAssessmentAt: new Date(),
    },
  });

  return Response.json({ success: true });
}
