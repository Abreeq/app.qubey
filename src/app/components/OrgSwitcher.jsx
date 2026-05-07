"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

export default function OrgSwitcher() {
  const { data: session, update } = useSession();
  const [open, setOpen] = useState(false);
  const [switchingOrgId, setSwitchingOrgId] = useState(null);

  const orgs = session?.user?.organizations || [];
  const activeId = session?.user?.activeOrganizationId;

  const activeOrg =
    orgs.find((o) => o.id === activeId) || orgs[0];

  // To Check the Number od organization
  const hasMultipleOrgs = orgs.length > 1;

  const switchOrg = async (org) => {
    if (org.id === activeId) return;

    try {
      setSwitchingOrgId(org.id);
      setOpen(false);

      await fetch("/api/organisation/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: org.id,
        }),
      });

      await update();

    } finally {
      setSwitchingOrgId(null);
    }
  };

  if (!activeOrg) return null;

  return (
    <div className="relative w-full">
      {/* Button */}
      <button disabled={!!switchingOrgId}
        onClick={() => {
          if (hasMultipleOrgs) {
            setOpen((v) => !v);
          }
        }}
        className={`w-full flex items-center justify-between gap-2 px-1.5 py-2 rounded-md 
          ${hasMultipleOrgs ? "cursor-pointer hover:bg-linear-to-bl hover:from-purple-50 hover:to-purple-200"
            : "cursor-default"} transition`}
      >
        {switchingOrgId ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#761be6]">
              Switching...
            </span>
            <span className="h-4 w-4 shrink-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <span className="font-semibold text-sm capitalize text-nowrap bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent tracking-wide">
              {activeOrg.name}
            </span>
            {hasMultipleOrgs && (
              <HiChevronDown
                className={`transition-transform text-sm ${open ? "rotate-180" : ""}`}
              />
            )}
          </>
        )}

      </button>

      {/* Dropdown */}
      {hasMultipleOrgs && open && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white border border-purple-300 shadow-xl rounded-md overflow-hidden z-50">
          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() => switchOrg(org)}
              className={`w-full cursor-pointer text-left p-2 font-medium hover:bg-purple-700/90 hover:text-white group ${org.id === activeId
                ? "bg-linear-to-bl from-purple-100 to-purple-200 hover:bg-linear-to-bl hover:from-purple-700/90 hover:to-purple-700/80"
                : ""
                }`}
            >
              {/* {org.name} */}
              <div className="flex flex-col">
                <span className="text-sm truncate">
                  {org.name}
                </span>
                <span className="text-[10px] text-gray-700 group-hover:text-gray-300">
                  {org.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}