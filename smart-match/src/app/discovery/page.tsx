"use client";

const months = [
  { name: 'March', year: 2026, days: 31 },
  { name: 'April', year: 2026, days: 30 },
  { name: 'May', year: 2026, days: 31 },
  { name: 'June', year: 2026, days: 30 }
];

const MonthCalendar = ({ month, year, days }: { month: string; year: number; days: number }) => (
  <div className="bg-white rounded-xl shadow-md p-4 border border-[#dbbde5] flex-1 min-w-0">
    <div className="text-center mb-4 py-2 rounded-lg" style={{ backgroundColor: "#dbbde5" }}>
      <h3 className="text-base font-semibold text-black">{month} {year}</h3>
    </div>

    {/* Days of week header */}
    <div className="grid grid-cols-7 gap-1 mb-2">
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
        <div key={day} className="text-center text-xs font-semibold py-1" style={{ color: "#471f8d" }}>
          {day}
        </div>
      ))}
    </div>

    {/* Calendar grid */}
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: 35 }, (_, i) => (
        <div
          key={i}
          className="aspect-square border border-[#dbbde5] rounded flex items-center justify-center text-xs text-gray-500 hover:text-white transition-colors cursor-pointer"
          style={{ ['--hover-bg' as string]: '#93C5FD' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#93C5FD')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
        >
          {i < days ? (i + 1) : ''}
        </div>
      ))}
    </div>
  </div>
);

export default function DiscoveryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#471f8d] pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>Discovery Engine</h1>
          <p className="text-[#dbbde5] text-lg" style={{ fontFamily: "Georgia, serif" }}>Automated university event finder — web scraping and LLM extraction.</p>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-[#f9f5ff] border border-[#dbbde5] rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-6" style={{ color: "#471f8d" }}>Event Calendar</h2>

          {/* First row: March and April */}
          <div className="flex gap-6 mb-6">
            {months.slice(0, 2).map((monthData) => (
              <MonthCalendar
                key={`${monthData.name}-${monthData.year}`}
                month={monthData.name}
                year={monthData.year}
                days={monthData.days}
              />
            ))}
          </div>

          {/* Second row: May and June */}
          <div className="flex gap-6 mb-4">
            {months.slice(2, 4).map((monthData) => (
              <MonthCalendar
                key={`${monthData.name}-${monthData.year}`}
                month={monthData.name}
                year={monthData.year}
                days={monthData.days}
              />
            ))}
          </div>

          <p className="text-center text-sm" style={{ color: "#471f8d", opacity: 0.5 }}>
            Calendar placeholder — events will be populated here
          </p>
        </div>
      </div>
    </div>
  );
}
