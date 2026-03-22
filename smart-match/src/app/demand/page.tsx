export default function DemandPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="bg-[#471f8d] pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>Opportunities (Demand Side)</h1>
          <p className="text-[#dbbde5] text-lg" style={{ fontFamily: "Georgia, serif" }}>CPP events, courses, and campus engagement opportunities.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Opportunity List Placeholder */}
        <div className="bg-white border border-[#dbbde5] rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: "#471f8d" }}>Opportunity List</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-[#dbbde5] rounded-lg bg-[#f9f5ff]">
            <p className="text-[#471f8d] text-sm opacity-60">No opportunities loaded yet — data will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
