"use client"
import { HiUserAdd } from "react-icons/hi";
import { HiUsers, HiClipboardDocumentCheck, HiDocumentChartBar } from "react-icons/hi2";
import { FaUserCheck } from "react-icons/fa";
import { LuSearch } from "react-icons/lu";
import { RxCrossCircled } from "react-icons/rx";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addNotification } from "@/lib/notification";


export default function TeamPage() {
  const [teamStats, setTeamStats] = useState({});
  const [members, setMembers] = useState([]);
  const [userModel, setUserModel] = useState(false);
  const [userEmail, setUserEmail] = useState("")
  // For Filter & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState(null);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [addLoading, setAddLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);

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

  // To get the Data
  useEffect(() => {
    loadTeamData();
  }, []);


  const loadTeamData = async () => {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setError("FORBIDDEN");
        } else {
          setError(data.error || "Failed to load team data");
        }
        return;
      }

      setTeamStats(data.stats);
      setMembers(data.members);
    } catch (err) {
      setError("Something went wrong while loading team data.");
    } finally {
      setLoading(false);
    }
  };

  // For Filter
  const filteredMembers = members.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });


  // To get Initials
  const getInitials = (name) => {
    if (name) {
      return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
    }
    return "U";// fallback: User;
  };

  // For Adding New Member
  const handleAddMember = async () => {
    if (!userEmail) {
      setAddError("Email Address is Required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(userEmail.trim())) {
      setAddError("Please enter a valid email address");
      return;
    }

    try {
      setAddLoading(true);
      setAddError("");
      setAddSuccess("");

      const res = await fetch("/api/organisation/add-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error || "Failed to add member");
        return;
      }

      //update UI instantly
      await loadTeamData();
      
      // For Notification
      addNotification({
        title: "New team member added",
        message: `${userEmail} has been added successfully`,
        link: "/team",
      });

      setAddLoading(false);

      setAddSuccess("Team member added successfully");
      setUserEmail("");

      setTimeout(() => {
        setAddSuccess("");
        setUserModel(false);
      }, 700);

    } catch (err) {
      setAddError("Something went wrong. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  // For Removing Access
  const handleRemoveAccess = async (userId) => {
    try {
      setActionLoading(userId);
      setActionError(null);

      const res = await fetch("/api/team/remove", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError({
          userId,
          message: data.error || "Failed to remove access",
        });

        setTimeout(() => {
          setActionError(null);
        }, 1400);

        return;
      }

      await loadTeamData();

      // To get the Name
      const member = members.find((u) => u.id === userId);

      addNotification({
        title: "Access removed",
        message: `${member?.name || "Team member"} access was removed`,
        link: "/team",
      });

    } catch (err) {
      setActionError({
        userId,
        message: "Something went wrong. Please try again.",
      });

      setTimeout(() => {
        setActionError(null);
      }, 1400);

    } finally {
      setActionLoading(null);
    }
  };

  // For Restoring Access
  const handleRestoreAccess = async (userId) => {
    try {
      setActionLoading(userId);
      setActionError("");

      const res = await fetch("/api/team/restore", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setActionError({
          userId,
          message: data.error || "Failed to restore access",
        });

        setTimeout(() => {
          setActionError(null);
        }, 1400);

        return;
      }

      await loadTeamData();

      // To get the Name
      const member = members.find((u) => u.id === userId);

      addNotification({
        title: "Access restored",
        message: `${member?.name || "Team member"} access was restored`,
        link: "/team",
      });

    } catch (err) {
      setActionError({
        userId,
        message: "Something went wrong. Please try again.",
      });

      setTimeout(() => {
        setActionError(null);
      }, 1400);

    } finally {
      setActionLoading(null);
    }
  };


  // For Forbidden Error
  if (error === "FORBIDDEN") {
    return (
      <main className="max-w-5xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-10">

        <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative text-center space-y-5">

          <h2 className="font-semibold text-2xl sm:text-3xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
            Access Restricted
          </h2>

          <p className="text-base sm:text-lg text-gray-700 font-medium max-w-2xl mx-auto">
            You do not have permission to access the Team Management page.
          </p>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Only organization owners can manage team members, permissions, and access controls.
          </p>

          <div className="flex justify-center">
            <Link
              href="/dashboard"
              className="rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white px-5 py-2.5 hover:from-[#5e1dbf] hover:to-[#8b2bf0] font-medium transition"
            >
              Back to Dashboard
            </Link>
          </div>

        </div>
      </main>
    );
  }

  // For Error
  if (error) {
    return (
      <main className="max-w-7xl mx-auto mt-12 relative overflow-hidden rounded-2xl bg-linear-to-tr from-purple-100 via-white to-white px-6 py-8">
        <div className="absolute top-4 right-4 w-84 h-84 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative pb-1 sm:pb-6">
          <div className="text-center space-y-4">
            <h2 className={`font-semibold capitalize text-2xl sm:text-3xl bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent`}>
              Oops! Unable to Load Team Data
            </h2>
            <p className="text-base sm:text-lg text-gray-700 font-medium mt-1 max-w-3xl mx-auto">
              We couldn’t fetch your team members right now.
            </p>
            <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 inline-block px-3 py-2 rounded-lg">
              {error}
            </p>
            <p className="text-sm sm:text-base font-medium mt-1">
              Try refreshing the page or come back later.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => window.location.reload()}
                className="cursor-pointer rounded-lg bg-linear-to-r from-[#441851] to-[#761be6] text-white
                  px-4 py-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] font-medium transition">
                Retry
              </button>

              <Link href="/dashboard"
                className="font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go Back to Dashboard
              </Link>
            </div>

            <p className="text-sm sm:text-base font-medium mt-1">
              If the issue persists, please contact support.
            </p>

          </div>
        </div>
      </main>
    )
  }

  // loading state
  if (loading) {
    return (
      <section className="relative">
        {/* Skeleton background */}
        <div className="pt-12 pb-8 space-y-7 sm:space-y-12 pr-1.5 max-w-7xl mx-auto">
          {/* ===== Page Heading Skeleton ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-center">
            <div className="space-y-3">
              <div className="h-8 sm:h-10 w-3/4 rounded-lg bg-gray-200" />
              <div className="h-4 sm:h-5 w-2/3 rounded bg-gray-200" />
            </div>

            <div className="flex flex-col items-end gap-4">
              <div className="flex gap-3">
                <div className="h-9 w-36 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>

          {/* ===== Cards Skeleton ===== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-full rounded-3xl border border-gray-200 bg-white/50 p-4 sm:p-5 space-y-4"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded bg-gray-200" />
                  <div className="h-5 w-32 rounded bg-gray-200" />
                </div>

                <div className="h-px w-full bg-gray-200" />

                {/* Main Value */}
                <div className="h-16 w-20 rounded bg-gray-200" />

                {/* Description */}
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-gray-200" />
                  <div className="h-3 w-5/6 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>

          {/* ===== Summary Skeleton ===== */}
          <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white px-6 pt-8 pb-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-2">
                <div className="h-5 w-48 rounded bg-gray-200" />
                <div className="h-4 w-64 rounded bg-gray-200" />
              </div>
              <div className="flex items-end flex-wrap gap-6">
                <div className="h-8 w-24 rounded bg-gray-200" />
                <div className="h-7 w-48 rounded bg-gray-200" />
              </div>
            </div>

            <div className="h-px w-full bg-gray-200" />

            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
          </div>

          {/* Blur Overlay */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 animate-pulse" />

          {/* Overlay generating message */}
          <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className="bg-white border border-gray-100 flex flex-col items-center rounded-3xl shadow-xl p-8 text-center space-y-4 max-w-md w-full">
              {/* Heading */}
              <div className="w-full flex justify-between items-center mb-3">
                <h2 className="text-2xl font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                  Loading Team Data...
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
                Fetching your team members, roles, and access details. <br />
                <span className="text-gray-500">Setting things up for you...</span>
              </p>

              {/* Subtle bouncing dots */}
              <div className="flex justify-center gap-1">
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          </div>
        </div>

      </section>
    );
  }

  return (
    <section className="pt-6 pb-8 space-y-7 sm:space-y-12 pr-1.5 max-w-7xl mx-auto">
      {/* Welcome Message */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4 items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl capitalize font-bold mt-2 bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight">
            Team Management
          </h1>
          <p className="font-medium text-base sm:text-lg max-w-2xl">
            Manage your team members, permissions, and view their activity.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
          <button onClick={() => {
            setUserModel(true);
            setAddSuccess("");
          }}
            className="cursor-pointer rounded-4xl bg-linear-to-r from-[#441851] to-[#761be6] 
              px-3 md:px-4 py-2 flex items-center gap-2 hover:from-[#5e1dbf] hover:to-[#8b2bf0] transition">
            <HiUserAdd className="size-3 sm:size-4 text-white shrink-0" />
            <span className="text-sm sm:text-base md:font-medium text-white">Add New Member</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        <div className="relative z-10">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            {/* Header */}
            <h2 className="font-semibold sm:text-lg md:text-xl flex items-center gap-2">
              <HiUsers className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Total Users</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl text-gray-800 font-semibold leading-tight">
              {teamStats?.totalUsers < 10 ? `0${teamStats.totalUsers}` : teamStats.totalUsers}
            </h3>
            <p className="text-sm text-gray-700">Total number of team members associated with this account.</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            {/* Header */}
            <h2 className="font-semibold sm:text-lg md:text-xl flex items-center gap-2">
              <FaUserCheck className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Active Users</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl text-gray-800 font-semibold leading-tight">
              {teamStats?.activeUsers < 10 ? `0${teamStats.activeUsers}` : teamStats.activeUsers}
            </h3>
            <p className="text-sm text-gray-700">Number of users currently active and able to access the system.</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            <h2 className="font-semibold sm:text-lg md:text-xl flex items-center gap-2">
              <HiClipboardDocumentCheck className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Total Assessments</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl text-gray-800 font-semibold leading-tight">
              {teamStats?.totalAssessments < 10 ? `0${teamStats.totalAssessments}` : teamStats.totalAssessments}
            </h3>
            <p className="text-sm text-gray-700">Number of assessments completed by users.</p>

          </div>
        </div>

        <div className="relative z-10">
          <div className="h-full flex flex-col bg-white/50 backdrop-blur-2xl rounded-3xl shadow-[0_20px_40px_rgba(118,27,230,0.12)] border border-gray-200 p-4 sm:p-5">
            {/* Header */}
            <h2 className="font-semibold sm:text-lg md:text-xl flex items-center gap-2">
              <HiDocumentChartBar className="size-4 sm:size-5 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Total Reports</span>
            </h2>
            <div className="border-b border-purple-300 my-3"></div>

            {/* Regulation Value*/}
            <h3 className="my-1 sm:my-2 text-xl sm:text-3xl md:text-4xl text-gray-800 font-semibold leading-tight">
              {teamStats?.totalReports < 10 ? `0${teamStats.totalReports}` : teamStats.totalReports}
            </h3>
            <p className="text-sm text-gray-700">Number of reports generated from completed assessments.</p>

          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-linear-to-tr from-purple-100 via-white to-white px-4 pb-4 pt-6 sm:px-6 sm:pt-8 sm:pb-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* User Search and Filter */}
        <div className='flex flex-col lg:flex-row gap-5 lg:gap-3 justify-between'>
          <div className="relative">
            <h2 className="font-semibold text-xl sm:text-2xl">
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">All Team Members</span>
            </h2>
            <p className="text-sm sm:text-base font-medium text-gray-700">View and manage all users, their access, and activity.</p>
          </div>

          <div className="relative flex flex-wrap items-end justify-start sm:justify-end gap-3 sm:gap-5">
            {/* Filter by Status */}
            <div className="flex flex-col">
              <label className="text-sm font-medium ml-1 text-gray-700">Filter by Status</label>
              <select value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cursor-pointer mt-1 text-gray-700 appearance-none bg-[url('/down.svg')] bg-no-repeat bg-size-[16px_16px] bg-position-[right_0.5rem_center] pl-3 pr-8 py-1.5 sm:py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white/80  focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all"
              >
                <option value="all">All Users</option>
                <option value="ACTIVE">Active Users</option>
                <option value="BLOCKED">Block Users</option>
              </select>
            </div>

            {/* SearchBar */}
            <div className="relative group">
              <LuSearch className="text-[#441851]/40 absolute left-1 sm:left-2 top-[50%] translate-y-[-50%] group-focus-within:text-gray-800" />
              <input type="text" placeholder="Search user by name or email..." value={search}
                onChange={(e) => setSearch(e.target.value)} name="search-users" autoComplete="off"
                className={`pl-6 sm:pl-7 pr-3 py-2 w-full sm:w-64 md:w-72 placeholder:text-[11px] sm:placeholder:text-sm font-medium text-sm text-gray-700 rounded-lg border border-gray-300 bg-white/80 placeholder-[#441851]/40 group-focus-within:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
            </div>
          </div>
        </div>
        <div className="border-b border-purple-300 mt-3"></div>

        {/* Users List */}
        <div className="relative space-y-6">
          {/* Content */}
          <div className="px-2 pt-6">
            <div className="overflow-hidden rounded-xl border border-purple-300 bg-white">
              <table className="w-full lg:table table-fixed border-collapse">
                {/* Header (hidden on tablets)*/}
                <thead className="hidden lg:table-header-group">
                  <tr className="bg-purple-50">
                    <th className="py-3 px-5 w-2/5 text-left font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Members</th>
                    <th className="p-3 w-1/4 text-left font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Role</th>
                    <th className="p-3 w-1/5 text-left font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Status</th>
                    <th className="p-3 w-1/6 text-left font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Assessments</th>
                    <th className="p-3 w-1/6 text-left font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Reports</th>
                    <th className="p-3 w-1/4 text-left font-semibold bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">Actions</th>
                  </tr>
                </thead>
                {/* Body*/}
                <tbody className="text-sm">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((user) => (
                      <tr key={user.id} className="border-t py-3 border-purple-300 flex flex-col lg:table-row hover:bg-purple-50 transition">
                        <td className="px-3 py-2 lg:py-3 lg:px-5">
                          <div className="flex items-center gap-3 min-w-0">
                            {user.image ? (
                              <img src={user.image || "/avatar.svg"}
                                className="w-12 h-12 rounded-xl object-cover" alt={user.name} />
                            ) : (
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white 
                                bg-[#761be6] text-lg">
                                {getInitials(user.name)}
                              </div>
                            )}

                            <div className="flex flex-col gap-0.5 text-gray-900 min-w-0">
                              <p className="font-medium leading-none">{user.name}</p>
                              <p className="text-xs break-all">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="flex justify-between items-center lg:table-cell px-3 py-1.5 sm:py-2 lg:p-3">
                          <span className="text-xs sm:text-sm font-medium leading-none text-gray-600 lg:hidden">Role</span>
                          <span className="rounded-md bg-purple-600 px-2 py-0.5 sm:py-1 text-xs font-medium sm:uppercase text-white">
                            {user.role}
                          </span>
                        </td>
                        <td className="flex justify-between items-center lg:table-cell px-3 py-1.5 sm:py-2 lg:p-3">
                          <span className="text-xs sm:text-sm font-medium leading-none text-gray-600 lg:hidden">Status</span>
                          <div className={`flex items-center gap-2 font-medium ${user.status === "ACTIVE" ? "text-green-600" : "text-red-600"}`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${user.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`} />
                            {user.status == "ACTIVE" ? "Active" : "Blocked"}
                          </div>
                        </td>
                        <td className="flex justify-between items-center font-medium lg:table-cell px-3 py-1.5 sm:py-2 lg:p-3">
                          <span className="text-xs sm:text-sm leading-none text-gray-600 lg:hidden">Assessments</span>
                          <span className="font-normal sm:font-medium">{user.assessments < 10 ? `0${user.assessments}` : user.assessments}</span>
                        </td>
                        <td className="flex justify-between items-center font-medium lg:table-cell px-3 py-1.5 sm:py-2 lg:p-3">
                          <span className="text-xs sm:text-sm leading-none text-gray-600 lg:hidden">Reports</span>
                          <span className="font-normal sm:font-medium">{user.reports < 10 ? `0${user.reports}` : user.reports}</span>
                        </td>

                        <td className="px-3 py-1 sm:py-2 lg:p-3">
                          {user.role === "OWNER" ? (
                            <span className="inline-flex items-center rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700">
                              Protected Account
                            </span>
                          ) : user.status === "ACTIVE" ? (
                            <button onClick={() => handleRemoveAccess(user.id)}
                              disabled={actionLoading === user.id}
                              className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-red-600 disabled:hover:text-white w-full lg:w-auto cursor-pointer font-medium rounded-lg bg-red-600 px-3 py-1.5 border border-red-600 text-white hover:bg-red-50 hover:text-red-600 transition">
                              {actionLoading === user.id ? (
                                <>
                                  <p className="font-medium flex items-center gap-2">
                                    Removing...
                                    <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                                  </p>
                                </>
                              ) : (
                                "Remove Access"
                              )}
                            </button>
                          ) : (
                            <button onClick={() => handleRestoreAccess(user.id)}
                              disabled={actionLoading === user.id}
                              className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:bg-green-600 disabled:hover:text-white w-full lg:w-auto cursor-pointer font-medium rounded-lg bg-green-600 px-3 py-1.5 border border-green-600 text-white hover:bg-green-50 hover:text-green-600 transition">
                              {actionLoading === user.id ? (
                                <>
                                  <p className="font-medium flex items-center gap-2">
                                    Restoring...
                                    <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                                  </p>
                                </>
                              ) : (
                                "Restore Access"
                              )}
                            </button>
                          )}
                          {actionError?.userId === user.id && (
                            <p className="mt-2 text-xs font-medium text-red-500">
                              {actionError.message}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <h4 className={`font-semibold capitalize text-lg sm:text-xl bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent leading-tight`}>
                          {search
                            ? `No users found for "${search}"`
                            : statusFilter !== "all"
                              ? `No ${statusFilter.toLowerCase()} users found`
                              : "No team members available"
                          }
                        </h4>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pop up to add new member */}
      {userModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white relative rounded-2xl shadow-xl w-full max-w-md px-4 sm:px-6 pb-6 pt-9">
            <RxCrossCircled onClick={() => {
              setUserModel(false);
              setAddError("");
              setUserEmail("");
            }}
              className="size-6 text-purple-600 shrink-0 cursor-pointer 
              absolute top-4 right-4 hover:scale-95 transition-all"/>

            {/* Heading */}
            <h2 className="font-semibold text-xl sm:text-2xl flex items-center gap-2">
              <HiUserAdd className="size-5 sm:size-6 text-[rgb(var(--light-purple))] shrink-0" />
              <span className="bg-linear-to-r from-[#761be6] to-[#441851] bg-clip-text text-transparent">
                Add New Team Member
              </span>
            </h2>

            {/* Subtext */}
            <p className="text-gray-700 text-sm mt-1 mb-4">
              Add an existing platform user to your organization using their registered email address.
            </p>

            {/* Email Address */}
            <div>
              <label className="flex text-sm sm:text-base font-medium ml-2 sm:ml-1">Email Address</label>
              <input type="email" value={userEmail} onFocus={() => setAddError("")} name="team-member-email"
                onChange={(e) => setUserEmail(e.target.value)} autoComplete="off"
                spellCheck={false} autoCorrect="off" autoCapitalize="none"
                placeholder="Enter user's registered email"
                className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 mt-1 text-sm sm:text-base rounded-lg bg-slate-100/60 border ${addError ? "border-red-500" : "border-gray-300"} placeholder-[#441851]/40 focus:border-[#761be6] focus:ring-1 focus:ring-[#761be6]/10 outline-none transition-all`}
              />
            </div>

            {addError && (
              <p className="text-red-500 text-sm mt-2 ml-1 text-left capitalize">{addError}</p>
            )}

            {addSuccess && (
              <p className="text-white mt-3 bg-green-600 inline-flex px-3 py-1.5 rounded-md text-sm capitalize font-medium text-left">
                {addSuccess}
              </p>
            )}

            <div className="flex items-center justify-between pt-5">
              <button onClick={() => {
                setUserModel(false);
                setAddError("");
                setUserEmail("");
              }}
                className="cursor-pointer px-4 py-2 rounded-lg bg-slate-100/80 border border-gray-300 shadow-md
                hover:bg-[#761be6] hover:text-white transition-all duration-300">
                Clear
              </button>

              <button onClick={handleAddMember} disabled={addLoading}
                className="disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:from-[#441851] disabled:hover:to-[#761be6] cursor-pointer px-4 py-2 rounded-lg bg-linear-to-r from-[#441851] to-[#761be6]
               text-white hover:from-[#5e1dbf] hover:to-[#8b2bf0]">
                {addLoading ? (
                  <>
                    <p className="font-medium flex items-center gap-2">
                      Adding Member...
                      <span className="shrink-0 h-4 w-4 animate-spin rounded-full border-2 border-purple-100 border-t-transparent"></span>
                    </p>
                  </>
                ) : (
                  "Add Member"
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
