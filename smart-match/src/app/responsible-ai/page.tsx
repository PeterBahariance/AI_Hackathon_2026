// Responsible AI Page
// This page uses Tailwind utility classes.
// Comments explain what controls layout, spacing, typography, and colors.

export default function ResponsibleAIPage() {
  const sections = [
    {
      id: "privacy",
      title: "(a) Privacy",
      subtitle: "Handling of speaker, faculty, and student data",
      points: [
        "The platform collects only the information necessary to support profile creation, event matching, scheduling, and feedback workflows.",
        "Access to personal information is restricted based on role and operational need, so users only see the data required for their responsibilities.",
        "Personally identifiable information is protected in transit and at rest, and reporting views prioritize aggregated or de-identified data whenever possible.",
        "Profile and activity data are used to improve platform functionality and matching quality, not for unrelated secondary purposes.",
      ],
    },
    {
      id: "bias",
      title: "(b) Bias",
      subtitle:
        "Ensuring the matching algorithm does not systematically favor certain speakers, universities, or topics",
      points: [
        "The matching process is designed to prioritize relevance, availability, and audience fit rather than prestige-based signals such as institutional reputation alone.",
        "Recommendation outcomes are reviewed regularly to identify whether certain speakers, schools, or subject areas are being systematically over- or under-represented.",
        "Feature design and ranking logic are evaluated to reduce the influence of historical popularity patterns that could reinforce existing inequities.",
        "Fairness monitoring is incorporated into platform review so that adjustments can be made when uneven outcomes are detected.",
      ],
    },
    {
      id: "transparency",
      title: "(c) Transparency",
      subtitle: "How match scores and event ratings are explained to stakeholders",
      points: [
        "Match recommendations are accompanied by clear explanations of the main factors contributing to the result.",
        "Scores are presented as decision-support signals rather than absolute judgments.",
        "Event ratings are described in plain language with clear aggregation methods.",
        "Different stakeholders receive explanations at appropriate levels of detail.",
      ],
    },
    {
      id: "data-handling",
      title: "(d) Data Handling",
      subtitle: "Consent and storage practices",
      points: [
        "Users are informed about what data is collected and why.",
        "Consent is built into onboarding and participation workflows.",
        "Users can request access, correction, or deletion of their data.",
        "Data is retained only as long as necessary for operations or compliance.",
      ],
    },
  ];

  const commitments = [
    "Protect personal data through minimization, access control, and secure storage.",
    "Monitor recommendation outcomes for fairness.",
    "Explain recommendations and ratings clearly.",
    "Maintain clear consent and retention practices.",
  ];

  return (
    // MAIN CONTAINER
    // min-h-screen = full viewport height
    // bg-background = page background color (from your theme)
    // text-foreground = default text color
    <main className="min-h-screen bg-background text-foreground">

      {/* PAGE WRAPPER */}
      {/* max-w-6xl = limits width (important for readability)
          mx-auto = centers horizontally
          px-6 = horizontal padding
          pt-32 = pushes content below navbar (fixes cutoff)
          pb-16 = bottom spacing */}
      <section className="mx-auto max-w-6xl px-6 pt-32 pb-16 md:px-10 lg:px-12">

        {/* HERO / HEADER */}
        {/* max-w-4xl = keeps text from stretching too wide */}
        <div className="max-w-4xl">

          {/* SMALL LABEL */}
          {/* uppercase + tracking controls letter spacing */}
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">
            Responsible AI
          </p>

          {/* MAIN TITLE */}
          {/* text-4xl/md:text-6xl = responsive font size */}
          <h1 className="text-4xl font-bold tracking-tight text-card-foreground md:text-6xl">
            Privacy, Fairness, Transparency, and Responsible Data Handling
          </h1>

          {/* DESCRIPTION TEXT */}
          {/* mt-6 = spacing above
              leading-8 = line height for readability */}
          <p className="mt-6 text-lg leading-8 text-muted">
            This page outlines how the platform approaches personal data
            protection, equitable matching, explainability, and responsible data
            governance.
          </p>
        </div>

        {/* GRID LAYOUT FOR SECTIONS */}
        {/* grid = enables columns
            lg:grid-cols-2 = 2 columns on large screens
            gap-6 = spacing between cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">

          {sections.map((section) => (

            // SECTION CARD
            // rounded-3xl = large rounded corners
            // border = visible outline
            // bg-card = white surface
            // p-8 = internal spacing
            // shadow-sm = subtle depth
            <article
              key={section.id}
              className="rounded-3xl border border-border bg-card p-8 shadow-sm"
            >

              {/* SECTION HEADER */}
              <div className="mb-6">

                {/* SECTION TITLE */}
                <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">
                  {section.title}
                </h2>

                {/* SUBTITLE */}
                <p className="mt-2 text-sm font-medium leading-6 text-primary">
                  {section.subtitle}
                </p>
              </div>

              {/* CONTENT LIST */}
              <div>

                {/* LABEL */}
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-primary-dark">
                  Approach
                </h3>

                {/* LIST */}
                {/* space-y-4 = vertical spacing between items */}
                <ul className="mt-4 space-y-4">

                  {section.points.map((point) => (

                    // LIST ITEM
                    // border-l-4 = left accent bar
                    // pl-4 = padding-left (space from border)
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

        {/* COMMITMENTS SECTION */}
        <section className="mt-14">

          <h2 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Our Commitments
          </h2>

          {/* GRID FOR COMMITMENTS */}
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            {commitments.map((item) => (

              // SMALL CARD
              <div
                key={item}
                className="rounded-2xl border border-border bg-card p-5 text-sm leading-6 text-muted shadow-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}