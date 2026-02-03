"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { RiMenu3Fill } from "react-icons/ri";
import { signIn, useSession } from "next-auth/react";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar() {
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const logoRef = useRef(null);
  const menuRef = useRef([]);
  const ctaRef = useRef(null);

  const navLinks = [
    { href: "https://staging.qubey.ae/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  useGSAP(() => {
    const tl = gsap.timeline();

    // logo
    tl.from(
      logoRef.current,
      {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });

    // Menu items (staggered)
    tl.from(
      menuRef.current,
      {
        y: -30,
        opacity: 0,
        stagger: 0.12,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.2"
    );

    // CTA button
    tl.from(
      ctaRef.current,
      {
        y: -30,
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
      },
      "-=0.2"
    );
  })

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 shadow-sm bg-white">
      <div className="custom-container flex h-18 items-center justify-between">

        {/* Logo */}
        <Link ref={logoRef} href="https://staging.qubey.ae/" className="text-2xl font-bold uppercase w-60">
          <img src="/logo.png" alt="Qubey Logo" className='h-8 sm:h-12 w-auto object-contain' />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-4.5 font-medium">
          {navLinks.map(({ href, label }, index) => (

            <Link key={label} href={href}
              ref={(el) => (menuRef.current[index] = el)}
              className="group relative font-medium flex items-center gap-1.5">
              <span className="text-[rgb(var(--light-purple))] font-semibold opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                [
              </span>
              <span>{label}</span>
              <span className="text-[rgb(var(--light-purple))] font-semibold opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                ]
              </span>
            </Link>

          ))}
        </nav>

        {/* Desktop Actions */}
        <div ref={ctaRef} className="hidden lg:flex items-center gap-6">
          {
            status === "loading" ? null : session?.user ? (
              <ProfileDropdown user={session.user} />
            ) : (

              <button
                onClick={() => signIn()}
                className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] px-4 py-2 font-semibold text-white  hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition"
              >
                Sign in
              </button>
            )
          }
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden text-2xl hover:text-[rgb(var(--brand-black))]/85 p-2 rounded-lg transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : <RiMenu3Fill />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-black/20 bg-white">
          <div className="flex flex-col px-6 py-6 space-y-3 font-medium text-center">
            {navLinks.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="sm:text-lg"
                onClick={(e) => {
                  setOpen(!open);
                }}
              >
                {label}
              </Link>
            ))}


            {/* Mobile CTA */}
            <div className="flex flex-col gap-3">
              {
              status === "loading" ? null : session?.user ? (
                <ProfileDropdown user={session.user} />
              ) : (

                <button
                  onClick={() => signIn()}
                  className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] px-4 py-2 text-center text-white font-semibold"
                >
                  Sign in
                </button>
              )
            }
            </div>
          </div>
        </div>
      )}
    </header>
  );
}