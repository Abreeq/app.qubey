import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkMembership } from "@/lib/checkMembership";

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return Response.json({ error: "UserId required" }, { status: 400 });
  }
  // 🔒 Check permission
  const currentMembership = await checkMembership(session.user.id, "OWNER");
  

  if (!currentMembership || currentMembership.role !== "OWNER") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const organization = currentMembership.organization;
  const organizationId = organization.id;

  // ❌ Prevent owner removing themselves
  if (userId === session.user.id) {
    return Response.json(
      { error: "Forbidden" },
      { status: 400 }
    );
  }

  await prisma.membership.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    data: {
      status: "BLOCKED",
    },
  });

  return Response.json({ success: true });
}