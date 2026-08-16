# Portfolio Website — Design Spec

**Date:** 2026-08-16
**Owner:** Anubhav Adhikari
**Status:** Approved — proceeding to implementation plan

## 1. Positioning & Narrative

Subject is not a "CS student." Positioning statement:

> **Building intelligent systems at the intersection of software, data, AI, and finance.**

The entire site should build toward one narrative arc for the reader: *this person understands software → they understand data → they understand AI → they also understand finance and business → I want to talk to this person.* Every section should reinforce this arc, not just list credentials. No generic student-portfolio tone, no AI-sounding corporate filler, no invented facts (jobs, stats, testimonials, results). Missing info becomes a clearly labeled placeholder, never a fabrication.

## 2. Visual Identity (decided)

- **Mode:** Dark-first only (no light theme required).
- **Palette:** Deep charcoal/near-black background (`~#0A0A0B` base, `~#131315` surface), off-white text (`~#F2F0EA` primary, `~#9A9790` muted), **Amber Gold accent** (`~#D4A657` family), hairline borders (`~#232325`), occasional glass/blur surfaces used sparingly (nav on scroll, cards on hover).
- **Hero visual:** "Financial Grid" motif — faint chart gridlines with a single rising trend line/path, subtle idle drift animation. Signals the finance+data angle directly without being literal or flashy.
- **Typography:** Large editorial headings, generous whitespace, clean modern sans (system/Inter-class stack). No neon, no cyberpunk excess, no random animation for its own sake.

## 3. Tech Stack & Project Structure

React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion. No backend, no CMS — static SPA, deployable to any static host (Vercel/Netlify/GitHub Pages — host TBD by user later, doesn't affect the build).

```
src/
  content/          # single source of truth — typed data, not hardcoded JSX
    profile.ts       # name, headline, links (placeholders marked)
    experience.ts     # 2 real entries
    projects.ts       # GradTrack AI, Recruitment Analytics, + placeholder slot
    skills.ts
    leadership.ts
    education.ts
  components/
    layout/           # Nav, Footer, SectionShell
    sections/         # Hero, WhyMe, Experience, Projects, Skills,
                       # BeyondTheCode, Leadership, Education,
                       # HowIThink, ResumeCTA, Contact
    ui/               # Button, Badge, GlassCard, Counter, RevealOnScroll,
                       # ArchitectureDiagram, FinancialGrid (hero viz)
  hooks/              # useScrollProgress, useInView, useCounter
  App.tsx
```

Every visible string lives in `content/*.ts` so placeholder values (GitHub/LinkedIn URLs, resume file, contact info) can be swapped without touching component code.

## 4. Placeholders (explicit, deferred by user)

These are intentionally left blank/placeholder for now, with space clearly reserved:

- **GitHub / LinkedIn links** — rendered as normal styled links pointing to `#`, sourced from `content/profile.ts` (`githubUrl`, `linkedinUrl` fields marked with a `TODO` comment). Update those two fields when URLs are known.
- **Resume file** — download button points to `/resume.pdf`. A code comment above the `resumeUrl` field in `content/profile.ts` notes that the real PDF should be dropped into `public/resume.pdf`. No code change needed once the file exists.
- **Contact form** — no backend exists. Implemented as a static "email me directly" block using `mailto:` (address sourced from `content/profile.ts`, currently placeholder), styled to look like a minimal contact form. Easiest upgrade path later: swap in a Formspree/Web3Forms endpoint.
- **Project 03** — a visibly distinct "add your next project" placeholder card (title, problem, solution, stack, GitHub, demo fields all shown as empty/placeholder), styled differently from the two real project case studies so it never reads as filler content.

## 5. Content Inventory (facts only — no invention beyond this list)

**About**
- Name: Anubhav Adhikari · Location: Caldwell, Idaho
- The College of Idaho — B.S. Computer Science | B.A. Finance — Expected May 2027
- Coursework: Statistical Machine Learning, Senior Software Engineering & AI, Data Structures & Algorithms, Linear Algebra, Intermediate Accounting, Financial Problems
- Interests: Software Engineering, Data Engineering, AI, Machine Learning, Data Analytics, FinTech, Financial Technology, building intelligent software products

**Experience**
1. Data Engineer Intern — Oppenheimer Companies, Inc. — Summer 2026. ETL/ELT pipelines, enterprise data workflows, Python, SQL, data cleaning/transformation, validation, pipeline monitoring, debugging, documentation, collaboration with data engineers/analysts.
2. Software Developer Intern — The College of Idaho, IT Department — Summer 2026–Present. WordPress development, front-end improvements, technical fixes, site architecture, plugins, user permissions, access control, collaboration with campus departments.

**Projects**
1. **GradTrack AI** (flagship) — Graduate Application Tracker. Python, MCP, LLM Integration, Email API. Full-stack AI app for managing grad school applications: email integration, automatic status updates, 10 MCP tools, application status parsing, deadline alerts, program comparison, document management, persistent memory, GitHub collaboration, sprint-based development, code review. Architecture to visualize: User → AI Assistant → MCP Tools → Application Data → Email/Documents → Personalized Recommendations.
2. **College Recruitment Analytics** — data science case study. Problem: which geographic regions produce the most enrolled students. Pipeline: Raw Data → Data Cleaning → EDA → ML → Visualization → Recruitment Insight. Highlights: missing value handling, type mismatches, duplicate records, inconsistent international student data, classification modeling, regional analysis, data visualization, business decision-making. Stack: R, tidyverse, ggplot2, caret, pandas.
3. **Placeholder slot** — see §4.

**Skills (grouped, not a logo wall)**
- Programming: Python, SQL, R
- Data: pandas, NumPy, tidyverse, ggplot2, caret
- Engineering: ETL/ELT, data transformation, data validation, data documentation, Git/GitHub, Azure
- AI/ML: model training, model evaluation, LLM integration, MCP, AI application development
- Web/Development: WordPress, front-end development, VS Code
- Finance/Analytics: financial analysis, budget management, forecasting, Excel, financial reporting

**Beyond the Code (Finance)**
- Finance Committee Head Advisor, Associated Students of The College of Idaho. Managing event budgets, tracking allocations/expenditures, Excel, reconciling actuals vs. approved amounts, reviewing funding proposals, forecasting costs, consolidating financial data, reporting to student leadership. Scale: 10+ events. Visual: Budget → Allocation → Spending → Reconciliation → Reporting. No fabricated dollar amounts.

**Leadership** (narrative framing, not a club list)
- Finance Committee Head Advisor — Associated Students of The College of Idaho
- Office Manager Coordinator — The College of Idaho Campus Safety
- President — Asian Student Association
- President / Chess.com College Ambassador — Chess Club

**Education**
- The College of Idaho, B.S. Computer Science + B.A. Finance, Expected May 2027, Dean's List (consecutive years), selected coursework as above. Presented as an academic profile, not a resume block.

## 6. Section Order

Nav → Hero → Why Me (3 connected pillars: Software / Data & AI / Finance) → Experience (interactive case-study timeline) → Projects (GradTrack AI flagship w/ architecture diagram, Recruitment Analytics as data-science case study, Project 03 placeholder) → Skills (grouped systems) → Beyond the Code (finance dashboard-style flow visual) → Leadership (narrative cards) → Education (academic profile) → **How I Think** (signature interactive section) → Resume CTA → Contact → Footer.

**Signature section decision:** "How I Think" (Question → Data → System → Model → Insight → Decision, click/tap to expand each stage) was chosen over the alternative "System Map" (Software/Data/AI/Finance connected to projects). Reason: the Why Me section already covers the four domains as pillars, so a System Map would repeat it. "How I Think" shows *process* instead of *domains* — more distinct and memorable.

## 7. Navigation

Minimal sticky nav: `ANUBHAV` wordmark + Work / Experience / About / Skills / Leadership / Resume / Contact. Transforms on scroll (padding shrinks, background gains blur + opacity past ~80px). Elegant collapsible menu on mobile.

## 8. Animation Strategy

Framer Motion `whileInView` scroll reveals (fire once, not repeating), spring-based hover states on cards/buttons, animated count-up for the "10+ events" stat, slow/low-amplitude idle drift on the hero's Financial Grid line, nav condense-on-scroll as above. No page-transition library — single page with anchor nav. Every animation must be purposeful; no bounce, no constant motion, no distraction. `prefers-reduced-motion` disables idle drift and shortens/removes reveal animation.

## 9. Accessibility & Quality Bar

Semantic landmarks (`nav`, `main`, `section` with `aria-label`s), skip-to-content link, full keyboard reachability with visible accent-colored focus rings, contrast-checked off-white-on-charcoal and gold-on-charcoal text, SEO/OG meta tags using the real name/headline, no console errors, fully responsive (mobile/tablet/desktop), optimized assets, no unnecessary dependencies.

## 10. Explicit Non-Goals

- No invented job responsibilities, awards, statistics, projects, technologies, companies, results, testimonials, clients, revenue figures, performance metrics, GitHub stars, or user counts.
- No generic three-column "portfolio template" project cards.
- No boring logo-wall skills section.
- No light theme (not required).
- No backend/CMS for this iteration.
