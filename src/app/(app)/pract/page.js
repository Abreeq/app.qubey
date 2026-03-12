"use client"

import React, { useEffect, useState } from 'react'
import { FaBookBookmark, FaArrowLeft, FaCirclePlay, FaCircleCheck } from "react-icons/fa6";

export default function page() {
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(0);

  const steps = [
    "Analyzing your assessment responses",
    "Mapping responses to compliance frameworks",
    "Identifying security and regulatory risks",
    "Generating remediation guidance",
    "Preparing your final compliance recommendations"
  ];

  const activeStep = Math.min(
    Math.floor(progress / 20), steps.length - 1
  );

  useEffect(() => {
    if (!loading) {
      setProgress(100);
      return;
    }

    setProgress(0); // reset when loading starts

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return prev;

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

        return Math.min(prev + increment, 94);
      });
    }, 600); // faster updates

    return () => clearInterval(interval);
  }, [loading]);

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
          <div className="bg-white border border-gray-100 flex flex-col items-center rounded-3xl shadow-xl p-8 text-center max-w-lg w-full">

            {/* Heading */}
            <div className="w-full flex justify-between items-center mb-2">
              <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Preparing Compliance Guidance...
              </h2>
              <span className="text-sm font-medium text-gray-600 tabular-nums">{Math.floor(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#761be6] to-[#441851] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Description */}
            <p className="text-gray-600 font-medium my-4 inline-block">
              Retrieving risk context, summary, and next steps.
            </p>

            <div className="space-y-3 w-full mb-6">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                  {/* Step Icon */}
                  {index < activeStep ? (
                    <div className="flex items-center justify-center size-6 rounded-full text-purple-600 font-bold">
                      ✓
                    </div>
                  ) : index === activeStep ? (
                    <div className="size-6 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                  ) : (
                    <div className="size-6 rounded-full border border-gray-300" />
                  )}

                  {/* Step text */}
                  <p className={`text-sm ${index < activeStep ? "text-gray-800 font-medium"
                        : index === activeStep
                          ? "text-purple-700 font-medium"
                          : "text-gray-400"
                      }`}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
           

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
    <div>Actual page</div>
  )
}
