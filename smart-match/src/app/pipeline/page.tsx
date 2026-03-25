'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  GraduationCap, Users, CalendarDays, Handshake, TrendingUp, Building,
  ArrowRight, ListFilter, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  MEMBER_PIPELINES,
  PIPELINE_STAGE_KEYS,
  PIPELINE_STAGE_LABELS,
  MOCK_VOLUNTEER_PROFILES,
  type PipelineStageKey,
} from '@/data/pipelineData';

const STAGE_ICONS: Record<PipelineStageKey, React.ReactNode> = {
  campusEngagement: <GraduationCap size={20} />,
  studentMember: <Users size={20} />,
  iaEventAttendee: <CalendarDays size={20} />,
  mentee: <Handshake size={20} />,
  youngProfessional: <TrendingUp size={20} />,
  corporateMember: <Building size={20} />,
};

const STAGE_COLORS = ['#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95', '#471f8d', '#3b0764'];

const ENGAGEMENT_TYPES = ['All', 'Hackathon Judging', 'Career Panel', 'Guest Lecture', 'Conference', 'Workshop'];


export default function PipelinePage() {
  const [engagementFilter, setEngagementFilter] = useState('All');
  const [expandedStage, setExpandedStage] = useState<PipelineStageKey | null>(null);

  // Get all member entries
  const allMembers = useMemo(() => {
    return Object.entries(MEMBER_PIPELINES).map(([name, pipeline]) => {
      const mockProfile = MOCK_VOLUNTEER_PROFILES.find(m => m.Name === name);
      return {
        name,
        ...pipeline,
        region: mockProfile?.['Metro Region'] || '',
      };
    });
  }, []);

  // Filter by engagement type
  const filteredMembers = useMemo(() => {
    if (engagementFilter === 'All') return allMembers;
    return allMembers.filter(m => m.campusEngagementType === engagementFilter);
  }, [allMembers, engagementFilter]);

  // Count members at each stage (members who have REACHED this stage)
  const stageCounts = useMemo(() => {
    return PIPELINE_STAGE_KEYS.map(stageKey => {
      const count = filteredMembers.filter(m => m.stages[stageKey] !== undefined).length;
      return {
        stage: PIPELINE_STAGE_LABELS[stageKey],
        stageKey,
        count,
      };
    });
  }, [filteredMembers]);

  // Conversion rates between consecutive stages
  const conversionRates = useMemo(() => {
    const rates: { from: string; to: string; rate: number; fromCount: number; toCount: number }[] = [];
    for (let i = 0; i < PIPELINE_STAGE_KEYS.length - 1; i++) {
      const fromKey = PIPELINE_STAGE_KEYS[i];
      const toKey = PIPELINE_STAGE_KEYS[i + 1];
      const fromCount = filteredMembers.filter(m => m.stages[fromKey] !== undefined).length;
      const toCount = filteredMembers.filter(m => m.stages[toKey] !== undefined).length;
      const rate = fromCount > 0 ? (toCount / fromCount) * 100 : 0;
      rates.push({
        from: PIPELINE_STAGE_LABELS[fromKey],
        to: PIPELINE_STAGE_LABELS[toKey],
        rate: Math.round(rate),
        fromCount,
        toCount,
      });
    }
    return rates;
  }, [filteredMembers]);

  // Members at a specific current stage
  const membersAtStage = (stageKey: PipelineStageKey) => {
    return filteredMembers.filter(m => m.currentStage === stageKey);
  };

  // Engagement type breakdown
  const engagementBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    allMembers.forEach(m => {
      counts[m.campusEngagementType] = (counts[m.campusEngagementType] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [allMembers]);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-5xl font-bold text-[#471f8d] mb-3" style={{ fontFamily: 'Georgia, serif' }}>
              Pipeline Dashboard
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl font-medium" style={{ fontFamily: 'Georgia, serif' }}>
              Member journey conversion funnel — from campus engagement to corporate membership.
            </p>
          </div>
          <div className="text-right mt-6 md:mt-0">
            <span className="text-6xl font-black text-[#471f8d] opacity-10 block leading-none">
              {filteredMembers.length}
            </span>
            <span className="text-[10px] font-bold text-[#471f8d] uppercase tracking-[0.2em]">Total Members</span>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <ListFilter size={16} className="text-[#471f8d]" />
            Engagement Type:
          </div>
          {ENGAGEMENT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setEngagementFilter(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                engagementFilter === type
                  ? 'bg-[#471f8d] text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#dbbde5]'
              }`}
            >
              {type}
              {engagementFilter === type && type !== 'All' && (
                <span className="ml-2" onClick={(e) => { e.stopPropagation(); setEngagementFilter('All'); }}>
                  <X size={12} className="inline" />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Funnel Chart */}
        <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm p-8 mb-8">
          <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-6">Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageCounts} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="stage" type="category" tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} width={140} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #dbbde5', fontSize: '13px' }}
                formatter={(value) => [`${value} members`, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]} cursor="pointer" fill="#471f8d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Rates */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {conversionRates.map((rate, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 text-center hover:border-[#dbbde5] transition-colors">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{rate.from}</p>
              <div className="flex items-center justify-center gap-2 my-2">
                <ArrowRight size={14} className="text-[#dbbde5]" />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">{rate.to}</p>
              <span className={`text-2xl font-black ${rate.rate >= 70 ? 'text-emerald-600' : rate.rate >= 50 ? 'text-amber-600' : 'text-slate-400'}`}>
                {rate.rate}%
              </span>
              <p className="text-[10px] text-slate-400 mt-1">{rate.fromCount} → {rate.toCount}</p>
            </div>
          ))}
        </div>

        {/* Stage Detail Cards */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest">Members by Current Stage</h3>
          {PIPELINE_STAGE_KEYS.map((stageKey, index) => {
            const members = membersAtStage(stageKey);
            const isExpanded = expandedStage === stageKey;
            return (
              <div key={stageKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#dbbde5] transition-colors">
                <button
                  onClick={() => setExpandedStage(isExpanded ? null : stageKey)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: STAGE_COLORS[index] }}>
                      {STAGE_ICONS[stageKey]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{PIPELINE_STAGE_LABELS[stageKey]}</p>
                      <p className="text-xs text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''} currently at this stage</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-[#471f8d] opacity-30">{members.length}</span>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </button>
                {isExpanded && members.length > 0 && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {members.map(member => (
                        <div key={member.name} className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${member.isMock ? 'bg-amber-400 text-white' : 'bg-[#471f8d] text-white'}`}>
                            {member.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{member.name}</p>
                            <p className="text-[10px] text-slate-500">via {member.campusEngagementType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {isExpanded && members.length === 0 && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50 text-center text-sm text-slate-400">
                    No members currently at this stage
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Engagement Type Breakdown */}
        <div className="bg-white rounded-3xl border border-[#dbbde5] shadow-sm p-8">
          <h3 className="text-xs font-black text-[#471f8d] uppercase tracking-widest mb-6">Entry Point Breakdown</h3>
          <p className="text-sm text-slate-500 mb-6">How members first engaged with IA West — the "first touch" that started their pipeline journey.</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {engagementBreakdown.map(([type, count]) => (
              <button
                key={type}
                onClick={() => setEngagementFilter(type)}
                className={`p-5 rounded-2xl border text-center transition-all hover:shadow-md ${
                  engagementFilter === type ? 'bg-[#f4efff] border-[#471f8d]' : 'bg-slate-50 border-slate-200 hover:border-[#dbbde5]'
                }`}
              >
                <span className="text-3xl font-black text-[#471f8d] block">{count}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">{type}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
