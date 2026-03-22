"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase"; // Ensure your firebase export is named 'db'
import { collection, getDocs } from "firebase/firestore";

const months = [
  { name: 'March', monthIndex: 2, year: 2026, days: 31 },
  { name: 'April', monthIndex: 3, year: 2026, days: 30 },
  { name: 'May', monthIndex: 4, year: 2026, days: 31 },
  { name: 'June', monthIndex: 5, year: 2026, days: 30 }
];

interface IAEvent {
  id: string;
  "IA Event Date": string; 
  Region: string;
  "Nearby Universities": string;
  "Suggested Lecture Window": string;
  "Course Alignment": string;
}

const MonthCalendar = ({ name, monthIndex, year, days, events }: { name: string; monthIndex: number; year: number; days: number, events: IAEvent[] }) => {
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  const requiredSlots = firstDayOfMonth + days;
  const totalSlots = requiredSlots <= 35 ? 35 : 42;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-[#dbbde5] flex-1 min-w-[280px]">
      <div className="text-center mb-4 py-2 rounded-lg bg-[#dbbde5]">
        <h3 className="text-base font-semibold text-black">{name} {year}</h3>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-semibold py-1 text-[#471f8d]">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalSlots }, (_, i) => {
          const dayNumber = i - firstDayOfMonth + 1;
          const isValidDay = dayNumber > 0 && dayNumber <= days;
          
          const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
          const dayEvent = events.find(e => e["IA Event Date"] === dateStr);
          return (
            <div key={i} className="relative aspect-square">
              {isValidDay ? (
                <Link 
                  href={dayEvent ? `/ia_events/${dayEvent.id}` : "#"}
                  className={`w-full h-full border border-[#dbbde5] rounded flex flex-col items-center justify-center text-xs transition-all
                    ${dayEvent 
                      ? "bg-[#471f8d] text-white font-bold hover:bg-[#5a2ab1]" 
                      : "text-gray-700 hover:bg-blue-50"}`}
                >
                  {dayNumber}
                  {dayEvent && (
                    <span className="w-1 h-1 bg-white rounded-full mt-0.5"></span>
                  )}
                </Link>
              ) : (
                <div className="w-full h-full bg-gray-50/30"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function IAEventsPage() {
  const [events, setEvents] = useState<IAEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const querySnapshot = await getDocs(collection(db, "event_calendar"));
        const eventsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as IAEvent[];
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#471f8d] pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>IA Events</h1>
          <p className="text-[#dbbde5] text-lg" style={{ fontFamily: "Georgia, serif" }}>
            {loading ? "Syncing with Firestore..." : "Automated event finder — live data extracted via LLM."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-[#f9f5ff] border border-[#dbbde5] rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {months.map((m) => (
              <MonthCalendar
                key={m.name}
                name={m.name}
                monthIndex={m.monthIndex}
                year={m.year}
                days={m.days}
                events={events}
              />
            ))}
          </div>
          {!loading && events.length === 0 && (
            <p className="text-center text-sm text-slate-500 italic">No events found in 'event_calendar' collection.</p>
          )}
        </div>
      </div>
    </div>
  );
}