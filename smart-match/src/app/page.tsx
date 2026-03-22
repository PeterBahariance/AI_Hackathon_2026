"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const modules = [
  {
    title: "Volunteers",
    href: "/supply",
    description: "Discover and manage our community of dedicated board members. Track expertise, skills, and availability to build a robust volunteer network ready to engage.",
  },
  {
    title: "Opportunities",
    href: "/demand",
    description: "Explore partnership opportunities with universities. Identify speaker slots, mentorship programs, and engagement initiatives across academic institutions.",
  },
  {
    title: "Matching",
    href: "/matching",
    description: "Harness AI intelligence to connect the right volunteers with the perfect opportunities. Our smart algorithm ensures meaningful partnerships that drive impact.",
  },
  {
    title: "Pipeline",
    href: "/pipeline",
    description: "Track the complete journey from engagement to membership. Visualize conversion metrics and identify opportunities to nurture lasting relationships.",
  },
  {
    title: "Discovery",
    href: "/discovery",
    description: "Automatically discover new university events and engagement opportunities. Stay ahead with intelligent web scraping and real-time updates.",
  },
  {
    title: "Outreach",
    href: "/outreach",
    description: "Create personalized communication campaigns effortlessly. Generate compelling emails and track follow-ups to maximize engagement success rates.",
  },
];

export default function Home() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(Array(modules.length).fill(false));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1) {
          setVisibleCards((prev) => {
            const newVisible = [...prev];
            newVisible[index] = entry.isIntersecting;
            return newVisible;
          });
        }
      });
    }, { threshold: 0.1 });

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      cardRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#471f8d] py-24 sm:py-32 pt-28">
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

      {/* Module Sections */}
      {modules.map((mod, index) => (
        <section
          key={mod.href}
          ref={(el) => {
            cardRefs.current[index] = el || null;
          }}
          className={`relative min-h-screen flex items-center justify-center py-24 sm:py-32 transition-all duration-500 ${visibleCards[index] ? "pop-up-3d" : "opacity-0"
            }`}
          style={{
            backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#dbbde5",
            transform: visibleCards[index]
              ? "perspective(1000px) rotateX(0deg) scale(1)"
              : "perspective(1000px) rotateX(-10deg) scale(0.95)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                {mod.title}
              </h2>
              <p className="text-xl sm:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
                {mod.description}
              </p>
              <Link
                href={mod.href}
                className="inline-block px-8 py-4 text-white rounded-lg hover:opacity-80 transition-all duration-300 font-semibold"
                style={{ backgroundColor: "#93C5FD" }}
              >
                Explore {mod.title}
              </Link>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
