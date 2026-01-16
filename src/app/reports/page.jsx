"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/report/latest");
      const data = await res.json();

      if (!res.ok) {
        toast.info("No report found. Please complete an assessment first.");
        setLoading(false);
        return;
      }

      setReport(data.report);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return null;

  if (!report) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <Link href="/assessment" className="underline text-sm">
            Start Assessment
          </Link>
        </div>

        <div className="mt-6 border bg-white rounded-xl p-6">
          <p className="text-gray-700">
            No report found yet. Complete a compliance assessment to generate
            your first report.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Compliance Report</h1>
          <p className="text-sm text-gray-500 mt-1">
            Generated on {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/reports/history" className="border px-3 py-2 rounded">
            View History
          </Link>

          <Link
            href="/assessment"
            className="bg-black text-white px-3 py-2 rounded"
          >
            Run New Assessment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-5 mt-8">
        <StatCard title="Compliance Score" value={`${report.score}%`} />
        <StatCard title="Risk Level" value={report.riskLevel} />
        <StatCard title="Open Gaps" value={`${report.openGaps}`} />
      </div>

      {/* Sections */}
      <ReportSection title="Summary" content={report.summary} />
      <ReportSection title="Key Findings" content={report.keyFindings} />
      <ReportSection
        title="Recommendations"
        content={report.recommendations}
      />
    </main>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="border rounded-xl bg-white p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function ReportSection({ title, content }) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3 border rounded-xl bg-white p-6 whitespace-pre-line text-gray-700 leading-relaxed">
        {content || "—"}
      </div>
    </section>
  );
}
