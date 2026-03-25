'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft, Loader2, MapPin, Briefcase, BookOpen,
  Calendar, Sparkles, ShieldCheck, FlaskConical, Target,
} from 'lucide-react';
import { MOCK_VOLUNTEER_PROFILES, REAL_MEMBER_NAMES, MEMBER_PIPELINES, PIPELINE_STAGE_LABELS } from '@/data/pipelineData';
import {
  computeMatchScore,
  type MatchVolunteer,
  type MatchOpportunityEvent,
  type MatchOpportunityCourse,
  type MatchOpportunity,
  type MatchResult,
} from '@/lib/matchingEngine';
import { FACTOR_LABELS, WEIGHTS } from '@/lib/matchingConstants';
import MatchScoreBadge from '@/components/MatchScoreBadge';
import MatchRadarChart from '@/components/MatchRadarChart';
import { generateMatchRationale } from '@/lib/gemini';

// Same campus events as main page
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

export default function MatchDetailPage() {
  const params = useParams();
  const compositeId = decodeURIComponent(params.id as string);
  const [volunteerId, opportunityId, oppType] = compositeId.split('--');

  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [rationale, setRationale] = useState<string | null>(null);
  const [rationaleLoading, setRationaleLoading] = useState(false);

  useEffect(() => {
    async function loadMatchData() {
      try {
        // ── Load volunteer ──────────────────────────────────────
        let volunteer: MatchVolunteer | null = null;

        // Check mock profiles first
        const mockProfile = MOCK_VOLUNTEER_PROFILES.find(m => m.id === volunteerId);
        if (mockProfile) {
          volunteer = {
            id: mockProfile.id,
            Name: mockProfile.Name,
            Title: mockProfile.Title,
            Company: mockProfile.Company,
            'Metro Region': mockProfile['Metro Region'],
            Expertise: mockProfile.Expertise,
            'Board Role': mockProfile['Board Role'] || '',
            isMock: true,
          };
        } else {
          // Try Firestore
          const volDoc = await getDoc(doc(db, 'volunteers', volunteerId));
          if (volDoc.exists()) {
            const d = volDoc.data();
            volunteer = {
              id: volDoc.id,
              Name: d.Name || '',
              Title: d.Title || '',
              Company: d.Company || '',
              'Metro Region': d['Metro Region'] || '',
              Expertise: d.Expertise || d['Expertise Tags'] || '',
              'Board Role': d['Board Role'] || '',
              isMock: !REAL_MEMBER_NAMES.has(d.Name || ''),
            };
          }
        }

        if (!volunteer) {
          setLoading(false);
          return;
        }

        // ── Load opportunity ────────────────────────────────────
        let opportunity: MatchOpportunity | null = null;

        if (oppType === 'course') {
          const courseDoc = await getDoc(doc(db, 'courses', opportunityId));
          if (courseDoc.exists()) {
            const d = courseDoc.data();
            opportunity = {
              type: 'course',
              id: courseDoc.id,
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
          }
        } else {
          // Check campus events first
          const campusEvent = CAMPUS_EVENTS.find(e => e.id === opportunityId);
          if (campusEvent) {
            opportunity = campusEvent;
          } else {
            // Try Firestore (IA events)
            const eventDoc = await getDoc(doc(db, 'event_calendar', opportunityId));
            if (eventDoc.exists()) {
              const d = eventDoc.data();
              opportunity = {
                type: 'event',
                id: eventDoc.id,
                name: d['Nearby Universities'] || d['Region'] || 'IA Event',
                category: d['Course Alignment'] || '',
                region: d['Region'] || '',
                date: d['IA Event Date'] || '',
                volunteerRoles: 'Guest speaker; Panelist; Mentor',
                courseAlignment: d['Course Alignment'] || '',
                nearbyUniversities: d['Nearby Universities'] || '',
                suggestedLectureWindow: d['Suggested Lecture Window'] || '',
              };
            }
          }
        }

        if (!opportunity) {
          setLoading(false);
          return;
        }

        setResult(computeMatchScore(volunteer, opportunity));
      } catch (error) {
        console.error('Error loading match data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMatchData();
  }, [volunteerId, opportunityId, oppType]);

  const handleGenerateRationale = async () => {
    if (!result) return;
    setRationaleLoading(true);
    const text = await generateMatchRationale(result);
    setRationale(text);
    setRationaleLoading(false);
  };

  // Pipeline stage for context
  const pipelineData = result ? MEMBER_PIPELINES[result.volunteer.Name] : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#471f8d]" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-bold mb-4">Match not found</p>
        <Link href="/matching" className="text-[#471f8d] font-bold hover:underline">
          ← Back to Matching Engine
        </Link>
      </div>
    );
  }

  const { volunteer, opportunity, totalScore, factors, explanations } = result;
  const oppName = opportunity.type === 'event' ? opportunity.name : `${opportunity.courseCode} — ${opportunity.name}`;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Back button */}
        <Link
          href="/matching"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#471f8d] transition-colors font-bold text-sm group mb-8"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Matching Engine
        </Link>

        {/* ── Header Card ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* Volunteer side */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start mb-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-2xl ${
                  volunteer.isMock ? 'bg-amber-400 text-white' : 'bg-[#471f8d] text-white'
                }`}>
                  {volunteer.Name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {volunteer.Name}
                  </h2>
                  {volunteer.isMock ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      <FlaskConical size={9} />Mock Data
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      <ShieldCheck size={9} />Real Member
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-500">
                <p className="flex items-center gap-2 justify-center md:justify-start"><Briefcase size={14} className="text-[#dbbde5]" />{volunteer.Title} at {volunteer.Company}</p>
                <p className="flex items-center gap-2 justify-center md:justify-start"><MapPin size={14} className="text-[#dbbde5]" />{volunteer['Metro Region']}</p>
              </div>
            </div>

            {/* Score center */}
            <div className="flex flex-col items-center">
              <MatchScoreBadge score={totalScore} size={100} />
              <span className="text-[10px] font-black text-[#471f8d] uppercase tracking-widest mt-2">Match Score</span>
            </div>

            {/* Opportunity side */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex items-center gap-3 justify-center md:justify-end mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
                    {oppName}
                  </h2>
                  <span className="inline-flex items-center gap-1 bg-[#f4efff] text-[#471f8d] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    <Target size={9} />
                    {opportunity.type === 'event' ? 'Event' : 'Course'}
                  </span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-[#f4efff] flex items-center justify-center">
                  {opportunity.type === 'event' ? <Calendar size={28} className="text-[#471f8d]" /> : <BookOpen size={28} className="text-[#471f8d]" />}
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-500">
                {opportunity.type === 'event' ? (
                  <>
                    <p className="flex items-center gap-2 justify-center md:justify-end"><MapPin size={14} className="text-[#dbbde5]" />{opportunity.region}</p>
                    <p className="flex items-center gap-2 justify-center md:justify-end"><Calendar size={14} className="text-[#dbbde5]" />{opportunity.date}</p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center gap-2 justify-center md:justify-end">{opportunity.instructor} • {opportunity.mode}</p>
                    <p className="flex items-center gap-2 justify-center md:justify-end">Enrollment: {opportunity.enrollmentCap} • {opportunity.guestLectureFit} Fit</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Radar Chart + Factor Breakdown ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Radar */}
          <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm p-8">
            <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-4">Score Breakdown</h3>
            <MatchRadarChart factors={factors} />
          </div>

          {/* Factor Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest">Factor Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(factors) as (keyof typeof factors)[]).map(key => {
                const score = factors[key];
                const weight = WEIGHTS[key];
                const contribution = Math.round(score * weight * 100);
                return (
                  <div key={key} className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-[#dbbde5] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        {FACTOR_LABELS[key]}
                      </span>
                      <span className="text-xs font-bold text-slate-400">w={Math.round(weight * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-[#471f8d] h-2 rounded-full transition-all duration-700"
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <span className="font-black text-sm text-[#471f8d]">{Math.round(score * 100)}%</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{explanations[key]}</p>
                    <p className="text-[9px] text-slate-400 mt-1">Contributes {contribution} pts to final score</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Pipeline Context (if available) ──────────────────── */}
        {pipelineData && (
          <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm p-8 mb-8">
            <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-3">
              Member Pipeline Context
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-bold text-slate-700">Current Stage:</span>
              <span className="bg-[#f4efff] text-[#471f8d] font-black text-xs px-3 py-1 rounded-full">
                {PIPELINE_STAGE_LABELS[pipelineData.currentStage]}
              </span>
              <span className="text-sm text-slate-500">via {pipelineData.campusEngagementType}</span>
              {pipelineData.isMock && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  <FlaskConical size={9} />Mock
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 italic">{pipelineData.notes}</p>
          </div>
        )}

        {/* ── AI Insight ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm p-8">
          <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Sparkles size={14} />
            AI-Generated Match Insight
          </h3>
          {rationale ? (
            <p className="text-sm text-slate-700 leading-relaxed bg-[#f9f5ff] rounded-2xl p-6 border border-[#dbbde5]">
              {rationale}
            </p>
          ) : (
            <button
              onClick={handleGenerateRationale}
              disabled={rationaleLoading}
              className="flex items-center gap-3 bg-[#471f8d] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#36176d] transition-all shadow-lg hover:shadow-[#471f8d]/40 disabled:opacity-50"
            >
              {rationaleLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating Insight...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate AI Insight
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
