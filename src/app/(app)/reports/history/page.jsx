"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { FaInfoCircle, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa6";
import { HiDocumentChartBar } from "react-icons/hi2";
import { MdOutlineFileDownload } from "react-icons/md";

export default function ReportsHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [pdfId, setPdfId] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  // for filters
  const [sortOrder, setSortOrder] = useState("newest");
  const [riskFilter, setRiskFilter] = useState("all");
  // for error
  const [error, setError] = useState(null);
  // for loader
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingProgress(100);
      return;
    }

    setLoadingProgress(0); // reset when loading starts

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;

        let increment;

        if (prev < 30) {
          increment = Math.random() * 8 + 2; // fast start
        }
        else if (prev < 60) {
          increment = Math.random() * 4 + 1; // medium
        }
        else {
          increment = Math.random() * 2; // slow end
        }

        return Math.min(prev + increment, 90);
      });
    }, 300); // faster updates

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/report/list");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load reports");
          setLoading(false);
          return;
        }

        setReports(data.reports);
      } catch (err) {
        setError("Something went wrong while loading reports.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // for Average Score
  const averageScore = () => {
    if (!reports.length) return 0;

    const totalScore = reports.reduce((acc, current) => {
      return acc + current.score;
    }, 0);

    const avg = totalScore / reports.length;
    return Number(avg.toFixed(1))
  }

  const latestReportDate = reports.length ? Math.max(...reports.map(r => new Date(r.createdAt))) : null;

  // For Filter
  const filteredReports = reports.filter((report) => {
    if (riskFilter === "all") return true;
    return report.riskLevel === riskFilter;
  }).sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    return sortOrder === "newest"
      ? dateB - dateA
      : dateA - dateB;
  });

  const visibleReports = showAll ? filteredReports : filteredReports.slice(0, 3);

  // for pdf download
  const handleDownload = async (assessmentId) => {
    try {
      setPdfId(assessmentId);
      setPdfError(null);

      const res = await fetch(`/api/report/pdf/${assessmentId}`);

      if (!res.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Qubey_Compliance_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      setPdfError("Unable to generate PDF. Please try again.");
    } finally {
      setPdfId(null);
    }
  };

  // For Error
  if (error) {
    return (
      <main className="max-w-7xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
        <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative pb-1 sm:pb-6">
          <div className="text-center space-y-4">
            <h2 className={`font-semibold capitalize text-2xl sm:text-3xl bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent`}>
              Oops! Unable to Load Report History
            </h2>
            <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 max-w-3xl mx-auto">
              We couldn’t retrieve your previously generated compliance reports right now.
            </p>
            <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 inline-block px-3 py-2 rounded-lg">
              {error}
            </p>
            <p className="text-sm sm:text-base font-medium mt-1">
              Try refreshing the page or starting a new assessment below.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => window.location.reload()}
                className="cursor-pointer rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] text-white
                                px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] font-medium transition">
                Retry Loading Reports
              </button>

              <Link href="/dashboard"
                className="font-medium px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go Back to Dashboard
              </Link>
            </div>

            <p className="text-sm sm:text-base font-medium mt-1">
              If the issue persists, please contact support.
            </p>

          </div>
        </div>
      </main>
    )
  }


  // loading state
  if (loading) {
    return (
      <section className="relative">
        {/* Skeleton background */}
        <div className="pt-12 pb-8 space-y-7 sm:space-y-12 pr-1.5 max-w-7xl mx-auto">
          {/* ===== Page Heading Skeleton ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-center">
            <div className="space-y-3">
              <div className="h-8 sm:h-10 w-3/4 rounded-lg bg-gray-200" />
              <div className="h-4 sm:h-5 w-2/3 rounded bg-gray-200" />
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-3">
                <div className="h-9 w-36 rounded-full bg-gray-200" />
              </div>
              <div className="h-4 w-56 rounded bg-gray-200" />
            </div>
          </div>

          {/* ===== Cards Skeleton ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-full rounded-3xl border border-gray-200 bg-white/50 p-4 sm:p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-gray-200" />
                  <div className="h-5 w-32 rounded bg-gray-200" />
                </div>

                <div className="h-px w-full bg-gray-200" />

                {/* Main Value */}
                <div className="h-16 w-20 rounded bg-gray-200" />

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-5/6 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {/* ===== Summary Skeleton ===== */}
          <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white px-6 pt-8 pb-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-4 w-64 rounded bg-gray-200" />
              </div>
            </div>

            <div className="h-px w-full bg-gray-200" />

            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
          </div>

        </div>

        {/* Blur Overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 animate-pulse" />

        {/* Overlay generating message */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="bg-white border border-gray-100 flex flex-col items-center rounded-3xl shadow-xl p-8 text-center space-y-4 max-w-md w-full">
            {/* Spinner */}
            {/* <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" /> */}

            {/* Heading */}
            <div className="w-full flex justify-between items-center mb-3">
              <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Loading Report History...
              </h2>
              <span className="text-sm font-medium text-gray-600 tabular-nums">{Math.floor(loadingProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#761be6] to-[#441851] transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            {/* Description */}
            <p className="text-gray-600 font-medium">
              We're retrieving your previously generated compliance reports, scores, and risk insights. <br />
              <span className="text-gray-500">This should only take a moment.</span>
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
    )
  }

  if (reports.length === 0) {
    return (
      <main className="max-w-7xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
        <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative pb-1 sm:pb-6">
          <div className="text-center space-y-4">
            <h2 className={`font-semibold capitalize text-2xl sm:text-3xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight`}>
              No Reports Available Yet
            </h2>
            <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 max-w-3xl mx-auto">
              Your compliance report history will appear here once reports are generated.
              Each report provides a detailed snapshot of your compliance score, risk level, and identified gaps at the time it was created.
            </p>
            <p className="text-sm sm:text-base font-medium mt-1">
              As reports are generated, they will be stored here so you can review progress, track improvements, and download previous assessments anytime.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/assessment"
                className="rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] text-white
                                px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] font-medium transition"
              >
                Start Assessment
              </Link>

              <Link href="/dashboard"
                className="font-medium px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go Back to Dashboard
              </Link>
            </div>

            <p className="text-sm sm:text-base font-medium mt-1">
              Reports are automatically saved to your history whenever a new compliance report is generated.
            </p>

          </div>
        </div>
      </main>
    );
  }

  return (
    <section className="pt-6 pb-8 space-y-7 sm:space-y-12 pr-1.5 max-w-7xl mx-auto">
      {/* Page Heading */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-start">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mt-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            Compliance Report History
          </h1>
          <p className="font-medium text-base sm:text-lg max-w-2xl">
            A complete record of your past compliance assessments, scores, and risk trends over time.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 justify-start">
          <div className="flex flex-col xl:flex-row items-center gap-4">
            <Link href="/reports"
              className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#441851]/80 
                            px-2 md:px-3 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
              <FaArrowLeft className="size-3.5 text-white shrink-0" />
              <span className="text-xs lg:text-sm text-white text-nowrap">Back to Report Page</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        <div className="relative z-10">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            {/* Header */}
            <h2 className="font-semibold text-lg sm:text-xl flex items-center gap-2">
              <HiDocumentChartBar className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Total Reports</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            <h3 className="mt-4 mb-2 text-xl sm:text-3xl md:text-4xl text-gray-800 font-semibold leading-tight">
              {reports.length < 10 ? `0${reports.length}` : reports.length}
            </h3>
            <p className="text-sm text-gray-700">Number of compliance reports generated from completed assessments.</p>

          </div>
        </div>

        <div className="relative z-10">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            {/* Header */}
            <h2 className="font-semibold text-lg sm:text-xl flex items-center gap-2">
              <FaShieldAlt className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Average Score</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            {/* Progress Value */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-20 sm:w-24 h-20 sm:h-24 shrink-0">
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
                    strokeDashoffset={251.2 - (251.2 * averageScore()) / 100}
                  />
                </svg>
                <p className="absolute inset-0 flex flex-col items-center justify-center sm:text-lg
                                 font-semibold">
                  {averageScore()}%
                </p>
              </div>

              <p className="mt-2 text-sm text-center text-gray-700">Average compliance score across all completed assessments.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 col-span-2 lg:col-span-1">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            {/* Header */}
            <h2 className="font-semibold text-lg sm:text-xl flex items-center gap-2">
              <FaInfoCircle className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Latest Open Gaps</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            {/* Gap Value*/}
            <h3 className="md:mt-4 mb-2 text-xl sm:text-3xl md:text-4xl font-semibold text-gray-800 leading-tight">
              {reports[0].openGaps < 10 ? `0${reports[0].openGaps}` : reports[0].openGaps}
            </h3>

            {reports[0].openGaps == 0 && (
              <p className="text-sm text-gray-700">
                No open compliance gaps detected in latest assessment. Your controls meet the required standards.
              </p>
            )}

            {reports[0].openGaps > 0 && reports[0].openGaps <= 3 && (
              <p className="text-sm text-orange-700">
                A small number of compliance gaps were identified in latest assessment. Addressing these will
                further strengthen your security posture.
              </p>
            )}

            {reports[0].openGaps > 3 && (
              <p className="text-sm text-red-500">
                Multiple compliance gaps require attention. These gaps increase regulatory
                and security risk if left unresolved.
              </p>
            )}

          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-linear-to-br from-purple-100 via-white to-white px-6 pt-8 pb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Report Filter */}
        <div className='flex flex-col lg:flex-row gap-5 lg:gap-3 justify-between'>
          <div className="relative">
            <h2 className="font-semibold text-xl sm:text-2xl">
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">All Generated Reports</span>
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-700">Browse previously generated compliance reports from completed assessments.</p>
          </div>

          <div className="relative flex justify-end gap-5">
            {/* Filter by Risk */}
            <div className="flex flex-col">
              <label className="text-sm font-medium ml-1">Filter by Risk</label>
              <select value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="cursor-pointer mt-1 appearance-none bg-[url('/down.svg')] bg-no-repeat bg-size-[16px_16px] bg-position-[right_0.5rem_center] pl-3 pr-8 py-1.5 sm:py-2 text-sm font-medium border-gray-300 rounded-xl bg-white/80 border focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all"
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            {/* Sort by Date */}
            <div className="flex flex-col">
              <label className="text-sm font-medium ml-1">Sort by Date</label>
              <select value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="cursor-pointer mt-1 appearance-none bg-[url('/down.svg')] bg-no-repeat bg-size-[16px_16px] bg-position-[right_0.5rem_center] pl-3 pr-9 py-1.5 sm:py-2 text-sm font-medium border-gray-300 rounded-xl bg-white/80 border focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

          </div>
        </div>
        <div className="border-b border-purple-300 my-3"></div>

        {/* List of Reports */}
        <div className="space-y-6">
          {/* Content */}
          <div className="px-2 sm:px-4 lg:px-6 pt-6 space-y-4 sm:space-y-6">
            {visibleReports.map((report) => (
              <div key={report.id} className="flex flex-col md:flex-row flex-wrap md:items-center md:justify-between gap-6 md:gap-1 p-4 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 hover:shadow-md hover:-translate-y-0.5 duration-300 transition-all">
                {/* Date */}
                <div className="flex flex-col gap-1 lg:gap-2">
                  {latestReportDate && new Date(report.createdAt).getTime() === latestReportDate && (
                    <span className="w-fit text-xs bg-purple-700 text-white px-2 py-1 rounded-full font-medium">
                      Latest
                    </span>
                  )}

                  <p className="text-sm font-medium text-gray-800">
                    Generated On:{" "}
                    <span className=" font-semibold">
                      {report.createdAt ? (() => {
                        const date = new Date(report.createdAt);
                        return (
                          <>
                            {date.toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                            <span className="inline-block md:hidden">,</span>
                            <br className="hidden md:block" />
                            {date.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </>
                        );
                      })() : "Not Created yet"
                      }
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <div>
                      <h5 className="text-lg md:text-base lg:text-lg font-medium text-gray-800">Compliance Score:</h5>
                      <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-2 rounded-full 
                                             ${report.score < 50 ? "bg-red-500" : report.score < 80 ? "bg-orange-500" : "bg-green-600"}
                                             `} style={{ width: `${report.score}%` }}
                        />
                      </div>
                    </div>
                    <h3 className="font-semibold text-2xl lg:text-3xl">{report.score}%</h3>
                  </div>

                </div>

                {/* Gaps */}
                <div className="flex md:flex-col gap-4 md:gap-1 lg:gap-2">
                  <h3 className="text-lg font-medium text-gray-800 flex items-center gap-1 md:gap-2">
                    Risk Level:
                    {report.riskLevel === "Low" && (
                      <span className="w-fit text-xs font-medium text-white bg-green-600 shadow-sm rounded-full px-2 md:px-3 py-1 uppercase">
                        Low
                      </span>
                    )}
                    {report.riskLevel === "Medium" && (
                      <span className="w-fit text-xs font-medium text-white bg-orange-500 shadow-sm rounded-full px-2 md:px-3 py-1 uppercase">
                        Medium
                      </span>
                    )}
                    {report.riskLevel === "High" && (
                      <span className="w-fit text-xs font-medium text-white bg-red-500 shadow-sm rounded-full px-2 md:px-3 py-1 uppercase">
                        High
                      </span>
                    )}
                  </h3>

                  <h3 className="text-lg font-medium text-gray-800">
                    Open Gaps: {""}
                    <span className="font-semibold text-2xl">
                      {report.openGaps < 10 ? `0${report.openGaps}` : report.openGaps}
                    </span>
                  </h3>
                </div>

                {/* Button */}
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => handleDownload(report.assessmentId)} disabled={pdfId === report.assessmentId}
                    className="disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center p-2 rounded-lg cursor-pointer active:scale-90
                    bg-white/70 border border-purple-200 shadow-sm hover:bg-[#761be6] hover:text-white transition" title="Download PDF">
                    {pdfId === report.assessmentId ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white-600 border-t-transparent animate-spin" />
                        <span className="text-xs md:font-medium ml-1">Preparing PDF…</span>
                      </>
                    ) : (
                      <MdOutlineFileDownload className="size-4 md:size-5 shrink-0" />
                    )}
                  </button>

                  {pdfError && (
                    <p className="text-sm font-medium text-red-600">
                      {pdfError}
                    </p>
                  )}

                  <Link href={`/reports/${report.assessmentId}`}
                    className="text-sm px-3 py-2 border-none rounded-lg text-white bg-linear-to-r from-[#441851] to-[#761be6]
                    hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                    View Report
                  </Link>
                </div>

              </div>
            ))}
          </div>

          {/* View all Button */}
          {filteredReports.length > 3 && (
            <div className="border-t border-purple-300 p-4 sm:p-6">
              <button onClick={() => setShowAll(!showAll)}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 cursor-pointer border-none rounded-lg text-white bg-linear-to-r from-[#441851] to-[#761be6]
                              hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                {showAll
                  ? "Show fewer Reports"
                  : `View all ${filteredReports.length} Reports`}
                <FaArrowRight className={`transition-transform ${showAll ? "-rotate-90" : "rotate-90"}`} />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}
