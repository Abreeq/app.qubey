"use client";

import { FaArrowLeft, FaCircleInfo, FaCircleUser } from "react-icons/fa6";
import { FaUserLock, FaMinusCircle, FaMapMarkerAlt, FaEnvelope, FaCheckCircle, FaRegCreditCard } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { PiShareNetworkBold } from "react-icons/pi";
import { FcGoogle } from "react-icons/fc";
import { RxCrossCircled } from "react-icons/rx";
import { BsPatchCheckFill } from "react-icons/bs";
import { LuCrown } from "react-icons/lu";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { status, update } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const [otpError, setOtpError] = useState("");
  const [formError, setFormError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [profileSuccess, setProfileSuccess] = useState("");
  const [unlinkSuccess, setUnlinkSuccess] = useState("");
  const [otpInfo, setOtpInfo] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");


  const inputRefs = useRef([]);  //For OTP


  // For adding the number in input of OTP
  const handleOTPChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // only numbers
    if (!value) return;

    setOtpError(""); // clear error

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

  // For Sending OTP
  const handleSendOTP = async () => {
    try {
      setResending(true);

      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setOtpError(data.error || "Failed to send OTP");
        setResending(false);
        return;
      }

      setOtpError("");
      setOtpInfo("Verification code sent to your email");
      autoClear(setOtpInfo);

    } catch (error) {
      setOtpError("Something went wrong. Try again.");
    } finally {
      setResending(false);
    }
  }

  // For verification of OTP
  const handleVerifyOTP = async () => {
    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: enteredOTP }),
      });

      const data = await res.json();

      if (!res.ok) {
        setOtpError(data.error || "Invalid verification code. Please try again.");
        setVerifying(false);
        return;
      }

      setProfile((prev) => ({
        ...prev,
        emailVerified: true,
      }));

      setOtpError("");
      setShowOTPModal(false);
      setOtp(["", "", "", "", "", ""]);
      setVerifying(false);

      await update();

      setOtpSuccess("Email verified successfully")
      autoClear(setOtpSuccess);

    } catch (err) {
      setOtpError("Something went wrong. Try again.");
    }
  };

  // For Loader
  useEffect(() => {
    if (!loading) {
      setLoadingProgress(100);
      return;
    }

    setLoadingProgress(0); // reset when loading starts

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) return prev;

        let increment;

        if (prev < 30) {
          increment = Math.random() * 8 + 2; // fast start
        }
        else if (prev < 60) {
          increment = Math.random() * 4 + 1; // medium
        }
        else {
          increment = Math.random() * 2; // slow end
        }

        return Math.min(prev + increment, 90);
      });
    }, 300); // faster updates

    return () => clearInterval(interval);
  }, [loading]);

  // For Clearing Sucess message
  const autoClear = (setter) => {
    setTimeout(() => setter(""), 2000);
  };

  // To get the Profile Data
  useEffect(() => {
    const load = async () => {
      if (status === "unauthenticated") {
        router.push("/auth");
        return;
      }

      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();

        if (!res.ok) {
          setAuthError(data.error || "Failed to load profile");
          setLoading(false);
          return;
        }

        setProfile(data);
        setName(data.name || "");
      } catch (err) {
        setAuthError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [status, router]);


  // To get Initials
  const getInitials = (name) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    }
    return "U";// fallback: User;
  };

  // For loading
  if (loading) {
    return (
      <section className="relative">
        {/* Skeleton background */}
        <div className="py-8 pr-1.5 max-w-5xl mx-auto space-y-8 sm:space-y-12 animate-pulse">
          {/* Header Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-center">
            <div className="space-y-3">
              <div className="h-8 sm:h-10 w-2/3 bg-gray-200 rounded-lg" />
              <div className="h-4 sm:h-5 w-1/2 bg-gray-200 rounded" />
            </div>

            <div className="flex justify-end">
              <div className="h-10 w-40 bg-gray-200 rounded-lg" />
            </div>
          </div>
          {/* Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Profile Card Skeleton */}
            <div className="col-span-1 bg-white/50 rounded-2xl border border-gray-200 overflow-hidden">

              {/* Top Banner */}
              <div className="h-32 bg-gray-200" />

              {/* Avatar */}
              <div className="flex justify-center -mt-12">
                <div className="w-24 h-24 rounded-full bg-gray-300 border-4 border-white" />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 text-center space-y-4">
                <div className="h-5 w-32 mx-auto bg-gray-200 rounded" />
                <div className="h-4 w-40 mx-auto bg-gray-200 rounded" />
                <div className="h-4 w-48 mx-auto bg-gray-200 rounded" />

                <div className="mt-4 p-3 bg-gray-100 rounded-xl space-y-2">
                  <div className="h-4 w-24 mx-auto bg-gray-200 rounded" />
                  <div className="h-3 w-40 mx-auto bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            {/* Profile Details Skeleton */}
            <div className="col-span-1 lg:col-span-2 bg-white/50 rounded-2xl border border-gray-200 p-4 sm:p-6 space-y-6">

              {/* Title */}
              <div className="h-6 w-48 bg-gray-200 rounded" />
              <div className="border-b border-gray-200" />

              {/* Inputs */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-10 w-full bg-gray-200 rounded-lg" />
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-10 w-full bg-gray-200 rounded-lg" />
                </div>

                {/* Email Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="h-6 w-40 bg-gray-200 rounded" />
                  <div className="h-8 w-28 bg-gray-200 rounded-lg" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-gray-200" />

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <div className="h-10 w-24 bg-gray-200 rounded-lg" />
                <div className="h-10 w-32 bg-gray-200 rounded-lg" />
              </div>
            </div>

          </div>
        </div>

        {/* Overlay generating message */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="bg-white border border-gray-100 flex flex-col items-center rounded-3xl shadow-xl p-8 text-center space-y-4 max-w-md w-full">
            {/* Heading */}
            <div className="w-full flex justify-between items-center mb-3">
              <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Loading Your Profile...
              </h2>
              <span className="text-sm font-medium text-gray-600 tabular-nums">{Math.floor(loadingProgress)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-[#761be6] to-[#441851] transition-all duration-500"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            {/* Description */}
            <p className="text-gray-600 font-medium">
              Fetching your account details, preferences, and security settings. <br />
              <span className="text-gray-500">This won't take long</span>
            </p>

            {/* Subtle bouncing dots */}
            <div className="flex justify-center gap-1">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // if there is no profile data
  if (!profile) {
    return (
      <main className="max-w-5xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
        <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="relative text-center space-y-4">
          <h2 className={`font-semibold text-2xl sm:text-3xl bg-linear-to-r ${authError ? "from-red-400 to-red-600" : "from-[#761be6] to-[#441851]"
            } bg-clip-text text-transparent`}>

            {authError ? authError : "Unable to Load Profile"}
          </h2>

          <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 max-w-xl mx-auto">
            We couldn’t retrieve your profile details right now. Please refresh the page
            or try again later.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => window.location.reload()}
              className="cursor-pointer rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] text-white
              px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] font-medium transition">
              Reload Page
            </button>

            <button onClick={() => router.push("/dashboard")}
              className="cursor-pointer font-medium px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <p className="text-sm sm:text-base font-medium mt-1">
            If the issue persists, please contact support.
          </p>
        </div>
      </main>
    );
  }

  // For Verification
  const isVerified = !!profile.emailVerified;

  // For Provider
  const provider = profile?.accounts?.[0]?.provider;
  const isGoogleUser = provider === "google";

  // For save Button
  const isChanged = name !== profile?.name;

  // For Saving Profile Details
  const saveProfile = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/user/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile");
        setSaving(false);
        return;
      }

      setProfile(data);
      await update(); // refresh session name
      setProfileSuccess("Profile updated successfully");
      autoClear(setProfileSuccess);
      setProfileError("");
      setSaving(false);
    } catch (error) {
      setProfileError("Network error");
    }
  };

  // For Unlinking Google Account
  const handleUnlink = async () => {
    try {
      if (!newPassword || !confirmPassword) {
        setFormError("Please fill all fields");
        return;
      }

      if (newPassword.length < 6) {
        setFormError("Password must be at least 6 characters");
        return;
      }

      if (newPassword !== confirmPassword) {
        setFormError("Passwords do not Match");
        return;
      }

      setUnlinkLoading(true);

      const res = await fetch("/api/auth/unlink/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // IMPORTANT (next-auth session)
        body: JSON.stringify({
          password: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to unlink account");
        return;
      }

      setFormError("");
      setNewPassword("");
      setConfirmPassword("");
      setUnlinkSuccess("Google account unlinked successfully");
      autoClear(setUnlinkSuccess);
      setShowPasswordModal(false);

      // refresh profile
      await update();

    } catch (err) {
      setFormError("Something went wrong. Try again.");
    } finally {
      setUnlinkLoading(false);
    }
  };

  // For Updating Password
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill all fields");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setUpdateLoading(true);

      const res = await fetch("/api/auth/password/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          password: newPassword,
          confirmPassword: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to update password");
        return;
      }

      setPasswordError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess("Password updated successfully");
      autoClear(setPasswordSuccess);

    } catch (err) {
      setPasswordError("Something went wrong. Try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <section className="py-8 pr-1.5 max-w-5xl mx-auto space-y-8 sm:space-y-12">
      {/* Page Heading */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 items-center">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
              Profile Settings
            </h1>
            <p className="sm:font-medium text-base sm:text-lg max-w-xl">
              Manage your personal information, account preferences, and security settings.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4 justify-start">
          <Link href="/dashboard"
            className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] 
                px-2 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
            <FaArrowLeft className="size-3 sm:size-4 text-white shrink-0" />
            <span className="md:font-medium text-white">Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="col-span-1 space-y-12 relative z-10 bg-white/50 overflow-hidden rounded-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200">
          <div className="relative flex justify-center">
            {/* Gradient top */}
            <div className="relative w-full" style={{ background: "linear-gradient(to right, #5e1dbf, #8b2bf0)", height: "8rem" }} />
            {/* Avatar */}
            <div className={`absolute rounded-full bg-white border-4 border-gray-100 backdrop-blur-3xl ${profile.image ? "p-1" : "p-0"}`} style={{ bottom: "-4rem" }}>
              {profile.image ? (
                <Image
                  src={profile.image || "/avatar.svg"}
                  alt="profile"
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />) : (
                <div className="w-25 h-25 rounded-full flex items-center justify-center text-white font-semibold 
                 bg-linear-to-r from-[#441851] to-[#761be6] text-2xl">
                  {getInitials(profile?.name)}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 text-center">
            {/* Name */}
            <h2 className="font-semibold text-lg sm:text-xl flex items-center justify-center gap-2">
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">{profile.name}</span>
              <BsPatchCheckFill className="text-[rgb(var(--light-purple))] shrink-0" />
            </h2>

            {/* Location */}
            <div className="flex items-center justify-center gap-2 text-gray-700 font-medium text-sm mt-3">
              <FaMapMarkerAlt className="text-purple-700" />
              <span>United Arab Emirates (UAE)</span>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center gap-2 text-gray-700 font-medium text-sm mt-1">
              <FaEnvelope className="text-purple-700" />
              <span>{profile.email}</span>
            </div>

            {/* Synced Profile Box */}
            <div className="mt-5 border border-purple-200 bg-purple-50 rounded-xl p-3">
              <div className="flex items-center justify-center gap-2 text-purple-700 font-medium text-sm mb-1">
                <FaCircleInfo className="text-purple-700 shrink-0" />
                <span>Synced Profile</span>
              </div>
              <p className="text-purple-600 text-xs">
                Your profile picture is managed by your login provider.
              </p>
            </div>

          </div>

        </div>

        {/* Profile Details */}
        <div className="col-span-1 lg:col-span-2 relative z-10 bg-white/50 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:px-6 sm:py-8">
          {/* Header */}
          <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-3">
            <FaCircleUser className="size-5 text-[rgb(var(--light-purple))]" />
            <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Profile Information</span>
          </h2>
          <div className="border-b border-purple-300 my-3"></div>

          <div className="space-y-3 sm:space-y-5">
            {/*Name */}
            <div>
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Full Name</label>
              <input type="text" placeholder="Enter your full name" value={name}
                onChange={(e) => setName(e.target.value)} onFocus={() => setProfileError("")}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
            </div>

           {/* Email & Organisation */}
            <div className="flex items-center gap-6">
              <div className="w-full">
                <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Email Address</label>
                <input type="text" value={profile.email || ""} readOnly
                  className={`cursor-not-allowed w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                />
              </div>

              <div className="w-full">
                <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Organisation Name</label>
                <input type="text" value={profile?.organizations?.name || ""} readOnly
                  className={`cursor-not-allowed w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                />
              </div>
            </div>

            {/* Email Status */}
            <div className="flex items-center justify-between sm:mt-6">
              <div>
                <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Email Status: {" "}</label>
                {
                  isVerified ? (
                    <span className={`text-sm font-medium text-green-800 border border-green-300 bg-green-100 shadow-sm rounded-lg px-3 py-1.5 transition-all duration-300`}>
                      Verified
                    </span>
                  ) : (
                    <span className={`text-sm font-medium text-red-800 border border-red-300 bg-red-100 shadow-sm rounded-lg px-3 py-1.5 transition-all duration-300`}>
                      Not Verified
                    </span>
                  )
                }
              </div>

              {
                !isVerified && (
                  <button type="button"
                    onClick={() => {
                      setShowOTPModal(true);
                      handleSendOTP();
                    }}
                    className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6]
                 hover:from-[#5e1dbf] hover:to-[#8b2bf0] ml-4 px-3 py-1.5 transition-all duration-300">
                    <span className="text-sm sm:text-base md:font-medium text-white">Verify Email</span>
                  </button>
                )
              }

              {otpSuccess && (
                <p className="text-white bg-green-600 px-3 py-1.5 inline-block rounded-md text-sm ml-2 capitalize font-medium">
                  {otpSuccess}
                </p>
              )}

            </div>

            {profileSuccess && (
              <p className="text-white bg-green-600 px-3 py-2 inline-block rounded-md text-sm ml-2 capitalize font-medium">
                {profileSuccess}
              </p>
            )}

            {profileError && (
              <p className="text-red-500 text-sm mt-2 ml-2 font-medium capitalize">
                {profileError}
              </p>
            )}

            <div className="border-b border-purple-300 my-3 md:my-6"></div>

            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => setName(profile?.name || "")}
                className="cursor-pointer rounded-lg bg-slate-100/80 border border-gray-300 shadow-md
                 hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 md:px-4 py-2 transition-all duration-300">
                <span className="text-sm sm:text-base md:font-medium">Clear</span>
              </button>

              <button type="button" onClick={saveProfile} disabled={!isChanged || saving}
                className="disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6]
                  hover:from-[#5e1dbf] hover:to-[#8b2bf0] px-3 md:px-4 py-2 transition-all duration-300">
                {saving ? (
                  <>
                    <p className="text-sm sm:text-base md:font-medium text-white flex items-center gap-2">
                      Saving...
                      <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    </p>
                  </>
                ) : (
                  <span className="text-sm sm:text-base md:font-medium text-white">Save Changes</span>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Account Setting */}
      <div className="relative z-10 overflow-hidden bg-white/50 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-3">
          <FaUserLock className="size-5 text-[rgb(var(--light-purple))]" />
          <span className="relative bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Security Settings</span>
        </h2>
        <p className="relative text-sm sm:text-base font-medium">Manage your account security and authentication settings.</p>
        <div className="border-b border-purple-300 my-4"></div>

        {isGoogleUser ? (
          <div className="bg-purple-50 border border-purple-200 rounded-xl py-6 px-4 text-center">
            <p className="font-medium text-sm">
              Your account is secured via Google login.
            </p>

            <p className="text-sm text-purple-600 mt-1">
              To set a password, unlink Google first.
            </p>

            <button onClick={() => setShowPasswordModal(true)}
              className="cursor-pointer mt-3 text-sm text-white rounded-lg bg-linear-to-r from-[#441851] to-[#761be6]
              hover:from-[#5e1dbf] hover:to-[#8b2bf0] px-3 py-2 transition-all duration-300"
            >
              Set Password & Unlink
            </button>
          </div>
        ) : (
          <div className="relative space-y-3 sm:space-y-5">
            {/* Current Password */}
            <div>
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Current Password</label>
              <input type="password" placeholder="Enter your current password" value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} onFocus={() => setPasswordError("")}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">New Password</label>
              <input type="password" placeholder="Enter your new password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} onFocus={() => setPasswordError("")}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Confirm Password</label>
              <input type="password" placeholder="Re enter your new password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} onFocus={() => setPasswordError("")}
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm mt-2 ml-2 font-medium text-left capitalize">
                {passwordError}
              </p>
            )}

            <div className="border-b border-purple-300 my-4"></div>

            {passwordSuccess && (
              <p className="text-white bg-green-600 inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm ml-2 capitalize font-medium text-left">
                <FaCheckCircle />
                {passwordSuccess}
              </p>
            )}

            <div className="flex items-center justify-end gap-4">
              <button type="button" onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setPasswordError("");
              }}
                className="cursor-pointer rounded-lg bg-slate-100/80 border border-gray-300 shadow-md
                 hover:bg-[#761be6] hover:text-white hover:scale-95 px-3 md:px-4 py-2 transition-all duration-300">
                <span className="text-sm sm:text-base md:font-medium">Clear</span>
              </button>

              <button type="button" onClick={handlePasswordUpdate} disabled={updateLoading}
                className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:from-[#441851] disabled:hover:to-[#761be6] cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6]
                  hover:from-[#5e1dbf] hover:to-[#8b2bf0] px-3 md:px-4 py-2 transition-all duration-300">
                <span className="text-sm sm:text-base md:font-medium text-white">
                  {updateLoading ? (
                    <>
                      <p className="font-medium flex items-center gap-2">
                        Updating...
                        <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                      </p>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* Google Setting */}
      <div className="overflow-hidden relative z-10 bg-white/50 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
          <PiShareNetworkBold className="size-5 text-[rgb(var(--light-purple))]" />
          <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Social Login</span>
        </h2>
        <p className="relative text-sm sm:text-base font-medium">Manage connected accounts and unlink your social login providers.</p>
        <div className="relative border-b border-purple-300 my-4"></div>

        <div className="relative space-y-3 sm:space-y-5">
          <div className="flex items-center justify-between">
            {/* google icon */}
            <div className="flex items-center gap-3">
              <div className="shrink-0 relative flex h-12 w-12 items-center justify-center rounded-full shadow-xl bg-white border border-gray-200">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                <FcGoogle className="relative text-2xl shrink-0" />
              </div>
              <p className="text-sm sm:text-base font-medium">Google</p>
            </div>

            {/* status */}
            {
              isGoogleUser ? (
                <p className="flex items-center gap-2">
                  <FaCheckCircle className="size-6 text-green-600 shrink-0" />
                  <span className="text-sm sm:text-base font-medium">Enabled</span>
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <FaMinusCircle className="size-6 text-red-600 shrink-0" />
                  <span className="text-sm sm:text-base font-medium">Disabled</span>
                </p>
              )
            }

            {/* Unlink button */}
            {isGoogleUser && (
              <button type="button" onClick={() => setShowPasswordModal(true)}
                className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6]
                hover:from-[#5e1dbf] hover:to-[#8b2bf0] px-3 md:px-4 py-2 transition-all duration-300">
                <span className="text-sm sm:text-base md:font-medium text-white">Unlink</span>
              </button>
            )}

          </div>
        </div>

        {unlinkSuccess && (
          <p className="text-green-600 text-sm mt-3 ml-2 font-medium text-left capitalize">
            {unlinkSuccess}
          </p>
        )}

      </div>

      {/* Billing Plan */}
      <div className="relative z-10 overflow-hidden bg-white/50 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Header */}
        <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-3">
          <FaRegCreditCard className="size-5 text-[rgb(var(--light-purple))]" />
          <span className="relative bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Billing & Subscription</span>
        </h2>
        <p className="relative text-sm sm:text-base font-medium">Manage your account subscription & billings.</p>

        <div className="border-b border-purple-300 my-4"></div>

        {/* Subscription and montly plan */}
        <div className="rounded-lg bg-slate-100/80 border border-gray-300 py-2.5 px-3">
          <div className="relative flex items-center justify-between">
            <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Current Plan {" "}</p>
            {/* <button className="rounded-lg border border-purple-300 bg-[#761be6] text-white px-3 py-1.5 
                flex items-center gap-2">
              <span className="text-sm font-medium">Starter</span>
            </button> */}

            <button className="rounded-lg border border-purple-300 bg-[#761be6] text-white px-3 py-1.5 
            flex items-center gap-2">
              <LuCrown className="shrink-0" />
              <span className="text-sm font-medium">Pro</span>
            </button>
          </div>

          <div className="border-b border-purple-300 my-4"></div>

          <div className="relative flex items-center justify-between">
            <div>
              <span className="text-sm ml-2 sm:ml-1">Billing Cycle</span>
              <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Monthly</p>
            </div>

            <div>
              <span className="text-sm ml-2 sm:ml-1">Next Billing Date</span>
              <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">20-April-2026</p>
            </div>
          </div>
        </div>

        {/* this or the button */}
        <div className="mt-3 sm:mt-5">
          <p className="text-sm sm:text-base font-medium ml-2 sm:ml-1">Upgrade to Unlock:</p>
          <ul className="mt-3 space-y-2">
            {["Unlimited assessments", "Full reports", "AI recommendations", "Team collaboration"]
              .map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <FaCheckCircle className="mt-1 text-purple-500" />
                  <p className="text-sm sm:text-base">{item}</p>
                </li>
              ))}
          </ul>
        </div>

        <button className="mt-3 sm:mt-5 cursor-pointer w-full rounded-lg bg-slate-100/80 border border-purple-300 shadow-md hover:bg-[#761be6] hover:text-white hover:scale-95 
          px-2 md:px-4 py-2 flex items-center justify-center gap-2 transition-all duration-300">
          <FaRegCreditCard className="size-3 sm:size-4 shrink-0" />
          <span className="md:font-medium">Manage Billing/Download Invoice</span>
        </button>

        <div className="border-b border-purple-300 my-4"></div>

        <button className="cursor-pointer w-full rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] 
          px-2 md:px-4 py-2 flex items-center justify-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
          <LuCrown className="size-3 sm:size-4 text-white shrink-0" />
          <span className="md:font-medium text-white">Upgrade to Pro</span>
        </button>



      </div>


      {/* Pop up Modal for OTP */}
      {showOTPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-md px-6 pb-6 pt-9 text-center">
            <RxCrossCircled onClick={() => {
              setShowOTPModal(false);
              setOtp(["", "", "", "", "", ""]);
              setOtpError("");
            }}
              className="size-7 text-purple-600 shrink-0 cursor-pointer 
             absolute top-4 right-4 hover:scale-95 transition-all"/>

            {/* Icon */}
            <div className="inline-flex items-center justify-center mb-2 rounded-full size-8 border-purple-200 bg-purple-100">
              <IoMail className="size-5 text-purple-700" />
            </div>

            {/* Heading */}
            <h2 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
              Check Your Email
            </h2>

            {/* Subtext */}
            <p className="text-gray-700 text-sm mt-1 mb-6">
              We sent a verification code to your email.
            </p>

            {/* OTP Inputs */}
            <div onPaste={handlePaste}
              className={`flex justify-center gap-2 ${otpError ? "animate-shake" : ""}`}>
              {otp.map((digit, index) => (
                <input key={index} type="text" maxLength={1} value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleOTPChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`w-12 h-12 text-center text-lg font-semibold rounded-lg bg-slate-100/80 border outline-none transition-all ${otpError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:border-[#761be6] focus:ring-[#761be6]/20"
                    }`}
                />
              ))}
            </div>

            {/* OTP Error */}
            {otpError && (
              <p className="text-red-500 text-sm mt-2 font-medium capitalize">
                {otpError}
              </p>
            )}

            {/* Subtext */}
            <p className="text-gray-700 text-sm mt-2 mb-6">
              Enter the 6-digit code from your email
            </p>

            {/* Verify button */}
            <button onClick={handleVerifyOTP} disabled={verifying}
              className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:from-[#441851] disabled:hover:to-[#761be6] cursor-pointer w-full px-4 py-2.5 rounded-xl bg-linear-to-r from-[#441851] to-[#761be6] text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]">
              {verifying ? (
                <>
                  <p className="font-medium flex items-center justify-center gap-2">
                    Verifying...
                    <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                  </p>
                </>
              ) : (
                "Verify"
              )
              }
            </button>

            {/* Resend */}
            <p className="text-sm text-gray-600 mt-4">
              Didn’t receive code?{" "}
              <button disabled={resending} className=" disabled:opacity-60 cursor-pointer text-purple-600 font-medium hover:underline"
                onClick={() => {
                  setOtp(["", "", "", "", "", ""]);
                  setOtpError("");
                  handleSendOTP();
                }} >
                {resending ? "Sending..." : "Resend"}
              </button>
            </p>

            {otpInfo && (
              <p className="text-green-600 text-sm mt-1 font-medium capitalize">
                {otpInfo}
              </p>
            )}

            <div className="mt-5 border border-purple-200 bg-purple-50 rounded-xl p-3">
              <div className="flex items-center justify-center gap-2 text-purple-700 font-medium text-sm mb-1">
                <FaCircleInfo className="text-purple-700 shrink-0" />
                <span>Having trouble?</span>
              </div>
              <p className="text-purple-600 text-xs">
                Check your spam folder or try requesting a new code.
              </p>
            </div>

          </div>
        </div>
      )
      }

      {/* Pop up Modal for Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-md px-6 pb-6 pt-12 text-center">
            <RxCrossCircled onClick={() => {
              setShowPasswordModal(false);
              setFormError("");
              setNewPassword("");
              setConfirmPassword("");
            }}
              className="size-7 text-purple-600 shrink-0 cursor-pointer 
             absolute top-4 right-4 hover:scale-95 transition-all"/>
            {/* Heading */}
            <h2 className="font-semibold text-xl sm:text-2xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
              Set Password to Continue
            </h2>

            {/* Description */}
            <p className="text-gray-700 text-sm mt-1 mb-6">
              To unlink your Google account, please set a password for your account.
            </p>

            {/* Inputs */}
            <div className="space-y-4">
              {/* New Password */}
              <div>
                <label className="flex text-sm sm:text-base font-medium ml-2 sm:ml-1">New Password</label>
                <input type="password" value={newPassword} onFocus={() => setFormError("")}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/80 border border-gray-300 placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="flex text-sm sm:text-base font-medium ml-2 sm:ml-1">Confirm Password</label>
                <input
                  type="password" value={confirmPassword} onFocus={() => setFormError("")}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-2 mt-1 rounded-lg bg-slate-100 border border-gray-300 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/20 outline-none"
                />
              </div>

            </div>

            {formError && (
              <p className="text-red-500 text-sm mt-2 font-medium text-left">
                {formError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6">
              <button onClick={() => {
                setShowPasswordModal(false);
                setNewPassword("");
                setConfirmPassword("");
                setFormError("")
              }}
                className="cursor-pointer px-4 py-2 rounded-lg bg-slate-100/80 border border-gray-300 shadow-md
                hover:bg-[#761be6] hover:text-white transition-all duration-300"
              >
                Clear
              </button>

              <button onClick={handleUnlink} disabled={unlinkLoading}
                className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:from-[#441851] disabled:hover:to-[#761be6] cursor-pointer px-4 py-2 rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]"
              >
                {unlinkLoading ? (
                  <>
                    <p className="font-medium flex items-center gap-2">
                      Processing...
                      <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                    </p>
                  </>
                ) : (
                  "Continue"
                )}
              </button>

            </div>

          </div>
        </div>
      )
      }
    </section>
  );
}

