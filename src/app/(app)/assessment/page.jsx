"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AssessmentPage() {
  const router = useRouter();

  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const [assessment, setAssessment] = useState(null);
  const [index, setIndex] = useState(0);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [finalSubmit, setFinalSubmit] = useState(false);

  // -----------------------------
  // ✅ Start / Resume Assessment
  // -----------------------------
  const startAssessment = async ({ forceNew = false } = {}) => {
    if (starting) return;

    setStarting(true);
    setLoading(true);
    setAssessment(null);
    setAssessmentId(null);
    setIndex(0);
    setNotes("");
    setCompleted(false);
    setFinalSubmit(false);

    try {
      const res = await fetch("/api/assessment/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceNew }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to start assessment");
        router.push("/dashboard");
        return;
      }

      if (data.resumed) toast.info("Resuming your assessment");
      else toast.success("New assessment created");

      setAssessmentId(data.assessmentId);
    } catch (err) {
      toast.error("Something went wrong");
      router.push("/dashboard");
    } finally {
      setStarting(false);
    }
  };

  // Start on load (Resume)
  useEffect(() => {
    startAssessment({ forceNew: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -----------------------------
  // ✅ Load Assessment
  // -----------------------------
  const loadAssessment = async (id) => {
    try {
      const res = await fetch(`/api/assessment/${id}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load assessment");
        router.push("/dashboard");
        return;
      }

      const a = data.assessment;

      setAssessment(a);

      // ✅ resume: jump to first unanswered question
      const firstUnanswered = a.questions.findIndex(
        (q) => !q.answers || q.answers.length === 0
      );

      if (firstUnanswered === -1) {
        setCompleted(true);
        setIndex(a.questions.length - 1);
      } else {
        setIndex(firstUnanswered);
      }

      setLoading(false);
    } catch (err) {
      toast.error("Failed to load assessment");
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (!assessmentId) return;
    loadAssessment(assessmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  // -----------------------------
  // ✅ Derived values
  // -----------------------------
  const totalQuestions = assessment?.questions?.length || 0;

  const currentQuestion = useMemo(() => {
    if (!assessment?.questions?.length) return null;
    return assessment.questions[index];
  }, [assessment, index]);

  const answeredCount = useMemo(() => {
    if (!assessment?.questions) return 0;
    return assessment.questions.filter((q) => q.answers?.length > 0).length;
  }, [assessment]);

  const progress = totalQuestions
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  // ✅ update notes when switching question (restore saved note if exists)
  useEffect(() => {
    if (!currentQuestion) return;
    const savedNote = currentQuestion?.answers?.[0]?.notes || "";
    setNotes(savedNote);
  }, [currentQuestion]);

  // -----------------------------
  // ✅ Save Answer
  // -----------------------------
  const submitAnswer = async (value) => {
    if (!currentQuestion) return;
    if (submitting !== null) return;

    setSubmitting(value);

    try {
      const res = await fetch("/api/assessment/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          value,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save answer");
        return;
      }

      toast.success("Saved your response", { autoClose: 800 });

      // ✅ Update local assessment so UI shows answered state without refetching everything
      setAssessment((prev) => {
        if (!prev) return prev;

        const updatedQuestions = [...prev.questions];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          answers: [{ value, notes }],
        };

        return { ...prev, questions: updatedQuestions };
      });

      setNotes("");

      if (index < totalQuestions - 1) {
        setIndex(index + 1);
      } else {
        setCompleted(true);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(null);
    }
  };

  // -----------------------------
  // ✅ Submit Assessment
  // -----------------------------
  const submitAssessment = async () => {
    if (!assessmentId) return;
    if (finalSubmit) return;

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
        setFinalSubmit(false);
        return;
      }

      toast.success("Assessment completed! Generating your report...", { autoClose: 1500 });
      router.push("/reports");
    } catch (error) {
      toast.error("Something went wrong");
      setFinalSubmit(false);
    }
  };

  // -----------------------------
  // UI States
  // -----------------------------
  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>

        <div className="h-2 bg-gray-200 rounded mt-4 animate-pulse" />

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

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
            Preparing your assessment...
          </div>
        </div>
      </main>
    );
  }

  if (!assessment || !currentQuestion) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">Unable to load assessment.</p>
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

  const q = currentQuestion;
  const currentAnswer = q?.answers?.[0]?.value;

  return (
    <main className="max-w-3xl mx-auto px-6 py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Compliance Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Answered {answeredCount}/{totalQuestions}
          </p>
        </div>

        {/* ✅ New assessment button */}
        <button
          onClick={() => startAssessment({ forceNew: true })}
          disabled={starting || finalSubmit}
          className="border rounded-lg px-4 py-2 text-sm hover:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {starting ? "Starting..." : "Run New Assessment"}
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-500">{progress}%</p>
        {currentAnswer ? (
          <span className="text-xs border rounded px-2 py-1 bg-gray-50">
            Answered: <b>{currentAnswer}</b>
          </span>
        ) : (
          <span className="text-xs border rounded px-2 py-1 bg-yellow-50">
            Not answered
          </span>
        )}
      </div>

      <div className="h-2 bg-gray-200 rounded mt-2">
        <div
          className="h-2 bg-black rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <div className="mt-8 border rounded-xl p-6 bg-white">
        {!completed ? (
          <>
            <p className="text-xs text-gray-500">{q.category}</p>
            <h2 className="text-lg font-medium mt-2">
              Q{index + 1}: {q.text}
            </h2>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <button
                onClick={() => submitAnswer("NO")}
                disabled={submitting || finalSubmit}
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
                disabled={submitting || finalSubmit}
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
                disabled={submitting || finalSubmit}
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
                setIndex(totalQuestions - 1);
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
              {finalSubmit ? "Submitting..." : "Submit Assessment"}
            </button>
          ) : (
            <p className="text-sm text-gray-400">
              Question {index + 1} / {totalQuestions}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
