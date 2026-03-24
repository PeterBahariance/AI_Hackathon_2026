'use client';

import React, { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { 
  Loader2, User, ChevronLeft, MapPin, Building2, Briefcase, 
  Calendar, ExternalLink, BookOpen, Clock, ListFilter, X, PlusCircle 
} from 'lucide-react';

interface IAEvent {
  id: string;
  "IA Event Date": string;
  Region: string;
  "Nearby Universities": string;
  "Suggested Lecture Window": string;
  "Course Alignment": string;
}

type FilterCategory = "Region" | "IA Event Date" | "Suggested Lecture Window" | "Course Alignment";

export default function VolunteerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap the params promise (Next 15+ convention)
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [volunteer, setVolunteer] = useState<any>(null);
  const [events, setEvents] = useState<IAEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Multi-Filter State
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterCategory, string>>>({});
  const [currentCategory, setCurrentCategory] = useState<FilterCategory | "">("");
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Volunteer Data
        const docRef = doc(db, "volunteers", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setVolunteer({ id: docSnap.id, ...docSnap.data() });
        }

        // 2. Fetch Events for matching
        const q = query(collection(db, "event_calendar"), orderBy("IA Event Date", "asc"));
        const querySnapshot = await getDocs(q);
        
        const rawData = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as IAEvent[];

        // Deduplication
        const uniqueData = Array.from(new Map(rawData.map(item => [
          `${item["IA Event Date"]}-${item["Nearby Universities"]}`, item
        ])).values());

        setEvents(uniqueData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Client-side Filter Logic for Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      return (Object.entries(activeFilters) as [FilterCategory, string][]).every(([category, value]) => {
        const eventValue = event[category]; 
        return eventValue ? eventValue.toLowerCase().includes(value.toLowerCase()) : false;
      });
    });
  }, [events, activeFilters]);

  // Unique values for dropdowns
  const getOptionsForCategory = (cat: FilterCategory) => {
    return Array.from(new Set(events.map(e => e[cat]))).filter(Boolean).sort();
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#471f8d] mb-4" />
        <p className="text-slate-500 font-medium">Loading Data Profiles...</p>
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
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Smart Back Button */}
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-3 text-slate-500 hover:text-[#471f8d] transition-all mb-10 bg-transparent border-none cursor-pointer p-0"
        >
          <div className="p-2 rounded-full bg-white border border-slate-200 group-hover:border-[#471f8d] group-hover:bg-[#f9f5ff] shadow-sm transition-all">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-semibold text-sm uppercase tracking-widest">
            Back to Volunteers
          </span>
        </button>

        {/* Header Grid: Volunteer Profile info + Match Counter Statistics */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-12 border-b border-slate-200 pb-8 gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-28 h-28 rounded-3xl bg-[#471f8d] text-white flex items-center justify-center font-bold text-4xl shadow-lg shrink-0">
              {volunteer.Name ? volunteer.Name.charAt(0) : <User size={42} />}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
                {volunteer.Name}
              </h1>
              <p className="text-xl text-[#471f8d] font-semibold mb-4">
                {volunteer.Title}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-[#dbbde5]" />
                  <span>{volunteer.Company || "Independent IA Consultant"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#dbbde5]" />
                  <span>{volunteer["Metro Region"] || "Remote"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-[#dbbde5]" />
                  <span>{volunteer.Expertise || "Strategy & Operations"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right ml-auto bg-white p-6 rounded-3xl border border-[#dbbde5] shadow-sm flex flex-col items-center justify-center min-w-[160px]">
            <span className="text-5xl font-black text-[#471f8d] leading-none mb-1">
              {filteredEvents.length}
            </span>
            <span className="text-[10px] font-bold text-[#471f8d] uppercase tracking-widest text-center">
              Matched Engagements
            </span>
          </div>
        </div>

        {/* Multi-Filter Pipeline */}
        <div className="space-y-4 mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
            Discovery Match Engine
          </h2>
          <div className="bg-white p-3 rounded-2xl border border-[#dbbde5] shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 min-w-[200px] border-r border-slate-100 pr-4">
              <ListFilter className="w-5 h-5 text-[#471f8d]" />
              <select 
                value={currentCategory}
                onChange={(e) => { setCurrentCategory(e.target.value as FilterCategory); setTempValue(""); }}
                className="bg-transparent font-bold text-[#471f8d] focus:outline-none cursor-pointer w-full text-sm"
              >
                <option value="">+ Add Match Filter...</option>
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
                    className="flex-1 bg-slate-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#471f8d]/20 outline-none text-sm"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFilter(tempValue)}
                  />
                ) : (
                  <select 
                    autoFocus
                    value={tempValue}
                    onChange={(e) => addFilter(e.target.value)}
                    className="flex-1 bg-slate-50 border-none rounded-lg px-4 py-2 outline-none font-medium text-slate-700 text-sm"
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

        {/* Dynamic Engagements Grid */}
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
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-bold text-slate-700">{event["IA Event Date"]}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center border-l-2 border-[#471f8d]/10 pl-4 group-hover:border-[#471f8d] transition-colors">
                  <Clock className="w-5 h-5 text-[#471f8d]" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Window</p>
                    <p className="text-sm text-slate-600 font-medium italic">{event["Suggested Lecture Window"]}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-center border-l-2 border-[#471f8d]/10 pl-4 group-hover:border-[#471f8d] transition-colors">
                  <BookOpen className="w-5 h-5 text-[#471f8d]" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course</p>
                    <p className="text-sm text-slate-600 font-medium line-clamp-2">{event["Course Alignment"]}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 mt-auto">
                <button className="w-full flex items-center justify-center gap-3 bg-[#471f8d] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#36176d] transition-all shadow-lg hover:shadow-[#471f8d]/40">
                  Submit Pairing <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-20 border-2 border-dashed border-[#dbbde5] rounded-3xl bg-white/50">
              <p className="text-slate-500 italic font-medium">No engagements match the criteria for this volunteer profile.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}