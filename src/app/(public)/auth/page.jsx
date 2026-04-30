"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BsShieldFillExclamation } from "react-icons/bs";
import { RxCrossCircled } from "react-icons/rx";
import { IoMail } from "react-icons/io5";
import { FaCheckCircle } from "react-icons/fa";

import { useRef } from "react";

export default function AuthPage() {
  const { update, data: session } = useSession(); // 👈 IMPORTANT
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [errorMsg, setErrorMsg] = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=success

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const inputRefs = useRef([]);  //For OTP

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("verified") === "true") {
      // Trigger JWT refresh
      update();

      // Clean URL immediately
      router.replace("/auth");
    }
  }, [update, router]);

  useEffect(() => {
    if (
      session?.user?.emailVerified &&
      !sessionStorage.getItem("emailVerifiedToast")
    ) {
      toast.success("Email verified successfully!");
      sessionStorage.setItem("emailVerifiedToast", "true");
    }
  }, [session]);


  //  For Validation
  const conditions = {
    name: [{ required: true, msg: "Please enter your full name" }, { length: 3, msg: "Name should be greater than 3 Characters" }],
    email: [{ required: true, msg: "Please enter your email" }, { pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, msg: "Please enter a valid email address" }],
    password: [{ required: true, msg: "Please enter your password" }, { length: 6, msg: "Password must be at least 6 characters" }],
  }

  const validate = (data, rules = conditions) => {
    const errData = {};
    Object.entries(data).forEach(([key, value]) => {
      rules[key]?.some((condition) => {
        if (condition.required && !value) {
          errData[key] = condition.msg;
          return true;
        }
        if (condition.length && value.length < condition.length) {
          errData[key] = condition.msg;
          return true;
        }
        if (condition.pattern && !condition.pattern.test(value)) {
          errData[key] = condition.msg;
          return true;
        }
      });
    });
    setErrorMsg(errData);
    return errData;
  };


  // For Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Determine which fields to validate
      const validationData = isSignup ? { name, email, password } : { email, password };
      const validatedData = validate(validationData, isSignup ? conditions :
        { email: conditions.email, password: conditions.password });

      if (Object.keys(validatedData).length) {
        setLoading(false);
        return;
      }

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
          setAuthError(data.error || "Signup failed");
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
      setAuthError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      setAuthError("Something went wrong with Google login.");
      setGoogleLoading(false);
    }
  };

  // For Sending OTP
  const handleSendOTP = async () => {

    if (!email) {
      setForgotError("Email Address is Required");
      return;
    }

    try {
      setForgotLoading(true);

      const res = await fetch("/api/auth/password/forgot/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setForgotError(data.error || "Failed to send OTP");
        return;
      }

      setStep(2);

    } catch (err) {
      setForgotError("Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };

  // For adding the number in input of OTP
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only numbers
    if (!value) return;

    setForgotError(""); // clear error

    const newOtp = [...otp];
    newOtp[index] = value[0]; // only 1 digit
    setOtp(newOtp);

    // move to next input
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // For when user clears OTP
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // move to previous box
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // For copyPaste the OTP 
  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    inputRefs.current[newOtp.length - 1]?.focus();
  };


  // For Updating/Resetting Password
  const handleResetPassword = async () => {
    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      setForgotError("Please enter the complete 6-digit code");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be atleast 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setForgotError("");
    setPasswordError("");

    try {
      setForgotLoading(true);

      const res = await fetch("/api/auth/password/forgot/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: enteredOTP,
          password: newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to reset password");
        return;
      }

      setStep(3);
    } catch (err) {
      setPasswordError("Something went wrong");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full relative flex items-center justify-center bg-[#f8fafc] overflow-hidden -mt-19">
      {/* --- Background Blobs --- */}
      <div className="absolute top-[-10%] left-[-10%] size-160 bg-[#761be6] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute bottom-[-10%] right-[-10%] size-160 bg-[#00A4EA] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
      <div className="absolute top-[5%] left-[30%] size-160 bg-[#6670CC] rounded-full mix-blend-multiply filter blur-[60px] opacity-30"></div>

      {/* --- Glass Card --- */}
      <div className={`${isSignup ? "mt-16 px-4 sm:px-6 py-3 sm:py-5" : "mt-12 p-4 sm:p-6"} custom-container relative z-10 w-[88%] sm:w-full max-w-sm sm:max-w-lg bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.16)] border border-white/60`}>

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
        <form onSubmit={handleSubmit}>
          {/* FULL NAME (SIGNUP ONLY) */}
          {isSignup && (
            <div className="mb-3 sm:mb-4">
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Full Name</label>
              <input
                type="text"
                placeholder="john doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setErrorMsg((prev) => ({ ...prev, name: "" }))}
                className={`w-full px-3 sm:px-4 py-1.5 mt-1 text-sm sm:text-base rounded-4xl bg-white/80 border ${errorMsg.name ? "border-red-500" : "border-white"} placeholder-[#441851]/40 focus:bg-white/60 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
              {errorMsg.name && <p className="text-red-600 text-sm mt-1 -mb-3 ml-2">{errorMsg.name}</p>}
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
                if (authError) setAuthError("");
              }}
              onFocus={() => setErrorMsg((prev) => ({ ...prev, email: "" }))}
              className={`w-full px-3 sm:px-4 ${isSignup ? "py-1.5": "py-1.5 sm:py-2"} mt-1 text-sm sm:text-base rounded-4xl bg-white/80 border ${errorMsg.email ? "border-red-500" : "border-white"} placeholder-[#441851]/40 focus:bg-white/60 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
            />
            {errorMsg.email && <p className="text-red-600 text-sm mt-1 -mb-3 ml-2 capitalize">{errorMsg.email}</p>}
          </div>

          {/* Password */}
          <div className="mt-3 sm:mt-4">
            <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Password</label>
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError("");
              }}
              onFocus={() => setErrorMsg((prev) => ({ ...prev, password: "" }))}
              className={`w-full px-3 sm:px-4 ${isSignup ? "py-1.5": "py-1.5 sm:py-2"} mt-1 text-sm sm:text-base rounded-4xl bg-white/80 border ${errorMsg.password ? "border-red-500" : "border-white"} placeholder-[#441851]/40 focus:bg-white/60 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
            />
            {errorMsg.password &&
              <p className="text-red-600 text-sm mt-1 mb-0 sm:-mb-3 ml-2 capitalize">{errorMsg.password}</p>
            }
          </div>

          {!isSignup && (
            <button type="button"
              onClick={() => {
                setShowForgot(true);
                setStep(1);
                setForgotError("");
              }}
              className="mt-3 w-full text-right cursor-pointer text-[#761be6] font-medium text-sm hover:underline"
            >
              Forgot Password?
            </button>
          )}

          {/* Submit Button */}
          <button disabled={loading || googleLoading}
            className={`disabled:opacity-60 w-full mt-3 sm:mt-5 ${isSignup ? "py-2": "py-2 sm:py-2.5"} rounded-4xl cursor-pointer bg-linear-to-r from-[#441851] to-[#761be6] hover:from-[#5e1dbf] hover:to-[#8b2bf0] text-white font-semibold transition-colors`}>
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
        <button disabled={loading || googleLoading} onClick={handleGoogleSignIn}
          className="disabled:bg-white/30 cursor-pointer w-full py-2 sm:py-2.5 rounded-4xl bg-white/80 shadow-md border border-white hover:bg-white/60 font-medium flex items-center justify-center gap-3 transition-all group">
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
          <span className="text-sm sm:text-base group-hover:text-[#761be6] transition-colors">
            {googleLoading ? "Please wait..." : "Continue with Google"}
          </span>
        </button>

        {/* Footer Login Link */}
        <p className="text-center text-sm text-[#441851]/80 mt-4">
          {isSignup ? "Already have an account?" : "Don’t have an account?"}
          <button type="button"
            className="cursor-pointer font-medium text-[#761be6] ml-1 hover:underline"
            onClick={() => {
              setIsSignup(!isSignup);
              setAuthError("");
              setErrorMsg({})
            }}
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>

      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md px-6 pb-6 pt-12 text-center relative">

            {/* CLOSE */}
            <RxCrossCircled onClick={() => {
              setShowForgot(false);
              setForgotError("");
              setPasswordError("");
              setEmail("");
              setNewPassword("");
              setConfirmPassword("");
              setOtp(["", "", "", "", "", ""]);
              setStep(1);
            }}
              className="size-7 text-purple-600 shrink-0 cursor-pointer 
             absolute top-4 right-4 hover:scale-95 transition-all"/>

            {/* STEP 1 */}
            {step === 1 && (
              <>
                {/* Heading */}
                <h2 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  Reset your password
                </h2>

                {/* Description */}
                <p className="text-gray-700 text-sm mt-1 mb-6">
                  Enter your email to receive a 6-digit verification code
                </p>

                <div>
                  <label className="flex text-sm sm:text-base font-medium ml-2 sm:ml-1">Email Address</label>
                  <input type="email" value={email} onFocus={() => setForgotError("")}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/60 border ${forgotError ? "border-red-500" : "border-gray-300"} placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                  />
                </div>

                {forgotError && (
                  <p className="text-red-500 text-sm mt-2 ml-1 text-left capitalize">{forgotError}</p>
                )}

                <button onClick={handleSendOTP} disabled={forgotLoading}
                  className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:from-[#441851] disabled:hover:to-[#761be6] mt-3 sm:mt-5 w-full cursor-pointer px-4 py-2 rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]"
                >
                  {forgotLoading ? (
                    <>
                      <p className="font-medium flex items-center justify-center gap-2">
                        Sending...
                        <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                      </p>
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <div className="inline-flex items-center justify-center mb-2 rounded-full size-8 border-purple-200 bg-purple-100">
                  <IoMail className="size-5 text-purple-700" />
                </div>

                {/* Heading */}
                <h2 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  Check Your Email
                </h2>

                {/* Description */}
                <p className="text-gray-700 text-sm mt-1 mb-6">
                  We have sent a verification code to {email}
                </p>


                {/* OTP Inputs */}
                <div onPaste={handlePaste}
                  className={`flex justify-center gap-2 ${forgotError ? "animate-shake" : ""}`}>
                  {otp.map((digit, index) => (
                    <input key={index} type="text" maxLength={1} value={digit}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-12 h-12 text-center text-lg font-semibold rounded-lg bg-slate-100/60 border outline-none transition-all ${forgotError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-300 focus:border-[#761be6] focus:ring-[#761be6]/20"
                        }`}
                    />
                  ))}
                </div>

                {/* OTP Error */}
                {forgotError && (
                  <p className="text-red-500 text-sm mt-2 capitalize">
                    {forgotError}
                  </p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="h-px bg-[rgb(var(--brand-black))]/10 flex-1"></div>
                  <span className="text-xs font-medium text-[rgb(var(--brand-black))]/50 uppercase tracking-wide">Set New Password</span>
                  <div className="h-px bg-[rgb(var(--brand-black))]/10 flex-1"></div>
                </div>

                <input type="password" value={newPassword} onFocus={() => setPasswordError("")}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/60 border ${passwordError ? "border-red-500" : "border-gray-300"} placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                />

                <input type="password" value={confirmPassword} onFocus={() => setPasswordError("")}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-3 text-sm sm:text-base rounded-lg bg-slate-100/60 border ${passwordError ? "border-red-500" : "border-gray-300"} placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                />

                {passwordError && (
                  <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                )}

                <button onClick={handleResetPassword} disabled={forgotLoading}
                  className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:from-[#441851] disabled:hover:to-[#761be6] mt-3 sm:mt-5 w-full cursor-pointer px-4 py-2 rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]"
                >
                  {forgotLoading ? (
                    <>
                      <p className="font-medium flex items-center justify-center gap-2">
                        Resetting...
                        <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                      </p>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="inline-flex items-center justify-center mb-3 rounded-full size-16 border-purple-200 bg-purple-100">
                  <FaCheckCircle className="size-10 text-purple-700" />
                </div>

                {/* Heading */}
                <h2 className="font-semibold text-xl">
                  All Done!
                </h2>

                <h2 className="text-xl sm:text-[22px] font-semibold text-green-600 mb-2">
                  Password Updated Successfully
                </h2>

                {/* Description */}
                <p className="text-gray-700 text-sm mt-1 mb-5">
                  You can now login with your new password.
                </p>

                <button onClick={() => {
                  setShowForgot(false);
                  setStep(1);
                  setForgotError("");
                  setPasswordError("");
                  setEmail("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setOtp(["", "", "", "", "", ""]);
                }}
                  className="w-full cursor-pointer px-4 py-2 rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]"
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}