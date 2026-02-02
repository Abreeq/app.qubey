"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ActionPage() {
  const { actionId } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/action/${actionId}`);
      const data = await res.json();

      if (!res.ok) {
        router.push("/dashboard");
        return;
      }

      setAction(data.action);
      setLoading(false);
    };

    load();
  }, [actionId, router]);

  const updateStatus = async (status) => {
    await fetch("/api/action/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, status }),
    });

    router.push("/dashboard");
  };

  if (loading) return null;

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">

      <h1 className="text-2xl font-semibold">{action.title}</h1>

      <p className="text-gray-600">{action.description}</p>
<p className="text-sm text-gray-500">
  Status: <strong>{action.status}</strong>
</p>
      <div className="border rounded-xl bg-white p-6 space-y-4">
        <h2 className="font-medium">How to Fix This</h2>

        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {action.remediationSteps}
        </pre>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => updateStatus("IN_PROGRESS")}
          className="border px-4 py-2 rounded"
        >
          Mark In Progress
        </button>

        <button
          onClick={() => updateStatus("COMPLETED")}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Mark Completed
        </button>
      </div>
    </main>
  );
}
