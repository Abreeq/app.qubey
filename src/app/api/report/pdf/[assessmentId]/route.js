import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { jsPDF } from "jspdf";

export async function GET(req, ctx) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assessmentId } = await ctx.params;

  const report = await prisma.report.findFirst({
    where: {
      assessmentId: assessmentId,
      userId: session.user.id
    }
  });

  if (!report) {
    return Response.json({ error: "Report not found" }, { status: 404 });
  }

  if (report.userId !== session.user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = await prisma.organization.findUnique({
    where: { id: report.organizationId },
  });


  // create PDF
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Qubey Compliance Report", 14, 18);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Organization: ${org?.name || "Unknown"}`, 14, 30);
  doc.text(`Generated: ${new Date(report.createdAt).toLocaleString()}`, 14, 37);

  doc.setFont("helvetica", "bold");
  doc.text(`Compliance Score: ${report.score}%`, 14, 50);
  doc.text(`Risk Level: ${report.riskLevel}`, 14, 57);
  doc.text(`Open Gaps Identified: ${report.openGaps}`, 14, 64);

  let y = 78;

  const addSection = (title, text) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, 14, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    const lines = doc.splitTextToSize(text || "—", 180);
    doc.text(lines, 14, y);
    y += lines.length * 6 + 10;

    // new page if overflow
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  addSection("Executive Summary", report.summary);
  addSection("Key Findings", report.keyFindings);
  addSection("Recommendations", report.recommendations);

  const pdfBuffer = doc.output("arraybuffer");

  return new Response(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="Qubey_Report_${org.name}.pdf"`,
    },
  });
}