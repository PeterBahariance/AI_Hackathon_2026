"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const links = [
  { href: "/", label: "Home" },
  { href: "/volunteers", label: "Volunteers" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/matching", label: "Matching" },
];

const outreachLinks = [
  { href: "/outreach", label: "Communication / Outreach" },
  { href: "/responsible-ai", label: "Use of AI" },
  { href: "/growth-strategy", label: "Growth Strategy Plan" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string; username: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [outreachOpen, setOutreachOpen] = useState(false);
  const outreachRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (outreachRef.current && !outreachRef.current.contains(e.target as Node)) {
        setOutreachOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let unsubDoc: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubDoc) { unsubDoc(); unsubDoc = null; }

      if (firebaseUser) {
        unsubDoc = onSnapshot(doc(db, "users", firebaseUser.uid), (snap) => {
          const data = snap.data();
          setUser({
            uid: firebaseUser.uid,
            username: data?.username || firebaseUser.displayName || "User",
          });
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    setMenuOpen(false);
    router.push("/");
  };

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

          {/* Outreach / Comms dropdown */}
          <div className="relative" ref={outreachRef}>
            <button
              onClick={() => setOutreachOpen(!outreachOpen)}
              className={`flex items-center gap-1 px-3 py-1 rounded transition-all duration-200 ${outreachLinks.some((l) => pathname === l.href)
                ? "bg-[#471f8d] text-white"
                : "text-gray-600 hover:bg-[#471f8d] hover:text-white"
                }`}
            >
              Outreach / Comms
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${outreachOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {outreachOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                {outreachLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOutreachOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${pathname === link.href
                      ? "bg-[#471f8d]/10 text-[#471f8d] font-medium"
                      : "text-gray-700 hover:bg-[#471f8d]/5 hover:text-[#471f8d]"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="relative ml-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: "#471f8d" }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.username}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user.username}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login?mode=signup"
                className="ml-4 px-4 py-1.5 text-sm rounded transition-colors hover:opacity-90 border whitespace-nowrap"
                style={{ color: "#471f8d", borderColor: "#471f8d", fontWeight: "600" }}
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm text-white rounded transition-colors hover:opacity-90 border"
                style={{ backgroundColor: "#471f8d", borderColor: "#471f8d", fontWeight: "600" }}
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
