# Retirement Planning Navigator

A dark-themed, all-in-one personal finance web app that synthesizes best practices from the most trusted voices in personal finance into a single, guided experience. Not a calculator — a coach.

Built with Astro + React + TypeScript. No accounts. No data leaving the browser.

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
| **4 — Investment Path** | Enter current portfolio and contributions. Monte Carlo probability cone shows pessimistic / median / optimistic outcomes. |
| **Summary** | Dual-phase net worth chart (accumulation + withdrawal), progress bar, spending comparison, key assumptions. |

---

## Features

- **Guided flow** — "Next Step →" button on each step; Welcome page "Get Started →" routes directly to Step 1
- **Smart defaults** — Retirement spending pre-populated from current spending (healthcare +30%, transport −50%, etc.)
- **Monte Carlo cone** — Three return scenarios (base ±2%) with uncertainty band and outcome summary
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
futureValue = presentValue × (1 + inflation)^yearsToRetirement
```

### Post-Retirement Returns
```
retirementReturnRate = max(4%, annualReturn × 0.6)
```
Conservative asset reallocation toward bonds assumed in retirement.

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
