"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { FaUser } from "react-icons/fa";
import { RiBarChartBoxFill } from "react-icons/ri";
import { IoLogOut } from "react-icons/io5";

export default function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // get Initials
  const getInitials = (name) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    }
    return "U";// fallback: User;
  };

  return (
    <div className="relative inline-flex items-center justify-center" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center focus:outline-none"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt="Profile"
            width={36}
            height={36}
            className="rounded-full cursor-pointer"
          />) : (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold 
              bg-linear-to-r from-[#441851] to-[#761be6] cursor-pointer">
            {getInitials(user?.name)}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-7 lg:right-0 mt-3 w-64 bg-white/90 border border-purple-200 shadow-xl rounded-xl z-50 overflow-hidden">
          <div className="flex items-center gap-3 p-3 bg-linear-to-r from-[#761be6]/65 to-[#761be6]">
            {user.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={36}
                height={36}
                className="rounded-full border-2 border-gray-200"
              />) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center 
                  bg-linear-to-r from-[#441851] to-[#761be6] 
                  text-white font-semibold border-2 border-gray-200">
                {getInitials(user?.name)}
              </div>
            )}

            <div className="flex flex-col gap-0.5 text-gray-100 min-w-0">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs break-all">{user.email}</p>
            </div>
          </div>
          <div className="px-1 py-1.5">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-linear-to-bl hover:from-purple-100 hover:to-purple-200 transition-colors"
              onClick={() => setOpen(false)}
            >
              <FaUser className="size-4 text-[rgb(var(--light-purple))]" />
              Profile
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-linear-to-bl hover:from-purple-100 hover:to-purple-200 transition-colors"
              onClick={() => setOpen(false)}
            >
              <RiBarChartBoxFill className="size-4 text-[rgb(var(--light-purple))]" />
              Dashboard
            </Link>

            <div className="border-b border-purple-300 my-1"></div>

            <button
              onClick={() => signOut()}
              className="w-full cursor-pointer flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-linear-to-bl hover:from-red-300 hover:to-red-500 hover:text-white group transition-colors"
            >
              <IoLogOut className="size-5 shrink-0 text-[rgb(var(--light-purple))] group-hover:text-white" />
              Sign out
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
