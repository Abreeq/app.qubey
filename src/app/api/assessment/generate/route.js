import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function extractJSON(text) {
  // Gemini sometimes returns ```json ... ```
  return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const org = await prisma.organization.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!org) {
    return Response.json({ error: "Organization not found" }, { status: 400 });
  }

  // create assessment
  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      organizationId: org.id,
    },
  });

  const prompt = `
You are a cybersecurity compliance expert.
Generate a compliance assessment questionnaire.

Organization:
- Name: ${org.name}
- Industry: ${org.industry}
- Company size: ${org.companySize}
- Country: ${org.country}
- Handles PII: ${org.handlesPII}
- Handles Payments: ${org.handlesPayments}

Return ONLY valid JSON array like:
[
  { "text": "...", "category": "Access Control|Data|Network|Policy|Incident|Vendor", "weight": 1 }
]

Generate exactly 20 questions.
No explanation, no markdown.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // ✅ your model
      contents: prompt,
    });

    const rawText = response.text;

    if (!rawText) {
      return Response.json(
        { error: "Gemini returned empty response" },
        { status: 500 }
      );
    }

    let questions = [];
    try {
      questions = extractJSON(rawText);
    } catch (err) {
      return Response.json(
        { error: "Gemini returned invalid JSON", rawText },
        { status: 500 }
      );
    }

    await prisma.question.createMany({
      data: questions.map((q) => ({
        assessmentId: assessment.id,
        text: q.text,
        category: q.category || "General",
        weight: q.weight || 1,
      })),
    });

    return Response.json({ success: true, assessmentId: assessment.id });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Gemini request failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
