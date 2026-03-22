"use client";

import React from 'react';

const months = [
  { name: 'March', monthIndex: 2, year: 2026, days: 31 },
  { name: 'April', monthIndex: 3, year: 2026, days: 30 },
  { name: 'May', monthIndex: 4, year: 2026, days: 31 },
  { name: 'June', monthIndex: 5, year: 2026, days: 30 }
];

const MonthCalendar = ({ name, monthIndex, year, days }: { name: string; monthIndex: number; year: number; days: number }) => {
  // Calculate which day of the week the 1st falls on (0 = Sunday, 1 = Monday...)
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay();
  
  // Calculate exactly how many slots are needed (Padding + Days)
  const requiredSlots = firstDayOfMonth + days;
  
  // Determine if we need 5 rows (35) or 6 rows (42)
  const totalSlots = requiredSlots <= 35 ? 35 : 42;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-[#dbbde5] flex-1 min-w-[280px]">
      <div className="text-center mb-4 py-2 rounded-lg bg-[#dbbde5]">
        <h3 className="text-base font-semibold text-black">{name} {year}</h3>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-xs font-semibold py-1 text-[#471f8d]">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: totalSlots }, (_, i) => {
          const dayNumber = i - firstDayOfMonth + 1;
          const isValidDay = dayNumber > 0 && dayNumber <= days;

          return (
            <div
              key={i}
              className={`aspect-square border border-[#dbbde5] rounded flex items-center justify-center text-xs transition-colors 
                ${isValidDay 
                  ? "text-gray-700 hover:bg-blue-400 hover:text-white cursor-pointer" 
                  : "bg-gray-50/50 text-transparent border-none"
                }`}
            >
              {isValidDay ? dayNumber : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function IAEventsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#471f8d] pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>IA Events</h1>
          <p className="text-[#dbbde5] text-lg" style={{ fontFamily: "Georgia, serif" }}>Automated university event finder — web scraping and LLM extraction.</p>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-[#f9f5ff] border border-[#dbbde5] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-[#471f8d]">IA Event Calendar</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            {months.map((m) => (
              <MonthCalendar
                key={`${m.name}-${m.year}`}
                name={m.name}
                monthIndex={m.monthIndex}
                year={m.year}
                days={m.days}
              />
            ))}
          </div>

          <p className="text-center text-sm text-[#471f8d] opacity-50 mt-4">
            Calendar view synced to 2026 week days — events will be populated here
          </p>
        </div>
      </div>
    </div>
  );
}