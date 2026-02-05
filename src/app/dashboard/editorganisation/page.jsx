"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function OrganisationEditPage() {
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/organisation/me");
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to load organisation");
        setLoading(false);
        return;
      }

      setOrg(data.org);
      setLoading(false);
    };

    load();
  }, []);

  const handleChange = (key, value) => {
    setOrg((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);

    const res = await fetch("/api/organisation/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: org.name,
        industry: org.industry,
        companySize: org.companySize,
        country: org.country,
        handlesPII: org.handlesPII,
        handlesPayments: org.handlesPayments,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      toast.error(data.error || "Update failed");
      return;
    }

    toast.success(data.message);

    // if assessment affected -> suggest new assessment
    if (data.affectsAssessment) {
      toast.info("Please run a new assessment to refresh your score.");
    }

    setOrg(data.org);
  };

  if (loading) return null;

  if (!org) {
    return (
      <main className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold">Organisation</h1>
        <p className="mt-3 text-gray-600">No organisation found.</p>
        <Link className="underline mt-3 inline-block" href="/organisation/create">
          Create Organisation
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Organisation Settings</h1>
        <Link href="/dashboard" className="underline text-sm">
          Back
        </Link>
      </div>

      <div className="mt-6 border bg-white rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Organisation Name</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={org.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Industry</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={org.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Company Size</label>
          <select
            className="w-full border rounded px-3 py-2 mt-1"
            value={org.companySize}
            onChange={(e) => handleChange("companySize", e.target.value)}
          >
            <option value="1-10">1 - 10</option>
            <option value="11-50">11 - 50</option>
            <option value="51-200">51 - 200</option>
            <option value="201-500">201 - 500</option>
            <option value="500+">500+</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Country / Region</label>
          <input
            className="w-full border rounded px-3 py-2 mt-1"
            value={org.country}
            onChange={(e) => handleChange("country", e.target.value)}
          />
        </div>

        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!org.handlesPII}
              onChange={(e) => handleChange("handlesPII", e.target.checked)}
            />
            Handles personal data (PII)
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!org.handlesPayments}
              onChange={(e) =>
                handleChange("handlesPayments", e.target.checked)
              }
            />
            Handles payment/card data
          </label>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <div className="text-xs text-gray-500">
          Profile version: <span className="font-medium">{org.profileVersion}</span>
        </div>
      </div>
    </main>
  );
}
