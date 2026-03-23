'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Calendar, ExternalLink, Loader2, BookOpen, Clock, Search, Filter, X } from 'lucide-react';

interface IAEvent {
  id: string;
  "IA Event Date": string;
  Region: string;
  "Nearby Universities": string;
  "Suggested Lecture Window": string;
  "Course Alignment": string;
}

export default function OpportunitiesPage() {
  const [events, setEvents] = useState<IAEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      try {
        const q = query(collection(db, "event_calendar"), orderBy("IA Event Date", "asc"));
        const querySnapshot = await getDocs(q);
        
        const rawData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const uniqueData = Array.from(new Map(rawData.map(item => [
          `${item["IA Event Date"]}-${item["Nearby Universities"]}`, item
        ])).values());

        setEvents(uniqueData as IAEvent[]);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Filtering Logic
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = 
        event["Nearby Universities"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        event["Course Alignment"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        event["Suggested Lecture Window"].toLowerCase().includes(searchQuery.toLowerCase()) ||
        event["IA Event Date"].includes(searchQuery);
      
      const matchesRegion = selectedRegion === "" || event.Region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [events, searchQuery, selectedRegion]);

  // Unique Regions for the dropdown
  const regions = useMemo(() => {
    return Array.from(new Set(events.map(e => e.Region))).sort();
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
                <h1 className="text-4xl font-bold text-[#471f8d]" style={{ fontFamily: "Georgia, serif" }}>
                Opportunities
                </h1>
                {!loading && (
                    <span className="bg-[#471f8d]/10 text-[#471f8d] px-3 py-1 rounded-full text-sm font-bold border border-[#471f8d]/20">
                        {filteredEvents.length} {filteredEvents.length === 1 ? 'Opportunity' : 'Opportunities'}
                    </span>
                )}
            </div>
            <p className="text-lg text-slate-600 max-w-2xl" style={{ fontFamily: "Georgia, serif" }}>
              Campus events and course guest lectures discovered from the web.          
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Filter by University, Date, Lecture Window, or Course..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#471f8d]/20 focus:border-[#471f8d] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#471f8d]/20 appearance-none text-slate-700 font-medium"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">All Regions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-[#471f8d] mb-4" />
            <p className="text-slate-500 font-medium">Loading opportunities...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium italic">No matches found for your current filters.</p>
                <button 
                    onClick={() => {setSearchQuery(""); setSelectedRegion("");}}
                    className="mt-4 text-[#471f8d] font-bold hover:underline"
                >
                    Clear all filters
                </button>
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl hover:border-[#471f8d]/30 transition-all duration-300 flex flex-col h-full"
              >
                <div className="p-6 border-b border-slate-50 bg-slate-50/50 rounded-t-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#471f8d] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      {event.Region}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight" style={{ fontFamily: "Georgia, serif" }}>
                    {event["Nearby Universities"]}
                  </h3>
                </div>

                <div className="p-6 space-y-4 flex-grow">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#471f8d] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Event Date</p>
                      <p className="text-sm font-medium text-slate-700">{event["IA Event Date"]}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#471f8d] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Lecture Window</p>
                      <p className="text-sm text-slate-600 italic leading-snug">{event["Suggested Lecture Window"]}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-[#471f8d] mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Course Alignment</p>
                      <p className="text-sm text-slate-600 line-clamp-2">{event["Course Alignment"]}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 mt-auto">
                  <Link 
                    href={`/ia_events/${event.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#471f8d] text-[#471f8d] px-4 py-2.5 rounded-xl font-bold hover:bg-[#471f8d] hover:text-white transition-all duration-200 group"
                  >
                    Match Volunteer <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
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