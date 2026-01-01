"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { update, data: session } = useSession(); // 👈 IMPORTANT
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
        toast.error(result.error);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {isSignup ? "Create an Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* FULL NAME (SIGNUP ONLY) */}
          {isSignup && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="my-4 text-center text-gray-400">OR</div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full border py-2 rounded"
        >
          Continue with Google
        </button>

        {/* TOGGLE */}
        <p className="text-center text-sm mt-4">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}
          <button
            type="button"
            className="ml-1 text-blue-600"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
