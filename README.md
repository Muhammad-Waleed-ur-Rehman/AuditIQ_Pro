# AuditIQ Pro

**Live demo**: [https://auditiq-pro.vercel.app](https://auditiq-pro.vercel.app)

AuditIQ Pro is a React + Vite audit productivity platform for internal and external audit teams. It combines an immersive public landing page, protected dashboard workflows, Supabase-backed storage, AI-assisted audit features, and ISA 315-inspired risk assessment tools.

## What this project includes
- Public landing page with immersive visuals, particle backgrounds, and scroll-triggered animations (GSAP, Three.js, Lenis)
- Supabase Auth + RLS-protected user-scoped data storage
- Protected dashboard with stat cards, active engagements list, audit checklist, and risk heatmap
- Project creation and active project selection (persisted across navigation via ProjectContext)
- Risk assessment form with ISA 315 inherent risk factors (likelihood × magnitude), control risk scoring, and significant risk toggle
- Risk heatmap — 5×5 inherent risk matrix with automatic risk level colouring and assessment placement
- Audit checklist with add/toggle/delete, category labels, due dates, and progress tracking
- Financial analyzer with CSV upload, ratio trend visualization (Recharts), and red-flag detection
- Working paper generator with observation/criteria/condition/cause/effect/recommendation framework
- Audit procedure generator with risk-area-driven assertions, procedures, sampling approach
- Management letter and planning memo generators with AI-powered drafts
- AI Copilot with chat history, prompt categories, and Groq-powered responses (via `llama-3.3-70b-versatile`) through Supabase Edge Functions
- Knowledge Hub and Prompt Library for reusable reference content
- User profile page with editable fields (job title, department, phone, location, certifications, bio)
- Theme support with dark mode via ThemeContext

## Repository architecture

```text
auditiq-pro/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── landing/
│   │   │   ├── AICopilotDemo.jsx
│   │   │   ├── AIFeaturesShowcase.jsx
│   │   │   ├── FAQSection.jsx
│   │   │   ├── FeatureSection.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── LandingNavbar.jsx
│   │   │   ├── ParticleBackground.jsx
│   │   │   ├── ProblemSolution.jsx
│   │   │   ├── ProductShowcase.jsx
│   │   │   ├── RealProductPreview.jsx
│   │   │   ├── ScrollSection.jsx
│   │   │   └── WhoItsFor.jsx
│   │   ├── AICopilot.jsx
│   │   ├── AlertMessage.jsx
│   │   ├── AuditProcedureGenerator.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FinancialAnalyzer.jsx
│   │   ├── Header.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── RiskAssessment.jsx
│   │   ├── SectionCard.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   └── WorkingPaperGenerator.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ProjectContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   └── useLenis.js
│   ├── lib/
│   │   ├── animations.js
│   │   ├── auditEngine.js
│   │   ├── auditPrompts.js
│   │   ├── checklistService.js
│   │   ├── dashboardData.js
│   │   ├── financialRatios.js
│   │   ├── invokeGemini.js
│   │   ├── riskHeatmap.js
│   │   ├── riskScoring.js
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── KnowledgeHub.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── ManagementLetters.jsx
│   │   ├── NotFound.jsx
│   │   ├── PlanningMemo.jsx
│   │   ├── ProfilePage.jsx
│   │   ├── PromptLibrary.jsx
│   │   └── Signup.jsx
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase/
│   ├── functions/
│   │   └── gemini-audit/
│   │       └── index.ts
│   └── schema.sql
├── supabase-schema.sql
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

## Tech stack
- **React 19** + **Vite 8** (fast dev server and production builds)
- **React Router DOM v7** with nested public/protected route architecture
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Supabase JS** for auth, database, and Edge Function invocation
- **Lenis** (smooth scrolling), **GSAP** + **ScrollTrigger**, **Three.js** (landing page visuals)
- **Lucide React** for consistent UI icons
- **Recharts** for financial ratio trend charts
- **Papa Parse** for CSV file parsing in Financial Analyzer

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a local environment file from .env.example:
   ```bash
   copy .env.example .env
   ```

3. Add your Supabase environment values:
   - `VITE_SUPABASE_URL` — your project URL from Supabase API settings
   - `VITE_SUPABASE_ANON_KEY` — your anon/public key from Supabase API settings

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Enable **Email auth** in Authentication → Providers.
3. Apply `supabase/schema.sql` in the Supabase SQL Editor (creates all tables, RLS policies, and the profile trigger).
4. Note your project URL and anon key for `.env`.
5. (Optional) For AI features, deploy the Edge Function:
   ```bash
   supabase functions deploy gemini-audit
   supabase secrets set GROQ_API_KEY=your_groq_key
   ```

## Key features detail

### Active Project Selection
Projects are created on the Dashboard and stored in Supabase. The selected project persists across route navigation and page refreshes via `ProjectContext` with localStorage. All child modules (Risk Assessment, Checklist, Working Papers, AI Copilot) scope their data to the active project.

### Risk Heatmap (ISA 315-Inspired)
The Dashboard renders a 5×5 inherent risk matrix using likelihood (1–5) and magnitude (1–5) dimensions. Each cell is colour-coded Low/Medium/High. Risk assessments are placed on the correct cell, and a Control Risk Assessment panel shows per-assessment details with inherent/control/overall risk levels.

### Audit Checklist
Per-project task list with:
- Add task (title, auto-category `Planning`, default priority `Medium`)
- Toggle completion (with `completed_at` timestamp)
- Delete task
- Category badges (Planning / Fieldwork / Reporting)
- Due date support
- Progress bar synced to stat card on Dashboard

### Dashboard Data Loading
Dashboard metrics are fetched in parallel with per-query error isolation — a failure in one query (e.g., a missing table) does not prevent other metrics from loading. A collapsible debug panel at the bottom of the dashboard shows current state.

## Scripts

| Command             | Description                         |
|---------------------|-------------------------------------|
| `npm run dev`       | Start Vite dev server               |
| `npm run build`     | Production build to `dist/`         |
| `npm run preview`   | Preview the production build        |
| `npm run lint`      | Run ESLint across source files      |

## Environment variables

| Variable                 | Required | Description                          |
|--------------------------|----------|--------------------------------------|
| `VITE_SUPABASE_URL`      | Yes      | Supabase project URL                 |
| `VITE_SUPABASE_ANON_KEY` | Yes      | Supabase anonymous/public API key    |

## Production deployment

### Vercel
1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel Environment Variables.
4. Vercel auto-detects Vite — build command is `npm run build`, output is `dist/`.

### Supabase
1. Run `supabase/schema.sql` via SQL Editor.
2. Enable Email auth provider.
3. Deploy the Gemini Edge Function if AI features are needed.

## Testing checklist

- [ ] Landing page loads with GSAP/Three.js animations and smooth scrolling
- [ ] Signup creates a new user and auto-creates a profile row
- [ ] Login persists session across refresh
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Create a project — it saves to Supabase and becomes the active project
- [ ] Active project persists after navigating between routes
- [ ] Run a risk assessment — it appears in the risk heatmap and assessments list
- [ ] Add, toggle, and delete checklist items — progress bar updates
- [ ] Active Engagements count reflects projects where status is not `completed`
- [ ] Financial Analyzer accepts CSV upload and renders ratio charts
- [ ] AI Copilot sends prompts to the Gemini Edge Function
- [ ] Profile page loads and saves user details
- [ ] Dark mode toggle works via ThemeContext
- [ ] Mobile layout is functional (sidebar collapses, content reflows)

## Limitations & disclaimers
- AI-generated outputs are for assistance only. This platform is **not** a replacement for professional auditor judgment.
- All AI-generated working papers and risk assessments must be reviewed and signed off by a qualified professional.
- No final audit opinion should be generated solely by the AI.
- Groq API free tier usage limits and rate throttling may apply.
- Financial CSV uploads must match the required column structure documented in the Financial Analyzer UI.
