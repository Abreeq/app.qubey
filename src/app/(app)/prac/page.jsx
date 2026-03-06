"use client";

import { FaCalendarDays, FaRegFileLines } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaHistory, FaClipboardList, FaTools, FaInfoCircle, FaShieldAlt } from "react-icons/fa";
import { TbInfoTriangleFilled } from "react-icons/tb";
import { IoShieldCheckmarkSharp } from "react-icons/io5";
import { HiUsers } from "react-icons/hi2";

import { useEffect, useState } from "react";
import Link from "next/link";


export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/report/latest");

                if (!res.ok) {
                    setReport(null);
                    setLoading(false);
                    return;
                }
                const data = await res.json();

                setReport(data.report);
                setLoading(false);
            } catch (error) {
                setReport(null);
            }
        };

        load();
    }, []);


    // for pdf download
    const handleDownload = async () => {
        try {
            setPdfLoading(true);
            setPdfError(null);

            const res = await fetch("/api/report/pdf");
            if (!res.ok) {
                throw new Error("PDF generation failed");
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "Qubey_Compliance_Report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);

        } catch (error) {
            setPdfError("Unable to generate PDF. Please try again.");
        } finally {
            setPdfLoading(false);
        }
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
                                <div className="h-9 w-32 rounded-full bg-gray-200" />
                            </div>
                            <div className="h-4 w-56 rounded bg-gray-200" />
                        </div>
                    </div>

                    {/* ===== Cards Skeleton ===== */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                        {[...Array(4)].map((_, i) => (
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
                        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />

                        {/* Heading */}
                        <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                            Loading Compliance Report...
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 font-medium">
                            Retrieving your latest compliance scores, risk levels, and findings. <br />
                            <span className="text-gray-500">This won't take long</span>
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

    if (!report) {
        return (
            <main className="max-w-7xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
                <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative pb-1 sm:pb-6">
                    <div className="text-center space-y-4">
                        <h2 className={`font-semibold capitalize text-2xl sm:text-3xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight`}>
                            No Compliance Report Yet
                        </h2>
                        <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 max-w-3xl mx-auto">
                            Your compliance report will be generated once you complete a compliance assessment.
                        </p>
                        <p className="text-sm sm:text-base font-medium mt-1">
                            Start an assessment to receive compliance scores, risk insights, and actionable recommendations.
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
                            Reports are generated automatically after each completed assessment.
                        </p>

                    </div>
                </div>
            </main>
        );
    }

    return (
        <section className="pt-6 pb-8 space-y-7 sm:space-y-12 pr-1.5 max-w-7xl mx-auto">
            {/* Page Heading */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mt-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
                        Compliance Assessment Report
                    </h1>
                    <p className="font-medium text-base sm:text-lg max-w-2xl">
                        Snapshot of your organization’s cybersecurity and regulatory compliance posture.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 justify-start">
                    <div className="flex flex-col xl:flex-row items-center gap-4">
                        <button type="button" onClick={handleDownload} disabled={pdfLoading}
                            className="disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer rounded-4xl bg-slate-100/80 border border-gray-300 shadow-md
                          hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 md:px-4 py-2 flex items-center gap-2 transition-all duration-300">
                            {pdfLoading ? (
                                <>
                                    <span className="h-4 w-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" />
                                    <span className="text-sm sm:text-base md:font-medium">Preparing PDF…</span>
                                </>
                            ) : (
                                <>
                                    <MdOutlineFileDownload className="size-4 md:size-5 shrink-0" />
                                    <span className="text-sm sm:text-base md:font-medium">Export Report</span>
                                </>
                            )}
                        </button>

                        <Link href="/reports/history" className="rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
                         px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <FaHistory className="size-3 sm:size-4 text-white shrink-0" />
                            <span className="text-sm sm:text-base md:font-medium text-white">View History</span>
                        </Link>
                    </div>

                    {pdfError && (
                        <p className="text-sm font-medium text-red-600">
                            {pdfError}
                        </p>
                    )}

                    {/* Assessment Created at*/}
                    <p className="flex items-center gap-2 font-medium text-sm text-gray-700">
                        <FaCalendarDays className="size-3 text-[rgb(var(--light-purple))]" />
                        Report Generated on: {" "} {report.createdAt
                            ? new Date(report.createdAt).toLocaleString("en-US", {
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

            {/* Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
                        {/* Header */}
                        <h2 className="font-semibold text-lg sm:text-2xl flex items-center gap-2">
                            <FaShieldAlt className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Compliance Score</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {/* Progress Value */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative flex items-center justify-center w-20 sm:w-28 h-20 sm:h-28 shrink-0">
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
                                        strokeDashoffset={251.2 - (251.2 * report.score) / 100}
                                    />
                                </svg>
                                <p className="absolute inset-0 flex flex-col items-center justify-center text-lg sm:text-2xl
                                 font-semibold">
                                    {report.score}%
                                </p>
                            </div>

                            <p className="mt-2 text-sm text-center text-gray-700">Overall compliance based on latest assessment</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
                        {/* Header */}
                        <h2 className="font-semibold text-lg sm:text-2xl flex items-center gap-2">
                            <TbInfoTriangleFilled className="size-4 sm:size-6 text-[rgb(var(--light-purple))] shrink-0" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Risk Level</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {report.riskLevel === "Low" && (
                            <>
                                <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl capitalize font-semibold leading-tight text-green-600">Low</h3>
                                <p className="text-sm text-gray-700">
                                    Your organization shows strong compliance with minimal immediate risk.
                                    Continue maintaining existing controls.
                                </p>
                            </>
                        )}
                        {report.riskLevel === "Medium" && (
                            <>
                                <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl capitalize font-semibold leading-tight text-orange-600">Medium</h3>
                                <p className="text-sm text-gray-700">
                                    Some compliance gaps were identified that may lead to security or
                                    regulatory risks if not addressed.
                                </p>
                            </>
                        )}

                        {report.riskLevel === "High" && (
                            <>
                                <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl capitalize font-semibold leading-tight text-red-600">High</h3>
                                <p className="text-sm text-gray-700">
                                    Critical gaps significantly increase the risk of breaches and regulatory
                                    penalties. Immediate action is required.
                                </p>

                            </>
                        )}
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
                        {/* Header */}
                        <h2 className="font-semibold text-lg sm:text-2xl flex items-center gap-2">
                            <FaInfoCircle className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Open Gaps</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {/* Gap Value*/}
                        <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl font-semibold text-gray-800 leading-tight">
                            {report.openGaps < 10 ? `0${report.openGaps}` : report.openGaps}
                        </h3>

                        {report.openGaps == 0 && (
                            <p className="text-sm text-gray-700">
                                No open compliance gaps detected. Your controls meet the required standards.
                            </p>
                        )}

                        {report.openGaps > 0 && report.openGaps <= 3 && (
                            <p className="text-sm text-gray-700">
                                A small number of compliance gaps were identified. Addressing these will
                                further strengthen your security posture.
                            </p>
                        )}

                        {report.openGaps > 3 && (
                            <p className="text-sm text-gray-700">
                                Multiple compliance gaps require attention. These gaps increase regulatory
                                and security risk if left unresolved.
                            </p>
                        )}

                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
                        {/* Header */}
                        <h2 className="font-semibold text-lg sm:text-[22px] flex items-center gap-2">
                            <IoShieldCheckmarkSharp className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Regulations Covered</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {/* Regulation Value*/}
                        <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl text-gray-800 font-semibold leading-tight">03</h3>
                        <p className="text-sm text-gray-700">Frameworks evaluated in this assessment PDPL, ISO 27001, and NESA controls.</p>

                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg bg-linear-to-br from-purple-100 via-white to-white px-6 pt-8 pb-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Summary Header */}
                <div className='flex flex-col-reverse lg:flex-row gap-4 justify-between'>
                    <div className="flex items-center gap-3">
                        <div className="relative flex size-12 items-center justify-center rounded-full bg-purple-100 border border-purple-200">
                            <FaRegFileLines className="relative text-2xl text-purple-700" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                                <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Executive Summary</span>
                            </h2>
                            <p className="text-sm sm:text-base font-medium text-gray-700"> High-level overview of your organization’s current compliance posture.</p>
                        </div>
                    </div>

                    <div className="relative flex flex-col items-end gap-4 justify-start">
                        <Link href="/assessment"
                            className="rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
                         px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <span className="text-sm sm:text-base md:font-medium text-white">Re-run Assessment</span>
                        </Link>
                    </div>
                </div>
                <div className="border-b border-purple-300 my-3"></div>

                <div className="p-4">
                    <p className="text-sm sm:text-base font-medium text-gray-700 rounded-xl border border-dashed bg-blue-50 p-4 hover:shadow-md hover:shadow-blue-100 transition border-blue-200">
                        {report?.summary}
                    </p>
                </div>

            </div>

            {/* Key Findings */}
            <div className="relative overflow-hidden hover:shadow-[0_20px_40px_rgba(118,27,230,0.12)] transition rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-3 sm:px-6 py-8">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Header */}
                <div className="relative border-b border-purple-300 pb-4 sm:pb-6">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-20 animate-ping"></span>
                            <FaClipboardList className="relative text-xl text-purple-700 shrink-0" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                Key Findings
                            </h2>
                            <p className="font-medium mt-1">
                                Critical compliance gaps identified during the assessment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                    {/* Content */}
                    <div className="px-2 sm:px-4 lg:px-6 pt-6 space-y-4 sm:space-y-6">
                        <div className="p-4 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 transition group">
                            <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-3 lg:gap-4 mb-6">
                                <h3 className="font-semibold text-xl flex items-center gap-3">
                                    <div className="shrink-0 relative flex size-9 items-center justify-center rounded-xl bg-red-100">
                                        <TbInfoTriangleFilled className="size-5 text-red-500" />
                                    </div>
                                    <span className="flex flex-col bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                        Incident Management
                                        <span className="text-sm font-medium text-gray-600"> 2 compliance gaps identified in this domain</span>
                                    </span>
                                </h3>
                                <span className="w-fit text-xs md:text-sm font-medium text-white bg-red-500 shadow-sm rounded-full px-2 md:px-3 py-1 uppercase">
                                    Critical
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4 px-4 py-3 rounded-xl border border-purple-300 border-dashed bg-purple-50">
                                    <h6 className="shrink-0 mt-1 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                                        01
                                    </h6>

                                    <div className="flex-1">
                                        <h4 className="text-sm md:text-base font-semibold text-gray-800">
                                            Insufficient Staff Training on Incident Reporting
                                        </h4>
                                        <p className="text-sm font-medium text-gray-700 mt-1">
                                            Employees have not received adequate training on how to identify and report security incidents or suspected data breaches promptly. This directly impacts the organization's ability to detect, contain, and recover from incidents effectively, undermining compliance with PDPL's rapid notification requirements and NESA/ISO 27001's operational security principles.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4 px-4 py-3 rounded-xl border border-purple-300 border-dashed bg-purple-50">
                                    <h6 className="shrink-0 mt-1 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                                        02
                                    </h6>

                                    <div className="flex-1">
                                        <h4 className="text-sm md:text-base font-semibold text-gray-800">
                                            Lack of Formal Incident Response Plan
                                        </h4>
                                        <p className="text-sm font-medium text-gray-700 mt-1">
                                            The business currently lacks a clear, documented plan for responding to personal data breaches or security incidents (e.g., data loss, theft, unauthorized access). This is a critical non-compliance with UAE PDPL Article 18 (Data Breach Notification), NESA Basic Controls (Incident Management), and ISO 27001 A.16 (Information Security Incident Management).
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>


                        <div className="p-4 rounded-xl border border-purple-300 bg-white hover:bg-purple-50 transition group">
                            <div className="flex items-center justify-between gap-3 lg:gap-4 mb-6">
                                <h3 className="font-semibold text-xl flex items-center gap-3">
                                    <div className="relative flex size-9 items-center justify-center rounded-xl bg-red-100">
                                        <HiUsers className="size-5 text-red-500" />
                                    </div>
                                    <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                        Vendor Management
                                    </span>
                                </h3>
                                <span className="text-sm font-medium text-white bg-red-500 shadow-sm rounded-full px-3 py-1 uppercase">
                                    Critical
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4 px-4 py-3 rounded-xl border border-purple-300 border-dashed bg-purple-50">
                                    <h6 className="shrink-0 mt-1 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                                        01
                                    </h6>

                                    <div className="flex-1">
                                        <h4 className="text-sm md:text-base font-semibold text-gray-800">
                                            Insufficient Staff Training on Incident Reporting
                                        </h4>
                                        <p className="text-sm font-medium text-gray-700 mt-1">
                                            Employees have not received adequate training on how to identify and report security incidents or suspected data breaches promptly. This directly impacts the organization's ability to detect, contain, and recover from incidents effectively, undermining compliance with PDPL's rapid notification requirements and NESA/ISO 27001's operational security principles.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-3 lg:gap-4 px-4 py-3 rounded-xl border border-purple-300 border-dashed bg-purple-50">
                                    <h6 className="shrink-0 mt-1 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-medium">
                                        02
                                    </h6>

                                    <div className="flex-1">
                                        <h4 className="text-sm md:text-base font-semibold text-gray-800">
                                            Lack of Formal Incident Response Plan
                                        </h4>
                                        <p className="text-sm font-medium text-gray-700 mt-1">
                                            The business currently lacks a clear, documented plan for responding to personal data breaches or security incidents (e.g., data loss, theft, unauthorized access). This is a critical non-compliance with UAE PDPL Article 18 (Data Breach Notification), NESA Basic Controls (Incident Management), and ISO 27001 A.16 (Information Security Incident Management).
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

            </div>

            {/* Recommended Actions */}
            <div className="overflow-hidden rounded-2xl bg-white/60 backdrop-blur-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] px-3 sm:px-6 py-8">

                {/* Header */}
                <div className="border-b border-purple-300 pb-4 sm:pb-6">
                    <div className="flex items-center gap-3">
                        <div className="shrink-0 relative flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-500">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-purple-300 opacity-20 animate-ping"></span>
                            <FaTools className="relative text-xl text-purple-700" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                Recommendations & Action Plan
                            </h2>
                            <p className="font-medium mt-1">
                                Prioritized actions to address identified compliance gaps
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action steps */}
                <div className="px-2 sm:px-4 lg:px-6 pt-6 space-y-4 sm:space-y-6">
                    <div className="py-4 px-6 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)]">
                        <div className="flex flex-col-reverse md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold flex items-center gap-3 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                    <span className="shrink-0 size-7 text-base flex items-center justify-center rounded-full bg-purple-600 text-white">
                                        01
                                    </span>
                                    Strengthen Incident Management
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    High priority · Incident Management
                                </p>
                            </div>

                            {/* Status Badge */}
                            <span className="w-fit shrink-0 rounded-full bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1">
                                Action Required
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-200" />

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm md:text-base font-semibold text-gray-800">
                                    Develop and Implement a Comprehensive Incident Response Plan (IRP):
                                </span>
                                <p className="text-sm font-medium text-gray-700">
                                    Create a robust, documented IRP aligned with PDPL Article 18 (Data Breach Notification), NESA Basic Controls (e.g., IM.1, IM.2), and ISO 27001 A.16. The plan must clearly define roles, responsibilities, procedures for detection, containment, eradication, recovery, and post-incident review, including specific timelines for notifying affected individuals and the UAE Data Office.
                                </p>
                            </div>

                            <div>
                                <span className="text-sm md:text-base font-semibold text-gray-800">
                                    Develop and Implement a Comprehensive Incident Response Plan (IRP):
                                </span>
                                <p className="text-sm font-medium text-gray-700">
                                    Create a robust, documented IRP aligned with PDPL Article 18 (Data Breach Notification), NESA Basic Controls (e.g., IM.1, IM.2), and ISO 27001 A.16. The plan must clearly define roles, responsibilities, procedures for detection, containment, eradication, recovery, and post-incident review, including specific timelines for notifying affected individuals and the UAE Data Office.
                                </p>
                            </div>


                        </div>
                    </div>


                    <div className="py-4 px-6 bg-white/60 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold flex items-center gap-3 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                    <span className="size-7 text-base flex items-center justify-center rounded-full bg-purple-600 text-white">
                                        01
                                    </span>
                                    Strengthen Incident Management
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    High priority · Incident Management
                                </p>
                            </div>

                            {/* Status Badge */}
                            <span className="shrink-0 rounded-full bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1">
                                Pending
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="my-4 border-t border-gray-200" />

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm md:text-base font-semibold text-gray-800">
                                    Develop and Implement a Comprehensive Incident Response Plan (IRP):
                                </span>
                                <p className="text-sm font-medium text-gray-700">
                                    Create a robust, documented IRP aligned with PDPL Article 18 (Data Breach Notification), NESA Basic Controls (e.g., IM.1, IM.2), and ISO 27001 A.16. The plan must clearly define roles, responsibilities, procedures for detection, containment, eradication, recovery, and post-incident review, including specific timelines for notifying affected individuals and the UAE Data Office.
                                </p>
                            </div>

                            <div>
                                <span className="text-sm md:text-base font-semibold text-gray-800">
                                    Develop and Implement a Comprehensive Incident Response Plan (IRP):
                                </span>
                                <p className="text-sm font-medium text-gray-700">
                                    Create a robust, documented IRP aligned with PDPL Article 18 (Data Breach Notification), NESA Basic Controls (e.g., IM.1, IM.2), and ISO 27001 A.16. The plan must clearly define roles, responsibilities, procedures for detection, containment, eradication, recovery, and post-incident review, including specific timelines for notifying affected individuals and the UAE Data Office.
                                </p>
                            </div>


                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-10 flex flex-wrap gap-3 sm:gap-2 items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Mapped to: PDPL · NESA · ISO 27001
                    </p>

                    <Link href="/dashboard" className="rounded-full bg-linear-to-r from-[#441851] to-[#761be6] px-3 md:px-4 py-2 text-xs md:text-sm md:font-medium text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                        View Action Details
                    </Link>
                </div>
            </div>

        </section>

    )
}
