"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

export default function OrgSwitcher() {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);

  const orgs = session?.user?.organizations || [];
  const activeId = session?.user?.activeOrganizationId;

  const activeOrg =
    orgs.find((o) => o.id === activeId) || orgs[0];

  const switchOrg = async (org) => {
  if (org.id === activeId) return;

  setOpen(false);

  // 1️⃣ persist in DB
  await fetch("/api/organisation/switch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organizationId: org.id,
    }),
  });

  // 2️⃣ update session (UI instant sync)
  await update({
    activeOrganizationId: org.id,
  });
};

  if (!activeOrg) return null;

  return (
    <div className="relative w-full">
      {/* Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-purple-50 transition"
      >
        <span className="text-sm font-semibold truncate">
          {activeOrg.name}
        </span>

        <HiChevronDown
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white border rounded-md shadow-lg z-50">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => switchOrg(org)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${
                org.id === activeId
                  ? "bg-purple-100 font-semibold"
                  : ""
              }`}
            >
              {org.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}