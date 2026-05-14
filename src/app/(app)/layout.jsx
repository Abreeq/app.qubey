"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function DashboardLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(true);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/auth");
      return;
    }
    setReady(true);
  }, [status, router]);

  if (!ready) return null;
  if (status === "unauthenticated") return null;

  return (
    <>
      {/* Header  */}
      <Navbar />

      <div className="flex custom-container">
        {/* Sidebar */}
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        {/* CONTENT AREA */}
        <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-18" : "ml-46 md:ml-50 lg:ml-52"}`}>
          {children}
        </main>
      </div>
    </>
  );
}


