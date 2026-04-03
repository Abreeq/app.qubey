"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdKeyboardArrowRight } from "react-icons/md";


export default function Breadcrumb() {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-2">
      {/* Home */}
      <Link href="/" className="hover:text-purple-600 text-sm sm:text-base font-medium text-gray-700">
        Home
      </Link>

      {pathSegments.map((segment, index) => {
        const href = "/" + pathSegments.slice(0, index + 1).join("/");

        return (
          <span key={index} className="flex items-center gap-1 sm:gap-2">
            <MdKeyboardArrowRight className="text-gray-700 shrink-0" />
            <p className="capitalize text-purple-600 font-medium text-sm sm:text-base">
              {segment.replace("-", " ")}
            </p>
          </span>
        );
      })}
    </div>
  );
}