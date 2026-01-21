import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const allowedFields = [
    "name",
    "industry",
    "companySize",
    "country",
    "handlesPII",
    "handlesPayments",
  ];

  // only pick allowed fields
  const updates = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  if (!Object.keys(updates).length) {
    return Response.json({ error: "No valid fields provided" }, { status: 400 });
  }

  // fetch existing org
  const org = await prisma.organization.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!org) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  // detect org changes that affect assessment generation
  const affectsAssessment =
    (updates.industry && updates.industry !== org.industry) ||
    (updates.companySize && updates.companySize !== org.companySize) ||
    (updates.country && updates.country !== org.country) ||
    (typeof updates.handlesPII === "boolean" && updates.handlesPII !== org.handlesPII) ||
    (typeof updates.handlesPayments === "boolean" && updates.handlesPayments !== org.handlesPayments);

  const updatedOrg = await prisma.organization.update({
    where: { id: org.id },
    data: {
      ...updates,
      ...(affectsAssessment
        ? {
            profileVersion: { increment: 1 },
            complianceScore: 0,
            riskLevel: "Unknown",
            openGaps: 0,
          }
        : {}),
    },
  });

  return Response.json({
    success: true,
    org: updatedOrg,
    affectsAssessment,
    message: affectsAssessment
      ? "Organization updated. Please run a new assessment."
      : "Organization updated successfully.",
  });
}
