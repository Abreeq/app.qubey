import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { assessmentId } = await ctx.params;

  const report = await prisma.report.findUnique({
    where: { assessmentId },
  });

  if (!report) return Response.json({ error: "Report not found" }, { status: 404 });

  if (report.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ report });
}
