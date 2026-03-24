'use client';

import React, { useEffect, useState, use } from "react"; // Added 'use'
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2, User, ChevronLeft, MapPin, Building2, Briefcase } from 'lucide-react';

export default function VolunteerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // 1. Unwrap the params promise using React.use()
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [volunteer, setVolunteer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        // 2. Use the unwrapped id here
        const docRef = doc(db, "volunteers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVolunteer({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching volunteer details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteer();
  }, [id]); // 3. Updated dependency to the unwrapped id

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#471f8d] mb-4" />
        <p className="text-slate-500 font-medium">Loading Profile...</p>
      </div>
    );
  }

  if (!volunteer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-slate-600 mb-4">Volunteer profile not found.</p>
          <button 
            onClick={() => router.push('/volunteers')}
            className="text-[#471f8d] font-bold underline cursor-pointer"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Smart Back Button */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-3 text-slate-500 hover:text-[#471f8d] transition-all mb-10 bg-transparent border-none cursor-pointer p-0"
        >
          <div className="p-2 rounded-full bg-white border border-slate-200 group-hover:border-[#471f8d] group-hover:bg-[#f9f5ff] shadow-sm transition-all">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-semibold text-sm uppercase tracking-widest">
            Back to Directory
          </span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#dbbde5] shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-3xl bg-[#471f8d] text-white flex items-center justify-center font-bold text-5xl shadow-lg shrink-0">
              {volunteer.Name ? volunteer.Name.charAt(0) : <User size={48} />}
            </div>

            {/* Main Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                {volunteer.Name}
              </h1>
              <p className="text-xl text-[#471f8d] font-semibold mb-6">
                {volunteer.Title}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600">
                  <Building2 size={18} className="text-[#dbbde5]" />
                  <span>{volunteer.Company || "Independent IA Consultant"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600">
                  <MapPin size={18} className="text-[#dbbde5]" />
                  <span>{volunteer["Metro Region"] || "Remote"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600">
                  <Briefcase size={18} className="text-[#dbbde5]" />
                  <span>{volunteer.Expertise || "Strategy & Operations"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
                Biography & Experience
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {volunteer.Bio || "Biography currently being updated."}
              </p>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#f9f5ff] rounded-2xl p-6 border border-[#dbbde5]">
              <h3 className="text-sm font-bold text-[#471f8d] mb-4 uppercase tracking-wider">Engagement</h3>
              <div className="flex flex-wrap gap-2">
                {/* Check if roles exist in your DB, otherwise show default badges */}
                {['Judge', 'Mentor', 'Speaker'].map((role) => (
                  <span key={role} className="bg-white text-[#471f8d] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#dbbde5]">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}