"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { MdLock } from "react-icons/md";
import { BsShieldFillExclamation } from "react-icons/bs";

export default function CreateOrganisationForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    industryOther: "",
    companySize: "",
    country: "United Arab Emirates",
    handlesPII: false,
    handlesPayments: false,
  });

  const [isOtherIndustry, setIsOtherIndustry] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const [authError, setAuthError] = useState("");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setAuthError("");
  };

  //  For Validation
  const conditions = {
    name: [{ required: true, msg: "Please enter your organization name" }, { length: 3, msg: "Organization name must be at least 3 characters" }],
    industry: [{ required: true, msg: "Please enter your industry" }],
    industryOther: [{ required: true, msg: "Please specify your industry"}],
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

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validatedData = validate(form);

    if (Object.keys(validatedData).length) {
      setLoading(false);
      return;
    }

    const formObj = { ...form, industryOther: form.industry === "Other" ? form.industryOther : null,};

    const res = await fetch("/api/organisation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formObj),
    });

    const data = await res.json();

    if (!res.ok) {
      setAuthError(data.error || "Failed to create organisation")
      setLoading(false);
      return;
    }

    toast.success("Organisation created successfully 🎉");
    router.push("/dashboard");
  };

  return (
    <section className="py-12">
      <div className="custom-container">
        <div className="flex flex-col space-y-2 items-center mb-6 sm:mb-7">
          <span className="font-medium bg-linear-to-r from-[#761be6] to-[#441851] text-white border-0 text-sm px-3 py-1.5 rounded-full">
            Quick setup
          </span>
          <h1 className="text-center text-2xl sm:text-3xl md:text-4xl capitalize font-bold mb-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            Setup your organisation
          </h1>
          <p className="text-center text-base sm:text-lg max-w-2xl">
            Fill in your company details to configure your compliance dashboard tailored to your
            region and industry.
          </p>
        </div>

        {/* Form */}
        <div className={`custom-container relative z-10 max-w-4xl bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6`}>

          {/* Error message */}
          {authError && (
            <div className="w-full px-3 sm:px-4 py-2 mb-3 sm:mb-4 text-sm sm:text-base rounded-xl bg-red-100/50 border border-red-500 backdrop-blur-2xl flex items-center gap-3 sm:gap-5">
              <BsShieldFillExclamation className="shrink-0 size-4 sm:size-6 text-red-600" />
              <div>
                <h4 className="text-sm sm:text-base font-medium text-red-600">Error</h4>
                <p className="text-sm leading-tight">{authError}</p>
              </div>
            </div>
          )}

          {/* Header */}
          <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
            <HiBuildingOffice2 className="size-5 text-[rgb(var(--light-purple))]" />
            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Company Information</span>
          </h2>
          <div className="border-b border-purple-300 my-3"></div>

          <form onSubmit={submit} className="space-y-3 sm:space-y-5">
            {/* Organisation Name */}
            <div>
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Organisation Name <span className="text-red-500">*</span></label>
              <input
                type="text" value={form.name} name="name"
                placeholder="Enter your registered company name"
                onFocus={() => setErrorMsg((prev) => ({ ...prev, name: "" }))}
                onChange={(e) => handleChange(e.target.name, e.target.value)}
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
                <select name="industry" value={isOtherIndustry ? "Other" : form.industry}
                  onFocus={() => setErrorMsg((prev) => ({ ...prev, industry: "" }))}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      setIsOtherIndustry(true);
                      handleChange("industry", val);
                    } else {
                      setIsOtherIndustry(false);
                      handleChange("industry", val);
                      handleChange("industryOther", "");
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
                {errorMsg.industry && <p className="text-red-600 text-sm mt-1 -mb-3 ml-2">{errorMsg.industry}</p>}
                {/* Show input if Other is selected */}
                {isOtherIndustry && (
                  <input
                    type="text"
                    placeholder="Enter your industry"
                    value={form.industryOther}
                    onFocus={() => setErrorMsg((prev) => ({ ...prev, industryOther: "" }))}
                    onChange={(e) => handleChange("industryOther", e.target.value)}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-2 text-sm sm:text-base rounded-4xl bg-slate-100/80 border ${errorMsg.industryOther  ? "border-red-500" : "border-gray-300"
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
                <select name="companySize" value={form.companySize}
                  onFocus={() => setErrorMsg((prev) => ({ ...prev, companySize: "" }))}
                  onChange={(e) => handleChange(e.target.name, e.target.value)}
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
              <label className="relative flex items-start space-x-3 rounded-xl border border-gray-300 px-4 py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/5 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.handlesPII}
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
              <label className="relative flex items-start space-x-3 rounded-xl border border-gray-300 px-4 py-3 shadow-sm hover:border-[#761be6]/50 hover:bg-[#761be6]/5 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.handlesPayments}
                  onChange={(e) => handleChange("handlesPayments", e.target.checked)}
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
              disabled={loading}
              className="disabled:opacity-60 w-full py-2 sm:py-2.5 rounded-3xl cursor-pointer bg-linear-to-r from-[#441851] to-[#761be6] hover:from-[#5e1dbf] hover:to-[#8b2bf0] text-white font-semibold mt-2 transition-colors"
            >
              {loading ? "Finishing..." : "Finish Setup"}
            </button>
          </form>

        </div>

        {/* Privacy Policy */}
        <p className="text-center text-sm mt-6">
          By creating an organisation, you agree to our{" "}
          <a href="https://staging.qubey.ae/terms" rel="noopener noreferrer" target="_blank" className="underline hover:text-purple-600 cursor-pointer transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="https://staging.qubey.ae/privacy" rel="noopener noreferrer" target="_blank" className="underline hover:text-purple-600 cursor-pointer transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}