"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (!res.ok) {
          router.push("/organisation/create");
          return;
        }

        setData(json);
        setLoading(false);
      } catch {
        router.push("/organisation/create");
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-12 animate-pulse space-y-6">
        <div className="h-8 w-72 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="grid md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </main>
    );
  }

  const {
    readinessScore,
    riskLevel,
    lastAssessmentAt,
    stats,
    nextAction,
  } = data;

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          Compliance Readiness Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Your current compliance status at a glance
        </p>
      </div>

      {/* Overall Score */}
      <div className="border rounded-xl bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">

        <div>
          <p className="text-sm text-gray-500">Overall Readiness Score</p>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-4xl font-semibold">{readinessScore}</span>
            <span className="text-gray-400">/100</span>
          </div>

          <span className="inline-block mt-3 px-3 py-1 text-xs rounded bg-yellow-100 text-yellow-700">
            {riskLevel}
          </span>
          {riskLevel === "Not started" && (
            <span className="inline-block mt-3 ml-2 px-3 py-1 text-xs rounded bg-gray-100 text-gray-700">
              Take your first assessment to get started 
              <button
                onClick={() => router.push("/assessment")}
                className="ml-1 bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition">
                Start Assessment
              </button>
            </span>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>
            Last assessment:{" "}
            {lastAssessmentAt
              ? new Date(lastAssessmentAt).toLocaleDateString()
              : "Not yet"}
          </p>
          {nextAction && (
            <p>
              Next recommended action:{" "}
              <span className="font-medium text-black">
                {nextAction.title}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard
          title="High Priority Risks"
          value={stats.highRisks}
        />
        <StatCard
          title="Actions Pending"
          value={stats.actionsPending}
        />
        <StatCard
          title="Actions Completed"
          value={stats.actionsCompleted}
        />
        <StatCard
          title="Score Improvement"
          value={`+${stats.scoreImprovement}`}
        />
      </div>

      {/* Next Action */}
      {nextAction && (
        <div className="border rounded-xl bg-purple-50 p-6 space-y-3">
          <p className="text-sm font-medium text-purple-700">
            Next Recommended Action
          </p>

          <p className="text-gray-700">
            {nextAction.title} – this could improve your score by approximately{" "}
            <b>{nextAction.expectedIncrease} points</b>.
          </p>

          <button
  onClick={() => router.push(`/actions/${nextAction.id}`)}
  className="bg-purple-600 text-white px-4 py-2 rounded hover:scale-95 transition"
>
  View Action
</button>
        </div>
      )}

      {/* Understanding Your Score */}
      <section className="space-y-5">

        <h2 className="text-lg font-semibold">
          Understanding Your Score
        </h2>

        <InfoBox title="What Your Score Means" color="purple">
          <ul className="list-disc pl-5 space-y-1">
            <li>0–40: Needs immediate attention</li>
            <li>41–70: Progressing – building foundation</li>
            <li>71–100: Strong readiness</li>
          </ul>
        </InfoBox>

        <InfoBox title="What Your Score Does NOT Mean" color="gray">
          <ul className="list-disc pl-5 space-y-1">
            <li>Not a certification or audit result</li>
            <li>Does not guarantee regulatory approval</li>
            <li>Not a substitute for legal advice</li>
            <li>Does not mean you’re immune to incidents</li>
          </ul>
        </InfoBox>

        <InfoBox title="Why Scores Change Over Time" color="green">
          <ul className="list-disc pl-5 space-y-1">
            <li>Completing actions improves score</li>
            <li>New risks may reduce score</li>
            <li>Reassessments keep data current</li>
          </ul>
        </InfoBox>
      </section>
    </main>
  );
}

/* ------------------ Components ------------------ */

function StatCard({ title, value }) {
  return (
    <div className="border rounded-xl bg-white p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function InfoBox({ title, color, children }) {
  const colors = {
    purple: "bg-purple-50 border-purple-200",
    gray: "bg-gray-50 border-gray-200",
    green: "bg-green-50 border-green-200",
  };

  return (
    <div className={`border rounded-xl p-5 ${colors[color]}`}>
      <p className="font-medium mb-2">{title}</p>
      <div className="text-sm text-gray-700">{children}</div>
    </div>
  );
}
