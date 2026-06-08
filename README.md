# Retirement Planning Navigator

[![CI](https://github.com/pmagouir/Financial_Planning_Tool/actions/workflows/ci.yml/badge.svg)](https://github.com/pmagouir/Financial_Planning_Tool/actions/workflows/ci.yml)

A dark-themed, all-in-one personal finance web app that synthesizes best practices from the most trusted voices in personal finance into a single, guided experience. Not a calculator — a coach.

Built with Astro + React + TypeScript. No accounts. No data leaving the browser. Every figure is independently validated and traceable to a source on the in-app **Methodology** page.

---

## Philosophy

Three frameworks form the intellectual backbone of every design and calculation decision:

- **Ramit Sethi** — Conscious spending plan (Fixed / Investments / Guilt-Free buckets), non-judgmental framing, smart defaults
- **JL Collins / Bogleheads** — Low-cost index funds, 4% rule via Trinity Study, simplicity as a feature
- **Morgan Housel** — Behavior over intelligence, time in market, "enough-ness" framing

---

## The Five-Step Flow

| Step | What it does |
|------|--------------|
| **1 — Current Reality** | Enter take-home pay and spending. Animated stacked bar (Fixed / Investing / Guilt-Free) with Ramit Sethi benchmarks updates live. |
| **2 — Retirement Design** | Adjust planned retirement spending with smart defaults pre-filled from Step 1. Per-category bar chart (Today vs Retirement) updates live as you move sliders. |
| **3 — Your Number** | Cinematic reveal of your required retirement portfolio. Giant glowing number + 4-step math chain showing the exact calculation path. |
| **4 — Investment Path** | Enter current portfolio and contributions. A real seeded Monte Carlo (1,000 paths) shows a 10th–90th percentile cone, the median path, and a stated success probability. |
| **Summary** | Median net-worth path with a 10th-percentile downside band (accumulation + withdrawal), success probability, progress bar, spending comparison, key assumptions. |

---

## Features

- **Guided flow** — "Next Step →" button on each step; Welcome page "Get Started →" routes directly to Step 1
- **Smart defaults** — Retirement spending pre-populated from current spending (healthcare +30%, transport −50%, etc.)
- **Monte Carlo simulation** — 1,000 seeded paths (lognormal, moment-matched), a 10th–90th percentile cone, a stated success probability, and genuine sequence-of-returns risk in the drawdown
- **Mobile bottom nav** — Collapses to a fixed bottom bar at ≤639px; desktop sidebar unchanged
- **No data leaves the browser** — All state saved to localStorage via Nanostores persistent
- **Trinity Study withdrawal rates** — Auto-calculated by retirement duration (3.5–5%), user-overridable

---

## Financial Calculations

### Withdrawal Rate (Bengen 1994 / Trinity Study)
| Retirement Duration | Rate |
|---|---|
| 35+ years | 3.5% |
| 25–35 years | 4.0% (the "4% rule") |
| 15–25 years | 4.5% |
| < 15 years | 5.0% |

### Required Portfolio
```
requiredPortfolio = (futureAnnualSpend − futurePassiveIncome) / withdrawalRate
futureValue       = presentValue × (1 + inflation)^yearsToRetirement
```
Social Security grows with inflation (COLA); pensions and other income are held flat — a conservative default. Figures are pre-tax and shown in today's dollars (with the future-dollar amount beside them).

### Post-Retirement Returns
```
retirementReturnRate = max(4%, annualReturn × 0.85)
```
A realistic ~60/40 retirement return. This deterministic path is the mean; sequence-of-returns risk and volatility live in the Monte Carlo (1,000 seeded paths).

> The full formula-by-formula chain, every reference value, and every source live on the in-app **Methodology** page and in `studio/.learn/canonical.md`.

---

## Trust & Methodology

This tool ships as a public resource on three commitments:

- **Every figure is validated.** Each formula is recomputed independently in WolframAlpha and locked to a reference value an automated test asserts against. If the engine ever returns a different number, CI fails.
- **No data leaves your browser.** No accounts, no servers. Everything is calculated locally and saved only to your browser's `localStorage`.
- **Open and honest.** It is open source, every projection is labeled an estimate, and the in-app **Methodology** page documents every formula and source — including what the tool deliberately does *not* model (taxes, fat tails). Check our work.

The app is improved by a continuous five-agent studio (`studio/`, `.claude/skills/finplan-*`): a Scout sweeps the field, an Analyst prioritizes, a specialist bench builds, an Auditor reviews against four lenses, and a Director reports to the maintainer. Every formula and token traces to `studio/.learn/canonical.md`; every fixed defect becomes a regression test.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Meta-framework | Astro 5 |
| UI | React 19 |
| State | Nanostores + persistent |
| Charts | Recharts |
| Animations | Framer Motion |
| Styling | Tailwind CSS 4 |
| Language | TypeScript (strict) |

---

## Getting Started

```bash
git clone https://github.com/pmagouir/Financial_Planning_Tool.git
cd Financial_Planning_Tool
npm install
npm run dev
# → http://localhost:4321
```

### Build for production

```bash
npm run build   # → dist/
npm run preview # preview production build
```

### Code quality

```bash
npm run lint        # ESLint
npm run lint:fix    # ESLint --fix
npm run format      # Prettier
npm run format:check
```

---

## Project Structure

```
src/
├── components/
│   ├── Welcome.tsx               # Landing page
│   ├── Step1_CurrentReality.tsx  # Budget input + animated bar
│   ├── Step2_RetirementDesign.tsx# Lifestyle sliders + comparison chart
│   ├── Step4_InvestmentPath.tsx  # Monte Carlo cone + gap analysis
│   ├── Step5_Summary.tsx         # Full plan summary + net worth chart
│   ├── Methodology.tsx           # Public methodology page — every formula + source
│   ├── calculator/
│   │   └── Step3_YourNumber.tsx  # Retirement number hero reveal
│   ├── bonus/
│   │   ├── CompoundCalculator.tsx
│   │   └── Resources.tsx
│   ├── ui/                       # Design system components
│   └── NavigationTabs.tsx        # App shell + routing
├── stores/
│   └── financialPlan.ts          # ALL financial logic + state
└── pages/
    └── index.astro
```

> **Rule:** Financial calculations live exclusively in `src/stores/financialPlan.ts`. Never scatter logic into components.

The chart-bearing screens (Step 2, Step 4, Step 5, Compound Calculator) are lazy-loaded so Recharts code-splits into on-demand chunks — the initial load stays light. The continuous-improvement studio lives in `studio/` (canonical, error ledger, audits, briefings) with its agents in `.claude/skills/finplan-*`.

---

## Deployment

Deployed on Vercel. Connects to `main` branch — every push auto-deploys.

Config: `vercel.json` sets framework to Astro, build command to `npm run build`, output to `dist`.
`.npmrc` sets `legacy-peer-deps=true` to handle ESLint 9 peer dependency resolution.

---

## Work Log

See [`WORKLOG.md`](./WORKLOG.md) for a full session-by-session record of what was built and what's next.

---

## License

MIT — free to use for personal or commercial purposes.
