"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="flex custom-container">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>

      {/* CONTENT AREA */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-18" : "ml-46 md:ml-50 lg:ml-52"}`}>
        {children}
      </main>
    </div>
  );
}


