"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CreateOrganisationForm() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    companySize: "",
    country: "UAE",
    handlesPII: false,
    handlesPayments: false,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/organisation/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to create organisation");
      setLoading(false);
      return;
    }

    toast.success("Organisation created successfully 🎉");
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="bg-white border rounded-xl shadow-sm w-full max-w-lg p-6 space-y-4"
      >
        <h1 className="text-2xl font-semibold">Create Organisation</h1>
        <p className="text-sm text-gray-500">
          Set up your organisation to start compliance assessment.
        </p>

        {/* Name */}
        <div>
          <label className="text-sm font-medium">Organisation Name *</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="e.g. Qutbee Technologies"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        {/* Industry */}
        <div>
          <label className="text-sm font-medium">Industry *</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="e.g. IT Services, Healthcare, Retail"
            value={form.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
            required
          />
        </div>

        {/* Company Size */}
        <div>
          <label className="text-sm font-medium">Company Size *</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.companySize}
            onChange={(e) => handleChange("companySize", e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="1-10">1 - 10</option>
            <option value="11-50">11 - 50</option>
            <option value="51-200">51 - 200</option>
            <option value="201-500">201 - 500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        {/* Country */}
        <div>
          <label className="text-sm font-medium">Country / Region</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={form.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.handlesPII}
              onChange={(e) => handleChange("handlesPII", e.target.checked)}
            />
            We handle personal data (PII)
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.handlesPayments}
              onChange={(e) => handleChange("handlesPayments", e.target.checked)}
            />
            We handle payment/card data
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Organisation"}
        </button>
      </form>
    </main>
  );
}
