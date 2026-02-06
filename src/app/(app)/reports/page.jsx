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

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Header skeleton */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 animate-pulse">
          <div className="space-y-2">
            <div className="h-6 w-56 bg-gray-200 rounded" />
            <div className="h-4 w-40 bg-gray-200 rounded" />
          </div>

          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 rounded" />
            <div className="h-10 w-40 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid md:grid-cols-3 gap-5 mt-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border rounded-xl bg-white p-6 animate-pulse"
            >
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-8 w-20 bg-gray-200 rounded mt-4" />
            </div>
          ))}
        </div>

        {/* Sections skeleton */}
        <section className="mt-10 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded" />

          <div className="mt-3 border rounded-xl bg-white p-6 space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-11/12 bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
          </div>
        </section>

        {/* Subtle loader */}
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
          Generating your compliance report...
        </div>
      </main>
    );
  }

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
          <button
            onClick={async () => {
              const res = await fetch("/api/report/pdf");
              if (!res.ok) {
                toast.error("Failed to generate PDF");
                return;
              }

              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = "Qubey_Compliance_Report.pdf";
              document.body.appendChild(a);
              a.click();
              a.remove();

              window.URL.revokeObjectURL(url);
            }}
            className="border px-3 py-2 rounded"
          >
            Download PDF
          </button>
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
      <ReportSection title="Recommendations" content={report.recommendations} />
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
