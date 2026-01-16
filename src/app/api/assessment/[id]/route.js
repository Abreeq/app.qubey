import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ IMPORTANT FIX

  if (!id) {
    return Response.json({ error: "Missing assessment id" }, { status: 400 });
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: {
        include: { answers: true },
      },
    },
  });

  if (!assessment) {
    return Response.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (assessment.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ assessment });
}
