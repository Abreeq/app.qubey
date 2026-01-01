import Link from "next/link";

export default function Home() {
  return (
 <main className="bg-white">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Cybersecurity & Compliance <br />
            <span className="text-blue-600">Made Simple for UAE Businesses</span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg">
            Qubey is an AI-powered compliance assistant that helps your
            organization understand, implement, and maintain cybersecurity
            regulations without consultants or complexity.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/auth"
              className="bg-black text-white px-6 py-3 rounded-lg"
            >
              Get Started
            </Link>
            <Link
              href="#features"
              className="border px-6 py-3 rounded-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="bg-gray-100 rounded-xl h-80 flex items-center justify-center text-gray-400">
          Product Illustration / Demo Preview
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="bg-gray-50 py-20 border-t"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-center">
            What Qubey Helps You With
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: "AI Compliance Assessment",
                desc: "Answer simple questions and instantly know where you stand against UAE regulations.",
              },
              {
                title: "Gap Analysis & Risk Scoring",
                desc: "Identify missing controls and understand your cybersecurity risk clearly.",
              },
              {
                title: "Auto Documentation",
                desc: "Generate policies, reports, and compliance documents in minutes.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-gray-600 mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-semibold">
          Start your compliance journey today
        </h2>
        <p className="text-gray-600 mt-4">
          No credit card. No consultants. Just clarity.
        </p>
        <Link
          href="/auth"
          className="inline-block mt-6 bg-black text-white px-6 py-3 rounded-lg"
        >
          Create Free Account
        </Link>
      </section>
    </main>
  );
}
