'use client';

import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Loader2, User } from 'lucide-react';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "volunteers"));
        const volunteerList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVolunteers(volunteerList);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section - Aligned with Grid */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#471f8d] mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Volunteers
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl" style={{ fontFamily: "Georgia, serif" }}>
            Board member profiles, expertise, role prefs (judge, mentor, speaker, panelist), availability
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#471f8d] mb-4" />
            <p className="text-slate-500 font-medium">Syncing Volunteer Profiles...</p>
          </div>
        ) : (
          <>
            {/* Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {volunteers.map((person) => (
                <Link 
                  key={person.id} 
                  href={`/supply/${person.id}`}
                  className="group relative bg-white rounded-2xl p-8 border border-[#dbbde5] shadow-sm 
                             cursor-pointer transition-all duration-300 ease-out
                             hover:shadow-2xl hover:-translate-y-2 hover:border-[#471f8d] 
                             hover:bg-gradient-to-b hover:from-white hover:to-[#f9f5ff]"
                >
                  {/* Profile Header */}
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 rounded-full bg-[#471f8d] text-white flex items-center justify-center font-bold text-2xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                      {person.Name ? person.Name.charAt(0) : <User size={24} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#471f8d] transition-colors leading-tight">
                        {person.Name}
                      </h2>
                      <p className="text-sm text-[#471f8d] font-semibold opacity-80">{person.Title}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <p className="text-slate-500 text-sm italic border-l-2 border-[#dbbde5] pl-3">
                      {person.Company || "Independent IA Consultant"}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-bold bg-[#f9f5ff] text-[#471f8d] px-3 py-1.5 rounded-full border border-[#dbbde5]">
                        📍 {person["Metro Region"]}
                      </span>
                      {person.Expertise && (
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
                          {person.Expertise}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Animated "View Profile" Icon */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="24" height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#471f8d" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14m-7-7 7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            {volunteers.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-[#dbbde5] rounded-2xl bg-white/50">
                <p className="text-slate-500 italic font-medium">No volunteers found in the database.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}