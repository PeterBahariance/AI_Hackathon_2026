'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Loader2, BookOpen, Clock, ListFilter, X, PlusCircle, User, Zap, ArrowLeft, ArrowRight, Calendar } from 'lucide-react';

interface ICourse {
  id: string;
  Instructor: string;
  Course: string;
  Section: string;
  Title: string;
  Days: string;
  "Start Time": string;
  "End Time": string;
  "Enrl Cap": string;
  Mode: string;
  "Guest Lecture Fit": string;
}

// Categories based on your CSV structure
type FilterCategory = "Instructor" | "Title" | "Days" | "Mode" | "Guest Lecture Fit";

export default function CoursesPage() {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Multi-Filter State
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterCategory, string>>>({});
  const [currentCategory, setCurrentCategory] = useState<FilterCategory | "">("");
  const [tempValue, setTempValue] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const querySnapshot = await getDocs(collection(db, "courses"));
        const data = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as ICourse[];
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Advanced Filter Logic
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      return (Object.entries(activeFilters) as [FilterCategory, string][]).every(([category, value]) => {
        const courseValue = course[category] || ""; 
        return courseValue.toLowerCase().includes(value.toLowerCase());
      });
    });
  }, [courses, activeFilters]);
  
  // Unique values for dropdowns (Dynamic based on CSV data)
  const getOptionsForCategory = (cat: FilterCategory) => {
    return Array.from(new Set(courses.map(c => c[cat]))).filter(Boolean).sort();
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

  const getFitStyles = (fit: string) => {
    switch (fit?.toLowerCase()) {
      case 'high': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Navigation Back Button */}
        <div className="max-w-7xl mx-auto px-6 mb-4">
        <Link 
            href="/opportunities" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#471f8d] transition-colors font-bold text-sm group"
        >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Opportunity Center
        </Link>
        </div>

        {/* Header Section */}
        <div className="mb-10 flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-blue-700 mb-2" style={{ fontFamily: "Georgia, serif" }}>Course Catalog</h1>
            <p className="text-slate-600" style={{ fontFamily: "Georgia, serif" }}>Academic alignment discovery engine.</p>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-blue-700 opacity-20 block leading-none">
              {filteredCourses.length}
            </span>
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">
              Sections Found
            </span>
          </div>
        </div>

        {/* Multi-Filter Builder (Matched to Events UI) */}
        <div className="space-y-4 mb-12">
          <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 min-w-[200px] border-r border-slate-100 pr-4">
              <ListFilter className="w-5 h-5 text-blue-600" />
              <select 
                value={currentCategory}
                onChange={(e) => { setCurrentCategory(e.target.value as FilterCategory); setTempValue(""); }}
                className="bg-transparent font-bold text-blue-700 focus:outline-none cursor-pointer w-full"
              >
                <option value="">+ Add Filter...</option>
                <option value="Title">Course Title</option>
                <option value="Instructor">Instructor</option>
                <option value="Guest Lecture Fit">Fit Level</option>
                <option value="Mode">Teaching Mode</option>
                <option value="Days">Days</option>
              </select>
            </div>

            {currentCategory && (
              <div className="flex-1 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 w-full">
                {currentCategory === "Title" || currentCategory === "Instructor" ? (
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search keywords..."
                    className="flex-1 bg-slate-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                {(currentCategory === "Title" || currentCategory === "Instructor") && (
                  <button onClick={() => addFilter(tempValue)} className="text-blue-600 p-2 hover:bg-blue-50 rounded-lg">
                    <PlusCircle size={24} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-2 bg-blue-600 text-white pl-3 pr-1 py-1 rounded-full text-xs font-bold shadow-md">
                <span className="opacity-70 uppercase text-[9px] mr-1">{cat}:</span>
                {val}
                <button onClick={() => removeFilter(cat as FilterCategory)} className="p-1 hover:bg-white/20 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ))}
            {Object.keys(activeFilters).length > 0 && (
              <button onClick={() => setActiveFilters({})} className="text-slate-400 text-xs font-bold hover:text-blue-600 px-2">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Grid Section */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden group border-b-4 border-b-transparent hover:border-b-blue-600">
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                      {course.Course} • Sec {course.Section}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-md border ${getFitStyles(course["Guest Lecture Fit"])}`}>
                      {course["Guest Lecture Fit"]} Guest Lecture Fit
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 h-14 line-clamp-2" style={{ fontFamily: "Georgia, serif" }}>
                    {course.Title}
                  </h3>
                </div>

                <div className="px-8 py-4 space-y-6 flex-grow">
                  <div className="flex gap-4 items-center border-l-2 border-blue-600/10 pl-4 group-hover:border-blue-600 transition-colors">
                    <User className="w-5 h-5 text-blue-600" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instructor</p><p className="text-sm font-bold text-slate-700">{course.Instructor}</p></div>
                  </div>
                  <div className="flex gap-4 items-center border-l-2 border-blue-600/10 pl-4 group-hover:border-blue-600 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</p><p className="text-sm text-slate-600 font-medium italic">{course.Days} | {course["Start Time"]} - {course["End Time"]}</p></div>
                  </div>
                  <div className="flex gap-4 items-center border-l-2 border-blue-600/10 pl-4 group-hover:border-blue-600 transition-colors">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mode</p><p className="text-sm text-slate-600 font-medium">{course.Mode}</p></div>
                  </div>
                </div>

                <div className="p-8 pt-0 mt-auto">
                  <Link href={`/opportunities/courses/${course.id}`} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/40">
                    Course Details <ArrowRight size={16} />
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