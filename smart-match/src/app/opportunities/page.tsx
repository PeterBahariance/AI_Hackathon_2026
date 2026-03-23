'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Calendar, ExternalLink, Loader2, BookOpen, Clock, ListFilter, X, PlusCircle } from 'lucide-react';

interface IAEvent {
  id: string;
  "IA Event Date": string;
  Region: string;
  "Nearby Universities": string;
  "Suggested Lecture Window": string;
  "Course Alignment": string;
}

type FilterCategory = "Region" | "IA Event Date" | "Suggested Lecture Window" | "Course Alignment";

export default function OpportunitiesPage() {
  const [events, setEvents] = useState<IAEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Multi-Filter State
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterCategory, string>>>({});
  const [currentCategory, setCurrentCategory] = useState<FilterCategory | "">("");
  const [tempValue, setTempValue] = useState("");

useEffect(() => {
    async function fetchEvents() {
      try {
        const q = query(collection(db, "event_calendar"), orderBy("IA Event Date", "asc"));
        const querySnapshot = await getDocs(q);
        
        // Cast the raw data to IAEvent immediately
        const rawData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as IAEvent[];

        // Use the typed rawData for de-duplication
        const uniqueData = Array.from(new Map(rawData.map(item => [
          `${item["IA Event Date"]}-${item["Nearby Universities"]}`, item
        ])).values());

        setEvents(uniqueData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Filter Logic
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      return (Object.entries(activeFilters) as [FilterCategory, string][]).every(([category, value]) => {
        // Use bracket notation with the category variable
        const eventValue = event[category]; 
        return eventValue.toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [events, activeFilters]);
  
  // Unique values for dropdowns
  const getOptionsForCategory = (cat: FilterCategory) => {
    return Array.from(new Set(events.map(e => e[cat]))).sort();
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
        <div className="mb-10 flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-[#471f8d] mb-2" style={{ fontFamily: "Georgia, serif" }}>Opportunities</h1>
            <p className="text-slate-600" style={{ fontFamily: "Georgia, serif" }}>University engagement discovery engine.</p>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-[#471f8d] opacity-20 block leading-none">
              {filteredEvents.length}
            </span>
            <span className="text-[10px] font-bold text-[#471f8d] uppercase tracking-widest">
              Available Matches
            </span>
          </div>
        </div>

        {/* Multi-Filter Builder */}
        <div className="space-y-4 mb-12">
          <div className="bg-white p-3 rounded-2xl border border-[#dbbde5] shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 min-w-[200px] border-r border-slate-100 pr-4">
              <ListFilter className="w-5 h-5 text-[#471f8d]" />
              <select 
                value={currentCategory}
                onChange={(e) => { setCurrentCategory(e.target.value as FilterCategory); setTempValue(""); }}
                className="bg-transparent font-bold text-[#471f8d] focus:outline-none cursor-pointer w-full"
              >
                <option value="">+ Add Filter...</option>
                <option value="Region">Location</option>
                <option value="IA Event Date">Date</option>
                <option value="Suggested Lecture Window">Lecture Window</option>
                <option value="Course Alignment">Course Alignment</option>
              </select>
            </div>

            {currentCategory && (
              <div className="flex-1 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 w-full">
                {currentCategory === "Course Alignment" ? (
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search keywords..."
                    className="flex-1 bg-slate-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#471f8d]/20 outline-none"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFilter(tempValue)}
                  />
                ) : (
                  <select 
                    autoFocus
                    value={tempValue}
                    onChange={(e) => addFilter(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-lg px-4 py-2 outline-none font-medium text-slate-700"
                  >
                    <option value="">Select option...</option>
                    {getOptionsForCategory(currentCategory).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                )}
                {currentCategory === "Course Alignment" && (
                  <button onClick={() => addFilter(tempValue)} className="text-[#471f8d] p-2 hover:bg-[#f4efff] rounded-lg">
                    <PlusCircle size={24} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-2 bg-[#471f8d] text-white pl-3 pr-1 py-1 rounded-full text-xs font-bold shadow-md animate-in slide-in-from-top-1">
                <span className="opacity-70 uppercase text-[9px] mr-1">{cat}:</span>
                {val}
                <button onClick={() => removeFilter(cat as FilterCategory)} className="p-1 hover:bg-white/20 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ))}
            {Object.keys(activeFilters).length > 0 && (
              <button onClick={() => setActiveFilters({})} className="text-slate-400 text-xs font-bold hover:text-[#471f8d] px-2">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#471f8d]" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden group border-b-4 border-b-transparent hover:border-b-[#471f8d]">
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#471f8d] bg-[#f4efff] px-3 py-1 rounded-lg">
                      {event.Region}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-2" style={{ fontFamily: "Georgia, serif" }}>
                    {event["Nearby Universities"]}
                  </h3>
                </div>

                <div className="px-8 py-4 space-y-6 flex-grow">
                  <div className="flex gap-4 items-center border-l-2 border-[#471f8d]/10 pl-4 group-hover:border-[#471f8d] transition-colors">
                    <Calendar className="w-5 h-5 text-[#471f8d]" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p><p className="text-sm font-bold text-slate-700">{event["IA Event Date"]}</p></div>
                  </div>
                  <div className="flex gap-4 items-center border-l-2 border-[#471f8d]/10 pl-4 group-hover:border-[#471f8d] transition-colors">
                    <Clock className="w-5 h-5 text-[#471f8d]" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Window</p><p className="text-sm text-slate-600 font-medium italic">{event["Suggested Lecture Window"]}</p></div>
                  </div>
                  <div className="flex gap-4 items-center border-l-2 border-[#471f8d]/10 pl-4 group-hover:border-[#471f8d] transition-colors">
                    <BookOpen className="w-5 h-5 text-[#471f8d]" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</p><p className="text-sm text-slate-600 font-medium line-clamp-2">{event["Course Alignment"]}</p></div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <Link href={`/ia_events/${event.id}`} className="w-full flex items-center justify-center gap-3 bg-[#471f8d] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#36176d] transition-all shadow-lg hover:shadow-[#471f8d]/40">
                    Match Volunteer <ExternalLink size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}