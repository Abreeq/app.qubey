"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function ReportsHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/report/list");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load reports");
        setLoading(false);
        return;
      }

      setReports(data.reports);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return null;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Report History</h1>
        <Link href="/reports" className="underline text-sm">
          Back to Reports
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="mt-6 border bg-white rounded-xl p-6">
          No reports found.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="border bg-white rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4"
            >
              <div>
                <p className="text-sm text-gray-500">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
                <p className="text-lg font-semibold mt-1">
                  Score: {r.score}% — Risk: {r.riskLevel}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Open gaps: {r.openGaps}
                </p>
              </div>

              <Link
                href="/reports"
                className="border px-3 py-2 rounded text-sm w-fit"
              >
                View Latest
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
