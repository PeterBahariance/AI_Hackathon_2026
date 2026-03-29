"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Loader2, ExternalLink, Mail } from "lucide-react";

interface ContactRecord {
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

function OutreachContent() {
  const searchParams = useSearchParams();
  const contactParam = searchParams.get("contact");
  const eventParam = searchParams.get("event");
  const volunteerParam = searchParams.get("volunteer");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailTone, setEmailTone] = useState("professional");
  const [generatedEmail, setGeneratedEmail] = useState("");

  // Real contact data from Firestore
  const [allContacts, setAllContacts] = useState<ContactRecord[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [prefillApplied, setPrefillApplied] = useState(false);
  const [activeContactEmail, setActiveContactEmail] = useState("");

  // Real IA events from Firestore
  interface CalendarEvent {
    date: string;
    title: string;
    region: string;
    lectureWindow: string;
  }
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Fetch all contacts from events_contacts + calendar events
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch contacts
        const contactSnap = await getDocs(collection(db, "events_contacts"));
        const records: ContactRecord[] = contactSnap.docs
          .map(d => {
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
          })
          .filter(c => c.email && !c.email.startsWith("See") && !c.email.startsWith("Use"));
        setAllContacts(records);

        // Fetch IA calendar events
        const calSnap = await getDocs(query(collection(db, "event_calendar"), orderBy("IA Event Date", "asc")));
        const events: CalendarEvent[] = calSnap.docs.map(d => {
          const data = d.data();
          return {
            date: data["IA Event Date"] || "",
            title: data["Nearby Universities"] || "",
            region: data["Region"] || "",
            lectureWindow: data["Suggested Lecture Window"] || "",
          };
        });
        setCalendarEvents(events);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setContactsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Pre-fill email fields when coming from matching page
  useEffect(() => {
    if (prefillApplied || !contactParam || allContacts.length === 0) return;

    // Check Firestore contacts first
    let contact = allContacts.find(c => c.id === contactParam);

    // If not found, check discovered contacts in sessionStorage
    if (!contact) {
      try {
        const stored = sessionStorage.getItem('discoveredContacts');
        if (stored) {
          const discovered: ContactRecord[] = JSON.parse(stored);
          contact = discovered.find(c => c.id === contactParam);
        }
      } catch { /* ignore */ }
    }

    if (contact) {
      setEmailRecipient(contact.contact);
      setActiveContactEmail(contact.email);
      const event = eventParam || contact.eventName;
      const volunteer = volunteerParam || "";
      setEmailSubject(
        volunteer
          ? `Volunteer Placement — ${volunteer} for ${event}`
          : `Volunteer Opportunity — ${event}`
      );
      setPrefillApplied(true);
    }
  }, [contactParam, eventParam, volunteerParam, allContacts, prefillApplied]);

  const handleGenerateEmail = () => {
    if (!emailSubject || !emailRecipient) return;
    const toneMap: Record<string, string> = {
      professional: "I hope this message finds you well.",
      friendly: "Hope you're having a great week!",
      formal: "I am writing to you regarding the following matter.",
    };

    // Find the contact's email for the signature line
    const matchedContact = allContacts.find(c => c.contact === emailRecipient);
    const volunteerName = volunteerParam || "our volunteer";
    const eventName = eventParam || matchedContact?.eventName || "your upcoming event";

    setGeneratedEmail(
      `Subject: ${emailSubject}\n\nDear ${emailRecipient},\n\n${toneMap[emailTone]}\n\nWe are reaching out from Insight Associations West regarding ${eventName}. We have identified ${volunteerName} as an excellent match for this opportunity based on their expertise and regional alignment.\n\nWe would love to coordinate a placement and discuss how our volunteer can contribute — whether as a guest speaker, judge, mentor, or panelist.\n\nWould you be available for a brief call this week to discuss next steps?\n\nWarm regards,\nInsight Associations West Team`
    );
  };

  // Category color for contact directory
  const categoryColor: Record<string, string> = {
    "AI / Hackathon": "bg-purple-100 text-purple-700",
    "Case competition": "bg-blue-100 text-blue-700",
    "Entrepreneurship / Pitch": "bg-orange-100 text-orange-700",
    "Tech symposium / Speakers": "bg-cyan-100 text-cyan-700",
    "Hackathon": "bg-violet-100 text-violet-700",
    "Research showcase": "bg-emerald-100 text-emerald-700",
    "Research symposium": "bg-teal-100 text-teal-700",
    "Career services": "bg-amber-100 text-amber-700",
    "Career fairs": "bg-amber-100 text-amber-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Communication & Outreach
      </h1>
      <p className="text-slate-500 mb-10 text-sm">Manage email drafts, align calendars, and track follow-ups all in one place.</p>

      {/* Pre-fill banner when coming from matching */}
      {contactParam && volunteerParam && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm text-emerald-800">
            <strong>Auto-filled from matching:</strong> Drafting outreach for <strong>{volunteerParam}</strong> → <strong>{eventParam}</strong>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Email Draft Generation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#471f8d" }}>
              ✉
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>Email Draft Generation</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Recipient Name</label>
              <input
                type="text"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="e.g. Jane Smith"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#471f8d]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="e.g. Volunteer Opportunity — Spring 2026"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#471f8d]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tone</label>
              <select
                value={emailTone}
                onChange={(e) => setEmailTone(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#471f8d]/30"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
              </select>
            </div>
            <button
              onClick={handleGenerateEmail}
              className="w-full py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#471f8d" }}
            >
              Generate Draft
            </button>
            {activeContactEmail && (
              <div className="mt-3 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <Mail size={14} className="text-emerald-600 shrink-0" />
                <span className="text-xs text-slate-600">Send to:</span>
                <a href={`mailto:${activeContactEmail}`} className="text-sm font-bold text-emerald-700 hover:underline">
                  {activeContactEmail}
                </a>
              </div>
            )}
            {generatedEmail && (
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans">{generatedEmail}</pre>
                <button
                  onClick={() => navigator.clipboard?.writeText(generatedEmail)}
                  className="mt-2 text-xs text-[#471f8d] font-medium hover:underline"
                >
                  Copy to clipboard
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Alignment — IA Events */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#471f8d" }}>
              📅
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>Calendar Alignment</h2>
          </div>
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {calendarEvents.length === 0 && !contactsLoading && (
              <p className="text-sm text-slate-400 text-center py-6">No upcoming events</p>
            )}
            {calendarEvents.map((event, i) => {
              const d = new Date(event.date + "T00:00:00");
              const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
              const day = d.getDate();
              const isPast = d < new Date();
              return (
                <div key={i} className={`flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-100 ${isPast ? "bg-gray-50 opacity-60" : "bg-gray-50"}`}>
                  <div className="flex gap-3 items-start">
                    <div className="text-center min-w-[40px]">
                      <p className="text-[10px] font-semibold text-[#471f8d] uppercase">{month}</p>
                      <p className="text-lg font-bold text-slate-800 leading-none">{day}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.region} · {event.lectureWindow}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${isPast ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-800"}`}>
                    {isPast ? "Past" : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Directory — real data from events_contacts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#471f8d" }}>
              📇
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>
              University Contact Directory
            </h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider ml-2">
              Cal Poly Pomona
            </span>
          </div>
          {contactsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#471f8d]" size={24} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-gray-100">
                    <th className="pb-2 font-medium pr-4">Event / Program</th>
                    <th className="pb-2 font-medium pr-4">Category</th>
                    <th className="pb-2 font-medium pr-4">Contact</th>
                    <th className="pb-2 font-medium pr-4">Email</th>
                    <th className="pb-2 font-medium pr-4">Roles Needed</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {allContacts.map((c) => (
                    <tr
                      key={c.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        contactParam === c.id ? "bg-emerald-50" : ""
                      }`}
                    >
                      <td className="py-3 pr-4 font-medium text-slate-800">{c.eventName}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${categoryColor[c.category] || "bg-gray-100 text-gray-600"}`}>
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{c.contact}</td>
                      <td className="py-3 pr-4">
                        <a href={`mailto:${c.email}`} className="text-[#471f8d] font-medium hover:underline">
                          {c.email}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{c.roles}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {c.url && (
                            <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#471f8d] transition-colors">
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => {
                              setEmailRecipient(c.contact);
                              setActiveContactEmail(c.email);
                              setEmailSubject(`Volunteer Opportunity — ${c.eventName}`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="text-[10px] font-bold text-[#471f8d] hover:underline whitespace-nowrap"
                          >
                            Draft Email
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <Loader2 className="animate-spin text-[#471f8d]" size={32} />
      </div>
    }>
      <OutreachContent />
    </Suspense>
  );
}
