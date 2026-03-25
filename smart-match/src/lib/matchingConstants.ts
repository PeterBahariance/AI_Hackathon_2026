// ── Matching Engine Constants ────────────────────────────────────────────────
// Reference: Challenge brief AI Matching Algorithm specification
// MATCH SCORE = w1×Topic_Relevance + w2×Role_Fit + w3×Geographic_Proximity
//             + w4×Calendar_Fit + w5×Historical_Conversion_Rate + w6×Student_Interest_Signal

export const WEIGHTS = {
  topicRelevance: 0.30,
  roleFit: 0.20,
  geographicProximity: 0.20,
  calendarFit: 0.10,
  historicalConversion: 0.10,
  studentInterest: 0.10,
} as const;

export const FACTOR_LABELS: Record<keyof typeof WEIGHTS, string> = {
  topicRelevance: 'Topic Relevance',
  roleFit: 'Role Fit',
  geographicProximity: 'Geographic Proximity',
  calendarFit: 'Calendar Fit',
  historicalConversion: 'Historical Conversion',
  studentInterest: 'Student Interest',
};

// ── Synonym Map ─────────────────────────────────────────────────────────────
// Normalizes domain-specific abbreviations for keyword matching
export const SYNONYM_MAP: Record<string, string[]> = {
  'market research': ['mr', 'marketing research', 'market research'],
  'artificial intelligence': ['ai', 'artificial intelligence', 'generative ai', 'machine learning'],
  'data analytics': ['analytics', 'data analytics', 'data analysis', 'data-driven'],
  'qualitative research': ['qualitative', 'qual', 'qualitative research', 'qualitative methods', 'focus groups', 'depth interviews', 'ethnographic research'],
  'quantitative research': ['quantitative', 'quant', 'quantitative research', 'survey design', 'survey'],
  'consumer behavior': ['consumer behavior', 'consumer insights', 'consumer understanding', 'customer understanding'],
  'brand strategy': ['brand', 'brand strategy', 'brand research', 'brand tracking', 'branding'],
  'digital marketing': ['digital', 'digital marketing', 'e-marketing', 'social media', 'social listening'],
  'innovation': ['innovation', 'creative', 'creative analytics', 'digital transformation'],
  'sales': ['sales', 'client development', 'business development'],
  'ux research': ['ux', 'ux research', 'user experience', 'behavioral analytics'],
  'project management': ['project management', 'operations', 'ops'],
  'dei': ['dei', 'diversity', 'inclusion', 'diversity & inclusion'],
  'mentorship': ['mentorship', 'mentoring', 'mentor'],
  'econometrics': ['econometrics', 'marketing science', 'statistics'],
};

// ── Region Groups ───────────────────────────────────────────────────────────
// Groups LA sub-regions and defines adjacency for geographic scoring
export const REGION_GROUPS: Record<string, string[]> = {
  'Los Angeles': [
    'Los Angeles', 'Los Angeles — West', 'Los Angeles — East',
    'Los Angeles — North', 'Los Angeles — Long Beach',
  ],
  'San Diego': ['San Diego'],
  'San Francisco': ['San Francisco'],
  'Portland': ['Portland'],
  'Seattle': ['Seattle'],
  'Ventura': ['Ventura / Thousand Oaks'],
  'Orange County': ['Orange County / Long Beach'],
};

// Adjacency pairs for 0.6 score (nearby regions)
export const ADJACENT_REGIONS: [string, string][] = [
  ['Los Angeles', 'Ventura'],
  ['Los Angeles', 'Orange County'],
  ['Los Angeles', 'San Diego'],
  ['San Francisco', 'San Diego'], // same state, moderate distance
  ['Seattle', 'Portland'],
];

// ── Role Inference Map ──────────────────────────────────────────────────────
// Infers volunteer role strengths from Board Role / Title keywords
export const ROLE_INFERENCE: Record<string, { roles: string[]; score: number }> = {
  'president': { roles: ['Guest speaker', 'Panelist'], score: 0.9 },
  'director': { roles: ['Guest speaker', 'Panelist', 'Workshop lead'], score: 0.85 },
  'professor': { roles: ['Guest speaker', 'Reviewer', 'Panelist'], score: 1.0 },
  'dr.': { roles: ['Guest speaker', 'Reviewer', 'Panelist'], score: 1.0 },
  'vp': { roles: ['Guest speaker', 'Panelist', 'Judge'], score: 0.85 },
  'svp': { roles: ['Guest speaker', 'Panelist', 'Judge'], score: 0.85 },
  'founder': { roles: ['Guest speaker', 'Mentor', 'Judge'], score: 0.9 },
  'ceo': { roles: ['Guest speaker', 'Judge', 'Panelist'], score: 0.9 },
  'sales': { roles: ['Mentor', 'Judge', 'Industry panelist'], score: 0.8 },
  'client development': { roles: ['Mentor', 'Judge', 'Industry panelist'], score: 0.8 },
  'marketing': { roles: ['Guest speaker', 'Mentor', 'Workshop speaker'], score: 0.75 },
  'analyst': { roles: ['Judge', 'Reviewer', 'Mentor'], score: 0.7 },
  'research': { roles: ['Guest speaker', 'Reviewer', 'Judge'], score: 0.8 },
  'student': { roles: ['Mentor'], score: 0.4 },
};

// ── Guest Lecture Fit Scores ────────────────────────────────────────────────
export const GUEST_LECTURE_FIT_SCORES: Record<string, number> = {
  'High': 1.0,
  'Medium': 0.6,
  'Low': 0.2,
};

// ── Historical Conversion Rates ─────────────────────────────────────────────
// Derived from MEMBER_PIPELINES campusEngagementType frequencies
// Career Panel: 5, Hackathon Judging: 4, Guest Lecture: 4, Conference: 5, Workshop: 1
export const ENGAGEMENT_CONVERSION_RATES: Record<string, number> = {
  'Career Panel': 1.0,       // 5/5 = highest
  'Conference': 1.0,         // 5/5
  'Hackathon Judging': 0.8,  // 4/5
  'Guest Lecture': 0.8,      // 4/5
  'Workshop': 0.2,           // 1/5
};

// Maps event categories to engagement types for conversion lookup
export const CATEGORY_TO_ENGAGEMENT: Record<string, string> = {
  'AI / Hackathon': 'Hackathon Judging',
  'Hackathon': 'Hackathon Judging',
  'Case competition': 'Hackathon Judging',
  'Career services': 'Career Panel',
  'Career fairs': 'Career Panel',
  'Tech symposium / Speakers': 'Conference',
  'Tech symposium': 'Conference',
  'Research showcase': 'Conference',
  'Research symposium': 'Conference',
  'Entrepreneurship / Pitch': 'Workshop',
};

// ── Course Mode Scores (for Calendar Fit) ───────────────────────────────────
export const COURSE_MODE_SCORES: Record<string, number> = {
  'Face-to-Face': 1.0,
  'Hybrid Sync': 1.0,
  'Hybrid Async': 0.7,
  'Fully Sync': 0.7,
  'Online Sync': 0.7,
  'Online Async': 0.3,
};
