"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/supply", label: "Volunteers" },
  { href: "/demand", label: "Opportunities" },
  { href: "/matching", label: "Matching" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/discovery", label: "Discovery" },
  { href: "/outreach", label: "Outreach" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="bg-slate-900 text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          IA Smart Match
        </Link>
        <div className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded transition-colors ${
                pathname === link.href
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
