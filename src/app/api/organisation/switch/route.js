import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { organizationId } = await req.json();

  if (!organizationId) {
    return Response.json({ error: "OrganizationId required" }, { status: 400 });
  }

  // ✅ Check user actually belongs to this org
  const membership = await checkMembership(session.user.id, null, organizationId);

  if (!membership) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ Set active org
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeOrganizationId: organizationId },
  });

  return Response.json({ success: true });
}