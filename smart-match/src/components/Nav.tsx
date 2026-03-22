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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md text-gray-800 shadow-lg border-b border-gray-200 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold transition-colors" style={{ color: "#471f8d", fontFamily: "Georgia, serif" }}>
          Insight Associations West Smart Match
        </Link>
        <div className="flex gap-4 text-sm items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1 rounded transition-all duration-200 ${pathname === link.href
                  ? "bg-[#471f8d] text-white"
                  : "text-gray-600 hover:bg-[#471f8d] hover:text-white"
                }`}
            >
              {link.label}
            </Link>
          ))}
          <button className="ml-4 px-4 py-2 text-gray-900 rounded transition-colors hover:opacity-90" style={{ backgroundColor: "#93C5FD", fontWeight: "600" }}>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
