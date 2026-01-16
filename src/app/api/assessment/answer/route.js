import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { questionId, value, notes } = await req.json();

  if (!questionId || !value) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { assessment: true },
  });

  if (!question) {
    return Response.json({ error: "Question not found" }, { status: 404 });
  }

  if (question.assessment.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // delete old answer (only one answer per question)
  await prisma.answer.deleteMany({
    where: { questionId },
  });

  const answer = await prisma.answer.create({
    data: {
      questionId,
      value,
      notes: notes || null,
    },
  });

  return Response.json({ success: true, answer });
}
