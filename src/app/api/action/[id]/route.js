import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params; // 👈 MUST AWAIT

  const action = await prisma.complianceAction.findUnique({
    where: { id: id },
  });

  if (!action) {
    return Response.json({ error: "Action not found" }, { status: 404 });
  }

  const org = await prisma.organization.findFirst({
    where: { ownerId: session.user.id },
  });

  if (!org || action.organizationId !== org.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // ------------------------
  // ✅ If steps missing → generate with Gemini
  // ------------------------
  if (!action.remediationSteps || action.remediationSteps.trim() === "") {

    const prompt = `
        You are a cybersecurity compliance expert.
        For this compliance gap: "${action.title}"

Generate:
1. A concise summary of the issue
2. Clear explanation of risk
3. Step-by-step remediation workflow in bullet points

Make it practical for small companies. Don't use big words. also don't use # tags or ** Also do not start the bullet points with - or * just use numbers, Also dont use As a Cybersecurity expert or any intro just give me the raw response.
`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const steps = aiResponse.text || "No steps generated.";

    // Save steps to DB
    await prisma.complianceAction.update({
      where: { id: action.id },
      data: {
        remediationSteps: steps,
      },
    });

    // Return updated action
    return Response.json({
      action: {
        ...action,
        remediationSteps: steps,
      },
    });
  }

  // If already exists → return normally
  return Response.json({ action });
}
