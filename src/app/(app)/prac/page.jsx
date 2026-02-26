"use client";

import { FaBookBookmark, FaArrowLeft, FaCirclePlay, FaCircleCheck } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";
import { TbInfoTriangleFilled } from "react-icons/tb";
import { VscChecklist } from "react-icons/vsc";
import { BsGraphUpArrow } from "react-icons/bs";

import Link from 'next/link';
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


    // for update
    const updateStatus = async (status) => {
        await fetch("/api/action/update-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ actionId, status }),
        });

        router.push("/dashboard");
    };

    //   Page Loading
    if (loading) {
        return (
            <section className="relative">
                <section className="py-8 space-y-6 pr-1.5 max-w-7xl mx-auto">
                    {/* Question Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-stretch">
                        {/* Left: Question */}
                        <div className="space-y-3">
                            <div className="h-10 w-5/6 bg-gray-200 rounded-lg" />
                            <div className="h-5 w-2/3 bg-gray-200 rounded" />
                            <div className="h-5 w-2/3 bg-gray-200 rounded" />
                        </div>
                        {/* Right: Impact + Buttons */}
                        <div className="flex flex-col justify-between gap-4 items-end sm:items-start lg:items-end">
                            <div className="h-16 w-44 bg-gray-200 rounded-xl" />
                            <div className="space-y-3">
                                <div className="h-10 w-48 bg-gray-200 rounded-full" />
                            </div>
                        </div>
                    </div>

                    {/* Card Skeleton */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 space-y-6">
                        {/* Guidance Header */}
                        <div className="flex items-start gap-3">
                            <div className="size-12 rounded-full bg-gray-200" />
                            <div className="space-y-2">
                                <div className="h-6 w-32 bg-gray-200 rounded" />
                                <div className="h-4 w-56 bg-gray-200 rounded" />
                            </div>
                        </div>
                        <div className="h-px bg-gray-200" />
                        {/* Summary + Risk */}
                        <div className="grid gap-8 sm:grid-cols-2">
                            <div className="space-y-3">
                                <div className="h-5 w-32 bg-gray-200 rounded" />
                                <div className="h-24 w-full bg-gray-200 rounded-xl" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-5 w-36 bg-gray-200 rounded" />
                                <div className="h-28 w-full bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                        {/* Remediation Workflow */}
                        <div className="space-y-4">
                            <div className="h-6 w-48 bg-gray-200 rounded" />
                            <div className="rounded-xl border border-dashed border-gray-300 p-4 space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className="size-8 rounded-full bg-gray-200" />
                                        <div className="h-5 w-full bg-gray-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

                {/* Blur Overlay */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 animate-pulse" />

                {/* Overlay generating message */}
                <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
                    <div className="bg-white border border-gray-100 flex flex-col items-center rounded-3xl shadow-xl p-8 text-center space-y-4 max-w-md w-full">
                        {/* Spinner */}
                        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />

                        {/* Heading */}
                        <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                            Loading Action Details...
                        </h2>

                        {/* Description */}
                        <p className="text-gray-600 font-medium">
                            Retrieving risk context, summary, and next steps. This will only take a moment.
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

    return (
        <section className="py-8 space-y-5 sm:space-y-8 pr-1.5 max-w-7xl mx-auto">
            {/* Question  */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-stretch">
                <div className="flex flex-col pb-2">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-semibold mt-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
                        Q: {action.title}
                    </h1>
                    <p className="font-medium sm:text-lg mt-2 text-gray-800">
                        {action.description} and improve your compliance posture.
                    </p>
                </div>

                {/* Impact Score */}
                <div className='flex flex-col sm:flex-row lg:flex-col items-end sm:items-start lg:items-end justify-between gap-4'>
                    <div className="flex items-center gap-3 rounded-xl bg-purple-50 p-2 border border-purple-300">
                        <div>
                            <p className="text-sm uppercase font-medium text-gray-700">Impact Score</p>
                            <h3 className="font-bold text-xl text-end">
                                <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">+{action.expectedIncrease}pts</span>
                            </h3>
                        </div>
                        <div className="relative flex size-10 items-center justify-center rounded-full bg-purple-100">
                            <BsGraphUpArrow className="relative text-xl text-purple-700" />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button onClick={() => updateStatus("COMPLETED")}
                            className="cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
                            px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <FaCircleCheck className="size-4 text-white shrink-0" />
                            <span className="md:font-medium text-white">Mark as Completed</span>
                        </button>

                        <button onClick={() => updateStatus("IN_PROGRESS")}
                            className="cursor-pointer rounded-4xl bg-slate-100/80 border border-gray-300
                          hover:bg-purple-100 hover:scale-95 px-3 md:px-4 py-2 flex items-center gap-2 transition-all duration-300">
                            <FaCirclePlay className="size-4 md:size-5 shrink-0" />
                            <span className="md:font-medium">Mark In Progress</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Card */}
            <div className={`relative z-10 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6`}>
                {/* Guidance */}
                <div className='flex flex-col-reverse md:flex-row gap-4 justify-between'>
                    <div className="flex items-start gap-3">
                        <div className="relative flex size-12 items-center justify-center rounded-full bg-purple-100">
                            <FaBookBookmark className="relative text-2xl text-purple-700" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                                <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Guidance</span>
                            </h2>
                            <p className="text-sm sm:text-base font-medium text-gray-700"> Follow these steps to remediate the identified risk.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 justify-start">
                        <Link href="/dashboard"
                            className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#441851]/80 
                                 px-2 md:px-3 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <FaArrowLeft className="size-3.5 text-white shrink-0" />
                            <span className="text-xs lg:text-sm text-white text-nowrap">Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
                <div className="border-b border-purple-300 my-3"></div>

                {/* Summary and Risk */}
                <div className="grid gap-10 p-4 md:grid-cols-2">
                    {/* Column 1: Summary */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-xl sm:text-xl flex items-center gap-2">
                            <FaInfoCircle className="size-5 text-blue-500" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                Summary
                            </span>
                        </h3>
                        <p className="text-sm sm:text-base font-medium text-gray-700 rounded-xl border border-dashed bg-blue-50 p-4 hover:shadow-md hover:shadow-blue-100 transition border-blue-200">
                            {action.remediationSteps[0].summary}
                        </p>
                    </div>

                    {/* Column 2: Risk */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-xl flex items-center gap-2">
                            <TbInfoTriangleFilled className="size-5 text-red-500" />
                            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                                Risk Analysis
                            </span>
                        </h3>
                        <p className="text-sm sm:text-base font-medium text-gray-700 rounded-xl border border-dashed bg-red-50 p-4 hover:shadow-md hover:shadow-red-100 transition border-red-200">
                            {action.remediationSteps[0].explaination}
                        </p>
                    </div>

                </div>

                {/* Remediation Workflow */}
                <div className='space-y-3 p-4 mt-7'>
                    <h3 className="font-semibold text-xl sm:text-xl flex items-center gap-2">
                        <VscChecklist className="size-6 text-green-600" />
                        <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                            Remediation Workflow
                        </span>
                    </h3>

                    {/* Remediation steps */}
                    <div className='rounded-xl border border-dashed bg-purple-50 p-4 hover:shadow-md hover:shadow-purple-100 transition border-purple-200'>
                        <div className='relative border-l-2 border-purple-300 pl-7 mx-2 space-y-3'>
                            {Object.values(action.remediationSteps[0].remediationSteps).map((step, index) => (
                                <div className="relative group">
                                    <div className="absolute -left-11.5 top-1.5 size-8 bg-purple-200 rounded-full 
                                     flex items-center justify-center text-purple-700 text-sm font-bold transition-all duration-300 ease-in-out 
                                     group-hover:bg-purple-700 group-hover:text-white">
                                        {index+1}
                                    </div>
                                    <p className="text-sm sm:text-base font-medium text-gray-700 py-2">
                                        {step}
                                    </p>
                                </div>
                            ))}


                            {/* <div className="relative group">
                                <div className="absolute -left-11.5 top-1.5 size-8 bg-purple-200 rounded-full 
                             flex items-center justify-center text-purple-700 text-sm font-bold transition-all duration-300 ease-in-out 
                             group-hover:bg-purple-700 group-hover:text-white">
                                    1
                                </div>
                                <p className="text-sm sm:text-base font-medium text-gray-700 py-2">
                                    Meet once a year or when you get new technology to review your list and
                                    make sure your plan still works.
                                </p>
                            </div> */}

                        </div>
                    </div>
                </div>


            </div>
        </section>
    )
}
