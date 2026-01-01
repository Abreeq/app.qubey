"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { status, update} = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          setProfile(data);
          setName(data.name || "");
          setLoading(false);
        });
    }
  }, [status, router]);

  if (loading) return null;

  const isVerified = !!profile.emailVerified;

  const saveProfile = async () => {
    setSaving(true);
    const res = await fetch("/api/user/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error("Failed to update profile");
      setSaving(false);
      return;
    }

    setProfile(data);
    await update(); // refresh session name
    toast.success("Profile updated");
    setSaving(false);
  };

  const resendVerification = async () => {
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error);
      return;
    }

    toast.success("Verification email sent");
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>

      {/* Profile picture */}
      <div className="flex items-center gap-4">
        <Image
          src={profile.image || "/avatar.svg"}
          alt="Profile"
          width={80}
          height={80}
          className="rounded-full"
        />
        <p className="text-sm text-gray-500">
          Profile picture is managed by login provider
        </p>
      </div>

      {/* Editable name */}
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <button
        onClick={saveProfile}
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {/* Email info */}
      <div className="pt-4 border-t">
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Email Status:</strong>{" "}
          {isVerified ? (
            <span className="text-green-600">Verified</span>
          ) : (
            <span className="text-red-600">Not Verified</span>
          )}
        </p>

        {!isVerified && (
          <button
            onClick={resendVerification}
            className="mt-3 text-sm underline"
          >
            Resend verification email
          </button>
        )}
      </div>
    </div>
  );
}
