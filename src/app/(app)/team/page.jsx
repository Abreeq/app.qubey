"use client"
import { FaCirclePlus } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";


export default function DashboardPage() {

  return (
    <section className="py-12 space-y-8 sm:space-y-12 pr-1.5">
      {/* Welcome Message */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mb-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            Teams Page
          </h1>
          <p className="font-medium text-lg max-w-3xl">
            Welcome back, View your current compliance status and key metrics at a glance.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 justify-start">
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <button className="cursor-pointer rounded-4xl bg-slate-100/80 border border-gray-300 shadow-md
              hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 md:px-4 py-2 flex items-center gap-2 transition-all duration-300">
              <MdOutlineFileDownload className="size-4 md:size-5 shrink-0" />
              <span className="md:font-medium">Export Report</span>
            </button>
            <button onClick={() => router.push("/assessment")}
              className="cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
              px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
              <FaCirclePlus className="size-4 text-white shrink-0" />
              <span className="md:font-medium text-white">New Assessment</span>
            </button>
          </div>

          {/* Last Assessment */}
          {/* <p className="flex items-center gap-2 font-medium text-sm text-gray-700">
            <FaCalendarDays className="size-3 text-[rgb(var(--light-purple))]" />
            Last assessment: {" "} {lastAssessmentAt ?
              new Date(lastAssessmentAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              }) : "Not yet"}
          </p> */}
        </div>
      </div>


    </section>
  );
}
