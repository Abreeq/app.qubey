"use client"
import { FaCirclePlus, FaCalendarDays, FaCheck } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import {
  FaShieldAlt, FaInfoCircle, FaArrowRight, FaClipboardList, FaBookmark,
  FaBan, FaTimesCircle, FaSyncAlt, FaHistory, FaPlay,
} from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";


export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dashboard");
        const json = await res.json();
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
        if (res.status === 403) {
          router.push("/profile");
          return;
        }

        if(res.status === 404) {
          if(json.error === "Organization not found") {
          router.push("/organisation/create");
          }
          router.push("/auth");
          return;
        }

        setData(json);
        setLoading(false);
      } catch (error) {
        console.error(error);
        router.push("/auth");
      }
    };

    load();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-12 animate-pulse space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <div className="h-8 max-w-lg bg-gray-200 rounded" />
            <div className="h-3 max-w-md bg-gray-200 rounded" />
          </div>
          <div className="flex items-start gap-4 justify-end">
            <div className="h-8 w-40 rounded-4xl bg-gray-200"></div>
            <div className="h-8 w-40 rounded-4xl bg-gray-200"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white border border-gray-200 px-6 pt-8 pb-6 space-y-6">
            <div className="space-y-3">
              <div className="h-6 max-w-64 bg-gray-200 rounded" />
              <div className="h-4 w-96 max-w-full bg-gray-200 rounded" />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-48 h-48 rounded-full bg-gray-200 shrink-0" />

              <div className="flex-1 space-y-6 w-full">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-full bg-gray-200 rounded-full" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 h-16 bg-gray-200 rounded-xl" />
                  <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1 rounded-2xl bg-white border border-gray-200 p-4 sm:px-6 pt-8 pb-6 space-y-6">
            <div className="space-y-3">
              <div className="h-6 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-56 bg-gray-200 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="h-14 bg-gray-200 rounded-xl" />
      </main>
    );
  }

  const { readinessScore, riskLevel, lastAssessmentAt, stats, nextAction, } = data;

  const hasAssessment = Boolean(lastAssessmentAt);
  const noActionsAfterAssessment = hasAssessment && Array.isArray(nextAction) && nextAction.length === 0;

  const sortedActions = Array.isArray(nextAction) ? [...nextAction].sort(
    (a, b) => b.expectedIncrease - a.expectedIncrease)
    : [];

  const visibleActions = showAll ? sortedActions : sortedActions.slice(0, 3);

  return (
    <section className="py-12 space-y-8 sm:space-y-12 pr-1.5">
      {/* Welcome Message */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mb-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            Compliance Readiness Dashboard
          </h1>
          <p className="font-medium text-lg max-w-3xl">
            Welcome back, {session?.user?.name}. View your current compliance status and key metrics at a glance.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 justify-start">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <button className="cursor-pointer rounded-4xl bg-slate-100/80 border border-gray-300
              hover:bg-purple-100 hover:scale-95 px-3 md:px-4 py-2 flex items-center gap-2 transition-all duration-300">
              <MdOutlineFileDownload className="size-4 md:size-5 shrink-0" />
              <span className="md:font-medium">Export Report</span>
            </button>
            <button onClick={() => router.push("/assessment")}
              className="cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
              px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
              <FaCirclePlus className="size-4 text-white shrink-0" />
              <span className="md:font-medium text-white">New Assessment</span>
            </button>
          </div>

          {/* Last Assessment */}
          <p className="flex items-center gap-2 font-medium text-sm text-gray-700">
            <FaCalendarDays className="size-3 text-[rgb(var(--light-purple))]" />
            Last assessment: {" "} {lastAssessmentAt ?
              new Date(lastAssessmentAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }) : "Not yet"}
          </p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Readiness Score Card */}
        <div className="col-span-1 lg:col-span-2 relative overflow-hidden rounded-2xl shadow-lg bg-linear-to-br from-purple-100 via-white to-white px-6 pt-8 pb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Card Header */}
          <div className="relative mb-6">
            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
              <FaShieldAlt className="size-6 text-[rgb(var(--light-purple))]" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Overall Readiness Score</span>
            </h2>
            <p className="font-medium mt-1">
              This score represents your compliance status across all assessments and policies.
            </p>
          </div>

          {/* Card Content */}
          <div className="flex flex-col md:flex-row items-center gap-7 md:gap-5 lg:gap-8">
            {/* Circle Progress */}
            <div className="relative flex items-center justify-center w-48 h-48 shrink-0">
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
                  strokeDashoffset={251.2 - (251.2 * readinessScore) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-bold">{readinessScore}</span>
                <span className="font-medium text-gray-500">/ 100</span>
              </div>
            </div>

            {/* Progress and Actions */}
            <div className="flex-1 space-y-6 w-full">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-800">Assessment Progress</span>
                  <span className="text-gray-500">{readinessScore}%</span>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-purple-600 rounded-full"
                    style={{ width: `${readinessScore}%` }}
                  />
                </div>
              </div>

              {/* Alert + Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-xl p-3 flex items-start gap-2.5">
                  <FaInfoCircle className="text-yellow-600 mt-1 size-5 shrink-0" />
                  <div>
                    <div className="font-bold text-sm uppercase tracking-wider mb-1">Status</div>
                    <div className="font-semibold text-xs">
                      {riskLevel === "Not started" ? "Assessment Not Started" : `Risk: ${riskLevel}`}
                    </div>
                  </div>
                </div>

                {riskLevel === "Not started" ? (
                  <button onClick={() => router.push("/assessment")}
                    className="flex-1 cursor-pointer rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] 
                    px-4 py-4 md:py-2 flex items-center justify-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                    <span className="font-medium text-white">Start Assessment</span>
                    <FaArrowRight className="text-white shrink-0" />
                  </button>
                ) : (
                  <Link href={"#recommended-actions"}
                    className="flex-1 rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] 
                     py-4 px-2 md:py-2 flex items-center justify-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                    <span className=" text-white">Recommended Action</span>
                    <FaArrowRight className="text-white rotate-90 shrink-0" />
                  </Link>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Action Center Card */}
        <div className="col-span-1 flex flex-col rounded-2xl bg-white/60 backdrop-blur-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-300 p-4 sm:px-6 pt-8 pb-6">
          <div className="mb-4">
            <h3 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Action Center</h3>
            <p className="font-medium">Immediate attention required</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Critical Risks" value={stats.highRisks} color="text-red-600"
              />

              <StatCard
                title="Pending Actions" value={stats.actionsPending} color="text-orange-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Actions Completed" value={stats.actionsCompleted} color="text-purple-600"
              />

              <StatCard
                title="Score Improvement" value={`+${stats.scoreImprovement}`} color="text-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Understand your score */}
      <div className="overflow-hidden rounded-2xl bg-white/60 backdrop-blur-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] p-4 sm:p-6">

        {/* Header */}
        <div className="border-b border-purple-300 pb-4 sm:pb-6 pt-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
              <span className="absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-20 animate-ping"></span>
              <FaInfoCircle className="relative text-xl text-purple-700" />
            </div>
            <div>
              <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Understanding Your Score
              </h2>
              <p className="font-medium mt-1">
                A quick guide to what your readiness score reflects and what it doesn’t.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 px-4 py-6 lg:grid-cols-2 xl:grid-cols-3">

          {/* Column 1: What Your Score Means */}
          <div className="space-y-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FaBookmark className="size-4 text-[rgb(var(--light-purple))]" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                What Your Score Means
              </span>
            </h3>

            <div className="space-y-3">
              {/* 0–40 */}
              <div className="rounded-xl border bg-red-50 p-4 hover:shadow-md hover:shadow-red-100 transition border-red-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-600">0 - 40</span>
                  <span className="rounded bg-red-600 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                    Action Required
                  </span>
                </div>
                <p className="text-sm font-medium">Needs immediate attention</p>
                <p className="text-xs font-medium text-gray-700">
                  Critical gaps identified in security posture.
                </p>
              </div>

              {/* 41–70 */}
              <div className="rounded-xl border bg-orange-50 p-4 hover:shadow-md hover:shadow-orange-100 transition border-orange-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-600">41 - 70</span>
                  <span className="rounded bg-orange-600 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                    In Progress
                  </span>
                </div>
                <p className="text-sm font-medium">Progressing - building foundation</p>
                <p className="text-xs font-medium text-gray-700">
                  Core controls exist but require maturity.
                </p>
              </div>

              {/* 71–100 */}
              <div className="rounded-xl border bg-purple-50 p-4 hover:shadow-md hover:shadow-purple-100 transition border-purple-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-purple-600">71 - 100</span>
                  <span className="rounded bg-purple-600 px-2 py-1 text-[10px] font-semibold uppercase text-white">
                    Ready
                  </span>
                </div>
                <p className="text-sm font-medium">Strong readiness</p>
                <p className="text-xs font-medium text-gray-700">
                  Well-positioned for audits and scaling.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: What Your Score Does NOT Mean */}
          <div className="space-y-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FaBan className="size-4 text-[rgb(var(--light-purple))]" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                What Your Score Does NOT Mean
              </span>
            </h3>

            <div className="rounded-xl border border-dashed border-purple-400 bg-gray-50 py-6 px-4">
              <ul className="space-y-4">
                {[
                  {
                    title: "Not a certification or audit result",
                    desc: "Internal metric only, not an official seal.",
                  },
                  {
                    title: "Does not guarantee regulatory approval",
                    desc: "Compliance depends on external auditors.",
                  },
                  {
                    title: "Not a substitute for legal advice",
                    desc: "Consult with your legal counsel.",
                  },
                  {
                    title: "Does not mean you’re immune to incidents",
                    desc: "Risk can be managed but never eliminated.",
                  },
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <FaTimesCircle className="mt-1 text-red-500" />
                    <div>
                      <p className="text-sm sm:text-base font-medium">{item.title}</p>
                      <p className="text-sm font-medium text-gray-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 3: Why Scores Change */}
          <div className="lg:col-span-2 xl:col-span-1 space-y-5">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FaSyncAlt className="size-4 text-[rgb(var(--light-purple))]" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Why Scores Change Over Time
              </span>
            </h3>

            <div className="grid gap-4">
              {/* Improve */}
              <div className="flex items-start gap-3 rounded-xl border border-purple-300 bg-white p-4 hover:shadow-md transition">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-green-100 text-green-700">
                  <FaArrowRight className="-rotate-90" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Completing actions improves score</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Implementing controls and uploading evidence boosts readiness.
                  </p>
                </div>
              </div>

              {/* Decrease */}
              <div className="flex items-start gap-3 rounded-xl border border-purple-300 bg-white p-4 hover:shadow-md transition">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-700">
                  <FaArrowRight className="rotate-90" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">New risks may reduce score</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Regulatory changes or threats can introduce new gaps.
                  </p>
                </div>
              </div>

              {/* Reassessment */}
              <div className="flex items-start gap-3 rounded-xl border border-purple-300 bg-white p-4 hover:shadow-md transition">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                  <FaHistory />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-medium">Reassessments keep data current</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Periodic reviews ensure real-time accuracy.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* Next Recommended Action */}
      {!hasAssessment ? (
        <div className="relative overflow-hidden hover:shadow-[0_20px_40px_rgba(118,27,230,0.12)] transition rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
          <div className="pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                <span className="absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-20 animate-ping"></span>
                <FaPlay className="relative ml-1 text-lg text-purple-700" />
              </div>
              <div>
                <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  Run your First Assessment
                </h2>
                <p className="font-medium mt-1">
                  Complete an assessment to receive tailored recommendations and improve your score.
                </p>
              </div>
            </div>

            <button onClick={() => router.push("/assessment")}
              className="cursor-pointer ml-12 mt-4 px-4 py-2 rounded-lg text-white bg-linear-to-r from-[#441851] to-[#761be6]
            hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
              Start assessment
            </button>
          </div>
        </div>
      ) : noActionsAfterAssessment ? (
        <div className="relative overflow-hidden hover:shadow-[0_20px_40px_rgba(118,27,230,0.12)] transition rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
          <div className="pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-500">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-20 animate-ping"></span>
                <FaCheck className="relative text-lg text-green-700" />
              </div>
              <div>
                <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  You’re all Caught Up
                </h2>
                <p className="font-medium mt-1">
                  No recommended actions at the moment. Your controls meet current requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Next Recommended Actions
        <div id="recommended-actions" className="relative overflow-hidden hover:shadow-[0_20px_40px_rgba(118,27,230,0.12)] transition rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-3 sm:px-6 py-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          {/* Header */}
          <div className="relative border-b border-purple-300 pb-4 sm:pb-6">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                <span className="absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-20 animate-ping"></span>
                <TbTargetArrow className="relative text-xl text-purple-700" />
              </div>
              <div>
                <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  Next Recommended Actions
                </h2>
                <p className="font-medium mt-1">
                  Recommended steps to improve your compliance score.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-6">

            {/* Content */}
            <div className="px-2 sm:px-4 lg:px-6 pt-6 space-y-4 sm:space-y-6">
              {visibleActions.map((action) => (
                <div key={action.id} className="flex flex-col md:flex-row items-start md:items-center gap-3 lg:gap-4 p-4 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 transition group">
                  <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                    <FaClipboardList />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm md:text-base font-semibold">
                      {action.title}
                    </h4>
                    <p className="text-sm font-medium text-gray-700 mt-1">
                      This could improve your score by approximately{" "}<span className="font-semibold">{action.expectedIncrease} points.</span>
                    </p>
                  </div>

                  <button onClick={() => router.push(`/actions/${action.id}`)}
                    className="md:ml-3 text-sm px-3 py-2 cursor-pointer border-none rounded-lg text-white bg-linear-to-r from-[#441851] to-[#761be6]
                   hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                    View Action
                  </button>
                </div>
              ))}
            </div>

            {/* View all Button */}
            {nextAction.length > 3 && (
              <div className="border-t border-purple-300 p-4 sm:p-6">
                <button onClick={() => setShowAll(!showAll)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-3 cursor-pointer border-none rounded-lg text-white bg-linear-to-r from-[#441851] to-[#761be6]
                hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                  {showAll
                    ? "Show fewer actions"
                    : `View all ${nextAction.length} pending actions`}
                  <FaArrowRight className={`transition-transform ${showAll ? "rotate-90" : ""}`} />
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </section>
  );
}

// statsCard
function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-300 text-center">
      <h4 className={`text-3xl font-bold ${color} mb-1`}>{value}</h4>
      <p className="text-xs text-gray-700 font-medium uppercase tracking-wide">
        {title}
      </p>
    </div>
  );
}
