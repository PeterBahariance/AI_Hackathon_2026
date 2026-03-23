'use client';

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { 
  Users, 
  GraduationCap, 
  Zap, 
  Send, 
  ArrowRight 
} from "lucide-react";

const modules = [
  {
    title: "Volunteers",
    href: "/supply",
    icon: <Users className="w-10 h-10 mb-4" />,
    description: "Discover and manage our community of dedicated board members. Track expertise, skills, and availability to build a robust volunteer network ready to engage.",
  },
  {
    title: "Opportunities",
    href: "/opportunities",
    icon: <GraduationCap className="w-10 h-8 mb-4" />,
    description: "Explore partnership opportunities with universities. Identify speaker slots, mentorship programs, and engagement initiatives across academic institutions.",
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Zap className="w-10 h-10 mb-4" />,
    description: "View partnership opportunities with universities in a dynamic calendar. Stay organized with event details, deadlines, and reminders to maximize engagement success.",
  },
  {
    title: "Matching",
    href: "/matching",
    icon: <Zap className="w-10 h-10 mb-4" />,
    description: "Harness AI intelligence to connect the right volunteers with the perfect opportunities. Our smart algorithm ensures meaningful partnerships that drive impact.",
  },
  {
    title: "Outreach",
    href: "/outreach",
    icon: <Send className="w-10 h-10 mb-4" />,
    description: "Create personalized communication campaigns effortlessly. Generate compelling emails and track follow-ups to maximize engagement success rates.",
  },
];

export default function Home() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>(Array(modules.length).fill(false));
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = cardRefs.current.indexOf(entry.target as HTMLElement);
        if (index !== -1) {
          setVisibleCards((prev) => {
            const newVisible = [...prev];
            newVisible[index] = entry.isIntersecting;
            return newVisible;
          });
        }
      });
    }, { 
      threshold: 0.3, // Trigger slightly later for shorter sections
      rootMargin: "0px 0px -10% 0px" // Prevents immediate triggering
    });

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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#471f8d] py-24 pt-28">
        {/* Decorative background element for better centering feel */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center flex flex-col items-center">
            <h1 className="text-5xl sm:text-7xl lg:text-7xl font-bold text-white mb-8 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
              Insight Associations West <br />
              <span className="text-purple-300">Smart Match</span>
            </h1>
            <p className="text-xl sm:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed opacity-90 mb-12">
              The AI-powered command center for university engagement. 
              Discover opportunities, match board members, and manage your outreach pipeline in one seamless interface.
            </p>
            
            {/* Helpful Scroll Guide */}
            <div className="mt-8 flex flex-col items-center gap-4 animate-bounce">
              <span className="text-purple-300 text-xs font-black uppercase tracking-[0.3em]">
                Scroll to Explore Modules
              </span>
              <div className="w-px h-16 bg-gradient-to-b from-purple-300 to-transparent"></div>
              <svg 
                className="w-6 h-6 text-purple-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Module Sections */}
      {modules.map((mod, index) => {
        const isEven = index % 2 === 0;
        // Logic: Alternate between White and the brand-aligned Lavender
        const bgColor = isEven ? "bg-white" : "bg-[#fcfaff]";
        const borderColor = isEven ? "border-[#f3ebff]" : "border-[#dbbde5]";

        return (
          <section
            key={mod.href}
            ref={(el) => { cardRefs.current[index] = el; }}
            // Reduced height from min-h-screen to h-[60vh]
            className={`relative h-[60vh] min-h-[400px] flex items-center justify-center transition-all duration-700 ease-out border-b ${bgColor} ${borderColor} ${
              visibleCards[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
            style={{
              backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#e5d4f8",
              transform: visibleCards[index]
                ? "perspective(1000px) rotateX(0deg) scale(1)"
                : "perspective(1000px) rotateX(-5deg) scale(0.95)",
            }}
          >
            <div className="max-w-5xl mx-auto px-6 w-full text-center flex flex-col items-center">
              <div className="text-[#471f8d] animate-bounce-slow">
                {mod.icon}
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                {mod.title}
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
                {mod.description}
              </p>
              <Link
                href={mod.href}
                className="group inline-flex items-center gap-2 px-8 py-3 bg-[#471f8d] text-white rounded-xl hover:bg-[#36176d] transition-all duration-300 font-bold shadow-lg hover:shadow-[#471f8d]/30"
              >
                Explore {mod.title} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        );
      })}

      {/* Footer */}
      <footer className="bg-white py-10 text-center border-t border-slate-100">
        <p className="text-slate-400 text-sm italic">
          IA-West-CRM Discovery Engine Online
        </p>
      </footer>
    </div>
  );
}