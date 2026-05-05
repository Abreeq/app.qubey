import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;   

  // 1️⃣ Ensure user is OWNER
  const ownerMembership = await prisma.membership.findFirst({
    where: {
      userId,
      role: "OWNER",
    },
  });

  if (!ownerMembership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = ownerMembership.organizationId;

  // 2️⃣ Get all members
  const memberships = await prisma.membership.findMany({
    where: { organizationId },
    include: {
      user: true,
    },
  });

  // 3️⃣ Aggregate counts
  const totalUsers = memberships.length;

  const activeUsers = memberships.filter(
    (m) => m.status !== "BLOCKED" // if you add status field
  ).length;

  const totalAssessments = await prisma.assessment.count({
    where: { organizationId },
  });

  const totalReports = await prisma.report.count({
    where: { organizationId },
  });

  // 4️⃣ Per-user stats (⚠️ this is N+1, optimize later if needed)
  const members = await Promise.all(
    memberships.map(async (m) => {
      const assessments = await prisma.assessment.count({
        where: {
          organizationId,
          userId: m.userId,
        },
      });

      const reports = await prisma.report.count({
        where: {
          organizationId,
          userId: m.userId,
        },
      });

      return {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
        status: m.status || "ACTIVE", // fallback if not added yet
        assessments,
        reports,
      };
    })
  );

  return Response.json({
    stats: {
      totalUsers,
      activeUsers,
      totalAssessments,
      totalReports,
    },
    members,
  });
}