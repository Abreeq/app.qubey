"use client";

import React from 'react'
import Link from "next/link";
import {
    HiMiniCog6Tooth, HiDocumentChartBar, HiClipboardDocumentCheck, HiBuildingOffice2
} from "react-icons/hi2";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { RiMenu3Line } from "react-icons/ri";
import { FaUsersCog } from "react-icons/fa";
import { IoHelpCircle } from "react-icons/io5";

import { usePathname } from "next/navigation";
import { useSession } from 'next-auth/react';

export default function Sidebar({ collapsed, setCollapsed }) {

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
                    <span className="font-bold text-sm uppercase bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent tracking-wide">
                        {session?.user?.organizations || "Menu"}
                    </span>
                )}
                <div className="relative group">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`${collapsed ? "flex-1 justify-items-center" : ""} p-2 cursor-pointer rounded-md text-[rgb(var(--light-purple))] hover:bg-linear-to-bl hover:from-purple-50 hover:to-purple-200 transition-colors`}
                    >
                        <RiMenu3Line className={`${collapsed ? "text-xl sm:text-2xl" : "text-2xl sm:text-xl"} transition-transform duration-300 ${collapsed ? "rotate-0" : "rotate-180"}`} />
                    </button>

                    {/* Tooltip */}
                    <span className="absolute left-13 top-1/2 -translate-y-1/2 whitespace-nowrap
                        rounded-md bg-purple-700/90 backdrop-blur-sm text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100
                        translate-x-2.5 group-hover:translate-x-0 transition-all duration-200 pointer-events-none z-50 shadow-md">
                        {collapsed ? "Expand sidebar" : "Collapse sidebar"}

                        {/* Arrow */}
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                         border-4 border-transparent border-r-purple-700"></span>
                    </span>
                </div>
            </div>

            {/* Sidebar Nav */}
            <nav className="p-2 space-y-2">
                <SidebarLink
                    href="/dashboard"
                    icon={<TbLayoutDashboardFilled />}
                    label="Dashboard"
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
                    href="/team"
                    icon={<FaUsersCog />}
                    label="Team"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/organisation/edit"
                    icon={<HiBuildingOffice2 />}
                    label="Organisation"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/profile"
                    icon={<HiMiniCog6Tooth />}
                    label="Settings"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
                <SidebarLink
                    href="/helpcenter"
                    icon={<IoHelpCircle />}
                    label="Help Center"
                    collapsed={collapsed}
                    onClick={handleNavClick}
                />
            </nav>
        </aside>
    )
}



function SidebarLink({ href, icon, label, collapsed, onClick }) {
    const pathname = usePathname();

    const isRootDashboard = href === "/dashboard";
    const isActive = isRootDashboard
        ? pathname === "/dashboard"
        : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <Link
            href={href} onClick={onClick}
            className={`relative group flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors
            ${isActive
                    ? "bg-linear-to-bl from-purple-50 to-purple-200"
                    : "hover:bg-linear-to-bl hover:from-purple-50 hover:to-purple-200"
                }`}
        >
            {/* Icon */}
            <span className={`${collapsed ? "text-xl sm:text-2xl" : "text-2xl sm:text-xl"
                } text-[rgb(var(--light-purple))]`}
            >
                {icon}
            </span>

            {/* Label (only when expanded) */}
            {!collapsed && <span>{label}</span>}

            {/* Tooltip (only when collapsed) */}
            {collapsed && (
                <span className="absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap
                    rounded-md bg-purple-700 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100
                    translate-x-2.5 group-hover:translate-x-0
                    transition-all duration-200 pointer-events-none z-50 shadow-md">
                    {label}
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full
                     border-4 border-transparent border-r-purple-700"></span>
                </span>
            )}
        </Link>
    );
}