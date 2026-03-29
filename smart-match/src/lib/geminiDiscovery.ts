// ── Gemini University Discovery ─────────────────────────────────────────────
// Uses Google Gemini to discover engagement opportunities at any university.
// Implements "LLM-assisted extraction + templated search" as described in the
// IA West Smart Match challenge requirements.

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface DiscoveredContact {
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

export async function discoverUniversityOpportunities(universityName: string): Promise<DiscoveredContact[]> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API key not configured.');

  const prompt = `You are an assistant for a professional association CRM. Given a university name, generate 5-7 realistic engagement opportunities (hackathons, career fairs, case competitions, research symposia, guest lecture programs, tech symposiums) that the Insights Association West could participate in at that university.

Use real program names, departments, and event formats typical of that university when possible. If you know of actual events at this university, use those. Otherwise, generate plausible ones based on the university's known colleges and programs.

Return a JSON array where each object has these exact fields:
- "Event / Program": string (name of event or program)
- "Category": string (one of: "AI / Hackathon", "Case competition", "Entrepreneurship / Pitch", "Tech symposium / Speakers", "Hackathon", "Research showcase", "Research symposium", "Career fairs", "Career services")
- "Point(s) of Contact (published)": string (realistic department contact title, e.g. "Career Center Director" or "Hackathon Organizer")
- "Contact Email / Phone (published)": string (realistic departmental email like dept@university.edu)
- "Host / Unit": string (hosting department or college)
- "Volunteer Roles (fit)": string (semicolon-separated, from: Judge; Mentor; Guest speaker; Workshop lead; Panelist; Reviewer; Industry panelist)
- "Primary Audience": string (e.g. "Undergraduate business students", "Graduate analytics students")
- "Public URL": string (ONLY use a URL you are confident is real and active — otherwise use an empty string "")
- "Recurrence (typical)": string (e.g. "Annual", "Semesterly", "Quarterly")

University: ${universityName}

Return ONLY valid JSON. No markdown fences, no commentary, no explanation. Use double quotes for all property names and string values. Do not use single quotes. Do not include trailing commas.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 8192,
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini Discovery API error:', errorText);
      throw new Error('Gemini API request failed.');
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini raw response:', rawText.substring(0, 500));

    // Strip markdown fences and fix common Gemini JSON quirks
    let cleaned = rawText
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    // Fix trailing commas before ] or }
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    // Replace smart/curly quotes with straight quotes
    cleaned = cleaned.replace(/[\u201C\u201D\u2018\u2019]/g, '"');

    // Extract the JSON array from the response
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!arrayMatch) {
      console.error('No JSON array found in Gemini response. Full response:', rawText);
      throw new Error('Could not parse Gemini response as JSON.');
    }

    let arrayStr = arrayMatch[0].replace(/,\s*([}\]])/g, '$1');

    let parsed;
    try {
      parsed = JSON.parse(arrayStr);
    } catch (e) {
      console.error('JSON parse error:', e, '\nCleaned string:', arrayStr.substring(0, 500));
      throw new Error('Could not parse Gemini response as JSON.');
    }

    if (!Array.isArray(parsed)) throw new Error('Expected JSON array from Gemini.');

    return parsed.map((item: Record<string, string>, i: number): DiscoveredContact => ({
      id: `discovered-${universityName.toLowerCase().replace(/\s+/g, '-')}-${i}`,
      eventName: item['Event / Program'] || '',
      category: item['Category'] || '',
      contact: item['Point(s) of Contact (published)'] || '',
      email: item['Contact Email / Phone (published)'] || '',
      host: item['Host / Unit'] || '',
      roles: item['Volunteer Roles (fit)'] || '',
      audience: item['Primary Audience'] || '',
      url: item['Public URL'] || '',
      recurrence: item['Recurrence (typical)'] || '',
    }));
  } catch (error) {
    console.error('Gemini Discovery failed:', error);
    throw error;
  }
}
