"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
    const { data: session, status } = useSession();
    
    return (
        <nav className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        <Link href="/" className="text-xl font-bold">
          Qubey
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
            {status === "loading" ? null : session?.user ? (
            <ProfileDropdown user={session.user} />
            ) : (
            <button
                onClick={() => signIn()}
                className="bg-black text-white px-3 py-1.5 rounded"
            >
                Sign in
            </button>
            )}
        </div>
      </div>
    </nav>
  );
}
