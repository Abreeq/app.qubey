import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ IMPORTANT: use lib/auth
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth");

  if (!session.user.emailVerified) {
    redirect("/profile?verifyRequired=true");
  }

  // ✅ Check if organization exists
  const org = await prisma.organization.findUnique({
    where: {
      ownerId: session.user.id,
    },
  });

  // ✅ If no organization → force user to create
  if (!org) {
    redirect("/organisation/create");
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">
        Welcome back, {session.user.name || "User"}
      </h1>

      <p className="mt-2 text-gray-600">
        Organization: <span className="font-medium">{org.name}</span>
      </p>

      {/* REAL STATUS CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <DashboardCard
          title="Compliance Score"
          value={`${org.complianceScore}%`}
          subtitle="Based on your current assessment"
        />

        <DashboardCard
          title="Risk Level"
          value={org.riskLevel}
          subtitle="Calculated from gaps & controls"
        />

        <DashboardCard
          title="Open Gaps"
          value={`${org.openGaps}`}
          subtitle="Controls missing"
        />
      </div>

      {/* REAL ACTIONS (later dynamic) */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">Recommended Actions</h2>

        <div className="mt-4 space-y-4">
          <ActionItem
            title="Start / Continue Assessment"
            desc="Answer compliance questions to update your score."
            href="/assessment"
          />
          <ActionItem
            title="View Risk Report"
            desc="See why your risk is high and what to fix first."
            href="/reports"
          />
          <ActionItem
            title="Manage Organization"
            desc="Update company profile and compliance scope."
            href="/organisation"
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

function ActionItem({ title, desc, href }) {
  return (
    <a
      href={href}
      className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
      <span className="text-sm underline">Open</span>
    </a>
  );
}
