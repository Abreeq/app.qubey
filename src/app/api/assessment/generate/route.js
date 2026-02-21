import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { extractJSON } from "@/lib/extractJSON";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  const { forceNew } = await req.json().catch(() => ({}));
  
  const org = await prisma.organization.findUnique({
    where: { ownerId: session.user.id },
  });

  if (!org) {
    return Response.json({ error: "Organization not found" }, { status: 400 });
  }

  // ✅ If user has in-progress assessment, resume
  if (!forceNew) {
    const existing = await prisma.assessment.findFirst({
      where: {
        userId: session.user.id,
        organizationId: org.id,
        status: "IN_PROGRESS",
      },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return Response.json({
        success: true,
        resumed: true,
        assessmentId: existing.id,
      });
    }
  }

   if (forceNew) {
    await prisma.assessment.updateMany({
      where: {
        userId: session.user.id,
        organizationId: org.id,
        status: "IN_PROGRESS",
      },
      data: { status: "CANCELLED" },
    });
  }
  // create assessment
  const assessment = await prisma.assessment.create({
    data: {
      userId: session.user.id,
      organizationId: org.id,
      profileVersion: org.profileVersion || 1,
    },
  });

const prompt = ` You are a cybersecurity compliance expert with deep knowledge of UAE regulations, including PDPL, ISO 27001, NESA basic controls, and local industry best practices.
Generate a compliance assessment questionnaire for the organization below, tailored specifically to UAE businesses. 
Organization:
-	Name: ${org.name}
-	Industry: ${org.industry}
-	Company size: ${org.companySize}
-	Country: ${org.country} // must be UAE
-	Handles PII: ${org.handlesPII}
-	Handles Payments: ${org.handlesPayments}
Instructions:
-	Generate exactly 20 questions.
-	Each question should have a weight of 1.
-Each question should have answers in a yes/partial/no format, there should be no free text or descriptive answers needed.
-	Questions must be written in simple, layman-friendly language that non-technical staff can understand.
-	Return ONLY valid JSON array (no explanations, no markdown, no extra text) in the following format: [ { "text": "Question text here", "category": "Access Control" | "Data" | "Network" | "Policy" | "Incident" | "Vendor", "weight": 1} ]
-	Each question must be relevant to the organization's UAE regulatory context, industry, size, and whether it handles PII or payments.
-	Focus on practical compliance readiness, not theoretical cybersecurity concepts.
-	Do NOT include any technical jargon or acronyms that a non-technical person may not understand.
-	Do NOT include any extra fields or commentary outside the array. 
-	`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // ✅ your model
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

    return Response.json({ success: true, resumed: false, assessmentId: assessment.id });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Gemini request failed", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
