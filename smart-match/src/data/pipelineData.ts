// Member Pipeline Data
// Tracks the conversion path: Campus Engagement → Student Member → IA Event Attendee → Mentee → Young Professional → Corporate Member
// Is_Mock = false → verified IA West board member (real data)
// Is_Mock = true  → illustrative example (mock/demo data)

export const PIPELINE_STAGE_KEYS = [
  'campusEngagement',
  'studentMember',
  'iaEventAttendee',
  'mentee',
  'youngProfessional',
  'corporateMember',
] as const;

export type PipelineStageKey = (typeof PIPELINE_STAGE_KEYS)[number];

export const PIPELINE_STAGE_LABELS: Record<PipelineStageKey, string> = {
  campusEngagement: 'Campus Engagement',
  studentMember: 'Student Member',
  iaEventAttendee: 'IA Event Attendee',
  mentee: 'Mentee',
  youngProfessional: 'Young Professional',
  corporateMember: 'Corporate Member',
};

export interface MemberPipeline {
  isMock: boolean;
  currentStage: PipelineStageKey;
  campusEngagementType: string;
  stages: Partial<Record<PipelineStageKey, string>>; // dates (YYYY-MM-DD) or undefined
  notes: string;
}

export const MEMBER_PIPELINES: Record<string, MemberPipeline> = {
  // ── REAL MEMBERS (IA West Board) ──────────────────────────────────────────
  "Travis Miller": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Hackathon Judging',
    stages: {
      campusEngagement: '2015-03-15',
      studentMember: '2015-08-01',
      iaEventAttendee: '2016-02-20',
      mentee: '2016-09-15',
      youngProfessional: '2017-06-01',
      corporateMember: '2020-01-15',
    },
    notes: 'First engaged judging a CPP student hackathon. Now serves as IA West President.',
  },
  "Amanda Keller-Grill": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2014-11-10',
      studentMember: '2015-02-05',
      iaEventAttendee: '2015-08-18',
      mentee: '2016-03-01',
      youngProfessional: '2017-01-20',
      corporateMember: '2019-06-15',
    },
    notes: 'Recruited via career panel at USC Marshall. Now President Elect.',
  },
  "Katrina Noelle": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Guest Lecture',
    stages: {
      campusEngagement: '2013-09-20',
      studentMember: '2014-01-15',
      iaEventAttendee: '2014-07-10',
      mentee: '2015-02-01',
      youngProfessional: '2016-06-01',
      corporateMember: '2018-11-01',
    },
    notes: 'First contact through qualitative research guest lecture at SF State.',
  },
  "Rob Kaiser": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Conference',
    stages: {
      campusEngagement: '2016-04-05',
      studentMember: '2016-09-01',
      iaEventAttendee: '2017-03-15',
      mentee: '2017-10-01',
      youngProfessional: '2018-06-01',
      corporateMember: '2021-03-10',
    },
    notes: 'Met at AMA West Coast Conference, converted through mentorship track.',
  },
  "Donna Flynn": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2015-06-12',
      studentMember: '2015-10-01',
      iaEventAttendee: '2016-04-22',
      mentee: '2016-11-15',
      youngProfessional: '2018-01-01',
      corporateMember: '2020-09-01',
    },
    notes: 'Connected via career panel at Loyola Marymount University.',
  },
  "Greg Carter": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Guest Lecture',
    stages: {
      campusEngagement: '2002-04-18',
      studentMember: '2003-01-01',
      iaEventAttendee: '2003-09-15',
      corporateMember: '2005-06-01',
    },
    notes: 'Legacy member (40+ yrs experience). Joined through early Seattle chapter guest lectures. Mentee and YP stages predated formal program structure.',
  },
  "Katie Nelson": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Hackathon Judging',
    stages: {
      campusEngagement: '2018-10-05',
      studentMember: '2019-02-10',
      iaEventAttendee: '2019-08-01',
      mentee: '2020-02-15',
      youngProfessional: '2021-01-01',
      corporateMember: '2023-04-20',
    },
    notes: 'Engaged as hackathon judge at Portland State University.',
  },
  "Liz O'Hara": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Conference',
    stages: {
      campusEngagement: '2017-05-20',
      studentMember: '2017-10-01',
      iaEventAttendee: '2018-03-05',
      mentee: '2018-09-10',
      youngProfessional: '2019-08-01',
      corporateMember: '2022-02-14',
    },
    notes: 'Recruited at IIeX conference, transitioned through the full pipeline.',
  },
  "Sean McKenna": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2012-03-08',
      studentMember: '2012-08-01',
      iaEventAttendee: '2013-02-20',
      mentee: '2013-10-01',
      youngProfessional: '2015-01-01',
      corporateMember: '2017-07-15',
    },
    notes: '15+ yrs industry experience. First engaged through SDSU career panel.',
  },
  "Calvin Friesth": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Hackathon Judging',
    stages: {
      campusEngagement: '2013-11-22',
      studentMember: '2014-04-01',
      iaEventAttendee: '2014-10-15',
      mentee: '2015-05-01',
      youngProfessional: '2016-08-01',
      corporateMember: '2019-01-10',
    },
    notes: 'Joined through judging CPP AI competition. 15+ yrs experience.',
  },
  "Ashley Le Blanc": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Guest Lecture',
    stages: {
      campusEngagement: '2018-02-14',
      studentMember: '2018-06-01',
      iaEventAttendee: '2018-11-20',
      mentee: '2019-04-01',
      youngProfessional: '2020-06-01',
      corporateMember: '2022-09-15',
    },
    notes: 'First connected through brand strategy guest lecture at CSUN.',
  },
  "Monica Voss": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Conference',
    stages: {
      campusEngagement: '2017-09-28',
      studentMember: '2018-02-01',
      iaEventAttendee: '2018-07-10',
      mentee: '2019-02-01',
      youngProfessional: '2020-04-01',
      corporateMember: '2022-06-01',
    },
    notes: 'Discovered IA at MRS Annual Conference 2017.',
  },
  "Molly Strawn": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2019-01-15',
      studentMember: '2019-05-01',
      iaEventAttendee: '2019-10-20',
      mentee: '2020-03-15',
      youngProfessional: '2021-06-01',
      corporateMember: '2023-01-20',
    },
    notes: 'Engaged through growth marketing career panel at UCLA.',
  },
  "Shana DeMarinis": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Hackathon Judging',
    stages: {
      campusEngagement: '2016-03-10',
      studentMember: '2016-07-01',
      iaEventAttendee: '2017-01-15',
      mentee: '2017-08-01',
      youngProfessional: '2018-07-01',
      corporateMember: '2021-05-10',
    },
    notes: '13 yrs experience. First engaged judging CSUCI hackathon.',
  },
  "Dr. Yufan Lin": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Guest Lecture',
    stages: {
      campusEngagement: '2019-09-05',
      studentMember: '2020-01-15',
      iaEventAttendee: '2020-07-01',
      mentee: '2021-01-15',
      youngProfessional: '2022-06-01',
      corporateMember: '2023-09-01',
    },
    notes: 'Recruited as CPP faculty through guest lecture program; now hosts IA speakers himself.',
  },
  "Adam Portner": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Conference',
    stages: {
      campusEngagement: '2008-06-14',
      studentMember: '2009-01-01',
      iaEventAttendee: '2009-07-20',
      corporateMember: '2011-03-01',
    },
    notes: 'Legacy member with 25+ yrs experience. Joined via Quirks Event Conference. Pre-dates formal mentee/YP track.',
  },
  "Laurie Bae": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2019-11-08',
      studentMember: '2020-03-01',
      iaEventAttendee: '2020-09-15',
      mentee: '2021-04-01',
      youngProfessional: '2022-08-01',
      corporateMember: '2024-02-01',
    },
    notes: 'Connected through Ipsos university recruitment career panel at SF State.',
  },
  "Amber Jawaid": {
    isMock: false,
    currentStage: 'corporateMember',
    campusEngagementType: 'Conference',
    stages: {
      campusEngagement: '2010-05-20',
      studentMember: '2011-01-01',
      iaEventAttendee: '2011-08-10',
      corporateMember: '2013-06-15',
    },
    notes: '20+ yrs experience. Joined through ESOMAR conference. Pre-dates formal mentee/YP track.',
  },

  // ── MOCK MEMBERS (Illustrative Pipeline Examples) ─────────────────────────
  "Jordan Kim": {
    isMock: true,
    currentStage: 'mentee',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2023-09-20',
      studentMember: '2024-01-15',
      iaEventAttendee: '2024-04-10',
      mentee: '2024-09-01',
    },
    notes: 'UCLA Anderson graduate student, currently active mentee in the LA chapter.',
  },
  "Alex Ramirez": {
    isMock: true,
    currentStage: 'youngProfessional',
    campusEngagementType: 'Hackathon Judging',
    stages: {
      campusEngagement: '2022-10-12',
      studentMember: '2023-02-01',
      iaEventAttendee: '2023-07-18',
      mentee: '2023-11-01',
      youngProfessional: '2024-06-15',
    },
    notes: 'SDSU alum, now at a boutique insights firm in San Diego. Strong track for corporate membership.',
  },
  "Sam Chen": {
    isMock: true,
    currentStage: 'studentMember',
    campusEngagementType: 'Guest Lecture',
    stages: {
      campusEngagement: '2024-02-08',
      studentMember: '2024-05-01',
    },
    notes: 'Cal Poly Pomona junior, attended Dr. Lin\'s guest lecture on generative AI in market research.',
  },
  "Taylor Brooks": {
    isMock: true,
    currentStage: 'iaEventAttendee',
    campusEngagementType: 'Workshop',
    stages: {
      campusEngagement: '2023-04-25',
      studentMember: '2023-08-01',
      iaEventAttendee: '2024-01-20',
    },
    notes: 'Portland State student who attended a digital transformation workshop and signed up for IA events.',
  },
  "Morgan Patel": {
    isMock: true,
    currentStage: 'youngProfessional',
    campusEngagementType: 'Career Panel',
    stages: {
      campusEngagement: '2021-11-15',
      studentMember: '2022-03-01',
      iaEventAttendee: '2022-08-20',
      mentee: '2023-02-01',
      youngProfessional: '2024-03-10',
    },
    notes: 'SF Bay Area analyst, moving toward corporate membership after strong mentorship engagement.',
  },
  "Casey Williams": {
    isMock: true,
    currentStage: 'campusEngagement',
    campusEngagementType: 'Hackathon Judging',
    stages: {
      campusEngagement: '2025-02-28',
    },
    notes: 'UC San Diego senior, just judged their first hackathon. Follow-up outreach pending.',
  },
  "Riley Torres": {
    isMock: true,
    currentStage: 'iaEventAttendee',
    campusEngagementType: 'Guest Lecture',
    stages: {
      campusEngagement: '2023-06-10',
      studentMember: '2023-10-01',
      iaEventAttendee: '2024-03-15',
    },
    notes: 'Seattle-area community college transfer student. Attended IA Pacific Northwest event as first major exposure.',
  },
};

// Static profiles for mock volunteers (not in Firestore)
export const MOCK_VOLUNTEER_PROFILES = [
  {
    id: 'mock-jordan-kim',
    Name: 'Jordan Kim',
    Title: 'Graduate Research Assistant',
    Company: 'UCLA Anderson School of Management',
    'Metro Region': 'Los Angeles — West',
    Expertise: 'quantitative research, consumer behavior, survey design',
    'Board Role': '—',
    isMock: true,
  },
  {
    id: 'mock-alex-ramirez',
    Name: 'Alex Ramirez',
    Title: 'Research Analyst',
    Company: 'Boutique Insights Firm',
    'Metro Region': 'San Diego',
    Expertise: 'data analytics, brand tracking, market segmentation',
    'Board Role': '—',
    isMock: true,
  },
  {
    id: 'mock-sam-chen',
    Name: 'Sam Chen',
    Title: 'Junior (Undergraduate)',
    Company: 'Cal Poly Pomona',
    'Metro Region': 'Los Angeles — East',
    Expertise: 'generative AI, marketing research methods',
    'Board Role': '—',
    isMock: true,
  },
  {
    id: 'mock-taylor-brooks',
    Name: 'Taylor Brooks',
    Title: 'Community College Transfer Student',
    Company: 'Portland State University',
    'Metro Region': 'Portland',
    Expertise: 'digital marketing, social listening, data visualization',
    'Board Role': '—',
    isMock: true,
  },
  {
    id: 'mock-morgan-patel',
    Name: 'Morgan Patel',
    Title: 'Insights Analyst',
    Company: 'Tech Startup (SF Bay Area)',
    'Metro Region': 'San Francisco',
    Expertise: 'UX research, behavioral analytics, NLP',
    'Board Role': '—',
    isMock: true,
  },
  {
    id: 'mock-casey-williams',
    Name: 'Casey Williams',
    Title: 'Senior (Undergraduate)',
    Company: 'UC San Diego',
    'Metro Region': 'San Diego',
    Expertise: 'competitive intelligence, secondary research',
    'Board Role': '—',
    isMock: true,
  },
  {
    id: 'mock-riley-torres',
    Name: 'Riley Torres',
    Title: 'Transfer Student',
    Company: 'Shoreline Community College',
    'Metro Region': 'Seattle',
    Expertise: 'qualitative methods, ethnographic research',
    'Board Role': '—',
    isMock: true,
  },
];

// All real board member names (for badge lookup in directory)
export const REAL_MEMBER_NAMES = new Set([
  "Travis Miller", "Amanda Keller-Grill", "Katrina Noelle", "Rob Kaiser",
  "Donna Flynn", "Greg Carter", "Katie Nelson", "Liz O'Hara", "Sean McKenna",
  "Calvin Friesth", "Ashley Le Blanc", "Monica Voss", "Molly Strawn",
  "Shana DeMarinis", "Dr. Yufan Lin", "Adam Portner", "Laurie Bae", "Amber Jawaid",
]);
