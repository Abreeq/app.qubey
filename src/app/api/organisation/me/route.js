import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkMembership } from "@/lib/checkMembership";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const membership = await checkMembership(session.user.id , "OWNER");

  if (!membership) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  return Response.json({ org: membership.organization });
}
