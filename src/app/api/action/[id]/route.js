import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { extractJSON } from "@/lib/extractJSON";

const ai = new GoogleGenAI({});

export async function GET(req, context) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;

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

    const prompt = `You are a cybersecurity compliance expert. For this compliance gap: "${action.title}" Generate: 1. A concise summary of the issue (50 words max) 2. Clear explanation of risk (100 words max) 3. Step-by-step remediation workflow in bullet points (return an array) Make it practical for small companies. Don't use big words. also don't use # tags or ** Also do not start the bullet points with - or * just use arrays, Also dont use As a Cybersecurity expert or any intro just give me the raw response. Return ONLY valid JSON array (no explanations, no markdown, no extra text) in the following format: [ { "summary":"summary text here" , "explaination":"explaination text here", remediationSteps: {[1:"Step 1 text here" ] , [2:"Step 2 text here"], ...}}]`;

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
    const parsedSteps = extractJSON(steps);

    // Return updated action
    return Response.json({
      action: {
        ...action,
        remediationSteps: parsedSteps,
      },
    });
  }
  const parsedSteps = extractJSON(action.remediationSteps);
  // If already exists → return normally
  return Response.json({ 
    action: {
      ...action,
     remediationSteps: parsedSteps,
    },
   });
}
