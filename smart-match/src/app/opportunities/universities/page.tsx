'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Building2, Mail, ExternalLink, Loader2, Users, ListFilter, X, PlusCircle, ArrowLeft, Copy, Check, Search, Sparkles, ArrowRight } from 'lucide-react';
import { discoverUniversityOpportunities, type DiscoveredContact } from '@/lib/geminiDiscovery';

interface EventContact {
  id: string;
  eventName: string;
  category: string;
  contact: string;
  email: string;
  host: string;
  roles: string;
  audience: string;
  url: string;
  recurrence: string;
}

type FilterCategory = "Category" | "Roles" | "Host";

export default function UniversitiesPage() {
  const [contacts, setContacts] = useState<EventContact[]>([]);
  const [loading, setLoading] = useState(true);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterCategory, string>>>({});
  const [currentCategory, setCurrentCategory] = useState<FilterCategory | "">("");
  const [tempValue, setTempValue] = useState("");

  // ── Discovery state ────────────────────────────────────────────────────
  const [universityInput, setUniversityInput] = useState("");
  const [discoveredContacts, setDiscoveredContacts] = useState<DiscoveredContact[]>([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState<string | null>(null);
  const [discoveredUniversity, setDiscoveredUniversity] = useState<string>("");

  const handleDiscover = async () => {
    if (!universityInput.trim()) return;
    setDiscoveryLoading(true);
    setDiscoveryError(null);
    setDiscoveredContacts([]);
    try {
      const results = await discoverUniversityOpportunities(universityInput.trim());
      setDiscoveredContacts(results);
      setDiscoveredUniversity(universityInput.trim());
    } catch {
      setDiscoveryError('Failed to discover opportunities. Please try again.');
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const sendToMatching = (contact: DiscoveredContact) => {
    const event = {
      type: 'event' as const,
      id: contact.id,
      name: contact.eventName,
      category: contact.category,
      region: discoveredUniversity,
      date: '',
      volunteerRoles: contact.roles,
      courseAlignment: contact.category,
      nearbyUniversities: discoveredUniversity,
      suggestedLectureWindow: '',
    };
    const existing = JSON.parse(sessionStorage.getItem('discoveredOpportunities') || '[]');
    // Avoid duplicates
    if (!existing.find((e: { id: string }) => e.id === event.id)) {
      existing.push(event);
    }
    sessionStorage.setItem('discoveredOpportunities', JSON.stringify(existing));

    // Also store contact info so the match detail page can show outreach
    const existingContacts = JSON.parse(sessionStorage.getItem('discoveredContacts') || '[]');
    if (!existingContacts.find((c: { id: string }) => c.id === contact.id)) {
      existingContacts.push(contact);
    }
    sessionStorage.setItem('discoveredContacts', JSON.stringify(existingContacts));
    window.location.href = `/matching?tab=campus-events&opp=${encodeURIComponent(contact.id)}`;
  };

  useEffect(() => {
    async function fetchContacts() {
      try {
        const snap = await getDocs(collection(db, "events_contacts"));
        const records: EventContact[] = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            eventName: data["Event / Program"] || "",
            category: data["Category"] || "",
            contact: data["Point(s) of Contact (published)"] || "",
            email: data["Contact Email / Phone (published)"] || "",
            host: data["Host / Unit"] || "",
            roles: data["Volunteer Roles (fit)"] || "",
            audience: data["Primary Audience"] || "",
            url: data["Public URL"] || "",
            recurrence: data["Recurrence (typical)"] || "",
          };
        });
        setContacts(records);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      return (Object.entries(activeFilters) as [FilterCategory, string][]).every(([category, value]) => {
        if (category === "Category") return c.category.toLowerCase().includes(value.toLowerCase());
        if (category === "Roles") return c.roles.toLowerCase().includes(value.toLowerCase());
        if (category === "Host") return c.host.toLowerCase().includes(value.toLowerCase());
        return true;
      });
    });
  }, [contacts, activeFilters]);

  const getOptionsForCategory = (cat: FilterCategory) => {
    if (cat === "Category") return Array.from(new Set(contacts.map(c => c.category))).sort();
    if (cat === "Host") return Array.from(new Set(contacts.map(c => c.host))).sort();
    return [];
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

  const categoryColor: Record<string, { bg: string; text: string; border: string }> = {
    "AI / Hackathon": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
    "Case competition": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    "Entrepreneurship / Pitch": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
    "Tech symposium / Speakers": { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
    "Hackathon": { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
    "Research showcase": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    "Research symposium": { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
    "Career services": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    "Career fairs": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  };

  const getStyle = (category: string) => categoryColor[category] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <Link href="/opportunities" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors font-bold text-sm group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Opportunity Center
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-4xl font-bold text-emerald-700 mb-2" style={{ fontFamily: "Georgia, serif" }}>University Outreach</h1>
            <p className="text-slate-600" style={{ fontFamily: "Georgia, serif" }}>Browse event contacts at partner universities and initiate outreach.</p>
          </div>
          <div className="text-right">
            <span className="text-5xl font-black text-emerald-700 opacity-20 block leading-none">
              {filteredContacts.length}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
              Contacts
            </span>
          </div>
        </div>

        {/* ── AI Discovery Panel ─────────────────────────────────────── */}
        <div className="mb-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles size={20} className="text-emerald-200" />
            <h2 className="text-xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
              Discover Opportunities at Any University
            </h2>
          </div>
          <p className="text-emerald-100 text-sm mb-6">
            Enter a university name and our AI will identify engagement opportunities — hackathons, career fairs, competitions, guest lecture programs, and more.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={universityInput}
              onChange={(e) => setUniversityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDiscover()}
              placeholder="e.g. UCLA, San Diego State, Portland State..."
              className="flex-1 bg-white/15 backdrop-blur-sm text-white placeholder-emerald-200 border border-white/20 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:ring-2 focus:ring-white/40"
            />
            <button
              onClick={handleDiscover}
              disabled={discoveryLoading || !universityInput.trim()}
              className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
            >
              {discoveryLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Discovering...</>
              ) : (
                <><Search size={16} /> Discover</>
              )}
            </button>
          </div>
          {discoveryError && (
            <p className="mt-4 text-red-200 text-sm font-medium">{discoveryError}</p>
          )}
        </div>

        {/* ── Discovered Results ──────────────────────────────────────── */}
        {discoveredContacts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                <Sparkles size={12} />
                AI Discovered
              </div>
              <h3 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "Georgia, serif" }}>
                {discoveredContacts.length} Opportunities at {discoveredUniversity}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {discoveredContacts.map((c) => {
                const style = getStyle(c.category);
                return (
                  <div key={c.id} className="bg-white border-2 border-dashed border-emerald-300 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden group hover:border-emerald-600">
                    <div className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.text} ${style.bg} px-3 py-1 rounded-lg`}>
                          {c.category}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full">
                          <Sparkles size={9} />AI Discovered
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1" style={{ fontFamily: "Georgia, serif" }}>
                        {c.eventName}
                      </h3>
                      <p className="text-xs text-slate-500">{c.host}</p>
                    </div>

                    <div className="px-8 py-4 space-y-4 flex-grow">
                      <div className="flex gap-3 items-start border-l-2 border-emerald-600/10 pl-4 group-hover:border-emerald-600 transition-colors">
                        <Users className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roles Needed</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.roles.split(";").map(role => (
                              <span key={role.trim()} className="text-[9px] font-bold bg-emerald-600/10 text-emerald-700 px-2 py-0.5 rounded-md">
                                {role.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start border-l-2 border-emerald-600/10 pl-4 group-hover:border-emerald-600 transition-colors">
                        <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                          <p className="text-sm font-medium text-slate-700">{c.contact}</p>
                          {c.email && (
                            <p className="text-sm text-emerald-700 font-bold">{c.email}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 items-start border-l-2 border-emerald-600/10 pl-4 group-hover:border-emerald-600 transition-colors">
                        <Building2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audience</p>
                          <p className="text-sm text-slate-700">{c.audience}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 pt-0 mt-auto flex gap-3">
                      <button
                        onClick={() => sendToMatching(c)}
                        className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/40"
                      >
                        Send to Matching <ArrowRight size={16} />
                      </button>
                      {c.url && (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center w-14 bg-slate-100 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 py-4 rounded-2xl transition-colors"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-12 mb-2">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Existing CPP Contacts</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>
          </div>
        )}

        {/* Filter Builder */}
        <div className="space-y-4 mb-12">
          <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 min-w-[200px] border-r border-slate-100 pr-4">
              <ListFilter className="w-5 h-5 text-emerald-700" />
              <select
                value={currentCategory}
                onChange={(e) => { setCurrentCategory(e.target.value as FilterCategory); setTempValue(""); }}
                className="bg-transparent font-bold text-emerald-700 focus:outline-none cursor-pointer w-full"
              >
                <option value="">+ Add Filter...</option>
                <option value="Category">Category</option>
                <option value="Roles">Volunteer Role</option>
                <option value="Host">Host / Unit</option>
              </select>
            </div>

            {currentCategory && (
              <div className="flex-1 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 w-full">
                {currentCategory === "Roles" ? (
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search roles (e.g. Judge, Mentor)..."
                    className="flex-1 bg-slate-50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-600/20 outline-none"
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
                {currentCategory === "Roles" && (
                  <button onClick={() => addFilter(tempValue)} className="text-emerald-700 p-2 hover:bg-emerald-50 rounded-lg">
                    <PlusCircle size={24} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Active Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([cat, val]) => (
              <div key={cat} className="flex items-center gap-2 bg-emerald-700 text-white pl-3 pr-1 py-1 rounded-full text-xs font-bold shadow-md animate-in slide-in-from-top-1">
                <span className="opacity-70 uppercase text-[9px] mr-1">{cat}:</span>
                {val}
                <button onClick={() => removeFilter(cat as FilterCategory)} className="p-1 hover:bg-white/20 rounded-full">
                  <X size={14} />
                </button>
              </div>
            ))}
            {Object.keys(activeFilters).length > 0 && (
              <button onClick={() => setActiveFilters({})} className="text-slate-400 text-xs font-bold hover:text-emerald-700 px-2">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-700" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredContacts.map((c) => {
              const style = getStyle(c.category);
              const hasEmail = c.email && !c.email.startsWith("See") && !c.email.startsWith("Use");
              return (
                <div key={c.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full overflow-hidden group border-b-4 border-b-transparent hover:border-b-emerald-600">
                  <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${style.text} ${style.bg} px-3 py-1 rounded-lg`}>
                        {c.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{c.recurrence}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-1" style={{ fontFamily: "Georgia, serif" }}>
                      {c.eventName}
                    </h3>
                    <p className="text-xs text-slate-500">{c.host}</p>
                  </div>

                  <div className="px-8 py-4 space-y-4 flex-grow">
                    <div className="flex gap-3 items-start border-l-2 border-emerald-600/10 pl-4 group-hover:border-emerald-600 transition-colors">
                      <Users className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roles Needed</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.roles.split(";").map(role => (
                            <span key={role.trim()} className="text-[9px] font-bold bg-emerald-600/10 text-emerald-700 px-2 py-0.5 rounded-md">
                              {role.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start border-l-2 border-emerald-600/10 pl-4 group-hover:border-emerald-600 transition-colors">
                      <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</p>
                        <p className="text-sm font-medium text-slate-700">{c.contact}</p>
                        {hasEmail ? (
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`mailto:${c.email}`} className="text-sm text-emerald-700 font-bold hover:underline">
                              {c.email}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard?.writeText(c.email);
                                setCopiedId(c.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 rounded-md hover:bg-emerald-100 transition-colors"
                              title="Copy email"
                            >
                              {copiedId === c.id ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} className="text-slate-400 hover:text-emerald-600" />
                              )}
                            </button>
                          </div>
                        ) : c.email ? (
                          <p className="text-xs text-slate-500 italic mt-0.5">{c.email}</p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 mt-auto flex gap-3">
                    {hasEmail ? (
                      <>
                        <Link
                          href={`/outreach?contact=${encodeURIComponent(c.id)}&event=${encodeURIComponent(c.eventName)}`}
                          className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/40"
                        >
                          Draft Outreach <Mail size={16} />
                        </Link>
                        {c.url && (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-14 bg-slate-100 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 py-4 rounded-2xl transition-colors"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                      </>
                    ) : c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/40"
                      >
                        Visit Event Page <ExternalLink size={16} />
                      </a>
                    ) : (
                      <span className="flex-1 flex items-center justify-center gap-3 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                        No Contact Available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
