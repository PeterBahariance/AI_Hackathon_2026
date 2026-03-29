export default function GrowthStrategyPage() {
  const sections = [
    {
      title: "Overview",
      content: `Smart Match is designed to transform how the Insights Association (IA) West Chapter converts campus engagement into sustainable membership growth. While IA West already has strong programming and experienced volunteers, it currently lacks a structured system to discover opportunities, match volunteers effectively, and track long-term outcomes.

Today, valuable campus touchpoints—such as hackathons, career fairs, guest lectures, and competitions—often operate as isolated interactions. Without a system to connect these engagements to IA events, mentorship, and membership, the growth pipeline remains fragmented and difficult to measure.

Smart Match addresses this challenge by creating a unified, transparent system that connects opportunity discovery, volunteer matching, and pipeline tracking. The result is a scalable model that turns individual engagements into a consistent and measurable growth engine.`,
    },
    {
      title: "Growth Methodology",
      content: `At the core of Smart Match is a clearly defined pipeline:

Campus Engagement → IA Event Attendance → Mentorship → Student Membership → Young Professional → Corporate Membership

This model reflects the natural progression of student involvement within the IA ecosystem.

The process begins with campus engagement. Students interact with IA West through meaningful experiences such as judging panels, guest lectures, or career events. These moments are highly impactful because they introduce students to the industry in a real-world context.

Smart Match ensures that each opportunity is paired with the most relevant volunteer based on expertise, role preference, geography, and availability. This improves both the quality of the engagement and the likelihood of continued interaction.

Following the initial engagement, Smart Match supports structured follow-up. Students are guided toward IA events, mentorship opportunities, and membership pathways. Rather than ending at the event, each interaction becomes the starting point for deeper involvement.

The key advantage of this approach is visibility. IA West can track which engagements lead to event attendance, mentorship participation, and membership conversion. This allows the chapter to continuously refine its strategy and focus on the highest-impact opportunities.`,
      pipeline: true,
    },
    {
      title: "Target Audience Segments",
      content: null,
      audiences: [
        {
          label: "Students",
          description:
            "The primary audience. They attend campus events to explore career paths, build skills, and connect with industry professionals. These interactions represent the strongest entry point into IA membership.",
        },
        {
          label: "IA West Volunteers & Board Members",
          description:
            "As a volunteer-run organization, the chapter must use its members' time efficiently. Smart Match helps volunteers find opportunities that align with their expertise and preferred roles, reducing manual coordination and improving engagement quality.",
        },
        {
          label: "Universities & Campus Partners",
          description:
            "Faculty, career centers, and student organizations benefit from reliable access to experienced industry professionals who can enhance programming and provide real-world insight.",
        },
        {
          label: "IA West Leadership",
          description:
            "Relies on Smart Match for visibility and decision-making. The platform provides insight into which campuses, engagement types, and volunteer activities generate the strongest pipeline outcomes.",
        },
      ],
    },
    {
      title: "Value Proposition",
      content: null,
      values: [
        {
          label: "For Students",
          description:
            "The platform provides a clearer and more intentional pathway into the insights profession. Instead of a one-time interaction, students gain ongoing opportunities to engage with IA through events, mentorship, and membership.",
        },
        {
          label: "For Volunteers",
          description:
            "Smart Match simplifies participation by identifying opportunities that match their strengths and availability. It also allows them to see the broader impact of their involvement, increasing motivation and retention.",
        },
        {
          label: "For Universities",
          description:
            "The platform offers a consistent and efficient way to connect with qualified industry professionals. This strengthens campus programming while building long-term partnerships with IA West.",
        },
        {
          label: "For IA West",
          description:
            "Smart Match transforms outreach into a structured growth strategy. It enables scalable opportunity discovery, better volunteer utilization, and measurable membership conversion, all within the constraints of a volunteer-run organization.",
        },
      ],
    },
    {
      title: "Rollout Plan",
      content: null,
      phases: [
        {
          phase: "Phase 1",
          label: "Pilot — Cal Poly Pomona",
          description:
            "Test opportunity discovery, volunteer matching, and pipeline tracking within a controlled setting. CPP provides a rich dataset of events, courses, and contacts, making it an ideal starting point for validating the Smart Match system.",
        },
        {
          phase: "Phase 2",
          label: "Optimization",
          description:
            "Based on pilot results, refine matching logic, improve outreach strategies, and identify which engagement types drive the strongest outcomes.",
        },
        {
          phase: "Phase 3",
          label: "Regional Expansion",
          description:
            "Expand to three or more additional universities across the IA West region, demonstrating that the model is repeatable and scalable beyond a single campus.",
        },
        {
          phase: "Phase 4",
          label: "Full Network Scale",
          description:
            "Extend across the full regional network, creating a consistent and automated approach to campus engagement from Portland to San Diego.",
        },
      ],
    },
    {
      title: "Channel Strategy",
      content: null,
      channels: [
        {
          label: "Opportunity Discovery",
          description:
            "University event calendars, career center platforms, student organization pages, and course schedules provide a continuous stream of engagement opportunities across campuses.",
        },
        {
          label: "Engagement",
          description:
            "High-impact experiences such as hackathons, competitions, guest lectures, and career panels — the moments where students are most receptive to industry interaction.",
        },
        {
          label: "Conversion",
          description:
            "Structured follow-up through event invitations, mentorship pathways, and membership onboarding ensures that engagement leads to continued involvement.",
        },
        {
          label: "Long-Term Growth",
          description:
            "Faculty partnerships, student ambassadors, and community-driven outreach create a system that is both scalable and human-centered.",
        },
      ],
    },
    {
      title: "Transparency in Design",
      content: `Transparency is a core principle of Smart Match. The system is designed to ensure that all recommendations and outcomes are understandable and explainable.

Volunteer matching is based on clear factors such as expertise alignment, role fit, location, and availability. These criteria are visible to users, avoiding the risks of a "black box" system.

The membership pipeline is also fully trackable. IA West can see how each engagement contributes to event participation, mentorship, and membership growth over time. This enables continuous learning and improvement.

Importantly, Smart Match operates as a human-in-the-loop system. AI supports discovery and matching, but final decisions remain with IA leadership. This ensures that the system remains practical, ethical, and aligned with the organization's mission.`,
    },
    {
      title: "Conclusion",
      content: `Smart Match transforms campus engagement from a fragmented process into a structured and scalable growth strategy. By connecting opportunity discovery, volunteer matching, and pipeline tracking, it enables IA West to convert student interactions into long-term membership growth.

Through a CPP-first rollout, multi-channel engagement strategy, and commitment to transparency, Smart Match provides a realistic and impactful solution that aligns with IA West's operational constraints and long-term vision.`,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 pt-24 pb-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#471f8d" }}>
          Strategic Document
        </p>
        <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>
          Growth Strategy Plan
        </h1>
        <p className="text-slate-500 text-base max-w-2xl">
          How Smart Match converts campus engagement into sustainable membership growth for IA West.
        </p>
        <div className="mt-6 h-1 w-16 rounded-full" style={{ backgroundColor: "#471f8d" }} />
      </div>

      {/* Sections */}
      <div className="space-y-12">
        {sections.map((section) => (
          <div key={section.title} className="scroll-mt-24">
            <h2
              className="text-2xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {section.title}
            </h2>

            {/* Plain text content */}
            {section.content && (
              <div className="space-y-4">
                {section.content.split("\n\n").map((para, i) => {
                  const isPipeline =
                    para.startsWith("Campus Engagement →");
                  return isPipeline ? (
                    <div
                      key={i}
                      className="flex flex-wrap items-center gap-2 bg-[#471f8d]/5 border border-[#471f8d]/20 rounded-xl px-5 py-4 text-sm font-semibold text-[#471f8d]"
                    >
                      {para.split(" → ").map((step, j, arr) => (
                        <span key={j} className="flex items-center gap-2">
                          <span className="bg-white border border-[#471f8d]/30 rounded-lg px-3 py-1 whitespace-nowrap shadow-sm">
                            {step}
                          </span>
                          {j < arr.length - 1 && (
                            <span className="text-[#471f8d]/50">→</span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p key={i} className="text-slate-600 leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>
            )}

            {/* Audience cards */}
            {section.audiences && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.audiences.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                  >
                    <p className="text-sm font-semibold text-[#471f8d] mb-2">{item.label}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Value cards */}
            {section.values && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.values.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                  >
                    <p className="text-sm font-semibold text-[#471f8d] mb-2">{item.label}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Rollout phases */}
            {section.phases && (
              <div className="space-y-3">
                {section.phases.map((item, i) => (
                  <div key={item.phase} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: "#471f8d" }}
                      >
                        {i + 1}
                      </div>
                      {i < section.phases!.length - 1 && (
                        <div className="w-px flex-1 mt-1 bg-[#471f8d]/20" style={{ minHeight: "24px" }} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#471f8d] mb-0.5">
                        {item.phase}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 mb-1">{item.label}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Channel cards */}
            {section.channels && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.channels.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
                  >
                    <p className="text-sm font-semibold text-[#471f8d] mb-2">{item.label}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
