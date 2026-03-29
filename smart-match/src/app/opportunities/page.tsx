'use client';

import React from 'react';
import { BookOpen, Calendar, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function OpportunitiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#471f8d] mb-4" style={{ fontFamily: "Georgia, serif" }}>
            Opportunity Center
          </h1>
          <p className="text-slate-600 text-lg">Select your preferred view to start matching volunteers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Events View Card */}
          <Link 
            href="/opportunities/events" 
            className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all border-b-4 border-transparent hover:border-[#471f8d] flex flex-col items-center text-center"
          >
            <div className="p-4 bg-purple-100 text-[#471f8d] rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Calendar size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Event Timeline</h2>
            <p className="text-slate-500 mb-8">View university engagements by date, region, and specific event windows.</p>
            <span className="mt-auto flex items-center gap-2 font-bold text-[#471f8d]">
              View Events <ArrowRight size={18} />
            </span>
          </Link>

          {/* Courses View Card */}
          <Link 
            href="/opportunities/courses" 
            className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all border-b-4 border-transparent hover:border-blue-600 flex flex-col items-center text-center"
          >
            <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <BookOpen size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">Course Catalog</h2>
            <p className="text-slate-500 mb-8">Browse opportunities by academic alignment, course titles, and guest lecture topics.</p>
            <span className="mt-auto flex items-center gap-2 font-bold text-blue-600">
              View Courses <ArrowRight size={18} />
            </span>
          </Link>

          {/* University Outreach Card */}
          <Link
            href="/opportunities/universities"
            className="group bg-white p-10 rounded-3xl shadow-sm hover:shadow-2xl transition-all border-b-4 border-transparent hover:border-emerald-600 flex flex-col items-center text-center"
          >
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <Building2 size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-3">University Outreach</h2>
            <p className="text-slate-500 mb-8">Discover new university opportunities with AI, browse contacts, and draft outreach emails.</p>
            <span className="mt-auto flex items-center gap-2 font-bold text-emerald-600">
              View Contacts <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}