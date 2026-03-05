"use client";
import { FaCalendarDays } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaHistory } from "react-icons/fa";
import { FaShieldAlt } from "react-icons/fa";
import { TbInfoTriangleFilled } from "react-icons/tb";
import { FaInfoCircle } from "react-icons/fa";
import { IoShieldCheckmarkSharp } from "react-icons/io5";


export default function ReportsPage() {
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
                        <button className="cursor-pointer rounded-4xl bg-slate-100/80 border border-gray-300 shadow-md
                      hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 md:px-4 py-2 flex items-center gap-2 transition-all duration-300">
                            <MdOutlineFileDownload className="size-4 md:size-5 shrink-0" />
                            <span className="md:font-medium">Export Report</span>
                        </button>
                        <button className="cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
                         px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <FaHistory className="size-4 text-white shrink-0" />
                            <span className="md:font-medium text-white">View History</span>
                        </button>
                    </div>

                    {/* Assessment Created at*/}
                    <p className="flex items-center gap-2 font-medium text-sm text-gray-700">
                        <FaCalendarDays className="size-3 text-[rgb(var(--light-purple))]" />
                        {/* Report Generated on: {" "} {assessment.createdAt
                            ? new Date(assessment.createdAt).toLocaleString("en-US", {
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })
                            : "Not Created yet"} */}
                    </p>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-stretch">
                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:pt-4 sm:pb-6">
                        {/* Header */}
                        <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                            <FaShieldAlt className="size-5 text-[rgb(var(--light-purple))]" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Compliance Score</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {/* Progress Value */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
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
                                        strokeDashoffset={251.2 - (251.2 * 80) / 100}
                                    />
                                </svg>
                                <p className="absolute inset-0 flex flex-col items-center justify-center text-2xl
                                 font-semibold">
                                    80%
                                </p>
                            </div>

                            <p className="mt-2 text-sm text-center text-gray-700">Overall compliance based on latest assessment</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:pt-4 sm:pb-6">
                        {/* Header */}
                        <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                            <TbInfoTriangleFilled className="size-6 text-[rgb(var(--light-purple))]" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Risk Level</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {true && (
                            <>
                                <h3 className="my-2 text-2xl sm:text-3xl md:text-4xl capitalize font-semibold leading-tight text-green-600">Low</h3>
                                <p className="text-sm text-gray-700">
                                    Your organization shows strong compliance with minimal immediate risk.
                                    Continue maintaining existing controls.
                                </p>
                            </>
                        )}
                        {/* {riskLevel === "Medium" && (
                            <>
                                <h3 className="text-2xl font-semibold text-orange-600">Medium</h3>
                                <p className="text-sm text-gray-700">
                                    Some compliance gaps were identified that may lead to security or
                                    regulatory risks if not addressed.
                                </p>
                            </>
                        )}

                        {riskLevel === "High" && (
                            <>
                                <h3 className="text-2xl font-semibold text-red-600">High</h3>
                                <p className="text-sm text-gray-700">
                                    Critical gaps significantly increase the risk of breaches and regulatory
                                    penalties. Immediate action is required.
                                </p>
                            </>
                        )} */}
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:pt-4 sm:pb-6">
                        {/* Header */}
                        <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                            <FaInfoCircle className="size-5 text-[rgb(var(--light-purple))]" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Open Gaps</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {/* Gap Value*/}
                        <h3 className="my-2 text-2xl sm:text-3xl md:text-4xl capitalize font-semibold leading-tight">04</h3>

                        {true && (
                            <p className="text-sm text-gray-700">
                                No open compliance gaps detected. Your controls meet the required standards.
                            </p>
                        )}

                        {/* {openGaps > 0 && openGaps <= 3 && (
                            <p className="text-sm text-gray-700">
                                A small number of compliance gaps were identified. Addressing these will
                                further strengthen your security posture.
                            </p>
                        )}

                        {openGaps > 3 && (
                            <p className="text-sm text-red-600 font-medium">
                                Multiple compliance gaps require attention. These gaps increase regulatory
                                and security risk if left unresolved.
                            </p>
                        )} */}
                        
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:pt-4 sm:pb-6">
                        {/* Header */}
                        <h2 className="font-semibold text-xl sm:text-[22px] flex items-center gap-2">
                          <IoShieldCheckmarkSharp className="size-5 text-[rgb(var(--light-purple))]" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Regulations Covered</span>
                        </h2>
                        <div className="border-b border-purple-300 my-3"></div>

                        {/* Regulation Value*/}
                        <h3 className="my-2 text-2xl sm:text-3xl md:text-4xl capitalize font-semibold leading-tight">03</h3>
                        <p className="text-gray-700">Frameworks evaluated in this assessment PDPL, ISO 27001, and NESA controls.</p>
                     
                    </div>
                </div>
            </div>
        </section>
    )
}
