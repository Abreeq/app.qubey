"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AssessmentPage() {
  const router = useRouter();
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState("");

  // Generate assessment on page load
  useEffect(() => {
    const start = async () => {
      const res = await fetch("/api/assessment/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to start assessment");
        router.push("/dashboard");
        return;
      }

      setAssessmentId(data.assessmentId);
    };

    start();
  }, [router]);

  // Fetch assessment data
  useEffect(() => {
    const load = async () => {
      if (!assessmentId) return;
      const res = await fetch(`/api/assessment/${assessmentId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load assessment");
        router.push("/dashboard");
        return;
      }

      setAssessment(data.assessment);
      setLoading(false);
    };

    load();
  }, [assessmentId, router]);

  if (loading) return null;
  if (!assessment) return null;

  const q = assessment.questions[index];
  const progress = Math.round(((index + 1) / assessment.questions.length) * 100);

  const submitAnswer = async (value) => {
    const res = await fetch("/api/assessment/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: q.id,
        value,
        notes,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to save answer");
      return;
    }

    toast.success("Saved");

    setNotes("");

    if (index < assessment.questions.length - 1) {
      setIndex(index + 1);
    }
  };

  const submitAssessment = async () => {
    const res = await fetch("/api/assessment/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assessmentId }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to submit assessment");
      return;
    }

    toast.success("Assessment completed 🎉");
    router.push("/dashboard");
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Compliance Assessment</h1>
        <p className="text-sm text-gray-500">{progress}%</p>
      </div>

      <div className="h-2 bg-gray-200 rounded mt-4">
        <div
          className="h-2 bg-black rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8 border rounded-xl p-6 bg-white">
        <p className="text-xs text-gray-500">{q.category}</p>
        <h2 className="text-lg font-medium mt-2">{q.text}</h2>

        <textarea
          placeholder="Notes (optional)"
          className="w-full border rounded px-3 py-2 mt-4"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3 mt-5">
          <button
            onClick={() => submitAnswer("NO")}
            className="border rounded py-2"
          >
            No
          </button>
          <button
            onClick={() => submitAnswer("PARTIAL")}
            className="border rounded py-2"
          >
            Partial
          </button>
          <button
            onClick={() => submitAnswer("YES")}
            className="bg-black text-white rounded py-2"
          >
            Yes
          </button>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="text-sm underline disabled:opacity-50"
          >
            Back
          </button>

          {index === assessment.questions.length - 1 ? (
            <button
              onClick={submitAssessment}
              className="text-sm underline"
            >
              Submit Assessment
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              Question {index + 1} / {assessment.questions.length}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
