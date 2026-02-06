"use client";

import React from 'react'
import Link from "next/link";
import {
  HiOutlineCog6Tooth,HiDocumentChartBar, HiClipboardDocumentCheck
} from "react-icons/hi2";
import { FaBuilding } from "react-icons/fa";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { RiMenu3Line } from "react-icons/ri";

import { usePathname } from "next/navigation";
import { useSession } from 'next-auth/react';

export default function Sidebar({collapsed, setCollapsed}) {

    const handleNavClick = () => {
        setCollapsed(true);
    };
    const { data: session } = useSession();
    
    return (
        <aside className={`${collapsed ? "w-16" : "w-full sm:w-44 md:w-48 lg:w-50"} fixed top-18 left-0 h-[calc(100vh-72px)]
         bg-white border-r-2 border-black/10 shadow-sm transition-all duration-300 z-40`}>
            {/* Sidebar Header (affected by collapse) */}
            <div className="h-14 flex items-center justify-between px-3 border-b border-purple-400">
                {!collapsed && (
                    <span className="font-bold text-sm uppercase tracking-wide">
                        {session?.user?.organizations?.[0] || "Dashboard"}
                    </span>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`${collapsed ? "flex-1 justify-items-center" : ""} p-2 cursor-pointer rounded-md text-[rgb(var(--light-purple))] hover:bg-linear-to-bl hover:from-purple-50 hover:to-purple-200 transition-colors`}
                >
                    <RiMenu3Line className={`${collapsed ? "text-xl sm:text-2xl" : "text-2xl sm:text-xl"}`} />
                </button>
            </div>

            {/* Sidebar Nav */}
            <nav className="p-2 space-y-2">
                <SidebarLink
                    href="/dashboard"
                    icon={<TbLayoutDashboardFilled />}
                    label="Overview"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/assessment"
                    icon={<HiClipboardDocumentCheck />}
                    label="Assessments"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/reports"
                    icon={<HiDocumentChartBar />}
                    label="Reports"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/organisation/edit"
                    icon={<FaBuilding />}
                    label="Organisation"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/dashboard/settings"
                    icon={<HiOutlineCog6Tooth />}
                    label="Settings"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
            </nav>
        </aside>
    )
}



function SidebarLink({ href, icon, label, collapsed, onClick}) {
    const pathname = usePathname();
  
    const isRootDashboard = href === "/dashboard";
    const isActive = isRootDashboard
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`);
  
    return (
      <Link
        href={href} onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium  transition-colors
        ${
          isActive
            ? "bg-linear-to-bl from-purple-50 to-purple-200"
            : "hover:bg-linear-to-bl hover:from-purple-50 hover:to-purple-200"
        }`}
      >
        <span className={`${collapsed?"text-xl sm:text-2xl":"text-2xl sm:text-xl"} text-[rgb(var(--light-purple))]`}>{icon}</span>
        {!collapsed && <span>{label}</span>}
      </Link>
    );
  }