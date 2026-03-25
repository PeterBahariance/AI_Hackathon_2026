"use client";

import { useState } from "react";

export default function OutreachPage() {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailTone, setEmailTone] = useState("professional");
  const [generatedEmail, setGeneratedEmail] = useState("");

  const [followUps] = useState([
    { id: 1, name: "Jane Smith", email: "jane@example.org", lastContact: "2026-03-10", status: "Pending", notes: "Interested in mentorship program" },
    { id: 2, name: "Marcus Lee", email: "marcus@example.org", lastContact: "2026-03-15", status: "Responded", notes: "Confirmed for spring event" },
    { id: 3, name: "Priya Nair", email: "priya@example.org", lastContact: "2026-03-01", status: "Overdue", notes: "Awaiting availability for Q2" },
  ]);

  const calendarEvents = [
    { date: "Mar 28", title: "Volunteer Onboarding Call", time: "10:00 AM", attendees: 4, status: "Confirmed" },
    { date: "Apr 2", title: "Chapter Outreach Meeting", time: "2:00 PM", attendees: 8, status: "Pending" },
    { date: "Apr 7", title: "Follow-up: Spring Campaign", time: "11:00 AM", attendees: 2, status: "Confirmed" },
    { date: "Apr 14", title: "Sponsor Check-in", time: "3:30 PM", attendees: 3, status: "Draft" },
  ];

  const handleGenerateEmail = () => {
    if (!emailSubject || !emailRecipient) return;
    const toneMap: Record<string, string> = {
      professional: "I hope this message finds you well.",
      friendly: "Hope you're having a great week!",
      formal: "I am writing to you regarding the following matter.",
    };
    setGeneratedEmail(
      `Subject: ${emailSubject}\n\nDear ${emailRecipient},\n\n${toneMap[emailTone]}\n\nWe wanted to reach out to share an exciting opportunity with Insight Associations West. As part of our ongoing efforts to connect passionate volunteers with meaningful causes, we believe you would be an excellent fit for our upcoming initiatives.\n\nWe would love to schedule a brief call to discuss how we can collaborate. Please let us know your availability.\n\nWarm regards,\nInsight Associations West Team`
    );
  };

  const statusColor: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Responded: "bg-green-100 text-green-800",
    Overdue: "bg-red-100 text-red-800",
    Confirmed: "bg-green-100 text-green-800",
    Draft: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Communication & Outreach
      </h1>
      <p className="text-slate-500 mb-10 text-sm">Manage email drafts, align calendars, and track follow-ups all in one place.</p>

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

        {/* Calendar Alignment */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#471f8d" }}>
              📅
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>Calendar Alignment</h2>
          </div>
          <div className="space-y-3">
            {calendarEvents.map((event, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex gap-3 items-start">
                  <div className="text-center min-w-[40px]">
                    <p className="text-[10px] font-semibold text-[#471f8d] uppercase">{event.date.split(" ")[0]}</p>
                    <p className="text-lg font-bold text-slate-800 leading-none">{event.date.split(" ")[1]}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{event.title}</p>
                    <p className="text-xs text-slate-500">{event.time} · {event.attendees} attendees</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${statusColor[event.status]}`}>
                  {event.status}
                </span>
              </div>
            ))}
            <button className="w-full py-2 rounded-lg text-sm font-medium border border-[#471f8d] text-[#471f8d] hover:bg-[#471f8d]/5 transition-colors">
              + Schedule New Event
            </button>
          </div>
        </div>

        {/* Follow-up Tracking */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: "#471f8d" }}>
              🔔
            </div>
            <h2 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "Georgia, serif" }}>Follow-up Tracking</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-gray-100">
                  <th className="pb-2 font-medium pr-4">Name</th>
                  <th className="pb-2 font-medium pr-4">Email</th>
                  <th className="pb-2 font-medium pr-4">Last Contact</th>
                  <th className="pb-2 font-medium pr-4">Status</th>
                  <th className="pb-2 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((person) => (
                  <tr key={person.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-slate-800">{person.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{person.email}</td>
                    <td className="py-3 pr-4 text-slate-500">{person.lastContact}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[person.status]}`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">{person.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="mt-4 text-sm text-[#471f8d] font-medium hover:underline">+ Add Contact</button>
        </div>

      </div>
    </div>
  );
}
