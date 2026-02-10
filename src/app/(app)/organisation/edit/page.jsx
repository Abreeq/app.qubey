"use client"

import React, { useEffect, useRef, useState } from 'react'
import Link from "next/link";
import { toast } from "react-toastify";

import { HiBuildingOffice2 } from "react-icons/hi2";
import { FaArrowLeft } from "react-icons/fa6";
import { MdLock } from "react-icons/md";
import { BsShieldFillExclamation } from "react-icons/bs";
import { FaCalendarAlt, FaHistory} from "react-icons/fa";

export default function OrganisationPage() {
    const [loading, setLoading] = useState(true);
    const [org, setOrg] = useState(null);
    const [saving, setSaving] = useState(false);
    const [isOtherIndustry, setIsOtherIndustry] = useState(false);
    const [errorMsg, setErrorMsg] = useState({});
    const [authError, setAuthError] = useState("");
    const formTopRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            const res = await fetch("/api/organisation/me");
            const data = await res.json();

            if (!res.ok) {
                setAuthError(data.error || "Failed to load organisation");
                setLoading(false);
                return;
            }

            setOrg(data.org);
            if (data.org.industry === "Other") {
                setIsOtherIndustry(true);
            }

            setLoading(false);
        };

        load();
    }, []);


    //  For Validation
    const conditions = {
        name: [{ required: true, msg: "Please enter your organization name" }, { length: 3, msg: "Organization name should be greater than 3 Characters" }],
        industry: [{ required: true, msg: "Please enter your industry" }],
        industryOther: [{ required: true, msg: "Please specify your industry" }],
        companySize: [{ required: true, msg: "Please enter your company size" }],
    }

    const validate = (data) => {
        const errData = {};
        Object.entries(data).forEach(([key, value]) => {
            conditions[key]?.some((condition) => {
                if (condition.required && (!value || value.trim() === "") && !(key === "industryOther" && data.industry !== "Other")) {
                    errData[key] = condition.msg;
                    return true;
                }
                if (condition.length && value.length < condition.length) {
                    errData[key] = condition.msg;
                    return true;
                }
            });
        });
        setErrorMsg(errData);
        return errData;
    };


    const handleChange = (key, value) => {
        setOrg((prev) => ({ ...prev, [key]: value }));
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAuthError("");

        const validationErrors = validate(org);

        if (Object.keys(validationErrors).length > 0) {
            setSaving(false);
            return;
        }

        const res = await fetch("/api/organisation/update", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: org.name,
                industry: org.industry,
                industryOther: org.industry === "Other" ? org.industryOther : null,
                companySize: org.companySize,
                country: org.country,
                handlesPII: org.handlesPII,
                handlesPayments: org.handlesPayments,
            }),
        });

        const data = await res.json();
        setSaving(false);

        if (!res.ok) {
            setAuthError(data.error || "Failed to update organisation");
            formTopRef.current?.scrollIntoView({ behavior: "smooth" });
            setSaving(false);
            return;
        }

        toast.success(data.message);

        // if assessment affected -> suggest new assessment
        if (data.affectsAssessment) {
            toast.info("Please run a new assessment to refresh your score.");
        }

        setOrg(data.org);
    };

    if (loading) {
        return (
            <section className="py-12 pr-1.5 animate-pulse">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-7">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-gray-200" />
                            <div className="space-y-2">
                                <div className="h-6 w-32 md:w-56 bg-gray-200 rounded" />
                                <div className="h-4 w-40 md:w-72 bg-gray-200 rounded" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <div className="h-9 w-44 bg-gray-200 rounded-lg" />
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white/50 backdrop-blur-2xl rounded-3xl border border-gray-200 p-6 space-y-10">
                        {/* Section title */}
                        <div className="h-8 max-w-68 bg-gray-200 rounded" />
                        {/* Inputs */}
                        <div className="space-y-8">
                            <div className="h-10 w-full bg-gray-200 rounded-full" />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="h-10 bg-gray-200 rounded-full" />
                                <div className="h-10 bg-gray-200 rounded-full" />
                            </div>

                            <div className="h-10 w-full bg-gray-200 rounded-full" />
                        </div>

                        {/* Data sensitivity */}
                        <div className="space-y-3">
                            <div className="h-5 w-40 bg-gray-200 rounded" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="h-16 bg-gray-200 rounded-xl" />
                                <div className="h-16 bg-gray-200 rounded-xl" />
                            </div>
                        </div>

                        {/* Save button */}
                        <div className="h-11 w-full bg-gray-300 rounded-3xl" />

                    </div>
                </div>
            </section>
        )
    };


    // function for last updated date
    function daysAgo(date) {
        const now = new Date();
        const past = new Date(date);

        // normalize to midnight to avoid partial-day issues
        now.setHours(0, 0, 0, 0);
        past.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - past.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return "Today";
        if (diffDays === 1) return "1 day ago";
        return `${diffDays} days ago`;
    }

    if (!org) {
        return (
            <main className="max-w-5xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
                <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    
                <div className="relative pb-1 sm:pb-6">
                    <div className="text-center space-y-4">
                        <h2 className={`font-semibold capitalize text-2xl sm:text-3xl bg-linear-to-r ${authError?"from-red-400 to-red-600":"from-[#761be6] to-[#441851]"} bg-clip-text text-transparent`}>
                            {authError? authError: "Welcome to Your Organisation Dashboard"}
                        </h2>
                        <p className="text-sm sm:text-base font-medium mt-1 max-w-3xl mx-auto">
                            It looks like you haven’t set up your organisation yet.
                            Setting it up now will allow you to manage company details,
                            track data sensitivity, and configure preferences easily.
                        </p>
                        <p className="text-sm sm:text-base font-medium mt-1">
                            Don’t worry, it only takes a few minutes to get started!
                        </p>
                    </div>

                    <div className='flex items-center justify-center mt-4 sm:mt-8'>
                        <Link href="/organisation/create"
                            className="px-4 py-2 rounded-lg text-white bg-linear-to-r from-[#441851] to-[#761be6]
                          hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition text-sm sm:text-base">
                            Create Organisation
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <section className="py-12 pr-1.5">
            <div className='max-w-5xl mx-auto'>
                {/* Page Heading */}
                <div ref={formTopRef} className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-6 sm:mb-7">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex size-6 sm:size-12 items-center justify-center rounded-xl bg-purple-50 border border-purple-300">
                            <HiBuildingOffice2 className="ml-1 shrink-0 text-xl sm:text-3xl text-purple-700" />
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
                                Organisation Profile
                            </h1>
                            <p className="sm:font-medium text-base sm:text-lg max-w-2xl">
                                Manage Your company details and preferences.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-4 justify-start">
                        <Link href="/dashboard"
                            className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] 
                             px-2 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <FaArrowLeft className="size-3 sm:size-4 text-white shrink-0" />
                            <span className="md:font-medium text-white">Back to Dashboard</span>
                        </Link>
                    </div>
                </div>

                {/* Form */}
                <div className={`relative z-10 bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6`}>

                    {/* Error message */}
                    {authError && (
                        <div className="w-full px-3 sm:px-4 py-2 mb-3 sm:mb-4 text-sm sm:text-base rounded-xl bg-red-100/50 border border-red-500 backdrop-blur-2xl flex items-center gap-3 sm:gap-5">
                            <BsShieldFillExclamation className="shrink-0 size-4 sm:size-6 text-red-600" />
                            <div>
                                <h4 className="text-sm sm:text-base font-medium text-red-600">Error</h4>
                                <p className="text-sm font-medium leading-tight">{authError}</p>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                        <HiBuildingOffice2 className="size-5 text-[rgb(var(--light-purple))]" />
                        <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Company Information</span>
                    </h2>
                    <div className="border-b border-purple-300 my-3"></div>

                    <form onSubmit={save} className="space-y-3 sm:space-y-5">
                        {/* Organisation Name */}
                        <div>
                            <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Organisation Name <span className="text-red-500">*</span></label>
                            <input type="text" value={org.name} name="name"
                                placeholder="Enter your registered company name"
                                onFocus={() => setErrorMsg((prev) => ({ ...prev, name: "" }))}
                                onChange={(e) => handleChange("name", e.target.value)}
                                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-slate-100/80 border ${errorMsg.name ? "border-red-500" : "border-gray-300"} placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                            />
                            {errorMsg.name && <p className="text-red-600 text-sm mt-1 -mb-3 ml-2">{errorMsg.name}</p>}
                        </div>

                        {/* Industry & Company size*/}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Industry */}
                            <div>
                                <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">
                                    Industry Sector <span className="text-red-500">*</span>
                                </label>

                                <select name="industry" value={org.industry}
                                    onFocus={() => setErrorMsg((prev) => ({ ...prev, industry: "" }))}
                                    onChange={(e) => {
                                        const val = e.target.value;

                                        if (val === "Other") {
                                            setIsOtherIndustry(true);
                                            handleChange("industry", "Other");
                                        } else {
                                            setIsOtherIndustry(false);
                                            handleChange("industry", val);
                                            handleChange("industryOther", null);
                                        }
                                    }}
                                    className={`appearance-none bg-[url('/down.svg')] bg-no-repeat bg-size-[16px_16px] bg-position-[right_0.75rem_center] w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-slate-100/80 border ${errorMsg.industry ? "border-red-500" : "border-gray-300"} focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                                >
                                    <option value="" disabled>
                                        Select industry
                                    </option>
                                    <option value="IT Services">IT Services</option>
                                    <option value="Healthcare">Healthcare</option>
                                    <option value="Education">Education</option>
                                    <option value="Real Estate">Real Estate</option>
                                    <option value="Other">Other</option>
                                </select>

                                {/* Show input if Other is selected */}
                                {isOtherIndustry && (
                                    <input
                                        type="text"
                                        placeholder="Enter your industry"
                                        value={org.industryOther || ""}
                                        onChange={(e) => handleChange("industryOther", e.target.value)}
                                        onFocus={() => setErrorMsg((prev) => ({ ...prev, industryOther: "" }))}
                                        className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-2 text-sm sm:text-base rounded-4xl bg-slate-100/80 border ${errorMsg.industryOther ? "border-red-500" : "border-gray-300"
                                            } placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                                    />
                                )}
                                {errorMsg.industryOther && <p className="text-red-600 text-sm mt-1 -mb-3 ml-2">{errorMsg.industryOther}</p>}
                            </div>

                            {/* Company Size */}
                            <div>
                                <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">
                                    Workforce Size <span className="text-red-500">*</span>
                                </label>
                                <select name="companySize" value={org.companySize}
                                    onFocus={() => setErrorMsg((prev) => ({ ...prev, companySize: "" }))}
                                    onChange={(e) => handleChange("companySize", e.target.value)}
                                    className={`appearance-none bg-[url('/down.svg')] bg-no-repeat bg-size-[16px_16px] bg-position-[right_0.75rem_center] w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-slate-100/80 border ${errorMsg.companySize ? "border-red-500" : "border-gray-300"} focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                                >
                                    <option value="" disabled>
                                        Select range
                                    </option>
                                    <option value="1-10">1 - 10 (Startup)</option>
                                    <option value="11-50">11 - 50 (Small)</option>
                                    <option value="51-200">51 - 200 (Medium)</option>
                                    <option value="201-500">201 - 500 (Large)</option>
                                    <option value="500+">500+ (Enterprise)</option>
                                </select>

                                {errorMsg.companySize &&
                                    <p className="text-red-600 text-sm mt-1 -mb-3 ml-2">{errorMsg.companySize}</p>}
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Country/Region</label>
                            <input
                                type="text"
                                value={"United Arab Emirates (UAE)"} readOnly
                                className={`cursor-not-allowed w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                            />
                        </div>

                        <div className="mt-3">
                            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
                                <MdLock className="size-5 text-[rgb(var(--light-purple))]" />
                                <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Data Sensitivity</span>
                            </h2>
                            <div className="border-b border-purple-300 mt-3"></div>
                        </div>

                        {/* Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Personal Data */}
                            <label className="relative flex items-start space-x-2 sm:space-x-3 rounded-xl border border-gray-300 px-3 sm:px-4 py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/5 transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!org.handlesPII}
                                    onChange={(e) => handleChange("handlesPII", e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#761be6] focus:ring-[#761be6]/50"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <span className="text-sm sm:text-base font-medium cursor-pointer">
                                        Personal Identifiable Information (PII)
                                    </span>
                                    <p className="text-sm text-gray-700">
                                        We handle names, emails, IDs, etc.
                                    </p>
                                </div>
                            </label>

                            {/* Payment Data */}
                            <label className="relative flex items-start space-x-2 sm:space-x-3 rounded-xl border border-gray-300 px-3 sm:px-4 py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/5 transition-colors cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!org.handlesPayments}
                                    onChange={(e) =>
                                        handleChange("handlesPayments", e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#761be6] focus:ring-[#761be6]/50"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <span className="text-sm sm:text-base font-medium cursor-pointer">
                                        Payment / Card Data
                                    </span>
                                    <p className="text-sm text-gray-700">
                                        Credit card or bank account info
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* button */}
                        <button
                            type="submit"
                            disabled={saving}
                            className="disabled:opacity-60 w-full py-2 sm:py-2.5 rounded-3xl cursor-pointer bg-linear-to-r from-[#441851] to-[#761be6] hover:from-[#5e1dbf] hover:to-[#8b2bf0] text-white font-semibold mt-2 transition-colors"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </form>

                    {/* Organisation Meta Data */}
                    <div className='mt-6 pt-4 border-t border-purple-300 text-sm text-gray-600'>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                            {/* created at */}
                            <p className="flex items-center gap-1 md:justify-start">
                                <FaCalendarAlt className="size-3 text-[rgb(var(--light-purple))]" />
                                Created At: {" "} {org.createdAt ?
                                    new Date(org.createdAt).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                    }) : "Not Created yet"}
                            </p>

                            {/* Last updated  */}
                            <p className="flex items-center gap-1 md:justify-center">
                                <FaHistory className="size-3 text-[rgb(var(--light-purple))]" />
                                Last updated {org.updatedAt ? daysAgo(org.updatedAt) : "Never"}
                            </p>

                            {/* Profile Version */}
                            <p className="flex items-center gap-1 sm:justify-end">
                                Profile Version: v{(org.profileVersion).toFixed(1)}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
