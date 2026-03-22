"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface IAEvent {
  id: string;
  "IA Event Date": string;
  Region: string;
  "Nearby Universities": string;
  "Suggested Lecture Window": string;
  "Course Alignment": string;
}

const MonthCalendar = ({ name, monthIndex, year, days, events }: any) => {
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
          const dayEvent = events.find((e: IAEvent) => e["IA Event Date"] === dateStr);

          return (
            <div key={i} className="relative aspect-square">
              {isValidDay ? (
              <Link 
                href={dayEvent ? `/ia_events/${dayEvent.id}` : "#"}
                className={`w-full h-full border border-[#dbbde5] rounded flex flex-col items-center justify-center text-xs transition-all duration-200 ease-out
                  ${dayEvent 
                    ? "bg-[#471f8d] text-white font-bold shadow-sm hover:bg-[#5a2ab1] hover:shadow-lg hover:-translate-y-1 hover:scale-110 z-10" 
                    : "text-gray-700 hover:bg-blue-50"}`}
                title={dayEvent ? `${dayEvent.Region}: ${dayEvent["Nearby Universities"]}` : ""}
              >
                {dayNumber}
                {dayEvent && (
                  <span className="w-1 h-1 bg-white rounded-full mt-0.5 animate-pulse"></span>
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

  const dynamicMonths = useMemo(() => {
    if (events.length === 0) return [];
    const monthKeys = Array.from(new Set(events.map(e => {
      const parts = e["IA Event Date"].split('-');
      return `${parts[0]}-${parts[1]}`;
    }))).sort();

    return monthKeys.map(key => {
      const [year, month] = key.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return {
        name: date.toLocaleString('default', { month: 'long' }),
        monthIndex: date.getMonth(),
        year: date.getFullYear(),
        days: new Date(parseInt(year), parseInt(month), 0).getDate()
      };
    });
  }, [events]);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#471f8d] mb-8" style={{ fontFamily: "Georgia, serif" }}>IA Event Calendar</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {dynamicMonths.map((m) => (
            <MonthCalendar key={`${m.name}-${m.year}`} {...m} events={events} />
          ))}
        </div>
      </div>
    </div>
  );
}