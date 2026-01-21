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

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Header skeleton */}
      <div className="flex justify-between items-center animate-pulse">
        <div className="h-6 w-48 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* List skeleton */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border bg-white rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 animate-pulse"
          >
            <div className="space-y-2 w-full">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-5 w-72 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>

            <div className="h-9 w-28 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Subtle loader */}
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
        Loading report history...
      </div>
    </main>
    )
  }

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
