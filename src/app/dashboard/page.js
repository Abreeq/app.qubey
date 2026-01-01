import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth");
  }

  if (!session.user.emailVerified) {
    redirect("/profile?verifyRequired=true");
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">
        Welcome back, {session.user.name || "User"}
      </h1>

      {/* STATUS CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <DashboardCard
          title="Compliance Score"
          value="42%"
          subtitle="Based on current answers"
        />
        <DashboardCard
          title="Risk Level"
          value="Medium"
          subtitle="Needs attention"
        />
        <DashboardCard
          title="Open Gaps"
          value="7"
          subtitle="Controls missing"
        />
      </div>

      {/* ACTIONS */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">Recommended Actions</h2>

        <div className="mt-4 space-y-4">
          <ActionItem
            title="Complete Organization Profile"
            desc="Add industry, size, and data types to improve accuracy."
          />
          <ActionItem
            title="Start Compliance Assessment"
            desc="Answer AI-generated questions tailored to your business."
          />
          <ActionItem
            title="Review Risk Report"
            desc="Understand your cybersecurity posture in simple terms."
          />
        </div>
      </section>
    </main>
  );
}

function DashboardCard({ title, value, subtitle }) {
  return (
    <div className="border rounded-xl p-6 bg-white">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
}

function ActionItem({ title, desc }) {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
      <button className="text-sm underline">Start</button>
    </div>
  );
}
