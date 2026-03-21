# IA West Smart Match

AI-powered CRM that matches IA West board member volunteers to university engagement opportunities.

## Setup

### Option 1: Without Docker (simplest)

Make sure you have [Node.js 20](https://nodejs.org/) installed.

```bash
git clone https://github.com/PeterBahariance/AI_Hackathon_2026.git
cd AI_Hackathon_2026/smart-match
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)



## Project Structure

```
smart-match/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Home dashboard
│   │   ├── supply/           # Module 1: Volunteer profiles
│   │   ├── demand/           # Module 2: University opportunities
│   │   ├── matching/         # Module 3: AI matching engine
│   │   ├── pipeline/         # Module 4: Conversion pipeline dashboard
│   │   ├── discovery/        # Module 5: University event discovery
│   │   └── outreach/         # Module 6: Email generation & follow-up
│   ├── components/           # Shared components
│   └── lib/                  # Shared utilities
├── data/                     # CSV datasets
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Tech Stack

- Next.js (React + TypeScript)
- TailwindCSS
- Recharts
- Claude API
- Firebase Hosting
