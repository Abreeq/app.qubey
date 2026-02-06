import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function safeJSON(text) {
  try {
    return JSON.parse(
      (text || "").replace(/```json/g, "").replace(/```/g, "").trim()
    );
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { assessmentId } = body;

    if (!assessmentId) {
      return Response.json(
        { error: "assessmentId is required" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
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

    // ===========================
    // ✅ SCORE CALCULATION
    // ===========================
    let total = 0;
    let gained = 0;
    let openGaps = 0;

    for (const q of assessment.questions) {
      total += q.weight;

      const ans = q.answers?.[0]; // only 1 answer stored
      if (!ans) {
        openGaps += 1;
        continue;
      }

      if (ans.value === "YES") gained += q.weight;
      else if (ans.value === "PARTIAL") gained += q.weight * 0.5;
      else if (ans.value === "NO") openGaps += 1;
      else openGaps += 1;
    }

    const score = total === 0 ? 0 : Math.round((gained / total) * 100);

    const riskLevel =
      score >= 80 ? "Low" : score >= 50 ? "Medium" : "High";

    // ===========================
    // ✅ UPDATE ORGANIZATION STATS
    // ===========================
    await prisma.organization.update({
      where: { id: assessment.organizationId },
      data: {
        complianceScore: score,
        riskLevel,
        openGaps,
      },
    });

    // Mark assessment completed
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: { status: "COMPLETED" },
    });

    // ===========================
    // ✅ REPORT GENERATION (Gemini)
    // ===========================
    const weakQuestions = assessment.questions
      .map((q) => {
        const answer = q.answers?.[0]?.value || "UNANSWERED";
        return {
          question: q.text,
          category: q.category,
          weight: q.weight,
          answer,
        };
      })
      .filter((x) => x.answer === "NO" || x.answer === "UNANSWERED");

    const prompt = `
You are a cybersecurity compliance expert with deep knowledge of UAE regulations, including PDPL, ISO 27001, NESA basic controls, and local industry best practices.
Generate a compliance report for a business based on assessment results.

Return ONLY JSON:
{
  "summary": "...",
  "keyFindings": "...",
  "recommendations": "..."
}

Inputs:
- Compliance Score: ${score}%
- Risk Level: ${riskLevel}
- Open Gaps: ${openGaps}

Weak Questions:
${JSON.stringify(weakQuestions, null, 2)}
`;

    let report = {
      summary: "Report generation failed. Please try again.",
      keyFindings: "",
      recommendations: "",
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const parsed = safeJSON(response.text);

      if (parsed?.summary) {
        report = {
          summary: parsed.summary || "",
          keyFindings: parsed.keyFindings || "",
          recommendations: parsed.recommendations || "",
        };
      }
    } catch (err) {
      console.error("Gemini report generation error:", err);
    }

    // ===========================
    // ✅ STORE REPORT IN DB
    // ===========================
    await prisma.report.upsert({
      where: { assessmentId },
      update: {
        score,
        riskLevel,
        openGaps,
        summary: report.summary,
        keyFindings: report.keyFindings,
        recommendations: report.recommendations,
      },
      create: {
        userId: session.user.id,
        organizationId: assessment.organizationId,
        assessmentId,
        score,
        riskLevel,
        openGaps,
        summary: report.summary,
        keyFindings: report.keyFindings,
        recommendations: report.recommendations,
      },
    });

    // Example risk generation (simple logic for V0)

const risks = [];

for (const q of assessment.questions) {
  const answer = q.answers[0]?.value;

  if (answer === "NO") {
    risks.push({
      organizationId: assessment.organizationId,
      title: q.text,
      severity: "HIGH",
      status: "OPEN",
    });
  }

  if (answer === "PARTIAL") {
    risks.push({
      organizationId: assessment.organizationId,
      title: q.text,
      severity: "MEDIUM",
      status: "OPEN",
    });
  }
}

if (risks.length) {
  await prisma.risk.createMany({ data: risks });
}

// --------------------
// Create actions (simple mapping for now)

const actions = risks.slice(0, 5).map((r) => ({
  organizationId: assessment.organizationId,
  title: `Fix: ${r.title}`,
  description: "Implement required control to close this gap",
  expectedIncrease: 5,
  status: "PENDING",
}));

if (actions.length) {
  await prisma.complianceAction.createMany({ data: actions });
}

// --------------------
// Create or update snapshot

const highRiskCount = risks.filter(r => r.severity === "HIGH").length;

await prisma.complianceSnapshot.upsert({
  where: { organizationId: assessment.organizationId },
  update: {
    readinessScore: score,
    riskLevel,
    highRiskCount,
    actionsPending: actions.length,
    actionsCompleted: 0,
    scoreImprovement: 0,
    lastAssessmentAt: new Date(),
  },
  create: {
    organizationId: assessment.organizationId,
    readinessScore: score,
    riskLevel,
    highRiskCount,
    actionsPending: actions.length,
    actionsCompleted: 0,
    scoreImprovement: 0,
    lastAssessmentAt: new Date(),
  },
});


    return Response.json({
      success: true,
      score,
      riskLevel,
      openGaps,
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: "Something went wrong", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
