"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaCalendarDays, FaCheck, FaMinus, FaArrowLeft } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";
import { BsBarChartFill } from "react-icons/bs";
import { LuCircleCheckBig } from "react-icons/lu";


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

  const [responseText, setResponseText] = useState("");
  const [assessmentStatus, setAssessmentStatus] = useState("");


  // for auto clearing the responseText
  useEffect(() => {
    if (!responseText) return;

    const timer = setTimeout(() => {
      setResponseText("");
    }, 1000);

    return () => clearTimeout(timer);
  }, [responseText]);


  // Start on load (Resume)
  useEffect(() => {
    startAssessment({ forceNew: false });
  }, []);

  // ✅ Start / Resume Assessment
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

      if (data.resumed) setAssessmentStatus("Assessment Resumed");
      else setAssessmentStatus("New Assessment");

      setAssessmentId(data.assessmentId);
    } catch (err) {
      toast.error("Something went wrong");
      router.push("/dashboard");
    } finally {
      setStarting(false);
    }
  };


  // ✅ Load Assessment
  useEffect(() => {
    if (!assessmentId) return;
    loadAssessment(assessmentId);
  }, [assessmentId]);

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


  //---- ✅ Derived values  -----//
  const totalQuestions = assessment?.questions?.length || 0;

  const currentQuestion = useMemo(() => {
    if (!assessment?.questions?.length) return null;
    return assessment.questions[index];
  }, [assessment, index]);

  const answeredCount = useMemo(() => {
    if (!assessment?.questions) return 0;
    return assessment.questions.filter((q) => q.answers?.length > 0).length;
  }, [assessment]);


  // to show next button (Index of the latest answered question)
  const latestAnsweredIndex = useMemo(() => {
    if (!assessment?.questions) return -1;
    return assessment.questions.reduce((last, q, i) => (q.answers?.length ? i : last), -1);
  }, [assessment]);

  // Show Next button if user is behind the latest answered question
  const showNextButton = index < latestAnsweredIndex + 1;

  const progress = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

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
      setResponseText("Response Saved")

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


  // for categories
  const sections = useMemo(() => {
    if (!assessment?.questions) return [];

    const map = {};

    assessment.questions.forEach((q) => {
      const category = q.category || "Uncategorized";

      if (!map[category]) {
        map[category] = { title: category, answered: 0, total: 0 };
      }

      map[category].total += 1;
      if (q.answers?.length > 0) map[category].answered += 1;
    });

    // Convert map to array
    return Object.entries(map).map(([key, value], idx) => ({
      id: idx + 1,
      ...value,
    }));
  }, [assessment]);


  // for loading state
  if (loading) {
    return (
      <section className="relative">
        {/* Skeleton background */}
        <div className="pt-12 pb-8 pr-1.5 space-y-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-center">
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>

            <div className="flex gap-3 justify-start md:justify-end">
              <div className="h-10 w-40 bg-gray-200 rounded-full" />
              <div className="h-10 w-48 bg-gray-200 rounded-full" />
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Question Card Skeleton */}
            <div className="col-span-1 lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="h-5 w-32 bg-gray-200 rounded" />
                <div className="h-6 w-24 bg-gray-200 rounded-full" />
              </div>
              <div className="h-px bg-gray-200" />
              <div className="space-y-3">
                <div className="h-6 w-4/5 bg-gray-200 rounded" />
                <div className="h-6 w-3/5 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-20 w-full bg-gray-200 rounded-xl" />
              </div>
              <div className="h-8 w-28 bg-gray-200 rounded-xl mt-4" />
            </div>

            {/* Progress Card Skeleton */}
            <div className=" col-span-1 bg-white rounded-3xl border border-gray-200 p-6 space-y-6 shadow-sm">

              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-px bg-gray-200" />
              {/* Progress */}
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-20 w-20 bg-gray-200 rounded-full" />
              </div>
              {/* Sections */}
              <div className="space-y-4 pt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-4 w-10 bg-gray-200 rounded" />
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Blur Overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 animate-pulse" />

        {/* Overlay generating message */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="bg-white border border-gray-100 flex flex-col items-center rounded-3xl shadow-xl p-8 text-center space-y-4 max-w-md w-full">
            {/* Spinner */}
            <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />

            {/* Heading */}
            <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
              Loading Your Assessment...
            </h2>

            {/* Description */}
            <p className="text-gray-600 font-medium">
              We're preparing a personalized compliance assessment for you. This will only take a moment.
            </p>

            {/* Subtle bouncing dots */}
            <div className="flex justify-center gap-1">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        </div>

      </section>
    );
  }

  if (!assessment || !currentQuestion) {
    return (
      <main className="max-w-7xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
        <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative pb-1 sm:pb-6">
          <div className="text-center space-y-4">
            <h2 className={`font-semibold capitalize text-2xl sm:text-3xl bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent`}>
              Oops! Something’s Missing
            </h2>
            <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 max-w-3xl mx-auto">
              We couldn’t find the assessment data right now. This could happen if the assessment has no questions or if something went wrong while loading.
            </p>
            <p className="text-sm sm:text-base font-medium mt-1">
              Try refreshing the page or starting a new assessment below.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => startAssessment({ forceNew: true })}
                className="cursor-pointer rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] text-white
            px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] font-medium transition"
              >
                Start New Assessment
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer font-medium px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go Back to Dashboard
              </button>
            </div>

            <p className="text-sm sm:text-base font-medium mt-1">
              If the issue persists, please contact support.
            </p>

          </div>
        </div>
      </main>
    );
  }

  const q = currentQuestion;
  const currentAnswer = q?.answers?.[0]?.value;


  return (
    <section className="pt-6 pb-8 space-y-5 sm:space-y-8 pr-1.5 max-w-7xl mx-auto">
      {/* Page Heading */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mt-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            Assess Your Compliance Readiness
          </h1>
          <p className="font-medium text-sm sm:text-base max-w-2xl">
            Answer quick questions to understand where your organisation stands and what actions will strengthen your compliance.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 justify-start">
          <div className="flex flex-col xl:flex-row items-center gap-4">
            {assessmentStatus && (
              <p className="rounded-4xl text-sm sm:font-medium bg-slate-100/80 border border-gray-300 px-3 py-1">
                {assessmentStatus}
              </p>
            )}

            <button onClick={() => startAssessment({ forceNew: true })} disabled={starting || finalSubmit}
              className="disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
              px-3 py-1.5 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
              <span className="sm:font-medium text-sm text-white">{starting ? "Starting..." : "Run New Assessment"}</span>
            </button>
          </div>

          {/* Assessment Created at*/}
          <p className="flex items-center gap-2 font-medium text-sm text-gray-700">
            <FaCalendarDays className="size-3 text-[rgb(var(--light-purple))] mb-1" />
            Assessment Created At: {" "} {assessment.createdAt
              ? new Date(assessment.createdAt).toLocaleString("en-US", {
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              : "Not Created yet"}
          </p>

        </div>
      </div>

      {/* QuestionCard && Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Question Card */}
        {!completed ? (
          <div className={`col-span-1 lg:col-span-2 relative z-10 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:pt-4 sm:pb-6`}>

            {/* Question Number */}
            <div className="flex items-center justify-between gap-4">
              <p className="font-medium text-sm flex items-center gap-1">
                <span className="flex items-center justify-center size-6 bg-[rgb(var(--light-purple))] text-white rounded-full">{index + 1}</span> of {totalQuestions} Questions
              </p>
              {/* category */}
              <div className="flex items-center gap-4">
                {/* when response is saved */}
                <span className={`${responseText ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none"} text-sm font-medium text-green-800 border border-green-300 bg-green-100 shadow-sm rounded-full px-4 py-1 transition-all duration-300`}>
                  {responseText}
                </span>

                <span className="text-sm font-medium text-gray-600 border border-gray-300 shadow-sm  rounded-full px-4 py-1">{q.category}</span>
              </div>
            </div>

            <div className="border-b border-purple-300 my-3"></div>

            <h2 className="font-semibold text-lg sm:text-xl md:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
              Q{index + 1}: {q.text}
            </h2>

            <div className="border-b border-purple-300 my-3"></div>
            <p className="font-medium mt-5 mb-2">Select Your Answer</p>

            <div className="grid grid-cols-3 gap-3 items-center">
              <button onClick={() => submitAnswer("NO")} disabled={submitting || finalSubmit}
                className={`${currentAnswer === "NO" ? "bg-green-200 border-green-400" : ""} disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 sm:px-4 py-2 md:py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/3 transition-colors cursor-pointer`}>
                {submitting === "NO" ? (
                  <>
                    <p className="font-medium flex items-center gap-2">
                      Saving...
                      <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></span>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="flex items-center justify-center size-4 sm:size-5 bg-[rgb(var(--light-purple))] text-white rounded-full">
                      <IoMdClose className="size-3" />
                    </span>
                    <p className="font-medium md:text-lg">No</p>
                  </>
                )}
              </button>

              <button onClick={() => submitAnswer("PARTIAL")} disabled={submitting || finalSubmit}
                className={`${currentAnswer === "PARTIAL" ? "bg-green-200 border-green-400" : ""}   disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 sm:px-4 py-2 md:py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/3 transition-colors cursor-pointer`}>
                {submitting === "PARTIAL" ? (
                  <>
                    <p className="font-medium flex items-center gap-2">
                      Saving...
                      <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></span>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="flex items-center justify-center size-4 sm:size-5 bg-[rgb(var(--light-purple))] text-white rounded-full">
                      <FaMinus className="size-3" />
                    </span>
                    <p className="font-medium md:text-lg">Partial</p>
                  </>
                )}
              </button>

              <button onClick={() => submitAnswer("YES")} disabled={submitting || finalSubmit}
                className={`${currentAnswer === "YES" ? "bg-green-200 border-green-400" : ""} disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-3 sm:px-4 py-2 md:py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/3 transition-colors cursor-pointer`}>
                {submitting === "YES" ? (
                  <>
                    <p className="font-medium flex items-center gap-2">
                      Saving...
                      <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></span>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="flex items-center justify-center size-4 sm:size-5 bg-[rgb(var(--light-purple))] text-white rounded-full">
                      <FaCheck className="size-3" />
                    </span>
                    <p className="font-medium md:text-lg">Yes</p>
                  </>
                )}
              </button>

            </div>

            {/* Notes */}
            <p className="font-medium mt-6 mb-4 flex items-center justify-between">
              Additional Comments
              <span className="text-sm text-gray-600 border border-gray-300 shadow-sm rounded-full px-2 py-0.5">Optional</span>
            </p>

            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-300 shadow-sm px-3 sm:px-4 py-1 sm:py-2 focus:ring-1 focus:ring-[#761be6]/70 outline-none transition-all"
              placeholder="Add any comments or clarification"
              rows={3}
            />

            {/* Buttons */}
            <div className="flex justify-between gap-4 items-center mt-4">
              {/* Back Button */}
              <button disabled={index === 0 || finalSubmit}
                onClick={() => {
                  if (completed) {
                    setCompleted(false);
                    setIndex(totalQuestions - 1);
                  } else {
                    setIndex(Math.max(0, index - 1));
                  }
                }}
                className="disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-4xl bg-slate-100/80 border border-gray-300 text-gray-600
                hover:bg-[#761be6]/8 hover:scale-95 px-3 py-2 flex items-center gap-2 transition-all duration-300">
                <FaArrowLeft className="size-3" />
                <span className="text-sm font-medium">Previous</span>
              </button>

              {/* Next Button */}
              {showNextButton && !completed && (
                <button onClick={() => {
                  if (index === totalQuestions - 1 && answeredCount === totalQuestions) {
                    setCompleted(true);
                  } else {
                    setIndex(index + 1);
                  }
                }}
                  className="cursor-pointer flex items-center gap-2 rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition text-white px-6 py-2"
                >
                  <span className="text-sm font-medium">Next</span>
                  <FaArrowLeft className="size-3 rotate-180" />
                </button>
              )}

            </div>
          </div>
        ) : (
          <div className={`col-span-1 lg:col-span-2 relative z-10`}>
            <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6">
              <h2 className="font-semibold text-2xl sm:text-3xl flex items-center gap-3">
                <span className="flex items-center justify-center size-7 bg-green-600 text-white   rounded-full">
                  <FaCheck className="size-5" />
                </span>
                <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent capitalize">You’ve reached the end of the assessment</span>
              </h2>
              <div className="border-b border-purple-300 my-3"></div>

              <p className="font-medium text-base sm:text-lg mt-2 max-w-2xl">
                Great work! You've completed all 20 questions in this assessment.
              </p>

              <p className="font-medium mt-2">
                Review your answers or submit when ready.
              </p>

              <div className="flex items-baseline justify-between gap-4">
                {/* Back Button */}
                <button disabled={index === 0 || finalSubmit}
                  onClick={() => {
                    if (completed) {
                      setCompleted(false);
                      setIndex(totalQuestions - 1);
                    } else {
                      setIndex(Math.max(0, index - 1));
                    }
                  }}
                  className="disabled:opacity-50 disabled:cursor-not-allowed mt-4 cursor-pointer rounded-2xl bg-slate-100/80 border border-gray-300 text-gray-600
                hover:bg-[#761be6]/8 hover:scale-95 px-3 py-1.5 flex items-center gap-2 transition-all    duration-300">
                  <FaArrowLeft className="size-3" />
                  <span className="text-sm font-medium">Previous</span>
                </button>

                {/* Submit Button */}
                <button onClick={submitAssessment} disabled={finalSubmit}
                  className="disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition px-3 md:px-4 py-2 mt-7">
                  {finalSubmit ? (
                    <>
                      <p className="md:font-medium text-white flex items-center gap-2">
                        Submitting...
                        <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      </p>
                    </>
                  ) : (
                    <span className="md:font-medium text-white">Submit Assessment</span>
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

        {/* Progress */}
        <div className={`col-span-1 relative z-10 `}>
          <div className="bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:pt-4 sm:pb-6">
            {/* Header */}
            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
              <BsBarChartFill className="size-5 text-[rgb(var(--light-purple))]" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Assessment Progress</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            {/* Progress Value */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="flex flex-col">
                <h2 className="font-bold text-2xl sm:text-3xl text-gray-700">
                  {progress}%
                </h2>
                <span className="text-gray-500 font-medium text-sm">
                  {answeredCount}/{totalQuestions} Answered
                </span>
              </div>

              <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    r="40"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-gray-300"
                    strokeWidth="8"
                  />
                  <circle
                    r="40"
                    cx="50"
                    cy="50"
                    fill="transparent"
                    stroke="currentColor"
                    className="text-purple-600"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <LuCircleCheckBig className="size-7 text-[rgb(var(--light-purple))]" />
                </div>
              </div>

            </div>

            {/* Categories */}
            <div className="space-y-4 pt-2">
              {sections.map((section) => {
                const percentage = section.total === 0 ? 0
                  : Math.round((section.answered / section.total) * 100);

                return (
                  <div key={section.id} className="space-y-2">
                    <div className="flex w-full justify-between text-sm">
                      <span
                        className={`${section.answered > 0
                          ? "font-medium text-purple-600"
                          : "text-gray-500"
                          }`}
                      >
                        {section.id}. {section.title}
                      </span>
                      <span className="text-gray-500">
                        {section.answered}/{section.total}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </section >
  );
}
