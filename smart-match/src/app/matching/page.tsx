'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  Loader2, Target, MapPin, BookOpen, Users,
  ChevronRight, Zap, ShieldCheck, FlaskConical, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { MOCK_VOLUNTEER_PROFILES, REAL_MEMBER_NAMES } from '@/data/pipelineData';
import {
  rankVolunteersForOpportunity,
  rankOpportunitiesForVolunteer,
  type MatchVolunteer,
  type MatchOpportunity,
  type MatchOpportunityEvent,
  type MatchOpportunityCourse,
  type MatchResult,
} from '@/lib/matchingEngine';
import { WEIGHTS, FACTOR_LABELS } from '@/lib/matchingConstants';
import MatchScoreBadge from '@/components/MatchScoreBadge';

// ── Tab type ────────────────────────────────────────────────────────────────
type OpportunityTab = 'ia-events' | 'campus-events' | 'courses';

// ── Campus events (static — from CSV, not in Firestore) ─────────────────────
const CAMPUS_EVENTS: MatchOpportunityEvent[] = [
  { type: 'event', id: 'cpp-hackathon', name: 'AI for a Better Future Hackathon', category: 'AI / Hackathon', region: 'Los Angeles', date: '2026-04-16', volunteerRoles: 'Judge; Mentor; Guest speaker', courseAlignment: 'AI, marketing research, innovation', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-itc', name: 'Information Technology Competition (ITC)', category: 'Case competition', region: 'Los Angeles', date: '2026-04-01', volunteerRoles: 'Judge; Mentor; Guest speaker', courseAlignment: 'MIS, analytics, business', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-startup', name: 'Bronco Startup Challenge (SIIL)', category: 'Entrepreneurship / Pitch', region: 'Los Angeles', date: '2026-05-01', volunteerRoles: 'Judge; Mentor; Workshop speaker', courseAlignment: 'entrepreneurship, innovation, business strategy', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-swift', name: 'SWIFT Tech Symposium', category: 'Tech symposium / Speakers', region: 'Los Angeles', date: '2026-03-15', volunteerRoles: 'Guest speaker; Workshop lead; Panelist', courseAlignment: 'technology, digital transformation', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-broncohacks', name: 'BroncoHacks', category: 'Hackathon', region: 'Los Angeles', date: '2026-04-20', volunteerRoles: 'Judge; Speaker; Volunteer', courseAlignment: 'hackathon, tech, coding', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-research', name: 'OUR — RSCA Conference', category: 'Research showcase', region: 'Los Angeles', date: '2026-05-15', volunteerRoles: 'Panelist; Reviewer; Guest speaker', courseAlignment: 'research methods, undergraduate research', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-careers', name: 'CPP Career Center — Career Fairs', category: 'Career fairs', region: 'Los Angeles', date: '2026-04-10', volunteerRoles: 'Industry panelist; Employer-side speaker', courseAlignment: 'career development, industry insights', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
  { type: 'event', id: 'cpp-sci-symposium', name: 'College of Science Research Symposium', category: 'Research symposium', region: 'Los Angeles', date: '2026-05-20', volunteerRoles: 'Judge; Reviewer; Guest speaker', courseAlignment: 'data science, research', nearbyUniversities: 'Cal Poly Pomona', suggestedLectureWindow: '' },
];

function MatchingPageContent() {
  const searchParams = useSearchParams();

  // ── State ───────────────────────────────────────────────────────────────
  const [volunteers, setVolunteers] = useState<MatchVolunteer[]>([]);
  const [iaEvents, setIaEvents] = useState<MatchOpportunityEvent[]>([]);
  const [courses, setCourses] = useState<MatchOpportunityCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<OpportunityTab>((searchParams.get('tab') as OpportunityTab) || 'ia-events');
  const [selectedOppId, setSelectedOppId] = useState<string | null>(searchParams.get('opp'));
  const [minScore, setMinScore] = useState(0);

  // ── Discovered opportunities from University Discovery ──────────────
  const [discoveredEvents, setDiscoveredEvents] = useState<MatchOpportunityEvent[]>([]);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('discoveredOpportunities');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setDiscoveredEvents(parsed);
      }
    } catch { /* ignore parse errors */ }
  }, []);

  // ── Auth / Personalization ──────────────────────────────────────────
  const [userProfile, setUserProfile] = useState<{ username: string; role: string; metroRegion: string; expertise: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const d = userDoc.data();
          setUserProfile({
            username: d.username || firebaseUser.displayName || 'User',
            role: d.role || '',
            metroRegion: d.metroRegion || '',
            expertise: d.expertise || '',
          });
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsub();
  }, []);

  // ── Data Fetching ─────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      try {
        const [volSnap, eventSnap, courseSnap] = await Promise.all([
          getDocs(collection(db, 'volunteers')),
          getDocs(query(collection(db, 'event_calendar'), orderBy('IA Event Date', 'asc'))),
          getDocs(collection(db, 'courses')),
        ]);

        // Volunteers
        const firestoreVols: MatchVolunteer[] = volSnap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            Name: d.Name || '',
            Title: d.Title || '',
            Company: d.Company || '',
            'Metro Region': d['Metro Region'] || '',
            Expertise: d.Expertise || d['Expertise Tags'] || '',
            'Board Role': d['Board Role'] || '',
            isMock: !REAL_MEMBER_NAMES.has(d.Name || ''),
          };
        });
        const mockVols: MatchVolunteer[] = MOCK_VOLUNTEER_PROFILES.map(m => ({
          id: m.id,
          Name: m.Name,
          Title: m.Title,
          Company: m.Company,
          'Metro Region': m['Metro Region'],
          Expertise: m.Expertise,
          'Board Role': m['Board Role'] || '',
          isMock: true,
        }));
        setVolunteers([...firestoreVols, ...mockVols]);

        // IA Events
        const rawEvents = eventSnap.docs.map(doc => {
          const d = doc.data();
          return {
            type: 'event' as const,
            id: doc.id,
            name: d['Nearby Universities'] || d['Region'] || 'IA Event',
            category: d['Course Alignment'] || '',
            region: d['Region'] || '',
            date: d['IA Event Date'] || '',
            volunteerRoles: 'Guest speaker; Panelist; Mentor',
            courseAlignment: d['Course Alignment'] || '',
            nearbyUniversities: d['Nearby Universities'] || '',
            suggestedLectureWindow: d['Suggested Lecture Window'] || '',
          };
        });
        // Deduplicate
        const unique = Array.from(new Map(rawEvents.map(e => [`${e.date}-${e.nearbyUniversities}`, e])).values());
        setIaEvents(unique);

        // Courses
        const rawCourses: MatchOpportunityCourse[] = courseSnap.docs.map(doc => {
          const d = doc.data();
          return {
            type: 'course' as const,
            id: doc.id,
            name: d.Title || '',
            courseCode: d.Course || '',
            instructor: d.Instructor || '',
            guestLectureFit: d['Guest Lecture Fit'] || 'Medium',
            enrollmentCap: parseInt(d['Enrl Cap'] || '30', 10),
            mode: d.Mode || '',
            days: d.Days || '',
            startTime: d['Start Time'] || '',
            endTime: d['End Time'] || '',
          };
        });
        setCourses(rawCourses);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Current opportunities for selected tab ────────────────────────────
  const campusEvents = useMemo(() => [...CAMPUS_EVENTS, ...discoveredEvents], [discoveredEvents]);

  const currentOpportunities: MatchOpportunity[] = useMemo(() => {
    if (activeTab === 'ia-events') return iaEvents;
    if (activeTab === 'campus-events') return campusEvents;
    return courses;
  }, [activeTab, iaEvents, campusEvents, courses]);

  const selectedOpportunity = useMemo(
    () => currentOpportunities.find(o => o.id === selectedOppId) || null,
    [currentOpportunities, selectedOppId]
  );

  // ── Compute rankings ─────────────────────────────────────────────────
  const rankedResults: MatchResult[] = useMemo(() => {
    if (!selectedOpportunity || volunteers.length === 0) return [];
    return rankVolunteersForOpportunity(volunteers, selectedOpportunity)
      .filter(r => r.totalScore >= minScore);
  }, [volunteers, selectedOpportunity, minScore]);

  // ── Personalized recommendations for logged-in user ──────────────────
  const personalizedMatches = useMemo(() => {
    if (!userProfile || volunteers.length === 0) return [];

    // Create a pseudo-volunteer from the user's profile
    const userAsVolunteer: MatchVolunteer = {
      id: 'current-user',
      Name: userProfile.username,
      Title: userProfile.role,
      Company: 'IA West',
      'Metro Region': userProfile.metroRegion,
      Expertise: userProfile.expertise,
      'Board Role': userProfile.role,
    };

    // Score all opportunities for this user
    const allOpps: MatchOpportunity[] = [...iaEvents, ...campusEvents, ...courses];
    return rankOpportunitiesForVolunteer(userAsVolunteer, allOpps).slice(0, 3);
  }, [userProfile, volunteers, iaEvents, courses]);

  // ── Auto-select opportunity ────────────────────────────────────────────
  // Only auto-select the first item if the URL doesn't specify one, or if
  // the specified one isn't found in the current list.
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  useEffect(() => {
    if (currentOpportunities.length === 0) return;
    // If the URL-specified opp exists in the current list, keep it
    if (selectedOppId && currentOpportunities.find(o => o.id === selectedOppId)) return;
    // If we haven't auto-selected yet and there are discovered events still loading, wait
    if (!hasAutoSelected && searchParams.get('opp') && discoveredEvents.length === 0) return;
    // Otherwise default to first
    setSelectedOppId(currentOpportunities[0].id);
    setHasAutoSelected(true);
  }, [currentOpportunities, selectedOppId, hasAutoSelected, discoveredEvents, searchParams]);

  // ── Helpers ───────────────────────────────────────────────────────────
  const getOppLabel = (opp: MatchOpportunity) => {
    if (opp.type === 'event') return opp.name;
    return `${opp.courseCode} — ${opp.name}`;
  };

  const getOppSublabel = (opp: MatchOpportunity) => {
    if (opp.type === 'event') return `${opp.region} • ${opp.date}`;
    return `${opp.instructor} • ${opp.mode}`;
  };

  const tabs: { key: OpportunityTab; label: string; count: number }[] = [
    { key: 'ia-events', label: 'IA Events', count: iaEvents.length },
    { key: 'campus-events', label: 'Campus Events', count: campusEvents.length },
    { key: 'courses', label: 'Courses', count: courses.length },
  ];

  // ── Factor bar helper ─────────────────────────────────────────────────
  const topFactors = (result: MatchResult) => {
    const sorted = (Object.entries(result.factors) as [keyof typeof result.factors, number][])
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return sorted;
  };

  // ── Render ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#471f8d]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-5xl font-bold text-[#471f8d] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Matching Engine
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-medium" style={{ fontFamily: 'Georgia, serif' }}>
              AI-powered volunteer-to-opportunity scoring. Select an opportunity to see ranked matches.
            </p>

            {/* Algorithm badge */}
            <div className="flex items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 bg-[#f4efff] text-[#471f8d] border border-[#dbbde5] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                <Zap size={12} />
                6-Factor Scoring Algorithm
              </span>
              <span className="text-slate-400 text-xs">
                {Object.entries(WEIGHTS).map(([k, w]) => `${FACTOR_LABELS[k as keyof typeof WEIGHTS]} (${Math.round(w * 100)}%)`).join(' • ')}
              </span>
            </div>
          </div>
          <div className="text-right mt-6 md:mt-0">
            <span className="text-6xl font-black text-[#471f8d] opacity-10 block leading-none">
              {rankedResults.length}
            </span>
            <span className="text-[10px] font-bold text-[#471f8d] uppercase tracking-[0.2em]">Matches Found</span>
          </div>
        </div>

        {/* ── Personalized Recommendations ──────────────────────── */}
        {userProfile && personalizedMatches.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-[#471f8d] to-[#6b3fa0] rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center gap-3 mb-1">
              <Sparkles size={18} className="text-purple-300" />
              <h2 className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                Recommended for You
              </h2>
            </div>
            <p className="text-purple-200 text-sm mb-6">
              Based on your region ({userProfile.metroRegion}){userProfile.expertise ? ` and expertise (${userProfile.expertise.split(',').slice(0, 2).join(', ').trim()})` : ''}{userProfile.role && userProfile.role !== 'Member' ? ` — as ${userProfile.role}, you're a strong fit for Speaker and Panelist roles` : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalizedMatches.map(match => {
                const oppName = match.opportunity.type === 'event' ? match.opportunity.name : `${match.opportunity.courseCode} — ${match.opportunity.name}`;
                return (
                  <button
                    key={match.opportunity.id}
                    onClick={() => {
                      const opp = match.opportunity;
                      if (opp.type === 'course') setActiveTab('courses');
                      else if (CAMPUS_EVENTS.find(e => e.id === opp.id)) setActiveTab('campus-events');
                      else setActiveTab('ia-events');
                      setSelectedOppId(opp.id);
                    }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 text-left hover:bg-white/20 transition-all border border-white/10 group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-300">
                        {match.opportunity.type === 'event' ? 'Event' : 'Course'}
                      </span>
                      <MatchScoreBadge score={match.totalScore} size={40} />
                    </div>
                    <p className="font-bold text-sm leading-tight mb-1 text-white group-hover:text-purple-100">
                      {oppName}
                    </p>
                    <p className="text-[11px] text-purple-300">
                      {match.opportunity.type === 'event'
                        ? `${match.opportunity.region} • ${match.opportunity.date}`
                        : `${match.opportunity.instructor} • ${match.opportunity.mode}`
                      }
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab Bar ────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedOppId(null); }}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-[#471f8d] text-white shadow-lg shadow-[#471f8d]/30'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#dbbde5] hover:text-[#471f8d]'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs ${activeTab === tab.key ? 'opacity-70' : 'opacity-50'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* ── Main Layout: Sidebar + Results ─────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: Opportunity Selector */}
          <div className="lg:w-1/3 space-y-3">
            <div className="bg-white rounded-2xl border border-[#dbbde5] p-4 shadow-sm">
              <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-4 flex items-center gap-2">
                <Target size={14} />
                Select Opportunity
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {currentOpportunities.map(opp => (
                  <button
                    key={opp.id}
                    onClick={() => setSelectedOppId(opp.id)}
                    className={`w-full text-left p-4 rounded-xl transition-all duration-300 border ${
                      selectedOppId === opp.id
                        ? 'bg-[#f4efff] border-[#471f8d] shadow-md'
                        : 'bg-slate-50 border-transparent hover:bg-white hover:border-[#dbbde5]'
                    }`}
                  >
                    <p className={`font-bold text-sm leading-tight ${
                      selectedOppId === opp.id ? 'text-[#471f8d]' : 'text-slate-800'
                    }`}>
                      {getOppLabel(opp)}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      {opp.type === 'event' ? <MapPin size={10} /> : <BookOpen size={10} />}
                      {getOppSublabel(opp)}
                    </p>
                    {opp.type === 'event' && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {opp.volunteerRoles.split(';').map(role => (
                          <span key={role} className="text-[9px] font-bold bg-[#471f8d]/10 text-[#471f8d] px-2 py-0.5 rounded-md">
                            {role.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                    {opp.type === 'course' && (
                      <span className={`inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-md ${
                        opp.guestLectureFit === 'High' ? 'bg-emerald-100 text-emerald-700'
                          : opp.guestLectureFit === 'Medium' ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {opp.guestLectureFit} Fit
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Filter */}
            <div className="bg-white rounded-2xl border border-[#dbbde5] p-4 shadow-sm">
              <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-3 flex items-center gap-2">
                <SlidersHorizontal size={14} />
                Minimum Score
              </h3>
              <input
                type="range"
                min={0}
                max={90}
                step={5}
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-[#471f8d]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                <span>All</span>
                <span className="text-[#471f8d] text-sm font-black">{minScore > 0 ? `≥ ${minScore}` : 'No filter'}</span>
                <span>90+</span>
              </div>
            </div>
          </div>

          {/* Right: Ranked Results */}
          <div className="lg:w-2/3">
            {!selectedOpportunity ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <Target size={48} className="mb-4 opacity-30" />
                <p className="font-bold">Select an opportunity to see ranked matches</p>
              </div>
            ) : rankedResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                <Users size={48} className="mb-4 opacity-30" />
                <p className="font-bold">No volunteers match the minimum score threshold</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rankedResults.map((result, index) => (
                  <Link
                    key={result.volunteer.id}
                    href={`/matching/${encodeURIComponent(`${result.volunteer.id}--${result.opportunity.id}--${result.opportunity.type}`)}`}
                    className="group bg-white rounded-3xl p-6 border border-[#dbbde5] shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
                  >
                    {/* Rank badge */}
                    <div className="absolute top-0 left-0 bg-[#471f8d] text-white text-[10px] font-black px-3 py-1 rounded-br-xl">
                      #{index + 1}
                    </div>

                    {/* Mock / Real badge */}
                    <div className="absolute top-3 right-3">
                      {result.volunteer.isMock ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full">
                          <FlaskConical size={9} />Mock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full">
                          <ShieldCheck size={9} />Real
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-4 mb-4">
                      {/* Avatar */}
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 group-hover:rotate-3 transition-transform ${
                        result.volunteer.isMock ? 'bg-amber-400 text-white' : 'bg-[#471f8d] text-white'
                      }`}>
                        {result.volunteer.Name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 group-hover:text-[#471f8d] transition-colors truncate">
                          {result.volunteer.Name}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {result.volunteer.Title}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={10} className="text-[#dbbde5]" />
                          {result.volunteer['Metro Region']}
                        </p>
                      </div>

                      {/* Score */}
                      <MatchScoreBadge score={result.totalScore} size={56} />
                    </div>

                    {/* Top 3 factor bars */}
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      {topFactors(result).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase w-24 truncate">
                            {FACTOR_LABELS[key as keyof typeof FACTOR_LABELS]}
                          </span>
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-[#471f8d] h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${value * 100}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-slate-500 w-8 text-right">
                            {Math.round(value * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-end mt-3">
                      <ChevronRight size={16} className="text-[#dbbde5] group-hover:text-[#471f8d] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 pt-28 pb-20 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#471f8d]" /></div>}>
      <MatchingPageContent />
    </Suspense>
  );
}
