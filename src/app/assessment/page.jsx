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
  const [submitting, setSubmitting] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [finalSubmit, setFinalSubmit] = useState(false);


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


  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-14">
        {/* Header skeleton */}
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>

        {/* Progress bar skeleton */}
        <div className="h-2 bg-gray-200 rounded mt-4 animate-pulse" />

        {/* Card skeleton */}
        <div className="mt-8 border rounded-xl p-6 bg-white">
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-5 w-full bg-gray-200 rounded" />

            <div className="grid grid-cols-3 gap-3">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>

            <div className="h-20 w-full bg-gray-200 rounded" />
          </div>

          {/* Subtle loader */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
            Preparing your assessment...
          </div>
        </div>
      </main>
    );
  }

  if (!assessment) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Unable to load assessment.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer text-sm underline"
          >
            Go back to dashboard
          </button>
        </div>
      </main>
    );
  }

  const q = assessment.questions[index];
  const progress = Math.round(((index + 1) / assessment.questions.length) * 100);

  const submitAnswer = async (value) => {
    if (submitting !== null) return; // block double click

    setSubmitting(value);

    try {
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

      toast.success("Saved", {
        autoClose: 800,
      });

      setNotes("");

      if (index < assessment.questions.length - 1) {
        setIndex(index + 1);
      } else {
        setCompleted(true); //assessment finished
      }

    } catch (error) {
      toast.error("Something went wrong");

    } finally {
      setSubmitting(null)
    }
  };

  const submitAssessment = async () => {
    if (finalSubmit) return; // block double submit
    setFinalSubmit(true);

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        toast.error(data.error || "Failed to submit assessment");
        setFinalSubmit(false)
        return;
      }
  
      toast.success("Assessment completed 🎉");
      router.push("/dashboard");

    } catch (error) {
       toast.error("Something went wrong");
       setFinalSubmit(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
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
        {!completed ? (
          <>
            <p className="text-xs text-gray-500">{q.category}</p>
            <h2 className="text-lg font-medium mt-2">Q{index + 1}: {q.text}</h2>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <button
                onClick={() => submitAnswer("NO")}
                disabled={submitting}
                className="border rounded py-2 hover:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting === "NO" ? (
                  <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  "No"
                )}
              </button>

              <button
                onClick={() => submitAnswer("PARTIAL")}
                disabled={submitting}
                className="border rounded py-2 hover:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting === "PARTIAL" ? (
                  <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-black border-t-transparent" />
                ) : (
                  "Partial"
                )}
              </button>
              <button
                onClick={() => submitAnswer("YES")}
                disabled={submitting}
                className="bg-black text-white rounded py-2 hover:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting === "YES" ? (
                  <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Yes"
                )}
              </button>
            </div>

            <textarea
              placeholder="Notes (optional)"
              className="w-full border rounded px-3 py-2 mt-4"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </>
        ) : (
          <>
            <h2 className="text-lg font-medium mt-2">
              You’ve reached the end of the assessment
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Review your answers or submit when ready.
            </p>
          </>
        )}

          {/* Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => {
              if (completed) {
                setCompleted(false);
                setIndex(assessment.questions.length - 1);
              } else {
                setIndex(Math.max(0, index - 1));
              }
            }}
            disabled={index === 0 || finalSubmit}
            className="text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {completed ? (
            <button
              onClick={submitAssessment}
              disabled={finalSubmit}
              className="bg-black text-white rounded-lg px-3 py-2 hover:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
