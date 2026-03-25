// ── Gemini API Wrapper ──────────────────────────────────────────────────────
// Generates natural-language match rationales using Google Gemini.
// Uses the existing NEXT_PUBLIC_GEMINI_API_KEY from .env.local.

import type { MatchResult } from './matchingEngine';
import { FACTOR_LABELS } from './matchingConstants';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function generateMatchRationale(result: MatchResult): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return 'Gemini API key not configured.';

  const { volunteer, opportunity, totalScore, factors, explanations } = result;

  const oppName = opportunity.type === 'event'
    ? opportunity.name
    : `${opportunity.courseCode} — ${opportunity.name}`;

  const oppDetails = opportunity.type === 'event'
    ? `Category: ${opportunity.category}, Region: ${opportunity.region}, Date: ${opportunity.date}, Roles needed: ${opportunity.volunteerRoles}`
    : `Instructor: ${opportunity.instructor}, Mode: ${opportunity.mode}, Guest Lecture Fit: ${opportunity.guestLectureFit}, Enrollment: ${opportunity.enrollmentCap}`;

  const factorBreakdown = (Object.keys(factors) as (keyof typeof factors)[])
    .map(key => `- ${FACTOR_LABELS[key]}: ${Math.round(factors[key] * 100)}% — ${explanations[key]}`)
    .join('\n');

  const prompt = `You are an AI assistant for the Insights Association West Chapter's Smart Match CRM.
A matching algorithm has scored a volunteer-to-opportunity pairing. Write a concise 2-3 sentence rationale explaining why this is a ${totalScore >= 70 ? 'strong' : totalScore >= 50 ? 'moderate' : 'weaker'} match and what makes this volunteer suited (or not) for this opportunity. Be specific about the person and opportunity.

Volunteer: ${volunteer.Name}
Title: ${volunteer.Title} at ${volunteer.Company}
Region: ${volunteer['Metro Region']}
Expertise: ${volunteer.Expertise}
Board Role: ${volunteer['Board Role'] || 'N/A'}

Opportunity: ${oppName}
${oppDetails}

Overall Match Score: ${totalScore}/100

Factor Breakdown:
${factorBreakdown}

Write the rationale now (2-3 sentences, professional tone):`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return 'Unable to generate AI insight at this time.';
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || 'No rationale generated.';
  } catch (error) {
    console.error('Gemini request failed:', error);
    return 'Unable to generate AI insight at this time.';
  }
}
