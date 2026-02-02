"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BsShieldFillExclamation } from "react-icons/bs";

export default function AuthPage() {
  const { update, data: session } = useSession(); // 👈 IMPORTANT
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("verified") === "true") {
      // Trigger JWT refresh
      update();

      // Clean URL immediately
      router.replace("/auth");
    }
  }, [update, router ]);

  useEffect(() => {
     if (
    session?.user?.emailVerified &&
    !sessionStorage.getItem("emailVerifiedToast")
  ) {
    toast.success("Email verified successfully!");
    sessionStorage.setItem("emailVerifiedToast", "true");
  }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* =========================
         SIGNUP FLOW
      ========================= */
      if (isSignup) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || "Signup failed");
          setLoading(false);
          return;
        }

        toast.success("Account created successfully");
      }

      /* =========================
         LOGIN FLOW
      ========================= */
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // REQUIRED for toast handling
      });

      if (result?.error) {
        setAuthError("The email or password you entered is incorrect. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully");
      window.location.href = "/dashboard";
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full relative flex items-center justify-center bg-[#f8fafc] overflow-hidden -mt-19">
      {/* --- Background Blobs --- */}
      <div className="absolute top-[-10%] left-[-10%] size-160 bg-[#761be6] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] size-160 bg-[#00A4EA] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute top-[5%] left-[30%] size-160 bg-[#6670CC] rounded-full mix-blend-multiply filter blur-[60px] opacity-30"></div>

      {/* --- Glass Card --- */}
      <div className={`${isSignup? "mt-16":"mt-12"} custom-container relative z-10 w-[88%] sm:w-full max-w-sm sm:max-w-lg bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.16)] border border-white/60 p-4 sm:p-6`}>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-[#441851] to-[#761be6] bg-clip-text text-transparent">
            {isSignup ? "Create an Account" : "Welcome Back"}
          </h2>
          <p className="text-sm mt-1">
            {isSignup ? "Sign up to start your journey" : "We're thrilled to have you"}
          </p>
        </div>

        {/* Error message */}
        {authError && (
          <div className="w-full px-3 sm:px-4 py-2 mb-3 sm:mb-4 text-sm sm:text-base rounded-xl bg-red-100/50 border border-red-500 backdrop-blur-2xl flex items-center gap-3 sm:gap-5">
            <BsShieldFillExclamation className="shrink-0 size-4 sm:size-6 text-red-600" />
            <div>
              <h4 className="text-sm sm:text-base font-medium text-red-600">Access Denied</h4>
              <p className="text-sm leading-tight">{authError}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
          {/* FULL NAME (SIGNUP ONLY) */}
          {isSignup && (
            <div>
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Full Name</label>
              <input
                type="text"
                placeholder="john doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-white/80 border border-white placeholder-[#441851]/40 focus:bg-white/60 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if(authError) setAuthError("");
              }}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-white/80 border border-white placeholder-[#441851]/40 focus:bg-white/60 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all"
              required
            />
          </div>

           {/* Password */}
          <div>
            <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Password</label>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if(authError) setAuthError("");
              }}
              minLength={6}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-4xl bg-white/80 border border-white placeholder-[#441851]/40 focus:bg-white/60 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button disabled={loading}
            className="disabled:opacity-60 w-full py-2 sm:py-2.5 rounded-4xl cursor-pointer bg-linear-to-r from-[#441851] to-[#761be6] hover:from-[#5e1dbf] hover:to-[#8b2bf0] text-white font-semibold mt-2 transition-colors">
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
          </button>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px bg-[rgb(var(--brand-black))]/10 flex-1"></div>
          <span className="text-xs font-medium text-[rgb(var(--brand-black))]/50 uppercase tracking-wide">Or</span>
          <div className="h-px bg-[rgb(var(--brand-black))]/10 flex-1"></div>
        </div>

        {/* Google Button */}
        <button onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="cursor-pointer w-full py-2 sm:py-2.5 rounded-4xl bg-white/80 border border-white hover:bg-white/60 font-medium flex items-center justify-center gap-3 transition-all group">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm sm:text-base group-hover:text-[#761be6] transition-colors">Continue with Google</span>
        </button>

        {/* Footer Login Link */}
        <p className="text-center text-sm text-[#441851]/80 mt-3">
          {isSignup ? "Already have an account?" : "Don’t have an account?"} 
          <button type="button"
            className="cursor-pointer font-bold text-[#761be6] ml-1 hover:underline"
            onClick={() => {
              setIsSignup(!isSignup);
              setAuthError("");
            }}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>

      </div>
    </div>
  );
}