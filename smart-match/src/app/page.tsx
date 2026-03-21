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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          IA West Smart Match
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">
          AI-powered CRM that discovers university engagement opportunities,
          matches IA board member volunteers, and tracks the
          engagement-to-membership pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="block p-6 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {mod.title}
            </h2>
            <p className="text-slate-600">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
