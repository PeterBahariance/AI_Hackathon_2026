export default function ResponsibleAIPage() {
  const sections = [
    {
      id: "privacy",
      title: "(a) Privacy",
      subtitle: "Handling of speaker, faculty, and student data",
      points: [
        "Collect only the data needed for matching, outreach, scheduling, and reporting.",
        "Examples include speaker expertise, preferred roles, region, availability windows, event details, and organizer contacts.",
        "Use public university pages and consent-based collection methods instead of invasive scraping.",
        "Minimize student-level data and report pipeline performance in aggregate whenever possible.",
        "Restrict access by role, and protect personal and contact data in transit and at rest.",
      ],
    },
    {
      id: "bias",
      title: "(b) Bias",
      subtitle:
        "Ensuring the matching algorithm does not systematically favor certain speakers, universities, or topics",
      points: [
        "Rank volunteers using topic relevance, role fit, geography, calendar fit, and observed outcomes rather than prestige-based shortcuts.",
        "Include balancing logic such as recent assignment load, availability, and rotation rules to prevent overuse of the same volunteers.",
        "Review outcomes across speaker groups, metro regions, campuses, and topic areas to detect uneven representation.",
        "Use historical engagement data carefully so past popularity does not dominate future recommendations.",
        "Adjust feature weights, add guardrails, or use manual review when uneven outcomes appear.",
      ],
    },
    {
      id: "transparency",
      title: "(c) Transparency",
      subtitle: "How match scores and event ratings are explained to stakeholders",
      points: [
        "Show a plain-language breakdown of why a volunteer was matched to an opportunity.",
        "Treat scores as decision-support tools, not automatic decisions.",
        "Allow staff and volunteers to review, override, or re-rank recommendations when local context matters.",
        "Explain event ratings using visible inputs such as attendance, follow-up engagement, mentorship requests, and membership conversion.",
        "Document the main scoring inputs, assumptions, and limitations to avoid black-box claims.",
      ],
      breakdown: [
        { label: "Topic relevance", value: "35%" },
        { label: "Role fit", value: "25%" },
        { label: "Geographic fit", value: "20%" },
        { label: "Calendar fit", value: "10%" },
        { label: "Historical signal", value: "10%" },
      ],
    },
    {
      id: "data-handling",
      title: "(d) Data Handling",
      subtitle: "Consent and storage practices",
      points: [
        "Inform users what data is collected, why it is used, and how it supports matching, outreach, and pipeline measurement.",
        "Build consent into volunteer onboarding, event signup flows, and student follow-up processes.",
        "Retain data only as long as needed for chapter coordination, reporting, and improving match quality.",
        "Allow users to request access, correction, or deletion where appropriate.",
        "Clearly label simulated, inferred, and real records in the prototype.",
      ],
    },
  ];

  const commitments = [
    {
      title: "Data Minimization",
      description:
        "Collect only the data needed for matching, outreach, and reporting.",
    },
    {
      title: "Fair Matching",
      description:
        "Monitor outcomes across speakers, campuses, and topics.",
    },
    {
      title: "Clear Explanations",
      description:
        "Show every match score and event rating in plain language.",
    },
    {
      title: "Consent & Control",
      description:
        "Build consent, retention, and access controls into the workflow.",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-6 pt-32 pb-16 md:px-10 lg:px-12">
        <div className="max-w-4xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Responsible AI
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-card-foreground md:text-6xl">
            Privacy, Fairness, Transparency, and Responsible Data Handling
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">
            Smart Match uses AI to discover university opportunities, recommend
            volunteers, and track the path from campus engagement to IA events
            and membership. Because it handles personal data and influences
            recommendations, it is designed to be privacy-aware, transparent,
            and fair.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <article
              key={section.id}
              className="h-full rounded-3xl border border-border bg-card p-8 shadow-sm"
            >
              <div className="mb-6 border-b border-border pb-5">
                <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-primary">
                  {section.subtitle}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-primary-dark">
                  How Smart Match handles this
                </h3>

                <ul className="mt-4 space-y-4">
                  {section.points.map((point) => (
                    <li
                      key={point}
                      className="border-l-4 border-primary pl-4 text-base leading-7 text-muted"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-16">
          <div className="flex flex-col gap-3">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Responsible AI in Practice
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-card-foreground">
                Our Commitments
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                These principles guide how Smart Match handles personal data,
                explains recommendations, and supports fair, practical decisions
                for IA West.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {commitments.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1"
              >
                <h3 className="text-lg font-semibold tracking-tight text-card-foreground">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}