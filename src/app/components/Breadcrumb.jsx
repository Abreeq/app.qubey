"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function Breadcrumb() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  // Custom names for routes
  const labelMap = {
    dashboard: "Dashboard",
    auth: "Authentication",
    profile: "My Profile",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Home */}
      <Link href="/" className="hover:text-purple-600 text-sm sm:text-base font-medium text-gray-700">
        Home
      </Link>

      {pathSegments.map((segment, index) => {
        let label = segment.replace(/-/g, " ");

        // Static route rename
        if (labelMap[segment]) {
          label = labelMap[segment];
        }

        // Dynamic route rename
        if (index === pathSegments.length - 1) {
          const prevSegment = pathSegments[index - 1];
        
          if (prevSegment === "actions") {
            label = "Action Overview";
          } else if (prevSegment === "history") {
            label = "Report Overview";
          }
        }

        return (
          <span key={index} className="flex items-center gap-1 sm:gap-2">
            <MdKeyboardArrowRight className="text-gray-700 shrink-0" />

            {index !== pathSegments.length - 1 ? (
              <p className="capitalize text-gray-700 hover:text-purple-600 
               font-medium text-sm sm:text-base">
                {label}
              </p>
            ) : (
              <p className="capitalize text-purple-600 font-medium text-sm sm:text-base">
                {label}
              </p>
            )}
          </span>
        );
      })}
    </div>
  );
}