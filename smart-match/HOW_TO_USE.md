# IA Smart Match CRM — How to Use

A step-by-step guide for navigating the platform.

---

## Home Page (`/`)

The landing page introduces the Smart Match CRM and its modules. Scroll down to see each module card with a description, then click **Explore** to jump into any section.

---

## Volunteers (`/volunteers`)

**What it does:** Browse all IA West board members and mock pipeline members in one directory.

**How to use:**
1. Cards display each volunteer's name, title, company, region, and primary expertise tag
2. Use the **filter builder** at the top to narrow results:
   - Click the dropdown → select a filter category (Name, Member Type, Engagement Role, Expertise, Location, Organization)
   - Choose or type a value → filter chips appear showing active filters
   - Click the **X** on any chip to remove it, or **Clear All** to reset
3. Cards are labeled **Real Member** (verified IA West board) or **Mock Data** (illustrative pipeline examples)
4. Click any card to view the full **Volunteer Profile**, which includes:
   - Biography & experience
   - Engagement roles (Judge, Mentor, Speaker)
   - **Member Pipeline** — a visual timeline showing their journey from Campus Engagement through Corporate Member, with dates and current stage

---

## Opportunities (`/opportunities`)

**What it does:** Explore university engagement opportunities, split into two views.

**How to use:**
1. Choose **Event Timeline** or **Course Catalog** from the hub page

### Event Timeline (`/opportunities/events`)
- Shows IA regional events with date, region, nearby universities, lecture window, and course alignment
- Use the filter builder to narrow by Location, Date, Lecture Window, or Course Alignment
- Click **Match Volunteer** on any card to jump to the matching engine

### Course Catalog (`/opportunities/courses`)
- Shows CPP course sections available for guest lectures
- Each card shows the course code, title, instructor, schedule, teaching mode, and **Guest Lecture Fit** level (High / Medium / Low)
- Use filters to narrow by Course Title, Instructor, Fit Level, Teaching Mode, or Days

---

## Calendar (`/calendar`)

**What it does:** Visual month-by-month calendar showing when IA events are scheduled.

**How to use:**
- Purple highlighted dates indicate an IA event
- Hover over a highlighted date to see the region and universities
- Click a highlighted date to view event details

---

## Matching Engine (`/matching`)

**What it does:** The core AI feature. Scores and ranks every volunteer against a selected opportunity using a 6-factor algorithm.

### Step-by-step:

**1. Choose an opportunity type** using the three tabs at the top:
   - **IA Events** — Regional chapter events (Portland, San Diego, LA, SF, Seattle, etc.)
   - **Campus Events** — CPP hackathons, career fairs, research symposiums, competitions
   - **Courses** — CPP course sections available for guest lectures

**2. Select a specific opportunity** from the left sidebar:
   - Click any opportunity card to select it (it highlights purple when active)
   - Events show the volunteer roles needed (Judge, Mentor, Guest Speaker, etc.)
   - Courses show their Guest Lecture Fit level (High / Medium / Low)

**3. View ranked volunteer matches** on the right:
   - Volunteers are instantly scored and ranked from highest to lowest match (0–100)
   - Each card shows:
     - **Rank badge** (#1, #2, #3...)
     - **Score circle** — color-coded: green (75+), amber (55–74), gray (<55)
     - **Top 3 factors** — the three strongest scoring factors with progress bars
     - **Real/Mock badge** — whether this is a verified board member or illustrative data

**4. Adjust the minimum score** using the slider below the opportunity list:
   - Drag right to filter out lower-scoring matches
   - Useful for seeing only top candidates

**5. Click any volunteer card** to open the **Match Detail Page**, which shows:
   - **Header** — Volunteer info on the left, opportunity info on the right, large score badge in the center
   - **Radar chart** — Visual breakdown of all 6 scoring factors
   - **Factor analysis cards** — Each factor with its weight, score bar, explanation, and point contribution
   - **Pipeline context** — If the volunteer has pipeline data, shows their current membership stage
   - **Generate AI Insight** — Click this button to get an AI-generated explanation of why this volunteer is (or isn't) a strong match for this opportunity

### The 6 Scoring Factors:

| Factor | Weight | What it measures |
|--------|--------|-----------------|
| Topic Relevance | 30% | Keyword overlap between volunteer expertise and opportunity description |
| Role Fit | 20% | Does the event need a Judge/Mentor/Speaker and does this volunteer fit that role? |
| Geographic Proximity | 20% | Is the volunteer in the same region as the opportunity? |
| Calendar Fit | 10% | How soon is the event? Is the course format compatible? |
| Historical Conversion | 10% | Has this type of engagement historically converted members? |
| Student Interest | 10% | How large is the potential student audience? |

---

## Navigation Tips

- The **nav bar** at the top is always visible — use it to jump between sections
- **Sign Up / Login** in the top right for authenticated access
- Every list page has a **filter builder** — same pattern across Volunteers, Events, and Courses
- **Back buttons** on detail pages return you to the previous list view

---

## Data Notes

- **Real Member** badges indicate verified IA West board members from the official speaker profiles
- **Mock Data** badges indicate illustrative examples created to demonstrate the member pipeline at various stages
- All matching scores are computed in real-time in your browser — no server-side processing needed
