// ── Matching Engine ──────────────────────────────────────────────────────────
// Pure scoring functions — no React, no Firebase dependencies.
// Implements the challenge brief's 6-factor matching algorithm.

import {
  WEIGHTS,
  SYNONYM_MAP,
  REGION_GROUPS,
  ADJACENT_REGIONS,
  ROLE_INFERENCE,
  GUEST_LECTURE_FIT_SCORES,
  ENGAGEMENT_CONVERSION_RATES,
  CATEGORY_TO_ENGAGEMENT,
  COURSE_MODE_SCORES,
} from './matchingConstants';

// ── Types ───────────────────────────────────────────────────────────────────

export interface MatchVolunteer {
  id: string;
  Name: string;
  Title: string;
  Company: string;
  'Metro Region': string;
  Expertise: string;
  'Board Role'?: string;
  isMock?: boolean;
}

export interface MatchOpportunityEvent {
  type: 'event';
  id: string;
  name: string;
  category: string;
  region: string;
  date: string;                    // IA Event Date (YYYY-MM-DD)
  volunteerRoles: string;          // "Judge; Mentor; Guest speaker"
  courseAlignment: string;
  nearbyUniversities: string;
  suggestedLectureWindow: string;
}

export interface MatchOpportunityCourse {
  type: 'course';
  id: string;
  name: string;                    // Course title
  courseCode: string;              // e.g. "IBM 4121"
  instructor: string;
  guestLectureFit: string;        // High / Medium / Low
  enrollmentCap: number;
  mode: string;
  days: string;
  startTime: string;
  endTime: string;
}

export type MatchOpportunity = MatchOpportunityEvent | MatchOpportunityCourse;

export interface FactorScores {
  topicRelevance: number;
  roleFit: number;
  geographicProximity: number;
  calendarFit: number;
  historicalConversion: number;
  studentInterest: number;
}

export interface MatchResult {
  volunteer: MatchVolunteer;
  opportunity: MatchOpportunity;
  totalScore: number;              // 0–100
  factors: FactorScores;           // each 0.0–1.0
  explanations: Record<keyof FactorScores, string>;
}

// ── Tokenization Helpers ────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'and', 'the', 'of', 'in', 'for', 'to', 'a', 'an', 'is', 'on', 'at', 'by', 'with',
]);

function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  const tokens = text
    .toLowerCase()
    .split(/[,;/|&]+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  return new Set(tokens);
}

function expandSynonyms(tokens: Set<string>): Set<string> {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (synonyms.some(s => token.includes(s) || s.includes(token))) {
        expanded.add(canonical);
        synonyms.forEach(s => expanded.add(s));
      }
    }
  }
  return expanded;
}

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

// Also check substring overlap for partial matches (e.g. "AI innovation" vs "AI / Hackathon")
function substringOverlap(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let matches = 0;
  const allA = [...setA];
  const allB = [...setB];
  for (const a of allA) {
    for (const b of allB) {
      if (a.includes(b) || b.includes(a)) {
        matches++;
        break;
      }
    }
  }
  return matches / Math.max(allA.length, 1);
}

// ── Factor 1: Topic Relevance (w1 = 0.30) ──────────────────────────────────

function scoreTopicRelevance(volunteer: MatchVolunteer, opportunity: MatchOpportunity): { score: number; explanation: string } {
  const volTokens = expandSynonyms(tokenize(volunteer.Expertise));

  let oppText = '';
  if (opportunity.type === 'event') {
    oppText = `${opportunity.category}, ${opportunity.courseAlignment}, ${opportunity.name}`;
  } else {
    oppText = `${opportunity.name}, ${opportunity.courseCode}`;
  }
  const oppTokens = expandSynonyms(tokenize(oppText));

  const jaccard = jaccardSimilarity(volTokens, oppTokens);
  const substring = substringOverlap(volTokens, oppTokens);
  const score = Math.min(1.0, jaccard * 0.6 + substring * 0.4);

  const overlap = [...volTokens].filter(t => oppTokens.has(t)).slice(0, 3);
  const explanation = overlap.length > 0
    ? `Keyword overlap: ${overlap.join(', ')}`
    : 'Limited topic alignment';

  return { score, explanation };
}

// ── Factor 2: Role Fit (w2 = 0.20) ──────────────────────────────────────────

function scoreRoleFit(volunteer: MatchVolunteer, opportunity: MatchOpportunity): { score: number; explanation: string } {
  // For courses, use guest lecture fit
  if (opportunity.type === 'course') {
    const fitScore = GUEST_LECTURE_FIT_SCORES[opportunity.guestLectureFit] ?? 0.5;
    // Boost if volunteer has teaching/speaking background
    const titleLower = `${volunteer.Title} ${volunteer['Board Role'] || ''}`.toLowerCase();
    let roleBoost = 0.5;
    for (const [keyword, config] of Object.entries(ROLE_INFERENCE)) {
      if (titleLower.includes(keyword)) {
        if (config.roles.some(r => r.toLowerCase().includes('speaker') || r.toLowerCase().includes('guest'))) {
          roleBoost = config.score;
          break;
        }
      }
    }
    const score = fitScore * 0.6 + roleBoost * 0.4;
    return {
      score,
      explanation: `${opportunity.guestLectureFit} guest lecture fit${roleBoost > 0.7 ? ', strong speaker profile' : ''}`,
    };
  }

  // For events, check if volunteer's inferred roles match needed roles
  const neededRoles = tokenize(opportunity.volunteerRoles);
  const titleLower = `${volunteer.Title} ${volunteer['Board Role'] || ''} ${volunteer.Company}`.toLowerCase();

  let bestMatch = 0.5; // default baseline
  let matchedRole = '';

  for (const [keyword, config] of Object.entries(ROLE_INFERENCE)) {
    if (titleLower.includes(keyword)) {
      for (const role of config.roles) {
        const roleLower = role.toLowerCase();
        for (const needed of neededRoles) {
          if (roleLower.includes(needed) || needed.includes(roleLower)) {
            const roleScore = config.score;
            if (roleScore > bestMatch) {
              bestMatch = roleScore;
              matchedRole = role;
            }
          }
        }
      }
    }
  }

  return {
    score: bestMatch,
    explanation: matchedRole ? `Strong fit as ${matchedRole}` : 'General volunteer fit',
  };
}

// ── Factor 3: Geographic Proximity (w3 = 0.20) ─────────────────────────────

function getRegionGroup(region: string): string | null {
  for (const [group, members] of Object.entries(REGION_GROUPS)) {
    if (members.some(m => region.includes(m) || m.includes(region))) {
      return group;
    }
  }
  return null;
}

function scoreGeographicProximity(volunteer: MatchVolunteer, opportunity: MatchOpportunity): { score: number; explanation: string } {
  const volRegion = volunteer['Metro Region'] || '';
  const volGroup = getRegionGroup(volRegion);

  let oppRegion = '';
  if (opportunity.type === 'event') {
    oppRegion = opportunity.region;
  } else {
    // All courses are at CPP — Los Angeles East
    oppRegion = 'Los Angeles';
  }
  const oppGroup = getRegionGroup(oppRegion);

  if (!volGroup || !oppGroup) return { score: 0.3, explanation: 'Region unknown' };

  // Same region group
  if (volGroup === oppGroup) {
    return { score: 1.0, explanation: `Same region: ${volGroup}` };
  }

  // Adjacent regions
  const isAdjacent = ADJACENT_REGIONS.some(
    ([a, b]) => (a === volGroup && b === oppGroup) || (b === volGroup && a === oppGroup)
  );
  if (isAdjacent) {
    return { score: 0.6, explanation: `Adjacent: ${volGroup} ↔ ${oppGroup}` };
  }

  // All regions are in CA/OR/WA — same coast
  return { score: 0.2, explanation: `${volGroup} → ${oppGroup} (distant)` };
}

// ── Factor 4: Calendar Fit (w4 = 0.10) ──────────────────────────────────────

function scoreCalendarFit(opportunity: MatchOpportunity): { score: number; explanation: string } {
  if (opportunity.type === 'course') {
    const modeScore = COURSE_MODE_SCORES[opportunity.mode] ?? 0.5;
    return {
      score: modeScore,
      explanation: `${opportunity.mode} format${modeScore >= 0.9 ? ' (in-person friendly)' : ''}`,
    };
  }

  // For events, score based on how soon the event is
  const eventDate = new Date(opportunity.date);
  const today = new Date();
  const daysUntil = Math.max(0, (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil <= 60) return { score: 1.0, explanation: `${Math.round(daysUntil)} days away — high urgency` };
  if (daysUntil <= 120) return { score: 0.7, explanation: `${Math.round(daysUntil)} days away — moderate window` };
  return { score: 0.4, explanation: `${Math.round(daysUntil)} days away — long lead time` };
}

// ── Factor 5: Historical Conversion Rate (w5 = 0.10) ───────────────────────

function scoreHistoricalConversion(opportunity: MatchOpportunity): { score: number; explanation: string } {
  let engagementType = '';

  if (opportunity.type === 'event') {
    engagementType = CATEGORY_TO_ENGAGEMENT[opportunity.category] || '';
  } else {
    engagementType = 'Guest Lecture';
  }

  const rate = ENGAGEMENT_CONVERSION_RATES[engagementType];
  if (rate !== undefined) {
    return {
      score: rate,
      explanation: `${engagementType}: ${Math.round(rate * 100)}% historical conversion`,
    };
  }

  return { score: 0.5, explanation: 'No historical data for this engagement type' };
}

// ── Factor 6: Student Interest Signal (w6 = 0.10) ──────────────────────────

function scoreStudentInterest(opportunity: MatchOpportunity): { score: number; explanation: string } {
  if (opportunity.type === 'course') {
    const cap = opportunity.enrollmentCap;
    if (cap >= 45) return { score: 1.0, explanation: `${cap} enrollment cap — high reach` };
    if (cap >= 30) return { score: 0.7, explanation: `${cap} enrollment cap — moderate reach` };
    return { score: 0.5, explanation: `${cap} enrollment cap — focused group` };
  }

  // Events: default moderate score (no attendance data)
  return { score: 0.7, explanation: 'Campus event — broad student audience' };
}

// ── Main Scoring Function ───────────────────────────────────────────────────

export function computeMatchScore(volunteer: MatchVolunteer, opportunity: MatchOpportunity): MatchResult {
  const f1 = scoreTopicRelevance(volunteer, opportunity);
  const f2 = scoreRoleFit(volunteer, opportunity);
  const f3 = scoreGeographicProximity(volunteer, opportunity);
  const f4 = scoreCalendarFit(opportunity);
  const f5 = scoreHistoricalConversion(opportunity);
  const f6 = scoreStudentInterest(opportunity);

  const factors: FactorScores = {
    topicRelevance: f1.score,
    roleFit: f2.score,
    geographicProximity: f3.score,
    calendarFit: f4.score,
    historicalConversion: f5.score,
    studentInterest: f6.score,
  };

  const totalScore = Math.round(
    (WEIGHTS.topicRelevance * factors.topicRelevance +
      WEIGHTS.roleFit * factors.roleFit +
      WEIGHTS.geographicProximity * factors.geographicProximity +
      WEIGHTS.calendarFit * factors.calendarFit +
      WEIGHTS.historicalConversion * factors.historicalConversion +
      WEIGHTS.studentInterest * factors.studentInterest) * 100
  );

  const explanations = {
    topicRelevance: f1.explanation,
    roleFit: f2.explanation,
    geographicProximity: f3.explanation,
    calendarFit: f4.explanation,
    historicalConversion: f5.explanation,
    studentInterest: f6.explanation,
  };

  return { volunteer, opportunity, totalScore, factors, explanations };
}

// ── Ranking Functions ───────────────────────────────────────────────────────

export function rankVolunteersForOpportunity(
  volunteers: MatchVolunteer[],
  opportunity: MatchOpportunity
): MatchResult[] {
  return volunteers
    .map(v => computeMatchScore(v, opportunity))
    .sort((a, b) => b.totalScore - a.totalScore);
}

export function rankOpportunitiesForVolunteer(
  volunteer: MatchVolunteer,
  opportunities: MatchOpportunity[]
): MatchResult[] {
  return opportunities
    .map(o => computeMatchScore(volunteer, o))
    .sort((a, b) => b.totalScore - a.totalScore);
}
