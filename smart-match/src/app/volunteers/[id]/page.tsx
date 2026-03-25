'use client';

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  Loader2, User, ChevronLeft, MapPin, Building2, Briefcase,
  ShieldCheck, FlaskConical, CheckCircle2, Circle, ArrowRight,
  GraduationCap, Users, CalendarDays, Handshake, TrendingUp, Building,
} from 'lucide-react';
import {
  MEMBER_PIPELINES,
  MOCK_VOLUNTEER_PROFILES,
  REAL_MEMBER_NAMES,
  PIPELINE_STAGE_KEYS,
  PIPELINE_STAGE_LABELS,
  type PipelineStageKey,
} from "@/data/pipelineData";

const STAGE_ICONS: Record<PipelineStageKey, React.ReactNode> = {
  campusEngagement: <GraduationCap size={16} />,
  studentMember: <Users size={16} />,
  iaEventAttendee: <CalendarDays size={16} />,
  mentee: <Handshake size={16} />,
  youngProfessional: <TrendingUp size={16} />,
  corporateMember: <Building size={16} />,
};

function formatDate(dateStr: string) {
  const [year, month] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function PipelineVisualization({ name, isMock }: { name: string; isMock: boolean }) {
  const pipeline = MEMBER_PIPELINES[name];

  if (!pipeline) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
          Member Pipeline
        </h3>
        <p className="text-slate-400 text-sm">No pipeline data available for this member.</p>
      </div>
    );
  }

  const currentStageIndex = PIPELINE_STAGE_KEYS.indexOf(pipeline.currentStage);

  return (
    <div className={`rounded-2xl p-8 border shadow-sm ${isMock ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
          Member Pipeline
        </h3>
        {isMock ? (
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
            <FlaskConical size={10} /> Mock Data
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide">
            <ShieldCheck size={10} /> Verified
          </span>
        )}
      </div>

      {/* Entry point tag */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">First touch:</span>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isMock ? 'bg-amber-200 text-amber-800' : 'bg-[#dbbde5] text-[#471f8d]'}`}>
          {pipeline.campusEngagementType}
        </span>
      </div>

      {/* Pipeline stages — horizontal on md+, stacked on mobile */}
      <div className="relative">
        {/* Desktop: horizontal track */}
        <div className="hidden md:flex items-start gap-0">
          {PIPELINE_STAGE_KEYS.map((stageKey, index) => {
            const date = pipeline.stages[stageKey];
            const isCompleted = date !== undefined;
            const isCurrent = stageKey === pipeline.currentStage;
            const isFuture = index > currentStageIndex;
            const isLast = index === PIPELINE_STAGE_KEYS.length - 1;

            return (
              <React.Fragment key={stageKey}>
                <div className="flex flex-col items-center flex-1 min-w-0">
                  {/* Node */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                    isCurrent
                      ? isMock
                        ? 'bg-amber-400 border-amber-500 text-white shadow-lg shadow-amber-200 scale-110'
                        : 'bg-[#471f8d] border-[#471f8d] text-white shadow-lg shadow-purple-200 scale-110'
                      : isCompleted
                        ? isMock
                          ? 'bg-amber-200 border-amber-400 text-amber-800'
                          : 'bg-[#dbbde5] border-[#471f8d] text-[#471f8d]'
                        : 'bg-slate-100 border-slate-200 text-slate-300'
                  }`}>
                    {isCompleted ? STAGE_ICONS[stageKey] : <Circle size={14} />}
                  </div>

                  {/* Label */}
                  <span className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wide leading-tight px-1 ${
                    isCurrent
                      ? isMock ? 'text-amber-700' : 'text-[#471f8d]'
                      : isCompleted
                        ? 'text-slate-600'
                        : 'text-slate-300'
                  }`}>
                    {PIPELINE_STAGE_LABELS[stageKey]}
                  </span>

                  {/* Date */}
                  <span className={`mt-1 text-[9px] font-medium ${
                    isCurrent ? isMock ? 'text-amber-600' : 'text-[#471f8d]'
                    : isCompleted ? 'text-slate-400' : 'text-transparent'
                  }`}>
                    {date ? formatDate(date) : '—'}
                  </span>

                  {/* Current badge */}
                  {isCurrent && (
                    <span className={`mt-1 text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isMock ? 'bg-amber-200 text-amber-800' : 'bg-[#471f8d] text-white'}`}>
                      Current
                    </span>
                  )}
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className={`w-8 h-0.5 mt-5 shrink-0 ${
                    index < currentStageIndex
                      ? isMock ? 'bg-amber-300' : 'bg-[#dbbde5]'
                      : 'bg-slate-100'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Mobile: vertical list */}
        <div className="md:hidden space-y-3">
          {PIPELINE_STAGE_KEYS.map((stageKey, index) => {
            const date = pipeline.stages[stageKey];
            const isCompleted = date !== undefined;
            const isCurrent = stageKey === pipeline.currentStage;
            const isLast = index === PIPELINE_STAGE_KEYS.length - 1;

            return (
              <div key={stageKey} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    isCurrent
                      ? isMock ? 'bg-amber-400 border-amber-500 text-white' : 'bg-[#471f8d] border-[#471f8d] text-white'
                      : isCompleted
                        ? isMock ? 'bg-amber-200 border-amber-400 text-amber-800' : 'bg-[#dbbde5] border-[#471f8d] text-[#471f8d]'
                        : 'bg-slate-100 border-slate-200 text-slate-300'
                  }`}>
                    {isCompleted ? STAGE_ICONS[stageKey] : <Circle size={12} />}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-6 mt-1 ${isCompleted && index < currentStageIndex ? isMock ? 'bg-amber-300' : 'bg-[#dbbde5]' : 'bg-slate-100'}`} />
                  )}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isCurrent ? isMock ? 'text-amber-700' : 'text-[#471f8d]' : isCompleted ? 'text-slate-700' : 'text-slate-300'}`}>
                      {PIPELINE_STAGE_LABELS[stageKey]}
                    </span>
                    {isCurrent && (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isMock ? 'bg-amber-200 text-amber-800' : 'bg-[#471f8d] text-white'}`}>
                        Current
                      </span>
                    )}
                  </div>
                  {date && <p className="text-xs text-slate-400 mt-0.5">{formatDate(date)}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      {pipeline.notes && (
        <div className={`mt-6 pt-5 border-t ${isMock ? 'border-amber-200' : 'border-slate-100'}`}>
          <p className="text-sm text-slate-500 italic leading-relaxed">
            {pipeline.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function VolunteerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [volunteer, setVolunteer] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        // Check if this is a mock volunteer (static data)
        if (id.startsWith('mock-')) {
          const mockProfile = MOCK_VOLUNTEER_PROFILES.find(m => m.id === id);
          if (mockProfile) {
            setVolunteer({ ...mockProfile });
            setIsMock(true);
          }
          setLoading(false);
          return;
        }

        // Otherwise fetch from Firestore
        const docRef = doc(db, "volunteers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Record<string, unknown>;
          setVolunteer(data);
          setIsMock(!REAL_MEMBER_NAMES.has(data.Name as string));
        }
      } catch (error) {
        console.error("Error fetching volunteer details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteer();
  }, [id]);

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

  const name = volunteer.Name as string;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Back button */}
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
        <div className={`rounded-3xl p-8 md:p-12 border shadow-sm mb-8 ${isMock ? 'bg-amber-50 border-amber-200' : 'bg-white border-[#dbbde5]'}`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className={`w-32 h-32 rounded-3xl flex items-center justify-center font-bold text-5xl shadow-lg shrink-0 ${isMock ? 'bg-amber-400 text-white' : 'bg-[#471f8d] text-white'}`}>
              {name ? name.charAt(0) : <User size={48} />}
            </div>

            {/* Main Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
                  {name}
                </h1>
                {isMock ? (
                  <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-300 text-xs font-black px-3 py-1 rounded-full self-start md:self-auto">
                    <FlaskConical size={12} /> Mock Data
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full self-start md:self-auto">
                    <ShieldCheck size={12} /> Verified IA West Member
                  </span>
                )}
              </div>
              <p className="text-xl text-[#471f8d] font-semibold mb-6">
                {volunteer.Title as string}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600">
                  <Building2 size={18} className="text-[#dbbde5]" />
                  <span>{(volunteer.Company as string) || "Independent Consultant"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600">
                  <MapPin size={18} className="text-[#dbbde5]" />
                  <span>{(volunteer["Metro Region"] as string) || "Remote"}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-3 text-slate-600">
                  <Briefcase size={18} className="text-[#dbbde5]" />
                  <span>{(volunteer.Expertise as string) || "Strategy & Operations"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="space-y-8">

          {/* Pipeline — full width */}
          <PipelineVisualization name={name} isMock={isMock} />

          {/* Biography + Engagement row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm h-full">
                <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider" style={{ fontFamily: "Georgia, serif" }}>
                  Biography & Experience
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {(volunteer.Bio as string) || (
                    isMock
                      ? `${name} is an illustrative pipeline example representing a prospective IA West member at the ${MEMBER_PIPELINES[name] ? PIPELINE_STAGE_LABELS[MEMBER_PIPELINES[name].currentStage] : 'early'} stage.`
                      : "Biography currently being updated."
                  )}
                </p>
                {isMock && (
                  <p className="mt-4 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-start gap-2">
                    <FlaskConical size={14} className="mt-0.5 shrink-0" />
                    This is a mock profile created to demonstrate the member pipeline. All details are illustrative.
                  </p>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <div className={`rounded-2xl p-6 border ${isMock ? 'bg-amber-50 border-amber-200' : 'bg-[#f9f5ff] border-[#dbbde5]'}`}>
                <h3 className="text-sm font-bold text-[#471f8d] mb-4 uppercase tracking-wider">Engagement Roles</h3>
                <div className="flex flex-wrap gap-2">
                  {(['Judge', 'Mentor', 'Speaker'] as string[]).map((role) => (
                    <span key={role} className="bg-white text-[#471f8d] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#dbbde5]">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {!!(volunteer['Board Role']) && (volunteer['Board Role'] as string) !== '—' && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-sm font-bold text-[#471f8d] mb-2 uppercase tracking-wider">Board Role</h3>
                  <p className="text-slate-700 font-medium">{volunteer['Board Role'] as string}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
