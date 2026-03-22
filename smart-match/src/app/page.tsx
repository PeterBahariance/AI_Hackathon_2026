"use client";

import Link from "next/link";

const modules = [
  {
    title: "Volunteers",
    href: "/supply",
    description: "Board member profiles, expertise, and availability",
  },
  {
    title: "Opportunities",
    href: "/demand",
    description: "University events, courses, and engagement opportunities",
  },
  {
    title: "Matching",
    href: "/matching",
    description: "AI-powered volunteer-to-opportunity matching",
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    description: "Engagement to membership conversion tracking",
  },
  {
    title: "Discovery",
    href: "/discovery",
    description: "Automated university event discovery engine",
  },
  {
    title: "Outreach",
    href: "/outreach",
    description: "Email generation and follow-up tracking",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white pt-28">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#28839f] py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              Insight Associations West Smart Match
            </h1>
            <p className="text-xl sm:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
              AI-powered CRM that discovers university engagement opportunities,
              matches IA board member volunteers, and tracks the
              engagement-to-membership pipeline.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 mt-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Explore Our Modules
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover powerful tools designed to streamline volunteer management and university engagement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-all duration-300"
                style={{
                  borderColor: "transparent"
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#28839f"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3 transition-colors"
                    style={{ color: "inherit" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#28839f"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#111"}
                  >
                    {mod.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
                <div className="flex items-center font-medium" style={{ color: "#28839f" }}>
                  <span>Learn more</span>
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
