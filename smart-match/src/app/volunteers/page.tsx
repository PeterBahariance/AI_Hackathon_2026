'use client';

import React, { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { 
  Loader2, 
  User, 
  ListFilter, 
  X, 
  PlusCircle, 
  Search, 
  MapPin, 
  Briefcase,
  CheckCircle2 // New icon for roles
} from 'lucide-react';

interface Volunteer {
  id: string;
  Name: string;
  Title: string;
  Company: string;
  "Metro Region": string;
  Expertise: string;
  Roles?: string[]; // Assuming roles are stored as an array or comma-string
}

// Added "Roles" to the FilterCategory
type FilterCategory = "Name" | "Metro Region" | "Expertise" | "Company" | "Roles";

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterCategory, string>>>({});
  const [currentCategory, setCurrentCategory] = useState<FilterCategory | "">("");
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "volunteers"));
        const volunteerList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Volunteer[];
        setVolunteers(volunteerList);
      } catch (error) {
        console.error("Error fetching volunteers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, []);

  // Enhanced Filter Logic
  const filteredVolunteers = useMemo(() => {
    return volunteers.filter(person => {
      return (Object.entries(activeFilters) as [FilterCategory, string][]).every(([category, value]) => {
        // Special handling for the "Roles" array if applicable
        if (category === "Roles") {
           const roles = person.Roles || [];
           return roles.some(r => r.toLowerCase().includes(value.toLowerCase()));
        }
        const personValue = person[category] || "";
        return personValue.toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [volunteers, activeFilters]);

  const getOptionsForCategory = (cat: FilterCategory) => {
    if (cat === "Roles") return ["Judge", "Mentor", "Speaker", "Panelist"]; // Static options for roles
    return Array.from(new Set(volunteers.map(v => v[cat]).filter(Boolean))).sort();
  };

  const addFilter = (val: string) => {
    if (!currentCategory || !val) return;
    setActiveFilters(prev => ({ ...prev, [currentCategory]: val }));
    setCurrentCategory("");
    setTempValue("");
  };

  const removeFilter = (cat: FilterCategory) => {
    const newFilters = { ...activeFilters };
    delete newFilters[cat];
    setActiveFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-5xl font-bold text-[#471f8d] mb-3" style={{ fontFamily: "Georgia, serif" }}>
              Volunteer Directory
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-medium" style={{ fontFamily: "Georgia, serif" }}>
              Filter by expertise, region, or engagement role to find the right match.
            </p>
          </div>
          <div className="text-right">
            <span className="text-6xl font-black text-[#471f8d] opacity-10 block leading-none">
              {filteredVolunteers.length}
            </span>
            <span className="text-[10px] font-bold text-[#471f8d] uppercase tracking-[0.2em]">Matches Found</span>
          </div>
        </div>

        {/* Multi-Filter Builder */}
        <div className="space-y-4 mb-12">
          <div className="bg-white p-3 rounded-2xl border border-[#dbbde5] shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 min-w-[240px] border-r border-slate-100 pr-4">
              <ListFilter className="w-5 h-5 text-[#471f8d]" />
              <select 
                value={currentCategory}
                onChange={(e) => { setCurrentCategory(e.target.value as FilterCategory); setTempValue(""); }}
                className="bg-transparent font-bold text-[#471f8d] focus:outline-none cursor-pointer w-full text-sm"
              >
                <option value="">+ Add Filter Parameter...</option>
                <option value="Name">Volunteer Name</option>
                <option value="Roles">Engagement Role</option>
                <option value="Expertise">Expertise Area</option>
                <option value="Metro Region">Location</option>
                <option value="Company">Organization</option>
              </select>
            </div>

            {currentCategory && (
              <div className="flex-1 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 w-full">
                {currentCategory === "Name" || currentCategory === "Company" ? (
                  <input 
                    autoFocus
                    type="text"
                    placeholder={`Search ${currentCategory}...`}
                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 outline-none text-sm"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFilter(tempValue)}
                  />
                ) : (
                  <select 
                    autoFocus
                    value={tempValue}
                    onChange={(e) => addFilter(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 outline-none font-medium text-slate-700 text-sm"
                  >
                    <option value="">Select Option...</option>
                    {getOptionsForCategory(currentCategory as FilterCategory).map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-2 bg-[#471f8d] text-white pl-4 pr-1 py-1.5 rounded-full text-[11px] font-bold shadow-md">
                <span className="opacity-60 uppercase text-[9px] mr-1">{cat}:</span>
                {val}
                <button onClick={() => removeFilter(cat as FilterCategory)} className="p-1 hover:bg-white/20 rounded-full ml-1">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-[#471f8d]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVolunteers.map((person) => (
              <Link 
                key={person.id} 
                href={`/volunteers/${person.id}`}
                className="group bg-white rounded-3xl p-8 border border-[#dbbde5] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#471f8d] text-white flex items-center justify-center font-bold text-2xl group-hover:rotate-3 transition-transform">
                    {person.Name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-[#471f8d] transition-colors leading-tight">
                      {person.Name}
                    </h2>
                    <p className="text-xs text-[#471f8d] font-black uppercase tracking-widest opacity-60">
                      {person.Title}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-slate-500">
                    <MapPin size={16} className="text-[#dbbde5]" />
                    <span className="text-sm font-medium">{person["Metro Region"]}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Briefcase size={16} className="text-[#dbbde5]" />
                    <span className="text-sm font-medium">{person.Company}</span>
                  </div>
                </div>

                {/* Engagement Roles Section - Parallel to "Events" styling */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
                   {person.Expertise && (
                     <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">
                       {person.Expertise}
                     </span>
                   )}
                   {/* Visual indicator for "Available Roles" */}
                   <div className="flex-1" />
                   <CheckCircle2 size={18} className="text-[#dbbde5] group-hover:text-[#471f8d] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}