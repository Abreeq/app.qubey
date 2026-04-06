"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { RiMenu3Fill } from "react-icons/ri";
import { signIn, useSession } from "next-auth/react";
import ProfileDropdown from "./ProfileDropdown";
import { LuCrown, LuSearch } from "react-icons/lu";
import { VscBell } from "react-icons/vsc";
import Breadcrumb from "./Breadcrumb";

export default function Navbar() {
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // For Animation
  const logoRef = useRef(null);
  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const upgradeAnimRef = useRef(null);
  const profileRef = useRef(null);

  // For dropdown
  const upgradeRef = useRef(null);
  const notificationRef = useRef(null);

  // When click on outside dropdown should collapse
  useEffect(() => {
    function handleClickOutside(e) {
      if (upgradeRef.current && !upgradeRef.current.contains(e.target)) {
        setUpgradeOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gsap Animation
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

    tl.from(
      [
        searchRef.current,
        notifRef.current,
        upgradeAnimRef.current,
        profileRef.current,
      ],
      {
        y: -30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.4,
        ease: "power2.out",
      },
      "-=0.2"
    );
  })

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/10 shadow-sm bg-white">
        <div className="custom-container flex h-18 items-center justify-between px-3 sm:px-4">
          {/* LEFT SIDE */}
          <div ref={logoRef} className="flex items-center gap-2 md:gap-4 w-full min-w-0">
            {/* Logo */}
            <Link href="https://staging.qubey.ae/" className="border-r border-gray-300 pr-3 sm:pr-6 flex items-center shrink-0">
              <img src="/logo.png" alt="Qubey Logo" className="h-8 sm:h-12 w-auto object-contain" />
            </Link>

            {/* Breadcrumb */}
            <div className="flex items-center overflow-hidden">
              <Breadcrumb />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-5">
              {/* SearchBar */}
              <div ref={searchRef} className="relative group">
                <LuSearch className="text-[#441851]/40 absolute left-3 top-[50%] translate-y-[-50%] group-focus-within:text-gray-800" />
                <input type="text" placeholder="Search reports & actions"
                  className={`pl-10 pr-3 py-1.5 w-72 xl:w-98 text-sm sm:text-base rounded-lg border border-gray-400 placeholder-[#441851]/40 group-focus-within:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                />
              </div>

              {/* Notification */}
              <div ref={notificationRef} className="relative">
                <div ref={notifRef} onClick={() => setNotificationOpen(!notificationOpen)} className="relative cursor-pointer" >
                  <VscBell className="shrink-0 text-xl" />
                  <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500"></span>
                </div>

                {notificationOpen && (
                  <div className="absolute right-0 mt-4 w-86 bg-white border border-purple-200 p-2 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <h3 className="font-semibold text-base sm:text-lg bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Notifications</h3>
                      <button className="cursor-pointer text-sm text-purple-700 hover:underline">
                        Mark all as read
                      </button>
                    </div>

                    <div className="border-b border-purple-300 my-2"></div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto">
                      {/* Item */}
                      <div className="px-4 py-2 hover:bg-purple-100 rounded-lg cursor-pointer flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            New compliance risk detected
                          </p>
                          <p className="text-xs text-gray-600">
                            Critical gap found in Access Control
                          </p>
                          <span className="text-xs text-gray-500">5 min ago</span>
                        </div>
                        <span className="mt-1 size-2 bg-purple-700 rounded-full"></span>
                      </div>

                      {/* Item */}
                      <div className="px-4 py-2 hover:bg-purple-100 rounded-lg cursor-pointer flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Assessment completed
                          </p>
                          <p className="text-xs text-gray-600">
                            PDPL assessment has been completed
                          </p>
                          <span className="text-xs text-gray-500">1 hour ago</span>
                        </div>
                        <span className="mt-1 size-2 bg-purple-700 rounded-full"></span>
                      </div>

                      {/* Item */}
                      <div className="px-4 py-2 hover:bg-purple-100 rounded-lg cursor-pointer flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Report generated
                          </p>
                          <p className="text-xs text-gray-600">
                            Monthly compliance report is ready
                          </p>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <span className="mt-1 size-2 bg-purple-700 rounded-full"></span>
                      </div>
                    </div>

                    <div className="border-b border-purple-300 my-2"></div>
                    {/* Footer */}
                      {/* <button className="text-sm text-purple-600 hover:underline">
                        View all notifications
                      </button> */}
                      <button className="cursor-pointer w-full rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] 
                          px-2 md:px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                        <span className="md:font-medium text-white">View all notifications</span>
                      </button>
                    
                  </div>
                )}
              </div>

              {/* Subscription Plan */}
              <div ref={upgradeRef} className="relative">
                <div ref={upgradeAnimRef}>
                  <button onClick={() => setUpgradeOpen(!upgradeOpen)}
                    className="cursor-pointer rounded-lg bg-slate-100/80 border border-purple-300
                  hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 py-1.5 flex items-center gap-2 transition-all duration-300">
                    <LuCrown className="shrink-0" />
                    <span className="text-sm font-medium">Upgrade</span>
                  </button>

                  {/* <button className="cursor-pointer rounded-lg bg-yellow-200/80 border border-yellow-600
                    hover:scale-95 px-3 py-1.5 flex items-center gap-2 transition-all duration-300">
                      <LuCrown className="text-yellow-600 shrink-0" />
                      <span className="text-sm font-medium">Pro</span>
                    </button> */}

                </div>

                {upgradeOpen && (
                  <div className="absolute right-0 mt-3 w-160 bg-white/90 border border-purple-200 rounded-xl shadow-xl p-5 overflow-hidden space-y-2 z-50 animate-in fade-in zoom-in-95">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Upgrade Your Plan</h2>
                        <p className="text-sm sm:text-base font-medium">
                          Choose the plan that fits your needs
                        </p>
                      </div>

                      <button onClick={() => setUpgradeOpen(!upgradeOpen)}
                        className="text-gray-700 hover:text-purple-700 text-xl cursor-pointer">
                        ✕
                      </button>
                    </div>

                    <div className="border-b border-purple-300 my-4"></div>

                    {/* Current Plan */}
                    <div className="rounded-lg bg-linear-to-br from-purple-100 via-purple-50 to-white border border-gray-300 py-2.5 px-3">
                      <div className="relative flex items-center justify-between">
                        <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Current Plan {" "}</p>
                        <button className="rounded-lg border border-purple-300 bg-[#761be6] text-white px-3 py-1.5 
                          flex items-center gap-2">
                          <LuCrown className="shrink-0" />
                          <span className="text-sm font-medium">Pro</span>
                        </button>
                      </div>

                      <div className="border-b border-purple-300 my-3"></div>

                      <div className="relative flex items-center justify-between">
                        <div>
                          <span className="text-sm ml-2 sm:ml-1">Billing Cycle</span>
                          <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Monthly</p>
                        </div>

                        <div>
                          <span className="text-sm ml-2 sm:ml-1">Usage</span>
                          <p className="text-sm  font-medium ml-2 sm:ml-1">2/3 assessments used</p>
                        </div>

                        <div>
                          <span className="text-sm ml-2 sm:ml-1">Next Billing Date</span>
                          <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">20-April-2026</p>
                        </div>
                      </div>
                    </div>

                    {/* Plans */}
                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                      {/* Pro Plan */}
                      <div className="relative border border-purple-300 rounded-2xl p-4 shadow-sm group">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-purple-50 via-purple-50 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Label */}
                        <div className="absolute -top-3.5 left-4 flex items-center justify-center w-fit rounded-full px-4 py-0.5 text-sm bg-purple-700 text-white">Popular</div>
                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="font-semibold text-lg text-purple-700">Pro Plan</h3>
                          <p className="text-2xl font-bold mt-1">AED 499<span className="font-medium text-sm text-gray-600">/month</span></p>

                          <ul className="text-sm font-medium mt-3 space-y-1 text-gray-600">
                            <li><span className="text-green-500 mr-1">✔</span> Unlimited assessments</li>
                            <li><span className="text-green-500 mr-1">✔</span> 10 team members</li>
                            <li><span className="text-green-500 mr-1">✔</span> AI compliance advisor</li>
                            <li><span className="text-green-500 mr-1">✔</span> Priority support</li>
                          </ul>

                          <button className="cursor-pointer mt-6 w-full rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] 
                          px-2 md:px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
                            <span className="md:font-medium text-white">Current Plan</span>
                          </button>
                        </div>
                      </div>

                      {/* Enterprise */}
                      <div className="relative border border-gray-300 rounded-2xl p-4 shadow-sm overflow-hidden group">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-r from-purple-100 via-purple-100 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Content */}
                        <div className="relative z-10">
                          <h3 className="font-semibold text-lg text-purple-700">Enterprise</h3>
                          <p className="text-2xl font-bold mt-1">AED 999<span className="font-medium text-sm text-gray-600">/month</span></p>

                          <ul className="text-sm font-medium mt-3 space-y-1 text-gray-600">
                            <li><span className="text-green-500 mr-1">✔</span> Everything in Pro</li>
                            <li><span className="text-green-500 mr-1">✔</span> Unlimited team members</li>
                            <li><span className="text-green-500 mr-1">✔</span> Dedicated manager</li>
                            <li><span className="text-green-500 mr-1">✔</span> Custom integrations</li>
                          </ul>

                          <button className="mt-6 cursor-pointer w-full border border-purple-600 text-purple-600 py-1.5 rounded-lg hover:bg-purple-50">
                            Upgrade Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-center gap-6 text-sm text-gray-500 mt-6">
                      <button>Manage billing</button>
                      <button>View invoices</button>
                    </div>


                  </div>
                )}
              </div>

              {/* Profile */}
              <div ref={profileRef}>
                {status === "loading" ? null : session?.user ? (
                  <ProfileDropdown user={session.user} />
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] px-4 py-2 font-semibold text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition"
                  >
                    Sign in
                  </button>
                )}
              </div>

            </div>

            {/* Mobile Hamburger */}
            <button onClick={() => setOpen(!open)}
              className="lg:hidden text-2xl hover:text-[rgb(var(--brand-black))]/85 rounded-lg transition-colors"
              aria-label="Toggle menu" >
              {open ? "✕" : <RiMenu3Fill />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="lg:hidden border-t border-black/10 bg-white">
            <div className="flex flex-col px-4 py-5 space-y-5 font-medium">

              {/* Search */}
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports & actions"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#761be6]/20 outline-none"
                />
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between cursor-pointer">
                <span className="text-gray-700">Notifications</span>
                <div className="relative">
                  <VscBell className="text-xl" />
                  <span className="absolute top-0 right-0 size-2 rounded-full bg-red-500"></span>
                </div>
              </div>

              {/* Upgrade */}
              <button className="rounded-lg bg-slate-100 border border-purple-300 px-3 py-2 flex items-center justify-center gap-2">
                <LuCrown />
                Upgrade
              </button>

              {/* Profile / Auth */}
              <div className="pt-2 border-t">
                {status === "loading" ? null : session?.user ? (
                  <ProfileDropdown user={session.user} />
                ) : (
                  <button
                    onClick={() => signIn()}
                    className="w-full rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] px-4 py-2 text-white font-semibold"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}


// Previous header
// {/* <header className="sticky top-0 z-50 w-full border-b border-black/10 shadow-sm bg-white">
//   <div className="custom-container flex h-18 items-center justify-between">

//     {/* Logo */}
//     <Link ref={logoRef} href="https://staging.qubey.ae/" className="text-2xl font-bold uppercase w-60">
//       <img src="/logo.png" alt="Qubey Logo" className='h-8 sm:h-12 w-auto object-contain' />
//     </Link>

//     {/* Desktop Nav */}
//     <nav className="hidden lg:flex items-center gap-4.5 font-medium">
//       {navLinks.map(({ href, label }, index) => (

//         <Link key={label} href={href}
//           ref={(el) => (menuRef.current[index] = el)}
//           className="group relative font-medium flex items-center gap-1.5">
//           <span className="text-[rgb(var(--light-purple))] font-semibold opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
//             [
//           </span>
//           <span>{label}</span>
//           <span className="text-[rgb(var(--light-purple))] font-semibold opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
//             ]
//           </span>
//         </Link>

//       ))}
//     </nav>

//     {/* Desktop Actions */}
//     <div ref={ctaRef} className="hidden lg:flex items-center gap-4">
//       <button className="cursor-pointer rounded-lg bg-slate-100/80 border border-purple-300
//              hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 py-1.5 flex items-center gap-2 transition-all duration-300">
//         <LuCrown className="shrink-0" />
//         <span className="text-sm font-medium">Upgrade</span>
//       </button>

//       <button className="cursor-pointer rounded-lg bg-yellow-200/80 border border-yellow-600
//             hover:scale-95 px-3 py-1.5 flex items-center gap-2 transition-all duration-300">
//         <LuCrown className="shrink-0 text-yellow-600" />
//         <span className="text-sm font-medium">Pro</span>
//       </button>
//       {
//         status === "loading" ? null : session?.user ? (
//           <ProfileDropdown user={session.user} />
//         ) : (

//           <button
//             onClick={() => signIn()}
//             className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] px-4 py-2 font-semibold text-white  hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition"
//           >
//             Sign in
//           </button>
//         )
//       }
//     </div>

//     {/* Mobile Hamburger */}
//     <button
//       className="lg:hidden text-2xl hover:text-[rgb(var(--brand-black))]/85 p-2 rounded-lg transition-colors"
//       onClick={() => setOpen(!open)}
//       aria-label="Toggle menu"
//     >
//       {open ? "✕" : <RiMenu3Fill />}
//     </button>
//   </div>

//   {/* Mobile Menu */}
//   {open && (
//     <div className="lg:hidden border-t border-black/20 bg-white">
//       <div className="flex flex-col px-6 py-6 space-y-3 font-medium text-center">
//         {navLinks.map(({ href, label }) => (
//           <Link
//             key={label}
//             href={href}
//             className="sm:text-lg"
//             onClick={(e) => {
//               setOpen(!open);
//             }}
//           >
//             {label}
//           </Link>
//         ))}


//         {/* Mobile CTA */}
//         <div className="flex flex-col gap-3">
//           {
//             status === "loading" ? null : session?.user ? (
//               <ProfileDropdown user={session.user} />
//             ) : (

//               <button
//                 onClick={() => signIn()}
//                 className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] px-4 py-2 text-center text-white font-semibold"
//               >
//                 Sign in
//               </button>
//             )
//           }
//         </div>
//       </div>
//     </div>
//   )}
// </header> */}